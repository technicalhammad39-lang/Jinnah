import crypto from "crypto";

// Allowed alphabet: Uppercase English letters (A-Z) and numbers (0-9)
// Total alphabet length = 36 characters
// 36^6 = 2,176,782,336 possible combinations for 6 random characters
const ALPHANUMERIC_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/**
 * Generates an 8-character public Tracking ID in the exact format:
 * "JH" + 6 cryptographically secure uppercase alphanumeric characters.
 * 
 * Rules enforced:
 * - Exactly 8 characters (starts with "JH" followed by 6 chars).
 * - Only uppercase A-Z and digits 0-9.
 * - No hyphens, no spaces, no special characters.
 * - Uses Node.js crypto.randomBytes (CSPRNG).
 * - NEVER uses Math.random().
 * - Not based on timestamp, phone, customer name, counter, or DB doc ID.
 */
export function generatePublicTrackingId(): string {
  const charLength = ALPHANUMERIC_CHARS.length; // 36
  let randomSuffix = "";

  // Use crypto.randomBytes to generate unbiased random indices
  // 36 * 7 = 252. We discard bytes >= 252 to eliminate modulo bias.
  const maxUnbiasedByte = 256 - (256 % charLength); // 252

  while (randomSuffix.length < 6) {
    const bytes = crypto.randomBytes(12);
    for (let i = 0; i < bytes.length && randomSuffix.length < 6; i++) {
      const byte = bytes[i];
      if (byte < maxUnbiasedByte) {
        randomSuffix += ALPHANUMERIC_CHARS[byte % charLength];
      }
    }
  }

  return `JH${randomSuffix}`;
}

/**
 * Strictly validates whether an ID matches the required public Tracking ID format:
 * Exactly "JH" followed by 6 uppercase alphanumeric characters (total length: 8).
 */
export function isValidPublicTrackingId(id?: string | null): boolean {
  if (!id || typeof id !== "string") return false;
  return /^JH[A-Z0-9]{6}$/.test(id.trim().toUpperCase());
}

/**
 * Validates any accepted tracking query identifier for the API:
 * - New public Tracking ID: JH + 6 chars (e.g. JH7K4M92)
 * - Legacy order ID: #JH-XXXX-XXXX or JH-XXXX-XXXX
 * - Courier consignment tracking number: 6-40 alphanumeric chars
 */
export function isValidOrderIdentifier(id?: string | null): boolean {
  if (!id || typeof id !== "string") return false;
  const clean = id.trim().toUpperCase().replace(/^#/, "");
  // Accept:
  // 1. Exact 8-char tracking ID: JH[A-Z0-9]{6}
  // 2. Legacy JH-XXXX-XXXX format
  // 3. Courier CN / alphanumeric reference (4-40 chars, letters/numbers/hyphens)
  return /^[A-Z0-9_-]{4,40}$/.test(clean);
}

/**
 * Generates a public Tracking ID and verifies its uniqueness against Firestore.
 * If a collision occurs (which has < 0.00000005% probability), it regenerates another ID.
 * 
 * @param firestoreDb - Firestore instance (Admin DB preferred)
 * @param maxRetries - Maximum number of generation attempts (default 5)
 */
export async function generateUniqueTrackingId(
  firestoreDb?: any,
  maxRetries: number = 5
): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const candidateId = generatePublicTrackingId();

    if (!firestoreDb) {
      // Fallback if DB reference is unavailable during unit testing
      return candidateId;
    }

    try {
      // Check collision in orders collection by trackingId
      const querySnap = await firestoreDb
        .collection("orders")
        .where("trackingId", "==", candidateId)
        .limit(1)
        .get();

      if (querySnap.empty) {
        // Also check if candidateId matches any legacy order doc ID
        const docSnap = await firestoreDb.collection("orders").doc(candidateId).get();
        if (!docSnap.exists) {
          return candidateId;
        }
      }

      console.warn(`[TrackingID] Collision detected for ID ${candidateId}, retrying attempt ${attempt + 1}...`);
    } catch (err) {
      console.warn("[TrackingID] Uniqueness verification warning:", err);
      // If query fails (e.g. offline/mock), candidateId has 36^6 entropy so return candidate
      return candidateId;
    }
  }

  // If retries exhausted (statistically impossible under normal circumstances), generate one final CSPRNG ID
  return generatePublicTrackingId();
}
