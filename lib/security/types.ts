export type DeviceType = "desktop" | "mobile" | "tablet" | "unknown";

export type SessionStatus = "active" | "revoked" | "expired";

export interface AdminSession {
  id: string; // Firestore document ID
  sessionId: string; // Unique cryptographically random session ID
  uid: string; // Firebase Auth user UID
  email: string; // Admin email
  createdAt: string; // ISO timestamp
  lastActiveAt: string; // ISO timestamp
  status: SessionStatus;
  ip: string; // Server-derived IP address
  userAgent: string; // Server-extracted User-Agent
  browser: string; // e.g. Chrome, Firefox, Safari
  os: string; // e.g. Windows, macOS, Linux, Android, iOS
  deviceType: DeviceType;
  revokedAt?: string | null;
  revokedReason?: string | null;
}

export type LoginEventType =
  | "SUCCESSFUL_LOGIN"
  | "FAILED_LOGIN"
  | "LOGOUT"
  | "SESSION_REVOKED"
  | "ALL_SESSIONS_REVOKED"
  | "RATE_LIMITED"
  | "TEMPORARILY_BLOCKED";

export interface LoginHistoryEvent {
  id: string;
  uid: string | null;
  email: string | null;
  eventType: LoginEventType;
  timestamp: string;
  ip: string;
  browser: string;
  os: string;
  deviceType: DeviceType;
  userAgent: string;
  result: "SUCCESS" | "FAILED" | "BLOCKED" | "REVOKED";
  reason: string;
  sessionId: string | null;
}

export interface SecurityAlert {
  id: string;
  type: "MULTIPLE_FAILED_LOGINS" | "SUSPICIOUS_ANOMALY";
  severity: "medium" | "high" | "critical";
  targetEmail: string;
  ip: string;
  browser: string;
  os: string;
  deviceType: DeviceType;
  attemptsCount: number;
  timeWindowMinutes: number;
  createdAt: string;
  status: "unresolved" | "investigating" | "resolved";
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  emailNotificationSent: boolean;
}

export interface RateLimitRecord {
  key: string;
  attempts: number;
  firstAttemptAt: number; // Unix timestamp in ms
  lastAttemptAt: number; // Unix timestamp in ms
  blockedUntil: number | null; // Unix timestamp in ms or null
}
