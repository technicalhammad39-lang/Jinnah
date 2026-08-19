const fs = require('fs');
const envConfig = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const match = line.match(/^([^#\s][^=]+)=(.*)$/);
  if (match) {
    let key = match[1].trim();
    let val = match[2].trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
    acc[key] = val;
    process.env[key] = val;
  }
  return acc;
}, {});
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const source = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

async function updateRules() {
  try {
    const rules = admin.securityRules();
    console.log("Creating ruleset...");
    const rulesetSource = {
      name: "firestore.rules",
      content: source
    };
    const ruleset = await rules.createRuleset(rulesetSource);
    console.log("Releasing ruleset...", ruleset.name);
    await rules.releaseFirestoreRuleset(ruleset.name);
    console.log("Successfully updated Firestore rules.");
  } catch (err) {
    console.error("Error:", err);
  }
}

updateRules();
