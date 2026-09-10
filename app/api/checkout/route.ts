import { NextResponse } from 'next/server';
import { adminDb, getAdminApp, getFirebaseAdminDiagnostic } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { calculateProductPrice, Discount } from '@/lib/discount-engine';
import { calculateOrderShipping, GlobalShippingSettings } from '@/lib/shipping-engine';
import { handleOrderStatusEmail } from '@/lib/email/automation';

export async function POST(req: Request) {
  try {
    // Early check: Firebase Admin must be available for checkout
    const app = getAdminApp();
    if (!app) {
      const diag = getFirebaseAdminDiagnostic();
      console.error('[Checkout] Firebase Admin is not configured. Diagnostic:', {
        projectId: diag.FIREBASE_PROJECT_ID,
        clientEmail: diag.FIREBASE_CLIENT_EMAIL,
        privateKeyBase64: diag.FIREBASE_PRIVATE_KEY_BASE64,
        error: diag.error_message,
      });
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support. (Code: FA_MISSING)' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { customerInfo, items, paymentMethod, customerType, paymentProof, transactionId } = body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Fetch global settings and active discounts outside transaction for fast computation
    const [globalSettingsDoc, discountsSnap] = await Promise.all([
      adminDb.collection('settings').doc('global').get(),
      adminDb.collection('discounts').where('isActive', '==', true).get()
    ]);

    const globalSettingsData = globalSettingsDoc.exists ? globalSettingsDoc.data() : {};
    const lowStockThreshold = typeof globalSettingsData?.lowStockThreshold === 'number' ? globalSettingsData.lowStockThreshold : 5;

    const shippingSettings: GlobalShippingSettings = {
      defaultShippingFee: globalSettingsData?.defaultShippingFee ?? 200,
      defaultDeliveryEstimate: globalSettingsData?.defaultDeliveryEstimate || "3-5 working days",
      thresholdEnabled: !!globalSettingsData?.thresholdEnabled,
      thresholdAmount: globalSettingsData?.thresholdAmount ?? 10000,
      benefitType: globalSettingsData?.benefitType || "free_shipping",
      benefitValue: globalSettingsData?.benefitValue ?? 0,
      qrDestinationUrl: globalSettingsData?.qrDestinationUrl || ""
    };

    const activeDiscounts = discountsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Discount));

    // Generate unique Order ID
    const generateOrderId = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = 'JH-';
      for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
      result += '-';
      for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
      return result;
    };
    const orderId = generateOrderId();

    // Prepare container for processed order details
    let orderResultData: any = null;

    // Execute atomic transaction to prevent race conditions and negative inventory
    await adminDb.runTransaction(async (transaction) => {
      // 1. Transaction READS must come before writes in Firestore
      const productRefs = items.map(item => adminDb.collection('products').doc(item.product.id));
      const productSnapshots = await Promise.all(productRefs.map(ref => transaction.get(ref)));

      const validatedItems = [];
      const stockUpdates: Array<{
        ref: admin.firestore.DocumentReference;
        updates: Record<string, any>;
        logData: Record<string, any>;
      }> = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const snap = productSnapshots[i];

        if (!snap.exists) {
          throw new Error(`Product "${item.product?.name || item.product?.id}" not found.`);
        }

        const p = snap.data()!;
        const currentStock = typeof p.stockQuantity === 'number' ? p.stockQuantity : Number(p.stockQuantity || 0);

        // Check payment method constraints
        if (p.allowedPaymentMethods && p.allowedPaymentMethods.length > 0 && !p.allowedPaymentMethods.includes("ALL")) {
          if (!p.allowedPaymentMethods.includes(paymentMethod)) {
            throw new Error(`Product "${p.name}" cannot be purchased with the selected payment method.`);
          }
        }

        // Check variant-level stock if product has variants
        let matchedVariant: any = null;
        if (Array.isArray(p.variants) && p.variants.length > 0) {
          const cleanColor = item.selectedColor?.trim().toLowerCase();
          const cleanSize = item.selectedSize?.trim().toLowerCase();

          matchedVariant = p.variants.find((v: any) => {
            const vColor = v.color?.trim().toLowerCase();
            const vSize = v.size?.trim().toLowerCase();
            if (cleanColor && cleanSize) return vColor === cleanColor && vSize === cleanSize;
            if (cleanColor && !cleanSize) return vColor === cleanColor;
            if (!cleanColor && cleanSize) return vSize === cleanSize;
            return false;
          });
        }

        if (matchedVariant) {
          const vStock = typeof matchedVariant.stockQuantity === 'number' ? matchedVariant.stockQuantity : Number(matchedVariant.stockQuantity || 0);
          if (vStock < item.quantity) {
            if (vStock <= 0) {
              throw new Error(`Variant "${p.name} - ${matchedVariant.name || item.selectedColor || item.selectedSize}" just went out of stock.`);
            } else {
              throw new Error(`Only ${vStock} units remain for "${p.name} - ${matchedVariant.name || item.selectedColor || item.selectedSize}".`);
            }
          }

          // Decrement variant stock
          const newVariantStock = vStock - item.quantity;
          const updatedVariants = p.variants.map((v: any) =>
            v.id === matchedVariant.id ? { ...v, stockQuantity: newVariantStock } : v
          );
          const newTotalStock = updatedVariants.reduce((sum: number, v: any) => sum + (Number(v.stockQuantity) || 0), 0);
          const threshold = p.lowStockThreshold || lowStockThreshold;
          const newAvailability = newTotalStock > threshold ? 'in-stock' : (newTotalStock > 0 ? 'low-stock' : 'out-of-stock');

          stockUpdates.push({
            ref: snap.ref,
            updates: {
              variants: updatedVariants,
              stockQuantity: newTotalStock,
              availability: newAvailability,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            },
            logData: {
              productId: snap.id,
              productName: p.name,
              variantId: matchedVariant.id,
              variantName: matchedVariant.name || `${item.selectedColor || ''} ${item.selectedSize || ''}`.trim(),
              type: 'sale',
              change: -item.quantity,
              previousStock: vStock,
              newStock: newVariantStock,
              orderId,
              performedBy: 'checkout',
              createdAt: admin.firestore.FieldValue.serverTimestamp()
            }
          });
        } else {
          // Standard product level stock check
          if (currentStock < item.quantity) {
            if (currentStock <= 0) {
              throw new Error(`Product "${p.name}" just went out of stock.`);
            } else {
              throw new Error(`Only ${currentStock} units remain for "${p.name}". Please adjust your cart.`);
            }
          }

          const newStock = currentStock - item.quantity;
          const threshold = p.lowStockThreshold || lowStockThreshold;
          const newAvailability = newStock > threshold ? 'in-stock' : (newStock > 0 ? 'low-stock' : 'out-of-stock');

          stockUpdates.push({
            ref: snap.ref,
            updates: {
              stockQuantity: newStock,
              availability: newAvailability,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            },
            logData: {
              productId: snap.id,
              productName: p.name,
              variantId: null,
              variantName: null,
              type: 'sale',
              change: -item.quantity,
              previousStock: currentStock,
              newStock: newStock,
              orderId,
              performedBy: 'checkout',
              createdAt: admin.firestore.FieldValue.serverTimestamp()
            }
          });
        }

        validatedItems.push({
          product: {
            id: item.product.id,
            name: p.name,
            price: p.price,
            shippingType: p.shippingType,
            shippingFee: p.shippingFee
          },
          quantity: item.quantity,
          selectedColor: item.selectedColor || null,
          selectedSize: item.selectedSize || null,
          image: p.images?.[0] || null
        });
      }

      // Calculate totals
      let subtotal = 0;
      let discountTotal = 0;

      const processedItems = validatedItems.map(item => {
        const pricing = calculateProductPrice(item.product.price, item.product.id, activeDiscounts);
        subtotal += (item.product.price * item.quantity);
        discountTotal += (pricing.discountAmount * item.quantity);

        return {
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
          image: item.image,
          pricingSnapshot: pricing
        };
      });

      const shippingEngineItems = validatedItems.map(item => ({
        id: item.product.id,
        price: item.product.price,
        quantity: item.quantity,
        shippingType: item.product.shippingType,
        shippingFee: item.product.shippingFee
      }));

      const shippingResult = calculateOrderShipping(subtotal - discountTotal, shippingEngineItems, shippingSettings);
      let total = subtotal - discountTotal + shippingResult.finalShippingFee;

      if (shippingResult.appliedBenefit && shippingResult.appliedBenefit.type !== 'free_shipping') {
        total -= shippingResult.appliedBenefit.value;
      }
      total = Math.max(0, total);

      // 2. Transaction WRITES
      // Apply product stock updates and audit logs
      for (const update of stockUpdates) {
        transaction.update(update.ref, update.updates);
        const logRef = adminDb.collection('inventory_logs').doc();
        transaction.set(logRef, { id: logRef.id, ...update.logData });
      }

      // Save Order Document
      const orderRef = adminDb.collection('orders').doc(orderId);
      const orderData = {
        id: orderId,
        customerInfo,
        customerType,
        paymentMethod,
        paymentProof: paymentProof || null,
        transactionId: transactionId || null,
        items: processedItems,
        subtotal,
        discount: discountTotal,
        shipping: shippingResult.finalShippingFee,
        appliedBenefit: shippingResult.appliedBenefit || null,
        total,
        status: "pending",
        inventoryDeducted: true,
        inventoryRestored: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      transaction.set(orderRef, orderData);

      orderResultData = {
        id: orderId,
        customerInfo,
        items: processedItems,
        total,
        paymentMethod,
        status: "pending",
      };
    });

    // Trigger automated Order Confirmation email after transaction successfully commits
    if (orderResultData) {
      handleOrderStatusEmail(orderResultData, "pending").catch((err) => {
        console.error("[Checkout Order Confirmation Email Error]:", err);
      });
    }

    return NextResponse.json({ success: true, orderId });
  } catch (error: any) {
    console.error("Checkout API Error:", error.message);
    const isOutOfStock = error.message?.includes("out of stock") || error.message?.includes("remain for");
    return NextResponse.json(
      { error: error.message || "An error occurred during checkout", outOfStock: isOutOfStock },
      { status: isOutOfStock ? 409 : 500 }
    );
  }
}
