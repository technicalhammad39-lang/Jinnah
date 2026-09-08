import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCYRcCVnd7YA_UYtfE8naP7W-a5fCiJWUo",
  authDomain: "jinnah-hardware-store.firebaseapp.com",
  projectId: "jinnah-hardware-store",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function inspectSettings() {
  const docSnap = await getDoc(doc(db, "settings", "global"));
  console.log("Global settings:", docSnap.exists() ? docSnap.data() : "No global settings doc");
  process.exit(0);
}

inspectSettings().catch(err => {
  console.error(err);
  process.exit(1);
});
