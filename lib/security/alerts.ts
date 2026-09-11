import { adminDb, getAdminApp } from "@/lib/firebase-admin";
import { SecurityAlert } from "./types";
import { ParsedClientContext } from "./request-context";
import { getStoredEmailSettings } from "@/lib/email/db";
import { sendEmailViaSmtp } from "@/lib/email/smtp";
import crypto from "crypto";

// In-memory anti-spam tracker: alertKey -> lastSentTimestamp
const emailAlertSuppressionMap = new Map<string, number>();
const EMAIL_SUPPRESSION_WINDOW_MS = 60 * 60 * 1000; // 1 hour anti-spam throttle

export interface TriggerAlertParams {
  targetEmail: string;
  clientContext: ParsedClientContext;
  attemptsCount: number;
}

/**
 * Creates a security alert in Firestore and optionally sends a throttled email notification.
 */
export async function triggerFailedLoginSecurityAlert(params: TriggerAlertParams): Promise<void> {
  const alertId = `alert_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const now = Date.now();
  const timestamp = new Date(now).toISOString();
  const suppressionKey = `${params.clientContext.ip}_${params.targetEmail.toLowerCase()}`;

  let shouldSendEmail = true;
  const lastSent = emailAlertSuppressionMap.get(suppressionKey);
  if (lastSent && now - lastSent < EMAIL_SUPPRESSION_WINDOW_MS) {
    shouldSendEmail = false; // Anti-spam suppression active
  }

  const alertDoc: SecurityAlert = {
    id: alertId,
    type: "MULTIPLE_FAILED_LOGINS",
    severity: params.attemptsCount >= 8 ? "critical" : "high",
    targetEmail: params.targetEmail,
    ip: params.clientContext.ip,
    browser: params.clientContext.browser,
    os: params.clientContext.os,
    deviceType: params.clientContext.deviceType,
    attemptsCount: params.attemptsCount,
    timeWindowMinutes: 15,
    createdAt: timestamp,
    status: "unresolved",
    emailNotificationSent: shouldSendEmail,
  };

  // 1. Save alert record to Firestore
  try {
    const app = getAdminApp();
    if (app) {
      await adminDb.collection("security_alerts").doc(alertId).set(alertDoc);
    }
  } catch (err: any) {
    console.error("[SecurityAlert] Failed to save alert to Firestore:", err?.message || err);
  }

  // 2. Dispatch email notification if permitted and SMTP is configured
  if (shouldSendEmail) {
    emailAlertSuppressionMap.set(suppressionKey, now);

    try {
      const emailSettings = await getStoredEmailSettings();
      if (emailSettings && emailSettings.smtpEnabled && emailSettings.smtpUser) {
        const recipientEmail = emailSettings.fromEmail || emailSettings.smtpUser;

        const emailSubject = `⚠️ [Security Alert] Multiple Failed Admin Logins Detected`;
        const emailBodyHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #fee2e2; border-radius: 16px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; padding: 12px 18px; border-radius: 12px; background-color: #fef2f2; color: #dc2626; font-size: 24px; font-weight: bold;">
                🛡️ Security Alert
              </div>
              <h2 style="color: #111827; margin: 16px 0 6px 0; font-size: 20px;">Suspicious Admin Login Activity</h2>
              <p style="color: #6b7280; font-size: 14px; margin: 0;">Automated brute-force defense system notification</p>
            </div>

            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #374151;">
                <strong>Incident Summary:</strong> Multiple consecutive failed admin login attempts were detected within a 15-minute window. Progressive throttling and temporary IP/account restrictions have been enforced.
              </p>
              <table style="width: 100%; font-size: 13px; color: #4b5563; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; font-weight: 600; width: 140px;">Target Account:</td>
                  <td style="padding: 6px 0; font-family: monospace; color: #111827;">${params.targetEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: 600;">Originating IP:</td>
                  <td style="padding: 6px 0; font-family: monospace; color: #dc2626; font-weight: bold;">${params.clientContext.ip}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: 600;">Failed Attempts:</td>
                  <td style="padding: 6px 0; font-weight: bold; color: #dc2626;">${params.attemptsCount} attempts</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: 600;">Device & Browser:</td>
                  <td style="padding: 6px 0;">${params.clientContext.browser} on ${params.clientContext.os} (${params.clientContext.deviceType})</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: 600;">Detection Time:</td>
                  <td style="padding: 6px 0;">${new Date(timestamp).toLocaleString()}</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 13px; color: #6b7280; line-height: 1.5; margin: 0 0 16px 0;">
              If this was you, you can safely disregard this warning after waiting for the lockout timer to expire. If you did not initiate these attempts, consider rotating your admin credentials and reviewing your active sessions.
            </p>

            <div style="border-top: 1px solid #f3f4f6; padding-top: 16px; text-align: center;">
              <a href="https://jinnah-hardwarestore.com/admin-cts/security" style="display: inline-block; background-color: #FF6A2A; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 13px; padding: 10px 20px; border-radius: 10px;">
                Review Active Sessions & Security Logs
              </a>
            </div>
          </div>
        `;

        await sendEmailViaSmtp({
          settings: emailSettings,
          to: recipientEmail,
          subject: emailSubject,
          html: emailBodyHtml,
          text: `[Security Alert] ${params.attemptsCount} failed admin login attempts detected for ${params.targetEmail} from IP ${params.clientContext.ip}. Review security logs at /admin-cts/security`,
        });
      }
    } catch (err: any) {
      console.warn("[SecurityAlert] Failed to dispatch security alert email (non-fatal):", err?.message || err);
    }
  }
}
