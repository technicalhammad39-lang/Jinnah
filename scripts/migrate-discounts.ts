import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1]] = match[2];
    }
  });
}

const base64Key = process.env.FIREBASE_PRIVATE_KEY_BASE64;
if (!base64Key) {
  console.error("Missing FIREBASE_PRIVATE_KEY_BASE64");
  process.exit(1);
}

const serviceAccount = JSON.parse(Buffer.from(base64Key, 'base64').toString('utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function runMigration() {
  console.log("Starting Discount Migration...");
  
  const productsRef = db.collection('products');
  const discountsRef = db.collection('discounts');
  
  const snapshot = await productsRef.get();
  console.log(`Found ${snapshot.size} products to process.`);
  
  let migratedCount = 0;
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    
    // Check if the product has a manual discount (originalPrice > price)
    if (data.originalPrice && data.price && data.originalPrice > data.price) {
      const basePrice = data.originalPrice;
      const sellingPrice = data.price;
      const discountAmount = basePrice - sellingPrice;
      
      console.log(`Migrating product ${doc.id} (${data.name}). Base: ${basePrice}, Selling: ${sellingPrice}`);
      
      // 1. Create a fixed discount for this product
      const discountRef = discountsRef.doc();
      await discountRef.set({
        id: discountRef.id,
        name: `Legacy Discount - ${data.name}`,
        description: 'Automatically migrated from legacy product originalPrice',
        type: 'fixed',
        value: discountAmount,
        scope: 'product',
        productIds: [doc.id],
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // 2. Update product so `price` is the base price
      await doc.ref.update({
        price: basePrice,
        // We can keep originalPrice as information or nullify it, but the instruction says "make price the universal base price"
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      migratedCount++;
    }
  }
  
  console.log(`Migration completed successfully. Migrated ${migratedCount} products.`);
  process.exit(0);
}

runMigration().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
