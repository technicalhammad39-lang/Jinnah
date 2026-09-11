import { DeviceType } from "./types";

export interface ParsedClientContext {
  ip: string;
  userAgent: string;
  browser: string;
  os: string;
  deviceType: DeviceType;
}

// ==========================================
// HOSTINGER REVERSE PROXY & IP DEFINITIONS
// ==========================================

/**
 * Private and loopback IPv4 CIDR blocks.
 * Used to reject spoofed internal addresses from external callers in production.
 */
const PRIVATE_IPV4_CIDRS = [
  "127.0.0.0/8",    // Loopback
  "10.0.0.0/8",     // RFC 1918 Class A
  "172.16.0.0/12",  // RFC 1918 Class B
  "192.168.0.0/16", // RFC 1918 Class C
  "169.254.0.0/16", // Link-local
  "0.0.0.0/8",      // Current network
];

// ==========================================
// IP SANITIZATION & CIDR HELPER FUNCTIONS
// ==========================================

/**
 * Sanitizes and normalizes an incoming IP string.
 * Strips ports, brackets, and IPv4-mapped IPv6 prefixes (e.g. ::ffff:192.0.2.1).
 * Returns null if invalid or malformed.
 */
export function sanitizeIp(rawIp: string | null | undefined): string | null {
  if (!rawIp) return null;
  let ip = rawIp.trim();

  // Strip brackets from IPv6 e.g. [::1]:8080
  if (ip.startsWith("[") && ip.includes("]")) {
    ip = ip.substring(1, ip.indexOf("]"));
  }

  // Strip port if present in IPv4 (e.g. "192.0.2.1:443")
  if (/^(\d{1,3}\.){3}\d{1,3}:\d+$/.test(ip)) {
    ip = ip.split(":")[0];
  }

  // Normalize IPv4-mapped IPv6 (::ffff:192.0.2.1 -> 192.0.2.1)
  if (ip.toLowerCase().startsWith("::ffff:") && ip.includes(".")) {
    ip = ip.substring(7);
  }

  if (isValidIpv4(ip) || isValidIpv6(ip)) {
    return ip;
  }

  return null;
}

export function isValidIpv4(ip: string): boolean {
  if (!ip || ip.length > 15) return false;
  const parts = ip.split(".");
  if (parts.length !== 4) return false;

  for (const part of parts) {
    if (!/^\d+$/.test(part)) return false;
    // Reject leading zeroes to prevent octal notation bypasses
    if (part.length > 1 && part.startsWith("0")) return false;
    const n = Number(part);
    if (isNaN(n) || n < 0 || n > 255) return false;
  }
  return true;
}

export function isValidIpv6(ip: string): boolean {
  if (!ip || ip.length > 45 || ip.length < 2) return false;
  if (!ip.includes(":")) return false;
  return /^[a-fA-F0-9:]+$/.test(ip);
}

/**
 * Converts valid IPv4 string to 32-bit unsigned integer for fast bitwise CIDR matching.
 */
