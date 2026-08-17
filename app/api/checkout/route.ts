import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerInfo, items, paymentMethod, customerType, couponCode } = body;
    
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Server-side validation
    let subtotal = 0;
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
      
      const itemPrice = p.price;
      subtotal += itemPrice * item.quantity;
      
      validatedItems.push({
        productId: item.product.id,
        name: p.name,
        price: itemPrice,
        quantity: item.quantity,
        selectedColor: item.selectedColor || null,
        selectedSize: item.selectedSize || null,
        image: p.images?.[0] || null
      });
    }
    
    let discount = 0;
    let appliedCoupon = null;
    
    // Process Coupon
    if (couponCode) {
      const couponQuery = await adminDb.collection('coupons').where('code', '==', couponCode.toUpperCase()).get();
      if (!couponQuery.empty) {
        const cDoc = couponQuery.docs[0];
        const c = cDoc.data();
        
        const now = new Date();
        const isExpired = c.expiryDate && new Date(c.expiryDate) < now;
        const isLimitReached = c.usageLimit > 0 && c.usedCount >= c.usageLimit;
        
        if (c.active && !isExpired && !isLimitReached) {
          if (!c.minOrderAmount || subtotal >= c.minOrderAmount) {
            // Valid coupon
            appliedCoupon = c.code;
            if (c.discountType === 'percentage') {
              discount = (subtotal * c.discountValue) / 100;
            } else {
              discount = c.discountValue;
            }
            
            if (discount > subtotal) discount = subtotal; // don't go below 0

            // Increment used count immediately in a transaction or just update
            await adminDb.collection('coupons').doc(cDoc.id).update({
              usedCount: admin.firestore.FieldValue.increment(1)
            });
          }
        }
      }
    }
    
    const total = subtotal - discount;
    
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
      items: validatedItems,
      subtotal,
      discount,
      appliedCoupon,
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
