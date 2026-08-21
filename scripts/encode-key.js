const fs = require('fs');
const path = require('path');

// Usage: node scripts/encode-key.js <path-to-private-key-file>
// Example: node scripts/encode-key.js ./my-key.pem

const keyPath = process.argv[2];

if (!keyPath) {
  console.error("Please provide the path to your private key file.");
  console.error("Usage: node scripts/encode-key.js <path-to-private-key-file>");
  process.exit(1);
}

try {
  const fullPath = path.resolve(process.cwd(), keyPath);
  const rawKey = fs.readFileSync(fullPath, 'utf8');
  
  // Ensure we are working with the correct string, removing accidental whitespace padding
  const trimmedKey = rawKey.trim();
  
  // Convert to Base64
  const base64Key = Buffer.from(trimmedKey).toString('base64');
  
  console.log("\n✅ Successfully encoded to Base64.\n");
  console.log("Copy the following string and paste it into Hostinger as the value for FIREBASE_PRIVATE_KEY_BASE64:\n");
  console.log(base64Key);
  console.log("\n");
} catch (error) {
  console.error("Error reading file:", error.message);
  process.exit(1);
}
