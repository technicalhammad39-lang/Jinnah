import { NextResponse } from 'next/server';
import { adminDb, getAdminApp } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { calculateProductPrice, Discount } from '@/lib/discount-engine';

export async function POST(req: Request) {
  try {
    // Early check: Firebase Admin must be available for checkout
    const app = getAdminApp();
    if (!app) {
      console.error('[Checkout] Firebase Admin is not configured. Cannot process orders.');
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support. (Code: FA_MISSING)' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { customerInfo, items, paymentMethod, customerType } = body;
    
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Server-side validation
    const validatedItems = [];
    
    for (const item of items) {
      const productDoc = await adminDb.collection('products').doc(item.product.id).get();
      if (!productDoc.exists) {
        return NextResponse.json({ error: `Product ${item.product.name} not found.` }, { status: 400 });
      }
      const p = productDoc.data()!;
      
      // Check stock
      if ((p.stockQuantity || 0) < item.quantity) {
        return NextResponse.json({ error: `Not enough stock for ${p.name}. Only ${p.stockQuantity || 0} left.` }, { status: 400 });
      }
      
      // Check payment methods constraints
      if (p.allowedPaymentMethods && p.allowedPaymentMethods.length > 0 && !p.allowedPaymentMethods.includes("ALL")) {
        if (!p.allowedPaymentMethods.includes(paymentMethod)) {
          return NextResponse.json({ error: `Product "${p.name}" cannot be purchased with the selected payment method.` }, { status: 400 });
        }
      }
      
      validatedItems.push({
        product: {
          id: item.product.id,
          name: p.name,
          price: p.price,
        },
        quantity: item.quantity,
        selectedColor: item.selectedColor || null,
        selectedSize: item.selectedSize || null,
        image: p.images?.[0] || null
      });
    }
    
    // Fetch active discounts from server
    const discountsSnap = await adminDb.collection('discounts').where('isActive', '==', true).get();
    const activeDiscounts = discountsSnap.docs.map(doc => {
      const data = doc.data();
      return { id: doc.id, ...data } as Discount;
    });

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
    
    const total = subtotal - discountTotal;
    
    // Batch write to update stock and save order
    const batch = adminDb.batch();
    
    for (const item of items) {
      const pRef = adminDb.collection('products').doc(item.product.id);
      batch.update(pRef, {
        stockQuantity: admin.firestore.FieldValue.increment(-item.quantity)
      });
    }
    
    // Generate Order ID
    const generateOrderId = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = 'JH-';
      for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
      result += '-';
      for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
      return result;
    };
    
    const orderId = generateOrderId();
    
    const orderRef = adminDb.collection('orders').doc(orderId);
    batch.set(orderRef, {
      id: orderId,
      customerInfo,
      customerType,
      paymentMethod,
      items: processedItems,
      subtotal,
      discount: discountTotal,
      total,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    await batch.commit();
    
    return NextResponse.json({ success: true, orderId });
  } catch (error: any) {
    console.error("Checkout API Error:", error);
    return NextResponse.json({ error: error.message || "An error occurred during checkout" }, { status: 500 });
  }
}
