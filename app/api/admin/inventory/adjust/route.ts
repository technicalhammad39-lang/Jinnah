import { NextResponse } from 'next/server';
import { adminDb, getAdminApp } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { verifyAdminRequest, adminUnauthorizedResponse } from '@/lib/admin-auth-guard';

export async function POST(req: Request) {
  const authResult = await verifyAdminRequest(req);
  if (!authResult.success) {
    return adminUnauthorizedResponse(authResult);
  }

  try {
    const app = getAdminApp();
    if (!app) {
      return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 503 });
    }

    const body = await req.json();
    const adjustments: Array<{
      productId: string;
      variantId?: string | null;
      change?: number; // e.g. +5 or -2
      setStock?: number; // e.g. set to 25
      reason?: string;
    }> = Array.isArray(body.adjustments) ? body.adjustments : [body];

    if (!adjustments || adjustments.length === 0) {
      return NextResponse.json({ error: 'No adjustments provided' }, { status: 400 });
    }

    let updatedCount = 0;

    await adminDb.runTransaction(async (transaction) => {
      // 1. Reads
      const productSnapshots = await Promise.all(
        adjustments.map((adj) =>
          transaction.get(adminDb.collection('products').doc(adj.productId))
        )
      );

      // 2. Writes
      for (let i = 0; i < adjustments.length; i++) {
        const adj = adjustments[i];
        const snap = productSnapshots[i];

        if (!snap.exists) continue;

        const p = snap.data()!;
        const threshold = p.lowStockThreshold || 5;

        if (adj.variantId && Array.isArray(p.variants)) {
          const variant = p.variants.find((v: any) => v.id === adj.variantId);
          if (!variant) continue;

          const currentVStock = Number(variant.stockQuantity || 0);
          let newVStock = currentVStock;

          if (typeof adj.setStock === 'number') {
            newVStock = Math.max(0, adj.setStock);
          } else if (typeof adj.change === 'number') {
            newVStock = Math.max(0, currentVStock + adj.change);
          }

          const actualChange = newVStock - currentVStock;

          const updatedVariants = p.variants.map((v: any) =>
            v.id === adj.variantId ? { ...v, stockQuantity: newVStock } : v
          );
          const newTotal = updatedVariants.reduce((sum: number, v: any) => sum + (Number(v.stockQuantity) || 0), 0);
          const newAvailability = newTotal > threshold ? 'in-stock' : (newTotal > 0 ? 'low-stock' : 'out-of-stock');

          transaction.update(snap.ref, {
            variants: updatedVariants,
            stockQuantity: newTotal,
            availability: newAvailability,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          const logRef = adminDb.collection('inventory_logs').doc();
          transaction.set(logRef, {
            id: logRef.id,
            productId: snap.id,
            productName: p.name,
            variantId: variant.id,
            variantName: variant.name || variant.id,
            type: 'admin_adjustment',
            change: actualChange,
            previousStock: currentVStock,
            newStock: newVStock,
            reason: adj.reason || 'Manual admin inventory adjustment',
            performedBy: 'admin',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          updatedCount++;
        } else {
          const currentStock = typeof p.stockQuantity === 'number' ? p.stockQuantity : Number(p.stockQuantity || 0);
          let newStock = currentStock;

          if (typeof adj.setStock === 'number') {
            newStock = Math.max(0, adj.setStock);
          } else if (typeof adj.change === 'number') {
            newStock = Math.max(0, currentStock + adj.change);
          }

          const actualChange = newStock - currentStock;
          const newAvailability = newStock > threshold ? 'in-stock' : (newStock > 0 ? 'low-stock' : 'out-of-stock');

          transaction.update(snap.ref, {
            stockQuantity: newStock,
            availability: newAvailability,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          const logRef = adminDb.collection('inventory_logs').doc();
          transaction.set(logRef, {
            id: logRef.id,
            productId: snap.id,
            productName: p.name,
            variantId: null,
            variantName: null,
            type: 'admin_adjustment',
            change: actualChange,
            previousStock: currentStock,
            newStock: newStock,
            reason: adj.reason || 'Manual admin inventory adjustment',
            performedBy: 'admin',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          updatedCount++;
        }
      }
    });

    return NextResponse.json({ success: true, updatedCount });
  } catch (error: any) {
    console.error('Inventory adjustment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to adjust inventory' },
      { status: 500 }
    );
  }
}
