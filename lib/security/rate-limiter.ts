import { adminDb, getAdminApp } from "@/lib/firebase-admin";
import { RateLimitRecord } from "./types";

// In-memory cache to keep verification lightning fast
const memoryCache = new Map<string, RateLimitRecord>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minute sliding window
const SHORT_BLOCK_MS = 5 * 60 * 1000; // 5 minute restriction
const EXTENDED_BLOCK_MS = 15 * 60 * 1000; // 15 minute restriction

export interface RateLimitStatus {
  allowed: boolean;
  progressiveDelayMs: number;
  blockedUntil: number | null;
  remainingSeconds: number;
  attemptsCount: number;
  isTriggerAlertThreshold: boolean;
}

function sanitizeKey(prefix: string, value: string): string {
  // Replace invalid Firestore document characters (/ . # $ [ ])
  return `${prefix}_${value.toLowerCase().replace(/[^a-z0-9_-]/g, "_")}`;
}

/**
 * Checks rate-limit status for a given key (IP or Account).
 */
async function checkKeyRateLimit(key: string): Promise<RateLimitRecord> {
  const now = Date.now();

  // 1. Check in-memory cache
  const cached = memoryCache.get(key);
  if (cached && now - cached.lastAttemptAt < WINDOW_MS) {
    return cached;
  }

  // 2. Check Firestore record
  try {
    const app = getAdminApp();
    if (app) {
      const docSnap = await adminDb.collection("security_rate_limits").doc(key).get();
      if (docSnap.exists) {
        const data = docSnap.data() as RateLimitRecord;
        if (now - data.lastAttemptAt < WINDOW_MS) {
          memoryCache.set(key, data);
          return data;
        }
      }
    }
  } catch (err) {
    console.warn("[RateLimiter] Firestore read fallback error:", err);
  }

  // Default fresh record
  const fresh: RateLimitRecord = {
    key,
    attempts: 0,
    firstAttemptAt: now,
    lastAttemptAt: now,
    blockedUntil: null,
  };
  memoryCache.set(key, fresh);
  return fresh;
}

/**
 * Evaluates dual-layer rate limiting for both the client IP and targeted Email.
 */
export async function evaluateLoginRateLimit(
  clientIp: string,
  targetEmail: string
): Promise<RateLimitStatus> {
  const now = Date.now();
  const ipKey = sanitizeKey("ip", clientIp);
  const emailKey = sanitizeKey("acc", targetEmail || "unknown");

  const [ipRecord, emailRecord] = await Promise.all([
    checkKeyRateLimit(ipKey),
    checkKeyRateLimit(emailKey),
  ]);

  // Check if either is actively blocked
  const ipBlocked = ipRecord.blockedUntil && ipRecord.blockedUntil > now;
  const emailBlocked = emailRecord.blockedUntil && emailRecord.blockedUntil > now;

  if (ipBlocked || emailBlocked) {
    const blockedUntil = Math.max(
      ipBlocked ? ipRecord.blockedUntil! : 0,
      emailBlocked ? emailRecord.blockedUntil! : 0
    );
    const remainingSeconds = Math.ceil((blockedUntil - now) / 1000);

    return {
      allowed: false,
      progressiveDelayMs: 0,
      blockedUntil,
      remainingSeconds,
      attemptsCount: Math.max(ipRecord.attempts, emailRecord.attempts),
      isTriggerAlertThreshold: false,
    };
  }

  const maxAttempts = Math.max(ipRecord.attempts, emailRecord.attempts);

  // Progressive delays:
  // 1-3 failures: 0ms delay
  // 4-5 failures: 1500ms delay
  let progressiveDelayMs = 0;
  if (maxAttempts >= 4) {
    progressiveDelayMs = 1500;
  }

  return {
    allowed: true,
    progressiveDelayMs,
    blockedUntil: null,
    remainingSeconds: 0,
    attemptsCount: maxAttempts,
    isTriggerAlertThreshold: maxAttempts >= 5,
  };
}

/**
 * Records a failed login attempt for both IP and Account, applying progressive locks.
 */
export async function recordFailedLoginAttempt(
  clientIp: string,
  targetEmail: string
): Promise<{ attemptsCount: number; isTriggerAlert: boolean; blockedUntil: number | null }> {
  const now = Date.now();
  const ipKey = sanitizeKey("ip", clientIp);
  const emailKey = sanitizeKey("acc", targetEmail || "unknown");

  const [ipRecord, emailRecord] = await Promise.all([
    checkKeyRateLimit(ipKey),
    checkKeyRateLimit(emailKey),
  ]);

  const updateRecord = (rec: RateLimitRecord): RateLimitRecord => {
    // Reset window if expired
    const isExpired = now - rec.lastAttemptAt > WINDOW_MS;
    const newAttempts = isExpired ? 1 : rec.attempts + 1;
    let blockedUntil: number | null = null;

    if (newAttempts >= 9) {
      blockedUntil = now + EXTENDED_BLOCK_MS; // 15 min lock
    } else if (newAttempts >= 6) {
      blockedUntil = now + SHORT_BLOCK_MS; // 5 min lock
    }

    return {
      key: rec.key,
      attempts: newAttempts,
      firstAttemptAt: isExpired ? now : rec.firstAttemptAt,
      lastAttemptAt: now,
      blockedUntil,
    };
  };

  const newIpRecord = updateRecord(ipRecord);
  const newEmailRecord = updateRecord(emailRecord);

  memoryCache.set(ipKey, newIpRecord);
  memoryCache.set(emailKey, newEmailRecord);

  // Persist to Firestore asynchronously
  try {
    const app = getAdminApp();
    if (app) {
      const batch = adminDb.batch();
      batch.set(adminDb.collection("security_rate_limits").doc(ipKey), newIpRecord);
      batch.set(adminDb.collection("security_rate_limits").doc(emailKey), newEmailRecord);
      await batch.commit();
    }
  } catch (err) {
    console.warn("[RateLimiter] Failed to persist rate limit record to Firestore:", err);
  }

  const maxAttempts = Math.max(newIpRecord.attempts, newEmailRecord.attempts);
  const blockedUntil = newIpRecord.blockedUntil || newEmailRecord.blockedUntil;

  return {
    attemptsCount: maxAttempts,
    isTriggerAlert: maxAttempts === 5 || maxAttempts === 9,
    blockedUntil,
  };
}

/**
 * Resets the failed attempts counter for IP and Account upon successful authentication.
 */
export async function resetLoginRateLimit(clientIp: string, targetEmail: string): Promise<void> {
  const ipKey = sanitizeKey("ip", clientIp);
  const emailKey = sanitizeKey("acc", targetEmail || "unknown");

  memoryCache.delete(ipKey);
  memoryCache.delete(emailKey);

  try {
    const app = getAdminApp();
    if (app) {
      const batch = adminDb.batch();
      batch.delete(adminDb.collection("security_rate_limits").doc(ipKey));
      batch.delete(adminDb.collection("security_rate_limits").doc(emailKey));
      await batch.commit();
    }
  } catch (err) {
    console.warn("[RateLimiter] Failed to clear rate limit documents:", err);
  }
}