function ipv4ToNumber(ip: string): number | null {
  if (!isValidIpv4(ip)) return null;
  const parts = ip.split(".").map(Number);
  return (((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0);
}

/**
 * Checks if an IPv4 address matches a given CIDR notation (e.g. "10.0.0.0/8").
 */
export function matchesCidrV4(ip: string, cidr: string): boolean {
  const ipNum = ipv4ToNumber(ip);
  if (ipNum === null) return false;

  const [prefix, maskStr] = cidr.split("/");
  const mask = Number(maskStr);
  const prefixNum = ipv4ToNumber(prefix);
  if (prefixNum === null || isNaN(mask) || mask < 0 || mask > 32) return false;

  if (mask === 0) return true;
  const bitmask = ((0xFFFFFFFF << (32 - mask)) >>> 0);
  return (ipNum & bitmask) === (prefixNum & bitmask);
}

/**
 * Determines whether an IP is in the loopback or RFC1918 private range.
 */
export function isPrivateOrLoopbackIp(ip: string): boolean {
  const clean = sanitizeIp(ip);
  if (!clean) return false;

  if (isValidIpv4(clean)) {
    for (const cidr of PRIVATE_IPV4_CIDRS) {
      if (matchesCidrV4(clean, cidr)) return true;
    }
    return false;
  }

  // IPv6 check
  const lower = clean.toLowerCase();
  if (lower === "::1" || lower === "0:0:0:0:0:0:0:1") return true;
  if (lower.startsWith("fe80:") || lower.startsWith("fc00:") || lower.startsWith("fd")) return true;
  return false;
}

// ==========================================
// SECURE CLIENT IP EXTRACTION (HOSTINGER DIRECT)
// ==========================================

/**
 * Safely extracts the client IP address directly from Hostinger's Nginx reverse proxy.
 *
 * HOSTINGER INFRASTRUCTURE SECURITY:
 * 1. Hostinger runs an Nginx reverse proxy directly in front of the Node.js / Next.js app.
 * 2. Nginx sets:
 *    - `proxy_set_header X-Real-IP $remote_addr;`
 *      Set directly by Nginx from the incoming TCP socket. This OVERWRITES any client-sent
 *      `X-Real-IP` header, making it the most authoritative single-point client IP.
 *    - `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`
 *      Appends the client's actual remote address to the END (right side) of the chain.
 * 3. NEVER trust client-prepended values in `X-Forwarded-For`.
 *    If an attacker sends `X-Forwarded-For: 1.1.1.1`, Nginx produces: `1.1.1.1, real_client_ip`.
 *    We evaluate RIGHT-TO-LEFT so that the trusted proxy hop (`real_client_ip`) is extracted,
 *    and client-injected values like `1.1.1.1` are strictly discarded.
 * 4. Arbitrary foreign headers (e.g. `CF-Connecting-IP`, `True-Client-IP`, `Client-IP`) are
 *    ignored because traffic arrives directly via Hostinger.
 * 5. Rejects spoofed private/loopback IPs when running in production against public requests.
 */
export function extractClientIp(req: Request): string {
  const isProduction = process.env.NODE_ENV === "production";

  // 1. Direct connection IP from Hostinger Nginx (proxy_set_header X-Real-IP $remote_addr)
  const rawRealIp = req.headers.get("x-real-ip");
  const directRealIp = sanitizeIp(rawRealIp);

  // 2. Parse X-Forwarded-For chain
  const rawForwarded = req.headers.get("x-forwarded-for");
  const forwardedHops = rawForwarded
    ? rawForwarded
        .split(",")
        .map((s) => sanitizeIp(s))
        .filter((s): s is string => s !== null)
    : [];

  // 3. Right-to-Left evaluation of X-Forwarded-For:
  // Hostinger's Nginx is the 1 trusted reverse proxy hop.
  // The trusted IP added by Nginx is the LAST hop in the chain (hops[hops.length - 1]).
  // Any values to the left (hops[0] .. hops[hops.length - 2]) were provided by the untrusted
  // client and are strictly discarded.
  if (forwardedHops.length > 0) {
    const configuredHops = Number(process.env.TRUSTED_PROXY_HOPS);
    const trustedHops = !isNaN(configuredHops) && configuredHops > 0 ? configuredHops : 1;

    // Support optional custom trusted proxy IP list if configured
    const trustedProxiesEnv = process.env.TRUSTED_PROXIES;
    if (trustedProxiesEnv) {
      const trustedList = trustedProxiesEnv.split(",").map((s) => s.trim().toLowerCase());
      for (let i = forwardedHops.length - 1; i >= 0; i--) {
        const hop = forwardedHops[i];
        const isHopTrusted = trustedList.some((trusted) => {
          if (trusted.includes("/")) return matchesCidrV4(hop, trusted);
          return hop.toLowerCase() === trusted;
        });

        if (!isHopTrusted) {
          if (isProduction && isPrivateOrLoopbackIp(hop) && directRealIp && !isPrivateOrLoopbackIp(directRealIp)) {
            return directRealIp;
          }
          return hop;
        }
      }
    }

    // Default right-to-left hop resolution (1 hop from the right for Hostinger Nginx)
    const targetIndex = Math.max(0, forwardedHops.length - trustedHops);
    const trustedClientIp = forwardedHops[targetIndex];

    if (trustedClientIp) {
      // In production, reject spoofed private IP if connecting over public remote address
      if (isProduction && isPrivateOrLoopbackIp(trustedClientIp) && directRealIp && !isPrivateOrLoopbackIp(directRealIp)) {
        return directRealIp;
      }
      return trustedClientIp;
    }
  }

  // 4. If X-Forwarded-For was absent or empty, use authoritative X-Real-IP set by Hostinger Nginx
  if (directRealIp) {
    return directRealIp;
  }

  // 5. Safe local fallback
  return "127.0.0.1";
}

// ==========================================
// USER AGENT PARSER
// ==========================================

/**
 * Server-side parser for User-Agent string.
 * Categorizes browser, operating system, and hardware form factor.
 */
export function parseUserAgent(uaString: string | null): {
  browser: string;
  os: string;
  deviceType: DeviceType;
} {
  const ua = uaString || "";

  // 1. Device Type
  let deviceType: DeviceType = "desktop";
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) {
    deviceType = "tablet";
  } else if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|NetFront|Opera M(obi|ini)/i.test(ua)) {
    deviceType = "mobile";
  } else if (!ua) {
    deviceType = "unknown";
  }

  // 2. Operating System
  let os = "Unknown OS";
  if (/Windows NT 10.0/i.test(ua)) os = "Windows 10/11";
  else if (/Windows NT 6.3/i.test(ua)) os = "Windows 8.1";
  else if (/Windows NT 6.1/i.test(ua)) os = "Windows 7";
  else if (/Windows NT/i.test(ua)) os = "Windows";
  else if (/Mac OS X 10[._](\d+)/i.test(ua)) {
    const match = ua.match(/Mac OS X 10[._](\d+)/i);
    os = match ? `macOS 10.${match[1]}` : "macOS";
  } else if (/Mac OS X/i.test(ua) || /Macintosh/i.test(ua)) os = "macOS";
  else if (/iPhone OS (\d+[._]\d+)/i.test(ua)) {
    const match = ua.match(/iPhone OS (\d+[._]\d+)/i);
    os = match ? `iOS ${match[1].replace("_", ".")}` : "iOS";
  } else if (/iPad.*OS (\d+[._]\d+)/i.test(ua)) {
    const match = ua.match(/iPad.*OS (\d+[._]\d+)/i);
    os = match ? `iPadOS ${match[1].replace("_", ".")}` : "iPadOS";
  } else if (/Android (\d+(\.\d+)?)/i.test(ua)) {
    const match = ua.match(/Android (\d+(\.\d+)?)/i);
    os = match ? `Android ${match[1]}` : "Android";
  } else if (/Linux/i.test(ua)) os = "Linux";

  // 3. Browser
  let browser = "Unknown Browser";
  if (/Edg\/(\d+)/i.test(ua)) {
    const m = ua.match(/Edg\/(\d+)/i);
    browser = m ? `Edge ${m[1]}` : "Edge";
  } else if (/Chrome\/(\d+)/i.test(ua) && !/Chromium|Edg|OPR/i.test(ua)) {
    const m = ua.match(/Chrome\/(\d+)/i);
    browser = m ? `Chrome ${m[1]}` : "Chrome";
  } else if (/Firefox\/(\d+)/i.test(ua)) {
    const m = ua.match(/Firefox\/(\d+)/i);
    browser = m ? `Firefox ${m[1]}` : "Firefox";
  } else if (/Version\/(\d+).*Safari/i.test(ua)) {
    const m = ua.match(/Version\/(\d+)/i);
    browser = m ? `Safari ${m[1]}` : "Safari";
  } else if (/OPR\/(\d+)|Opera/i.test(ua)) {
    browser = "Opera";
  } else if (/MSIE|Trident/i.test(ua)) {
    browser = "Internet Explorer";
  }

  return { browser, os, deviceType };
}

/**
 * Returns complete sanitized request context.
 */
export function getClientRequestContext(req: Request): ParsedClientContext {
  const ip = extractClientIp(req);
  const userAgent = req.headers.get("user-agent") || "Unknown";
  const { browser, os, deviceType } = parseUserAgent(userAgent);

  return {
    ip,
    userAgent,
    browser,
    os,
    deviceType,
  };
}
