import adminPkg from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const admin = adminPkg.default || adminPkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env.local');
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

let decoded = Buffer.from(base64Key, 'base64').toString('utf8');
let serviceAccount;
if (decoded.trim().startsWith('{')) {
  serviceAccount = JSON.parse(decoded);
} else {
  serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: decoded.replace(/\\n/g, '\n'),
  };
}

const apps = admin.apps || [];
if (!apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function inspect() {
  console.log("=== INSPECTING FIRESTORE PRODUCTS ===");
  const snapshot = await db.collection('products').get();
  console.log(`Total products in Firestore: ${snapshot.size}`);

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

  console.log("\n=== INSPECTING INVENTORY COLLECTION (IF ANY) ===");
  const invSnap = await db.collection('inventory').get();
  console.log(`Total docs in 'inventory': ${invSnap.size}`);
  invSnap.docs.forEach(doc => {
    console.log(`Inv doc ${doc.id}:`, doc.data());
  });

  console.log("\n=== INSPECTING ORDERS COLLECTION ===");
  const ordersSnap = await db.collection('orders').get();
  console.log(`Total orders: ${ordersSnap.size}`);

  process.exit(0);
}

inspect().catch(err => {
  console.error("Inspection error:", err);
  process.exit(1);
});
