import { adminDb, getAdminApp } from "@/lib/firebase-admin";

interface TrackRateLimitRecord {
  key: string;
  attempts: number;
  firstAttemptAt: number;
  lastAttemptAt: number;
  blockedUntil: number | null;
}

// In-memory cache for ultra-fast validation
const trackRateLimitCache = new Map<string, TrackRateLimitRecord>();

const IP_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const IP_MAX_ATTEMPTS = 15; // Max 15 lookups per IP per 10 minutes
const IP_BLOCK_DURATION_MS = 10 * 60 * 1000; // 10-minute cooldown

const ORDER_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const ORDER_MAX_FAILED_ATTEMPTS = 5; // Max 5 failed lookups per Order ID per 15 minutes
const ORDER_BLOCK_DURATION_MS = 15 * 60 * 1000; // 15-minute lock on that specific order

function sanitizeKey(prefix: string, raw: string): string {
  return `track_${prefix}_${raw.toLowerCase().replace(/[^a-z0-9_-]/g, "_")}`;
}

/**
 * Checks if a specific key (IP or OrderID) is currently rate limited.
 */
async function getRecord(key: string, windowMs: number): Promise<TrackRateLimitRecord> {
  const now = Date.now();
  const cached = trackRateLimitCache.get(key);

  if (cached && now - cached.lastAttemptAt < windowMs) {
    return cached;
  }

  try {
    const app = getAdminApp();
    if (app) {
      const doc = await adminDb.collection("security_rate_limits").doc(key).get();
      if (doc.exists) {
        const data = doc.data() as TrackRateLimitRecord;
        if (now - data.lastAttemptAt < windowMs) {
          trackRateLimitCache.set(key, data);
          return data;
        }
      }
    }
  } catch (err) {
    // Non-fatal fallback
  }

  const fresh: TrackRateLimitRecord = {
    key,
    attempts: 0,
    firstAttemptAt: now,
    lastAttemptAt: now,
    blockedUntil: null,
  };
  trackRateLimitCache.set(key, fresh);
  return fresh;
}

/**
 * Persists an updated rate limit record.
 */
async function saveRecord(record: TrackRateLimitRecord): Promise<void> {
  trackRateLimitCache.set(record.key, record);
  try {
    const app = getAdminApp();
    if (app) {
      await adminDb.collection("security_rate_limits").doc(record.key).set(record, { merge: true });
    }
  } catch (err) {
    // Non-fatal
  }
}

/**
 * Checks whether the incoming request is allowed to perform an order tracking lookup.
 * Fails closed if rate limit is exceeded.
 */
export async function checkTrackRateLimit(
  clientIp: string,
  orderId: string
): Promise<{ allowed: boolean; error?: string }> {
  const now = Date.now();
  const ipKey = sanitizeKey("ip", clientIp);
  const orderKey = sanitizeKey("ord", orderId);

  const ipRecord = await getRecord(ipKey, IP_WINDOW_MS);
  if (ipRecord.blockedUntil && now < ipRecord.blockedUntil) {
    const waitMins = Math.ceil((ipRecord.blockedUntil - now) / 60000);
    return {
      allowed: false,
      error: `Too many tracking requests from this network. Please wait ${waitMins} minute(s) before trying again.`,
    };
  }

  const orderRecord = await getRecord(orderKey, ORDER_WINDOW_MS);
  if (orderRecord.blockedUntil && now < orderRecord.blockedUntil) {
    const waitMins = Math.ceil((orderRecord.blockedUntil - now) / 60000);
    return {
      allowed: false,
      error: `Too many verification attempts for this order. For security, lookups for this order are temporarily restricted. Please wait ${waitMins} minute(s).`,
    };
  }

  return { allowed: true };
}

/**
 * Records a failed tracking attempt against both the client IP and the targeted Order ID.
 */
export async function recordFailedTrackAttempt(
  clientIp: string,
  orderId: string
): Promise<void> {
  const now = Date.now();
  const ipKey = sanitizeKey("ip", clientIp);
  const orderKey = sanitizeKey("ord", orderId);

  // 1. Update IP record
  const ipRecord = await getRecord(ipKey, IP_WINDOW_MS);
  ipRecord.attempts += 1;
  ipRecord.lastAttemptAt = now;
  if (ipRecord.attempts >= IP_MAX_ATTEMPTS) {
    ipRecord.blockedUntil = now + IP_BLOCK_DURATION_MS;
  }
  await saveRecord(ipRecord);

  // 2. Update Order ID record
  const orderRecord = await getRecord(orderKey, ORDER_WINDOW_MS);
  orderRecord.attempts += 1;
  orderRecord.lastAttemptAt = now;
  if (orderRecord.attempts >= ORDER_MAX_FAILED_ATTEMPTS) {
    orderRecord.blockedUntil = now + ORDER_BLOCK_DURATION_MS;
  }
  await saveRecord(orderRecord);
}

/**
 * Resets the failed attempt counter for a successfully verified Order ID.
 */
export async function resetTrackRateLimit(orderId: string): Promise<void> {
  const orderKey = sanitizeKey("ord", orderId);
  trackRateLimitCache.delete(orderKey);
  try {
    const app = getAdminApp();
    if (app) {
      await adminDb.collection("security_rate_limits").doc(orderKey).delete();
    }
  } catch (err) {
    // Non-fatal
  }
}
