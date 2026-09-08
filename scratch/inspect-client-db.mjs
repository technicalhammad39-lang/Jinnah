import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function inspect() {
  console.log("=== INSPECTING FIRESTORE WITH CLIENT SDK ===");
  const snapshot = await getDocs(collection(db, "products"));
  console.log(`Total products: ${snapshot.size}`);

  snapshot.docs.forEach((doc, idx) => {
    const data = doc.data();
    console.log(`\n[Product ${idx + 1}] ID: ${doc.id}`);
    console.log(`Name: ${data.name}`);
    console.log(`stockQuantity: ${data.stockQuantity} (type: ${typeof data.stockQuantity})`);
    console.log(`stock: ${data.stock} (type: ${typeof data.stock})`);
    console.log(`availability: ${data.availability} (type: ${typeof data.availability})`);
    console.log(`quantity: ${data.quantity} (type: ${typeof data.quantity})`);
    console.log(`variants: ${JSON.stringify(data.variants || null)}`);
    console.log(`All keys: ${Object.keys(data).join(', ')}`);
  });

  const invSnap = await getDocs(collection(db, "inventory"));
  console.log(`\nTotal docs in 'inventory': ${invSnap.size}`);

  process.exit(0);
}

inspect().catch(err => {
  console.error("Inspection error:", err);
  process.exit(1);
});
