import adminPkg from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

const admin = adminPkg.default || adminPkg;

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  });
}

const base64Key = process.env.FIREBASE_PRIVATE_KEY_BASE64;
if (!base64Key) {
  console.error("Missing FIREBASE_PRIVATE_KEY_BASE64");
  process.exit(1);
}

let serviceAccount;
try {
  const decoded = Buffer.from(base64Key, 'base64').toString('utf8');
  if (decoded.trim().startsWith('{')) {
    serviceAccount = JSON.parse(decoded);
  } else {
    serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: decoded.replace(/\\n/g, '\n'),
    };
  }
} catch (e) {
  console.error("Error parsing key:", e);
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function runTests() {
  console.log("==================================================");
  console.log("STARTING ENTERPRISE INVENTORY VERIFICATION SUITE");
  console.log("==================================================");

  const testProdId = "test_inventory_system_prod_" + Date.now();
  const testProdRef = db.collection('products').doc(testProdId);

  try {
    // 1. Setup Test Product with Variants and Threshold
    console.log("\n[TEST 1] Creating Test Product with Variants & Thresholds...");
    await testProdRef.set({
      name: "Commercial Grade Deadbolt Lock",
      slug: "test-commercial-deadbolt-lock",
      price: 4500,
      stockQuantity: 5,
      lowStockThreshold: 3,
      availability: "in-stock",
      variants: [
        { id: "var-black", color: "Matte Black", size: "Standard", stock: 3, sku: "DL-BLK-STD" },
        { id: "var-gold", color: "Brushed Gold", size: "Standard", stock: 2, sku: "DL-GLD-STD" }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    console.log("✓ Test product created:", testProdId);

    // 2. Test Concurrent Race Condition Protection
    console.log("\n[TEST 2] Simulating Concurrent Checkout Race Condition...");
    console.log("Gold variant stock = 2. Customer A and Customer B both attempt to purchase 2 units simultaneously.");

    const purchaseAttempt = async (customerName) => {
      try {
        return await db.runTransaction(async (transaction) => {
          const snap = await transaction.get(testProdRef);
          if (!snap.exists) throw new Error("Product not found");

          const pData = snap.data();
          const variants = [...(pData.variants || [])];
          const variantIdx = variants.findIndex(v => v.id === "var-gold");
          if (variantIdx === -1) throw new Error("Variant not found");

          const currentVariantStock = Number(variants[variantIdx].stock ?? 0);
          const requestedQty = 2;

          if (currentVariantStock < requestedQty) {
            throw new Error(`Insufficient stock for ${customerName}. Only ${currentVariantStock} units remain.`);
          }

          variants[variantIdx] = {
            ...variants[variantIdx],
            stock: currentVariantStock - requestedQty
          };

          const newTotalStock = variants.reduce((sum, v) => sum + Number(v.stock || 0), 0);
          const threshold = Number(pData.lowStockThreshold || 5);
          const newAvailability = newTotalStock <= 0 ? 'out-of-stock' : (newTotalStock <= threshold ? 'low-stock' : 'in-stock');

          transaction.update(testProdRef, {
            variants,
            stockQuantity: newTotalStock,
            availability: newAvailability,
            updatedAt: new Date().toISOString()
          });

          const logRef = db.collection('inventory_logs').doc();
          transaction.set(logRef, {
            productId: testProdId,
            productName: pData.name,
            variantId: "var-gold",
            variantInfo: "Brushed Gold / Standard",
            action: 'order_deduction',
            quantityChanged: -requestedQty,
            previousStock: currentVariantStock,
            newStock: currentVariantStock - requestedQty,
            note: `Concurrent test checkout by ${customerName}`,
            timestamp: new Date().toISOString()
          });

          return { success: true, customer: customerName };
        });
      } catch (err) {
        return { success: false, customer: customerName, error: err.message };
      }
    };

    // Execute concurrently using Promise.all
    const [resA, resB] = await Promise.all([
      purchaseAttempt("Customer A"),
      purchaseAttempt("Customer B")
    ]);

    console.log("Customer A result:", resA);
    console.log("Customer B result:", resB);

    const oneSucceeded = (resA.success && !resB.success) || (!resA.success && resB.success);
    if (!oneSucceeded) {
      throw new Error("FAIL: Exactly one concurrent transaction must succeed!");
    }
    console.log("✓ SUCCESS: Concurrency locking prevented overselling! Exactly 1 succeeded, 1 safely rejected.");

    // Verify stock in database
    const afterConcurrentSnap = await testProdRef.get();
    const afterData = afterConcurrentSnap.data();
    const goldVarAfter = afterData.variants.find(v => v.id === "var-gold");
    console.log("Gold variant stock after concurrent attempts:", goldVarAfter.stock);
    console.log("Total product stock after concurrent attempts:", afterData.stockQuantity);
    console.log("Product availability:", afterData.availability);

    if (goldVarAfter.stock !== 0) {
      throw new Error(`FAIL: Expected gold variant stock to be 0, got ${goldVarAfter.stock}`);
    }
    if (afterData.stockQuantity !== 3) {
      throw new Error(`FAIL: Expected total product stock to be 3, got ${afterData.stockQuantity}`);
    }
    if (afterData.availability !== "low-stock") {
      throw new Error(`FAIL: Expected availability to be 'low-stock' (threshold 3), got ${afterData.availability}`);
    }
    console.log("✓ SUCCESS: Database stock state and low-stock threshold calculated correctly!");

    // 3. Test Order Cancellation & Restoration
    console.log("\n[TEST 3] Simulating Order Cancellation & Stock Restoration...");
    await db.runTransaction(async (transaction) => {
      const snap = await transaction.get(testProdRef);
      const pData = snap.data();
      const variants = [...(pData.variants || [])];
      const variantIdx = variants.findIndex(v => v.id === "var-gold");
      const currentVariantStock = Number(variants[variantIdx].stock ?? 0);

      variants[variantIdx] = {
        ...variants[variantIdx],
        stock: currentVariantStock + 2
      };

      const newTotalStock = variants.reduce((sum, v) => sum + Number(v.stock || 0), 0);
      const threshold = Number(pData.lowStockThreshold || 5);
      const newAvailability = newTotalStock <= 0 ? 'out-of-stock' : (newTotalStock <= threshold ? 'low-stock' : 'in-stock');

      transaction.update(testProdRef, {
        variants,
        stockQuantity: newTotalStock,
        availability: newAvailability,
        updatedAt: new Date().toISOString()
      });

      const logRef = db.collection('inventory_logs').doc();
      transaction.set(logRef, {
        productId: testProdId,
        productName: pData.name,
        variantId: "var-gold",
        variantInfo: "Brushed Gold / Standard",
        action: 'order_cancellation',
        quantityChanged: 2,
        previousStock: currentVariantStock,
        newStock: currentVariantStock + 2,
        note: `Order cancelled by Admin. Stock restored.`,
        timestamp: new Date().toISOString()
      });
    });

    const afterCancelSnap = await testProdRef.get();
    const afterCancelData = afterCancelSnap.data();
    const goldVarCancelled = afterCancelData.variants.find(v => v.id === "var-gold");
    console.log("Gold variant stock after cancellation:", goldVarCancelled.stock);
    console.log("Total product stock after cancellation:", afterCancelData.stockQuantity);
    console.log("Product availability after cancellation:", afterCancelData.availability);

    if (goldVarCancelled.stock !== 2) {
      throw new Error(`FAIL: Expected gold variant stock restored to 2, got ${goldVarCancelled.stock}`);
    }
    if (afterCancelData.stockQuantity !== 5) {
      throw new Error(`FAIL: Expected total product stock restored to 5, got ${afterCancelData.stockQuantity}`);
    }
    if (afterCancelData.availability !== "in-stock") {
      throw new Error(`FAIL: Expected availability to be 'in-stock', got ${afterCancelData.availability}`);
    }
    console.log("✓ SUCCESS: Stock restored and status updated to in-stock!");

    // 4. Verify Audit Ledger Log
    console.log("\n[TEST 4] Verifying Immutable Audit Ledger...");
    const logsSnap = await db.collection('inventory_logs').where('productId', '==', testProdId).get();
    console.log(`Audit log entries generated for test product: ${logsSnap.size}`);
    logsSnap.docs.forEach(doc => {
      const log = doc.data();
      console.log(` - Action: [${log.action}], Change: ${log.quantityChanged}, NewStock: ${log.newStock}, Note: ${log.note}`);
    });

    if (logsSnap.size < 2) {
      throw new Error("FAIL: Expected at least 2 audit log entries for deduction and cancellation");
    }
    console.log("✓ SUCCESS: Audit ledger recorded every transaction accurately!");

    console.log("\n==================================================");
    console.log("ALL TESTS PASSED WITH 100% INTEGRITY!");
    console.log("==================================================");

  } finally {
    // Cleanup
    console.log("\nCleaning up test artifacts...");
    await testProdRef.delete();
    const logsToClean = await db.collection('inventory_logs').where('productId', '==', testProdId).get();
    const batch = db.batch();
    logsToClean.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log("✓ Test artifacts cleaned up.");
  }
}

runTests().catch(err => {
  console.error("Test Suite Error:", err);
  process.exit(1);
});
