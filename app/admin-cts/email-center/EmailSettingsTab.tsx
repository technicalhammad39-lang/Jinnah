"use client";

import { useState, useEffect } from "react";
import { 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Lock, 
  Mail, 
  Inbox, 
  Server, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Sparkles,
  RefreshCw,
  Send,
  HelpCircle,
  ExternalLink,
  Info
} from "lucide-react";
import { EmailSettings } from "@/lib/email/types";
import { toast } from "sonner";

// Provider Preset Configurations
const PROVIDER_PRESETS: Record<
  string,
  {
    name: string;
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
    imapHost: string;
    imapPort: number;
    imapSecure: boolean;
  }
> = {
  hostinger: {
    name: "Hostinger Webmail",
    smtpHost: "smtp.hostinger.com",
    smtpPort: 465,
    smtpSecure: true,
    imapHost: "imap.hostinger.com",
    imapPort: 993,
    imapSecure: true,
  },
  gmail: {
    name: "Gmail / Google Workspace",
    smtpHost: "smtp.gmail.com",
    smtpPort: 465,
    smtpSecure: true,
    imapHost: "imap.gmail.com",
    imapPort: 993,
    imapSecure: true,
  },
  google_workspace: {
    name: "Google Workspace (Custom Domain)",
    smtpHost: "smtp.gmail.com",
    smtpPort: 465,
    smtpSecure: true,
    imapHost: "imap.gmail.com",
    imapPort: 993,
    imapSecure: true,
  },
  microsoft_365: {
    name: "Microsoft 365 / Outlook",
    smtpHost: "smtp-mail.outlook.com",
    smtpPort: 587,
    smtpSecure: false,
    imapHost: "outlook.office365.com",
    imapPort: 993,
    imapSecure: true,
  },
  zoho: {
    name: "Zoho Mail",
    smtpHost: "smtppro.zoho.com",
    smtpPort: 465,
    smtpSecure: true,
    imapHost: "imappro.zoho.com",
    imapPort: 993,
    imapSecure: true,
  },
  yahoo: {
    name: "Yahoo Mail",
    smtpHost: "smtp.mail.yahoo.com",
    smtpPort: 465,
    smtpSecure: true,
    imapHost: "imap.mail.yahoo.com",
    imapPort: 993,
    imapSecure: true,
  },
  custom: {
    name: "Custom Mail Server (cPanel / VPS)",
    smtpHost: "",
    smtpPort: 465,
    smtpSecure: true,
    imapHost: "",
    imapPort: 993,
    imapSecure: true,
  },
};

