import { NextResponse } from 'next/server';
import { adminDb, getAdminApp } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { handleOrderStatusEmail } from '@/lib/email/automation';

export async function POST(req: Request) {
  try {
    const app = getAdminApp();
    if (!app) {
      return NextResponse.json(
        { error: 'Firebase Admin not configured' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { orderId, newStatus, restoreInventory = false, note } = body;

    if (!orderId || !newStatus) {
      return NextResponse.json(
        { error: 'Missing orderId or newStatus' },
        { status: 400 }
      );
    }

    const orderRef = adminDb.collection('orders').doc(orderId);

    let updatedOrderData: any = null;
    let inventoryWasRestored = false;

    await adminDb.runTransaction(async (transaction) => {
      const orderSnap = await transaction.get(orderRef);
      if (!orderSnap.exists) {
        throw new Error(`Order ${orderId} not found`);
      }

      const orderData = orderSnap.data()!;
      const previousStatus = orderData.status;

      // Determine if inventory should be restored
      const shouldRestore =
        (newStatus === 'cancelled' || (newStatus === 'refunded' && restoreInventory === true)) &&
        orderData.inventoryDeducted === true &&
        orderData.inventoryRestored !== true;

      const orderUpdates: Record<string, any> = {
        status: newStatus,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (note) {
        orderUpdates.statusNote = note;
      }

      if (shouldRestore && Array.isArray(orderData.items)) {
        // Reads must precede writes: fetch all product docs first
        const productSnapshots = await Promise.all(
          orderData.items.map((item: any) =>
            transaction.get(adminDb.collection('products').doc(item.productId))
          )
        );

        for (let i = 0; i < orderData.items.length; i++) {
          const item = orderData.items[i];
          const pSnap = productSnapshots[i];

          if (!pSnap.exists) continue;

          const p = pSnap.data()!;
          const threshold = p.lowStockThreshold || 5;

          // Check if item corresponds to a variant
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
            const currentVStock = Number(matchedVariant.stockQuantity || 0);
            const newVStock = currentVStock + item.quantity;
            const updatedVariants = p.variants.map((v: any) =>
              v.id === matchedVariant.id ? { ...v, stockQuantity: newVStock } : v
            );
            const newTotal = updatedVariants.reduce((sum: number, v: any) => sum + (Number(v.stockQuantity) || 0), 0);
            const newAvailability = newTotal > threshold ? 'in-stock' : (newTotal > 0 ? 'low-stock' : 'out-of-stock');

            transaction.update(pSnap.ref, {
              variants: updatedVariants,
              stockQuantity: newTotal,
              availability: newAvailability,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            const logRef = adminDb.collection('inventory_logs').doc();
            transaction.set(logRef, {
              id: logRef.id,
              productId: pSnap.id,
              productName: p.name,
              variantId: matchedVariant.id,
              variantName: matchedVariant.name || `${item.selectedColor || ''} ${item.selectedSize || ''}`.trim(),
              type: newStatus === 'cancelled' ? 'cancellation_restock' : 'refund_restock',
              change: item.quantity,
              previousStock: currentVStock,
              newStock: newVStock,
              orderId,
              performedBy: 'admin',
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          } else {
            const currentStock = typeof p.stockQuantity === 'number' ? p.stockQuantity : Number(p.stockQuantity || 0);
            const newStock = currentStock + item.quantity;
            const newAvailability = newStock > threshold ? 'in-stock' : (newStock > 0 ? 'low-stock' : 'out-of-stock');

            transaction.update(pSnap.ref, {
              stockQuantity: newStock,
              availability: newAvailability,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            const logRef = adminDb.collection('inventory_logs').doc();
            transaction.set(logRef, {
              id: logRef.id,
              productId: pSnap.id,
              productName: p.name,
              variantId: null,
              variantName: null,
              type: newStatus === 'cancelled' ? 'cancellation_restock' : 'refund_restock',
              change: item.quantity,
              previousStock: currentStock,
              newStock: newStock,
              orderId,
              performedBy: 'admin',
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          }
        }

        orderUpdates.inventoryRestored = true;
        orderUpdates.inventoryRestoredAt = admin.firestore.FieldValue.serverTimestamp();
        inventoryWasRestored = true;
      }

      transaction.update(orderRef, orderUpdates);

      updatedOrderData = {
        ...orderData,
        ...orderUpdates,
        id: orderId,
      };
    });

    // Send email notification for status change
    if (updatedOrderData) {
      handleOrderStatusEmail(updatedOrderData, newStatus).catch((err) => {
        console.error('[Admin Order Status Email Error]:', err);
      });
    }

    return NextResponse.json({
      success: true,
      orderId,
      newStatus,
      inventoryRestored: inventoryWasRestored,
    });
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update order status' },
      { status: 500 }
    );
  }
}
