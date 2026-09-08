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
  RefreshCw
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
    smtpUser: "info@hammadgfx.online",
    smtpPassword: "",
    smtpSecure: true,
    fromEmail: "info@hammadgfx.online",
    fromName: "Jinnah Hardware Store",
    replyToEmail: "info@hammadgfx.online",

    imapEnabled: true,
    imapHost: "imap.hostinger.com",
    imapPort: 993,
    imapUser: "info@hammadgfx.online",
    imapPassword: "",
    imapSecure: true,
    autoSyncIntervalMinutes: 15,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [showImapPass, setShowImapPass] = useState(false);

  // Testing states
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [isTestingImap, setIsTestingImap] = useState(false);
  const [imapTestResult, setImapTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Load settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/email/settings");
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
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
      const res = await fetch("/api/admin/email/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, config: settings }),
      });
      const data = await res.json();

      if (type === "smtp") {
        setSmtpTestResult(data);
      } else {
        setImapTestResult(data);
      }

      if (data.success) {
        toast.success(data.message || `${type.toUpperCase()} connection successful!`);
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

  // Save Settings
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/email/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      toast.success("Settings saved and credentials securely encrypted!");
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
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl mx-auto p-4 md:p-6 pb-20">
      {/* Top Banner */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-extrabold text-foreground">
              Enterprise SMTP & IMAP Configuration
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Configure your business mail servers. Passwords are automatically encrypted at rest using AES-256-GCM.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-primary/20 hover:bg-primary/95 transition-all disabled:opacity-60 shrink-0"
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

      {/* Provider Preset Dropdown */}
      <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-xs">
        <label className="block text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-2">
          Select Your Email Provider Preset
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
      <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-black/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">SMTP Outgoing Mail Server</h3>
              <p className="text-xs text-muted-foreground">Used for composing, order confirmations, and notifications</p>
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
              onChange={(e) => setSettings({ ...settings, smtpPort: Number(e.target.value) })}
              className="w-full rounded-xl border border-black/10 bg-[#faf9f6] p-3 font-mono text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">SMTP Username / Email</label>
            <input
              type="text"
              placeholder="info@hammadgfx.online"
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
              placeholder="info@hammadgfx.online"
              value={settings.fromEmail}
              onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
              className="w-full rounded-xl border border-black/10 bg-[#faf9f6] p-3 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-black/5">
          <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold">
            <input
              type="checkbox"
              checked={settings.smtpSecure}
              onChange={(e) => setSettings({ ...settings, smtpSecure: e.target.checked })}
              className="h-4 w-4 rounded accent-primary cursor-pointer"
            />
            <span>Use SSL / TLS Encryption (Recommended on Port 465)</span>
          </label>

          <button
            type="button"
            disabled={isTestingSmtp}
            onClick={() => handleTest("smtp")}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-all"
          >
            {isTestingSmtp ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            <span>Test SMTP Connection</span>
          </button>
        </div>

        {smtpTestResult && (
          <div
            className={`p-3 rounded-xl border text-xs ${
              smtpTestResult.success
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {smtpTestResult.message}
          </div>
        )}
      </div>

      {/* IMAP Configuration (Incoming) */}
      <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-xs space-y-6">
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
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">IMAP Username</label>
            <input
              type="text"
              placeholder="info@hammadgfx.online"
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showImapPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-black/5">
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
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-blue-300 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-800 hover:bg-blue-100 transition-all"
          >
            {isTestingImap ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            <span>Test IMAP Connection</span>
          </button>
        </div>

        {imapTestResult && (
          <div
            className={`p-3 rounded-xl border text-xs ${
              imapTestResult.success
                ? "bg-blue-50 border-blue-200 text-blue-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {imapTestResult.message}
          </div>
        )}
      </div>

      {/* Signature Section */}
      <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-foreground">Email Signature (HTML)</h3>
        <p className="text-xs text-muted-foreground">Appended to the bottom of all outbound messages and replies.</p>
        <textarea
          rows={3}
          placeholder="<p>Best regards,<br/><strong>Jinnah Hardware Support Desk</strong></p>"
          value={settings.signatureHtml || ""}
          onChange={(e) => setSettings({ ...settings, signatureHtml: e.target.value })}
          className="w-full rounded-xl border border-black/10 bg-[#faf9f6] p-3 text-sm font-mono outline-none focus:border-primary"
        />
      </div>
    </form>
  );
}