export default function EmailSettingsTab() {
  const [settings, setSettings] = useState<EmailSettings>({
    providerPreset: "hostinger",
    smtpEnabled: true,
    smtpHost: "smtp.hostinger.com",
    smtpPort: 465,
    smtpUser: "info@jinnah-hardwarestore.com",
    smtpPassword: "",
    smtpSecure: true,
    fromEmail: "info@jinnah-hardwarestore.com",
    fromName: "Jinnah Hardware Store",
    replyToEmail: "info@jinnah-hardwarestore.com",

    imapEnabled: true,
    imapHost: "imap.hostinger.com",
    imapPort: 993,
    imapUser: "info@jinnah-hardwarestore.com",
    imapPassword: "",
    imapSecure: true,
    autoSyncIntervalMinutes: 15,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [showImapPass, setShowImapPass] = useState(false);

  // Testing connection states
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [isTestingImap, setIsTestingImap] = useState(false);
  const [imapTestResult, setImapTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Live test email dispatch
  const [testEmailTo, setTestEmailTo] = useState("");
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  // Load settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/email/settings");
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
          if (data.settings.fromEmail) {
            setTestEmailTo(data.settings.fromEmail);
          }
        }
      } catch (err) {
        console.error("Failed to load email settings:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  // Handle Preset Change
  const handlePresetSelect = (presetKey: string) => {
    const preset = PROVIDER_PRESETS[presetKey];
    if (!preset) return;

    setSettings((prev) => ({
      ...prev,
      providerPreset: presetKey as any,
      smtpHost: preset.smtpHost || prev.smtpHost,
      smtpPort: preset.smtpPort || prev.smtpPort,
      smtpSecure: preset.smtpSecure,
      imapHost: preset.imapHost || prev.imapHost,
      imapPort: preset.imapPort || prev.imapPort,
      imapSecure: preset.imapSecure,
    }));

    toast.info(`Applied default connection settings for ${preset.name}`);
  };

  // Test Connection
  const handleTest = async (type: "smtp" | "imap") => {
    if (type === "smtp") {
      setIsTestingSmtp(true);
      setSmtpTestResult(null);
    } else {
      setIsTestingImap(true);
      setImapTestResult(null);
    }

    try {
      const sanitizedConfig = {
        ...settings,
        smtpHost: (settings.smtpHost || "").trim(),
        smtpUser: (settings.smtpUser || "").trim(),
        imapHost: (settings.imapHost || "").trim(),
        imapUser: (settings.imapUser || "").trim(),
      };

      const res = await fetch("/api/admin/email/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, config: sanitizedConfig }),
      });
      const data = await res.json();

      if (type === "smtp") {
        setSmtpTestResult(data);
      } else {
        setImapTestResult(data);
      }

      if (data.success) {
        toast.success(data.message || `${type.toUpperCase()} connection verified!`);
      } else {
        toast.error(data.message || `${type.toUpperCase()} connection failed.`);
      }
    } catch (err: any) {
      const msg = err.message || "Failed to reach server test endpoint";
      if (type === "smtp") setSmtpTestResult({ success: false, message: msg });
      else setImapTestResult({ success: false, message: msg });
      toast.error(msg);
    } finally {
      if (type === "smtp") setIsTestingSmtp(false);
      else setIsTestingImap(false);
    }
  };

  // Live Test Email Dispatch
  const handleSendTestEmail = async () => {
    if (!testEmailTo || !testEmailTo.includes("@")) {
      toast.error("Please enter a valid recipient email address for testing");
      return;
    }

    setIsSendingTestEmail(true);
    setTestEmailResult(null);

    try {
      const res = await fetch("/api/admin/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testEmailTo.trim(),
          subject: `Test Email from Jinnah Hardware Store (${new Date().toLocaleTimeString()})`,
          bodyHtml: `
            <div style="font-family:sans-serif; max-width:600px; margin:auto; border:1px solid #eee; border-radius:12px; padding:24px;">
              <h2 style="color:#FF6A2A; margin-top:0;">SMTP Connection Verified!</h2>
              <p>Congratulations! Your business mail server configuration is working properly.</p>
              <p><strong>Host:</strong> ${settings.smtpHost}:${settings.smtpPort}</p>
              <p><strong>Sender:</strong> ${settings.fromName} &lt;${settings.fromEmail || settings.smtpUser}&gt;</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              <hr style="border:none; border-top:1px solid #eee; margin:20px 0;" />
              <small style="color:#777;">Sent via Enterprise Email Center - Jinnah Hardware Store</small>
            </div>
          `,
          bodyText: `SMTP Connection Verified! Congratulations, your mail server (${settings.smtpHost}) is sending successfully!`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to dispatch test email.");
      }

      setTestEmailResult({
        success: true,
        message: `Test email sent successfully to ${testEmailTo}! Message ID: ${data.messageId}`,
      });
      toast.success(`Test email delivered to ${testEmailTo}`);
    } catch (err: any) {
      setTestEmailResult({
        success: false,
        message: err.message || "Failed to send test email.",
      });
      toast.error(err.message || "Test email dispatch failed");
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  // Save Settings
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: EmailSettings = {
        ...settings,
        smtpHost: (settings.smtpHost || "").trim(),
        smtpUser: (settings.smtpUser || "").trim(),
        fromEmail: (settings.fromEmail || settings.smtpUser || "").trim(),
        fromName: (settings.fromName || "Jinnah Hardware Store").trim(),
        replyToEmail: (settings.replyToEmail || settings.fromEmail || "").trim(),
        imapHost: (settings.imapHost || "").trim(),
        imapUser: (settings.imapUser || "").trim(),
        smtpPort: Number(settings.smtpPort) || 465,
        imapPort: Number(settings.imapPort) || 993,
        smtpSecure: settings.smtpSecure !== undefined ? Boolean(settings.smtpSecure) : Number(settings.smtpPort) === 465,
        imapSecure: settings.imapSecure !== undefined ? Boolean(settings.imapSecure) : Number(settings.imapPort) === 993,
      };

      const res = await fetch("/api/admin/email/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      toast.success("Settings saved and credentials securely encrypted!");

      // Refresh settings to reflect masked passwords
      const getRes = await fetch("/api/admin/email/settings");
      const getData = await getRes.json();
      if (getData.success && getData.settings) {
        setSettings(getData.settings);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save email settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl mx-auto p-4 md:p-6 pb-24">
      {/* Top Banner & Sticky Save Trigger */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="text-base font-extrabold text-foreground">
              Enterprise SMTP & IMAP Configuration
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
            Configure your business mail servers. Passwords are encrypted at rest using AES-256-GCM.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-primary/20 hover:bg-primary/95 transition-all disabled:opacity-60 shrink-0"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save & Encrypt</span>
            </>
          )}
        </button>
      </div>

      {/* Hostinger Setup Helper Banner */}
      <div className="rounded-2xl border border-blue-500/20 bg-blue-50/60 p-4 sm:p-5 text-xs text-blue-950 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-blue-900">
            <Info className="h-4 w-4 text-blue-600 shrink-0" />
            <span>Hostinger Business Webmail Setup Instructions</span>
          </div>
          <a
            href="https://mail.hostinger.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:underline"
          >
            <span>Open Hostinger Webmail</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-white/70 p-3 rounded-xl border border-blue-200/50">
          <div>
            <strong className="text-blue-950">Outgoing SMTP:</strong> <code className="bg-blue-100/60 px-1 py-0.5 rounded font-mono">smtp.hostinger.com</code> (Port 465 SSL, or Port 587 STARTTLS)
          </div>
          <div>
            <strong className="text-blue-950">Incoming IMAP:</strong> <code className="bg-blue-100/60 px-1 py-0.5 rounded font-mono">imap.hostinger.com</code> (Port 993 SSL)
          </div>
        </div>
        <p className="text-[11px] text-blue-800 leading-relaxed">
          <strong>Crucial Password Reminder:</strong> In Hostinger, your email password is the one created specifically in <strong>hPanel &gt; Emails &gt; Manage &gt; Choose Account</strong>. It is often different from your main Hostinger hosting account password. Verify your credentials by logging in at <a href="https://mail.hostinger.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold">mail.hostinger.com</a> first.
        </p>
      </div>

      {/* Provider Preset Selector */}
      <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-xs">
        <label className="block text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-3">
          Select Your Email Provider Preset
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {Object.entries(PROVIDER_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              onClick={() => handlePresetSelect(key)}
              className={`p-3 rounded-xl border text-left transition-all ${
                settings.providerPreset === key
                  ? "border-primary bg-primary/5 text-primary font-bold shadow-xs"
                  : "border-black/10 bg-[#faf9f6] text-foreground hover:border-black/20"
              }`}
            >
              <p className="text-xs">{preset.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* SMTP Configuration (Outgoing) */}
      <div className="rounded-2xl border border-black/5 bg-white p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-black/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">SMTP Outgoing Mail Server</h3>
              <p className="text-xs text-muted-foreground">Used for composing, customer replies, and notifications</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.smtpEnabled}
              onChange={(e) => setSettings({ ...settings, smtpEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-black/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-muted-foreground mb-1">SMTP Host</label>
            <input
              type="text"
              placeholder="smtp.hostinger.com"
              value={settings.smtpHost}
              onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
              className="w-full rounded-xl border border-black/10 bg-[#faf9f6] p-3 font-mono text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">SMTP Port</label>
            <input
              type="number"
              placeholder="465"
              value={settings.smtpPort}
              onChange={(e) => {
                const portVal = Number(e.target.value);
                setSettings({
                  ...settings,
                  smtpPort: portVal,
                  smtpSecure: portVal === 465,
                });
              }}
              className="w-full rounded-xl border border-black/10 bg-[#faf9f6] p-3 font-mono text-sm outline-none focus:border-primary"
            />
            <p className="text-[10px] text-muted-foreground mt-1">465 (SSL/TLS) or 587 (STARTTLS)</p>
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">SMTP Username / Email</label>
            <input
              type="text"
              placeholder="info@jinnah-hardwarestore.com"
              value={settings.smtpUser}
              onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
              className="w-full rounded-xl border border-black/10 bg-[#faf9f6] p-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">SMTP Password</label>
            <div className="relative">
              <input
                type={showSmtpPass ? "text" : "password"}
                placeholder="Enter password..."
                value={settings.smtpPassword || ""}
                onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })}
                className="w-full rounded-xl border border-black/10 bg-[#faf9f6] p-3 text-sm outline-none focus:border-primary pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSmtpPass(!showSmtpPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              >
                {showSmtpPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Sender Name (From Name)</label>
            <input
              type="text"
              placeholder="Jinnah Hardware Store"
              value={settings.fromName}
              onChange={(e) => setSettings({ ...settings, fromName: e.target.value })}
              className="w-full rounded-xl border border-black/10 bg-[#faf9f6] p-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">From Email Address</label>
            <input
              type="email"
              placeholder="info@jinnah-hardwarestore.com"
              value={settings.fromEmail}
              onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
              className="w-full rounded-xl border border-black/10 bg-[#faf9f6] p-3 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-black/5">
          <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold">
            <input
              type="checkbox"
              checked={settings.smtpSecure}
              onChange={(e) => setSettings({ ...settings, smtpSecure: e.target.checked })}
              className="h-4 w-4 rounded accent-primary cursor-pointer"
            />
            <span>Use SSL / TLS Encryption (Checked for Port 465, Unchecked for Port 587)</span>
          </label>

          <button
            type="button"
            disabled={isTestingSmtp}
            onClick={() => handleTest("smtp")}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-all shrink-0"
          >
            {isTestingSmtp ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            <span>Test SMTP Connection</span>
          </button>
        </div>

        {smtpTestResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
              smtpTestResult.success
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-rose-50 border-rose-200 text-rose-900"
            }`}
          >
            <div className="flex items-start gap-2">
              {smtpTestResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <strong>{smtpTestResult.success ? "SMTP Success:" : "SMTP Verification Notice:"}</strong>{" "}
                {smtpTestResult.message}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* IMAP Configuration (Incoming) */}
      <div className="rounded-2xl border border-black/5 bg-white p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-black/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Inbox className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">IMAP Incoming Mail Server</h3>
              <p className="text-xs text-muted-foreground">Synchronizes your business email inbox directly into the dashboard</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.imapEnabled}
              onChange={(e) => setSettings({ ...settings, imapEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-black/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-muted-foreground mb-1">IMAP Host</label>
            <input
              type="text"
              placeholder="imap.hostinger.com"
              value={settings.imapHost}
              onChange={(e) => setSettings({ ...settings, imapHost: e.target.value })}
              className="w-full rounded-xl border border-black/10 bg-[#faf9f6] p-3 font-mono text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">IMAP Port</label>
            <input
              type="number"
              placeholder="993"
              value={settings.imapPort}
              onChange={(e) => setSettings({ ...settings, imapPort: Number(e.target.value) })}
              className="w-full rounded-xl border border-black/10 bg-[#faf9f6] p-3 font-mono text-sm outline-none focus:border-primary"
            />
            <p className="text-[10px] text-muted-foreground mt-1">Default 993 (SSL)</p>
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">IMAP Username</label>
            <input
              type="text"
              placeholder="info@jinnah-hardwarestore.com"
              value={settings.imapUser}
              onChange={(e) => setSettings({ ...settings, imapUser: e.target.value })}
              className="w-full rounded-xl border border-black/10 bg-[#faf9f6] p-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">IMAP Password</label>
            <div className="relative">
              <input
                type={showImapPass ? "text" : "password"}
                placeholder="Enter password..."
                value={settings.imapPassword || ""}
                onChange={(e) => setSettings({ ...settings, imapPassword: e.target.value })}
                className="w-full rounded-xl border border-black/10 bg-[#faf9f6] p-3 text-sm outline-none focus:border-primary pr-10"
              />
              <button
                type="button"
                onClick={() => setShowImapPass(!showImapPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              >
                {showImapPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-black/5">
          <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold">
            <input
              type="checkbox"
              checked={settings.imapSecure}
              onChange={(e) => setSettings({ ...settings, imapSecure: e.target.checked })}
              className="h-4 w-4 rounded accent-primary cursor-pointer"
            />
            <span>Use SSL / TLS (Default Port 993)</span>
          </label>

          <button
            type="button"
            disabled={isTestingImap}
            onClick={() => handleTest("imap")}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-blue-300 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-800 hover:bg-blue-100 transition-all shrink-0"
          >
            {isTestingImap ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            <span>Test IMAP Connection</span>
          </button>
        </div>

        {imapTestResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
              imapTestResult.success
                ? "bg-blue-50 border-blue-200 text-blue-900"
                : "bg-rose-50 border-rose-200 text-rose-900"
            }`}
          >
            <div className="flex items-start gap-2">
              {imapTestResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <strong>{imapTestResult.success ? "IMAP Success:" : "IMAP Verification Notice:"}</strong>{" "}
                {imapTestResult.message}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Test Email Dispatcher */}
      <div className="rounded-2xl border border-black/5 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b border-black/5 pb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-primary">
            <Send className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Send Test Email</h3>
            <p className="text-xs text-muted-foreground">Verify that outbound emails actually reach an external inbox</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="Enter destination email (e.g., your personal gmail)"
            value={testEmailTo}
            onChange={(e) => setTestEmailTo(e.target.value)}
            className="flex-1 rounded-xl border border-black/10 bg-[#faf9f6] p-3 text-xs outline-none focus:border-primary"
          />
          <button
            type="button"
            disabled={isSendingTestEmail}
            onClick={handleSendTestEmail}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-bold text-white shadow-sm hover:bg-primary/95 transition-all disabled:opacity-60 shrink-0"
          >
            {isSendingTestEmail ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            <span>{isSendingTestEmail ? "Sending..." : "Dispatch Test Email"}</span>
          </button>
        </div>

        {testEmailResult && (
          <div
            className={`p-3 rounded-xl border text-xs ${
              testEmailResult.success
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {testEmailResult.message}
          </div>
        )}
      </div>

      {/* Signature Section */}
      <div className="rounded-2xl border border-black/5 bg-white p-5 sm:p-6 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-foreground">Email Signature (HTML)</h3>
        <p className="text-xs text-muted-foreground">Appended to the bottom of all outbound messages and replies.</p>
        <textarea
          rows={3}
          placeholder="<p>Best regards,<br/><strong>Jinnah Hardware Support Desk</strong></p>"
          value={settings.signatureHtml || ""}
          onChange={(e) => setSettings({ ...settings, signatureHtml: e.target.value })}
          className="w-full rounded-xl border border-black/10 bg-[#faf9f6] p-3 text-xs font-mono outline-none focus:border-primary"
        />
      </div>

      {/* Sticky Bottom Save Button for Mobile / Small Screens */}
      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-primary/25 hover:bg-primary/95 transition-all disabled:opacity-60"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save & Encrypt Configuration</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
