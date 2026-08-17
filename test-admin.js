const { getFirebaseAdminApp } = require("./lib/firebase-admin");

async function test() {
  try {
    console.log("Initializing Firebase Admin...");
    const app = getFirebaseAdminApp();
    if (app) {
      console.log("Firebase Admin initialized successfully.");
    } else {
      console.log("Firebase Admin failed to initialize (returned null).");
    }
  } catch (e) {
    console.error("Firebase Admin Error:", e);
  }
}

test();
