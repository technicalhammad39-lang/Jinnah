export type EmailFolder =
  | "inbox"
  | "sent"
  | "drafts"
  | "outbox"
  | "scheduled"
  | "starred"
  | "important"
  | "spam"
  | "archive"
  | "trash";

export interface EmailAttachment {
  filename: string;
  contentType: string;
  size: number;
  content?: string; // base64 encoded content
  url?: string; // cloud/local storage public URL
  cid?: string; // content-id for inline images
}

export interface EmailMessage {
  id: string; // Firestore document ID or IMAP UID
  dbKey?: string;
  folder: EmailFolder;
  conversationId: string;
  threadId?: string;
  from: {
    name: string;
    email: string;
  };
  to: Array<{
    name?: string;
    email: string;
  }>;
  cc?: Array<{
    name?: string;
    email: string;
  }>;
  bcc?: Array<{
    name?: string;
    email: string;
  }>;
  replyTo?: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  snippet: string;
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
  hasAttachments: boolean;
  attachments?: EmailAttachment[];
  status: "received" | "sent" | "draft" | "queued" | "scheduled" | "failed";
  messageId?: string;
  inReplyTo?: string;
  references?: string[];
  uid?: number; // IMAP UID
  scheduledAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface EmailSettings {
  // Provider preset
  providerPreset:
    | "hostinger"
    | "gmail"
    | "google_workspace"
    | "outlook"
    | "microsoft_365"
    | "zoho"
    | "yahoo"
    | "custom";

  // SMTP Configuration (Outgoing)
  smtpEnabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword?: string; // Encrypted in DB, masked in UI
  smtpSecure: boolean; // SSL/TLS (port 465) vs STARTTLS (port 587)
  fromEmail: string;
  fromName: string;
  replyToEmail?: string;

  // IMAP Configuration (Incoming)
  imapEnabled: boolean;
  imapHost: string;
  imapPort: number;
  imapUser: string;
  imapPassword?: string; // Encrypted in DB, masked in UI
  imapSecure: boolean; // SSL/TLS (usually port 993)
  autoSyncIntervalMinutes: number; // e.g. 5, 15, 30
  lastSyncAt?: string | null;

  // Personalization
  signatureHtml?: string;
  defaultReplyTemplateId?: string;
  updatedAt?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  slug: string;
  subject: string;
  category: "order" | "customer" | "marketing" | "notification" | "general";
  bodyHtml: string;
  variables: string[];
  isDefault?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface EmailSubscriber {
  id: string;
  email: string;
  name?: string;
  status: "subscribed" | "unsubscribed" | "bounced";
  tags?: string[];
  source?: string;
  subscribedAt: string;
}

export interface NewsletterCampaign {
  id: string;
  title: string;
  subject: string;
  bodyHtml: string;
  recipientsCount: number;
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  scheduledAt?: string | null;
  sentAt?: string | null;
  stats?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    failed: number;
  };
  createdAt: string;
}

export interface EmailLog {
  id: string;
  type: "smtp_send" | "imap_sync" | "automation" | "newsletter" | "system";
  status: "success" | "error" | "warning" | "info";
  to?: string;
  from?: string;
  subject?: string;
  messageId?: string;
  errorDetails?: string;
  timestamp: string;
}
