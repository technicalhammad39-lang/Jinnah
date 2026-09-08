import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCYRcCVnd7YA_UYtfE8naP7W-a5fCiJWUo",
  authDomain: "jinnah-hardware-store.firebaseapp.com",
  projectId: "jinnah-hardware-store",
  storageBucket: "jinnah-hardware-store.firebasestorage.app",
  messagingSenderId: "1064074776262",
  appId: "1:1064074776262:web:14815df163d675210191c7",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function normalizeInventory() {
  console.log("Starting inventory normalization...");
  const productsSnap = await getDocs(collection(db, "products"));
  console.log(`Found ${productsSnap.size} products to normalize.`);

  let updatedCount = 0;

  for (const productDoc of productsSnap.docs) {
    const data = productDoc.data();
    const currentStock = typeof data.stockQuantity === 'number' ? data.stockQuantity : Number(data.stockQuantity || 0);
    const lowStockThreshold = typeof data.lowStockThreshold === 'number' ? data.lowStockThreshold : 5;
    
    let availability = "out-of-stock";
    if (currentStock > lowStockThreshold) {
      availability = "in-stock";
    } else if (currentStock > 0) {
      availability = "low-stock";
    }

    const updates = {
      stockQuantity: currentStock,
      availability: availability,
      lowStockThreshold: lowStockThreshold,
    };

    // If variants exist, normalize each variant
    if (Array.isArray(data.variants) && data.variants.length > 0) {
      let variantTotalStock = 0;
      const normalizedVariants = data.variants.map((v, i) => {
        const vStock = typeof v.stockQuantity === 'number' ? v.stockQuantity : Number(v.stockQuantity || 0);
        variantTotalStock += vStock;
        return {
          ...v,
          id: v.id || `variant-${i + 1}`,
          stockQuantity: vStock
        };
      });
      updates.variants = normalizedVariants;
      updates.stockQuantity = variantTotalStock;
      updates.availability = variantTotalStock > lowStockThreshold ? "in-stock" : (variantTotalStock > 0 ? "low-stock" : "out-of-stock");
    }

    await updateDoc(doc(db, "products", productDoc.id), updates);
    console.log(`Normalized product: ${data.name || productDoc.id} -> Stock: ${updates.stockQuantity}, Availability: ${updates.availability}`);

    // Create baseline inventory log if no logs exist
    const logRef = doc(collection(db, "inventory_logs"));
    await setDoc(logRef, {
      id: logRef.id,
      productId: productDoc.id,
      productName: data.name || "Unnamed Product",
      type: "initial",
      change: 0,
      previousStock: currentStock,
      newStock: updates.stockQuantity,
      reason: "System inventory baseline normalization",
      performedBy: "system/migration",
      createdAt: serverTimestamp()
    });

    updatedCount++;
  }

  console.log(`Successfully normalized ${updatedCount} products.`);
  process.exit(0);
}

normalizeInventory().catch(err => {
  console.error("Normalization error:", err);
  process.exit(1);
});
