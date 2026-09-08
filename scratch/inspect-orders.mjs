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

async function inspectOrders() {
  const snapshot = await getDocs(collection(db, "orders"));
  console.log(`Total orders: ${snapshot.size}`);
  snapshot.docs.forEach((doc, idx) => {
    console.log(`Order ${idx + 1}: ${doc.id}`);
    console.log(JSON.stringify(doc.data(), null, 2));
  });
  process.exit(0);
}

inspectOrders().catch(err => {
  console.error(err);
  process.exit(1);
});
