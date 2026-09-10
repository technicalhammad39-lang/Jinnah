"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { 
  ArrowLeft, 
  Star, 
  Trash2, 
  Archive, 
  AlertOctagon, 
  CornerUpLeft, 
  Forward, 
  Printer, 
  Paperclip, 
  Download, 
  Send, 
  Mail, 
  Clock, 
  MoreVertical,
  ShieldCheck,
  ChevronDown,
  ExternalLink,
  CheckCircle2
} from "lucide-react";
import { EmailMessage } from "@/lib/email/types";
import { toast } from "sonner";

interface EmailDetailViewProps {
  email: EmailMessage;
  currentFolderName?: string;
  onBack: () => void;
  onUpdate: () => void;
  onComposeReply: (email: EmailMessage, type: "reply" | "reply_all" | "forward") => void;
}

// Relative time helper (e.g. "3 days ago" or "Just now")
function formatRelativeTime(dateString: string | number | Date) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 2) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return "";
  }
}

// Sandboxed & Responsive Seamless Email HTML Renderer
function EmailBodyIframe({ html }: { html: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number>(350);

  const updateHeight = useCallback(() => {
    try {
      if (iframeRef.current && iframeRef.current.contentDocument) {
        const doc = iframeRef.current.contentDocument;
        const scrollH = Math.max(
          doc.body?.scrollHeight || 0,
          doc.documentElement?.scrollHeight || 0,
          doc.body?.offsetHeight || 0,
          doc.documentElement?.offsetHeight || 0
        );
        if (scrollH > 40) {
          setHeight(scrollH + 24);
        }
      }
    } catch {
      // ignore cross-origin or sandbox limits
    }
  }, []);

  useEffect(() => {
    updateHeight();
    const t1 = setTimeout(updateHeight, 200);
    const t2 = setTimeout(updateHeight, 600);
    const t3 = setTimeout(updateHeight, 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [html, updateHeight]);

  const docHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <base target="_blank">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 8px 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 15px;
      line-height: 1.65;
      color: #1a1917;
      background: transparent;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    img {
      max-width: 100% !important;
      height: auto !important;
      display: inline-block;
    }
    table {
      max-width: 100% !important;
      width: 100% !important;
      border-collapse: collapse;
    }
    a {
      color: #FF6A2A;
      text-decoration: underline;
    }
    blockquote {
      border-left: 3px solid #e2e8f0;
      margin-left: 0;
      padding-left: 12px;
      color: #64748b;
    }
    pre, code {
      white-space: pre-wrap;
      word-break: break-all;
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;

  return (
    <div className="w-full overflow-x-auto min-h-[200px]">
      <iframe
        ref={iframeRef}
        srcDoc={docHtml}
        onLoad={updateHeight}
        sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        className="w-full border-0 block bg-transparent"
        style={{ height: `${height}px`, minHeight: "220px" }}
        title="Email Body Content"
      />
    </div>
  );
}

export default function EmailDetailView({
  email,
  currentFolderName = "inbox",
  onBack,
  onUpdate,
  onComposeReply,
}: EmailDetailViewProps) {
  const [quickReplyText, setQuickReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showTopMenu, setShowTopMenu] = useState(false);
  const topMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (topMenuRef.current && !topMenuRef.current.contains(event.target as Node)) {
        setShowTopMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openInNewTab = () => {
    if (!email.bodyHtml) return;
    const blob = new Blob([email.bodyHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  // Actions handler
  const handleAction = async (action: string, targetFolder?: string) => {
    try {
      const res = await fetch("/api/admin/email/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: [email.id || email.dbKey],
          action,
          targetFolder,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Action applied");
      onUpdate();
      if (action === "trash" || action === "move") {
        onBack();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update email");
    }
  };

  // Quick reply submission
  const handleQuickReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickReplyText.trim()) return;

    setIsSendingReply(true);
    try {
      const res = await fetch("/api/admin/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email.from.email,
          subject: email.subject.startsWith("Re:") ? email.subject : `Re: ${email.subject}`,
          bodyText: quickReplyText,
          bodyHtml: `<p style="font-family:sans-serif;line-height:1.6;">${quickReplyText.replace(/\n/g, "<br/>")}</p>`,
          inReplyTo: email.messageId,
          conversationId: email.conversationId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      toast.success("Reply sent successfully");
      setQuickReplyText("");
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Failed to send reply");
    } finally {
      setIsSendingReply(false);
    }
  };

  const senderInitial = (email.from?.name || email.from?.email || "U").charAt(0).toUpperCase();
  const relativeTime = formatRelativeTime(email.createdAt);
  const formattedFullDate = new Date(email.createdAt).toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* 1. Gmail-Style Top Action Bar */}
      <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 border-b border-black/5 bg-white shrink-0">
        {/* Left: Back Arrow */}
        <button
          onClick={onBack}
          className="p-2 -ml-1 rounded-full text-stone-700 hover:text-stone-900 hover:bg-black/5 transition-colors cursor-pointer active:scale-95"
          title={`Back to ${currentFolderName || "Inbox"}`}
          aria-label="Back to inbox"
        >
          <ArrowLeft className="h-5 w-5 stroke-[2.2]" />
        </button>

        {/* Right: Gmail Mobile Action Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Archive Icon */}
          <button
            onClick={() => handleAction("move", "archive")}
            className="p-2 rounded-full text-stone-700 hover:text-stone-900 hover:bg-black/5 transition-colors cursor-pointer"
            title="Archive"
            aria-label="Archive"
          >
            <Archive className="h-5 w-5 stroke-[2]" />
          </button>

          {/* Delete / Trash Icon */}
          <button
            onClick={() => handleAction("trash")}
            className="p-2 rounded-full text-stone-700 hover:text-rose-600 hover:bg-black/5 transition-colors cursor-pointer"
            title="Delete"
            aria-label="Delete"
          >
            <Trash2 className="h-5 w-5 stroke-[2]" />
          </button>

          {/* Mark as Unread Icon */}
          <button
            onClick={async () => {
              await handleAction("mark_unread");
              onBack();
            }}
            className="p-2 rounded-full text-stone-700 hover:text-stone-900 hover:bg-black/5 transition-colors cursor-pointer"
            title="Mark as unread"
            aria-label="Mark as unread"
          >
            <Mail className="h-5 w-5 stroke-[2]" />
          </button>

          {/* More Vertical Menu (Three Dots) */}
          <div className="relative" ref={topMenuRef}>
            <button
              type="button"
              onClick={() => setShowTopMenu(!showTopMenu)}
              className="p-2 rounded-full text-stone-700 hover:text-stone-900 hover:bg-black/5 transition-colors cursor-pointer"
              title="More options"
              aria-label="More options"
            >
              <MoreVertical className="h-5 w-5 stroke-[2]" />
            </button>

            {/* Dropdown Options */}
            {showTopMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-48 rounded-2xl bg-white border border-black/10 shadow-xl p-1.5 z-50 text-xs font-semibold text-stone-800 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    handleAction(email.isStarred ? "unstar" : "star");
                    setShowTopMenu(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/5 cursor-pointer"
                >
                  <Star className={`h-4 w-4 ${email.isStarred ? "fill-amber-400 text-amber-400" : "text-stone-500"}`} />
                  <span>{email.isStarred ? "Remove Star" : "Add Star"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleAction("move", "spam");
                    setShowTopMenu(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/5 text-amber-700 cursor-pointer"
                >
                  <AlertOctagon className="h-4 w-4 text-amber-600" />
                  <span>Report Spam</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    setShowTopMenu(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/5 cursor-pointer"
                >
                  <Printer className="h-4 w-4 text-stone-500" />
                  <span>Print Email</span>
                </button>

                {email.bodyHtml && (
                  <button
                    type="button"
                    onClick={() => {
                      openInNewTab();
                      setShowTopMenu(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/5 cursor-pointer"
                  >
                    <ExternalLink className="h-4 w-4 text-stone-500" />
                    <span>Open in New Tab</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Scrollable Email Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 space-y-5 custom-scrollbar">
        {/* Subject Header with Star on the Right (Gmail Mobile Layout) */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug break-words flex-1">
              {email.subject || "(No Subject)"}
            </h1>

            {/* Star Icon Button (Positioned on the right, matching reference image) */}
            <button
              type="button"
              onClick={() => handleAction(email.isStarred ? "unstar" : "star")}
              className="p-1.5 -mr-1 rounded-full text-stone-400 hover:text-amber-500 hover:bg-black/5 transition-colors shrink-0 cursor-pointer"
              title={email.isStarred ? "Starred" : "Not starred"}
              aria-label="Star email"
            >
              <Star
                className={`h-5 w-5 ${
                  email.isStarred ? "fill-amber-400 text-amber-400" : "stroke-[1.8]"
                }`}
              />
            </button>
          </div>

          {/* Folder & Status Badges (Pill directly under subject) */}
          <div className="flex items-center gap-2 mt-2">
            <span className="rounded-md bg-rose-50 text-rose-800 border border-rose-200/60 px-2 py-0.5 text-xs font-semibold capitalize">
              {email.folder || currentFolderName || "Inbox"}
            </span>
            {email.isImportant && (
              <span className="rounded-md bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 text-xs font-semibold">
                Important
              </span>
            )}
          </div>
        </div>

        {/* Sender Metadata Row with "to me ⌄" (Gmail Mobile Layout) */}
        <div className="pt-2">
          <div className="flex items-start justify-between gap-3">
            {/* Left: Avatar + Sender Info */}
            <div className="flex items-start gap-3 min-w-0">
              {/* Circular Avatar */}
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-amber-600 text-white font-bold text-base shadow-xs shrink-0">
                {senderInitial}
              </div>

              {/* Name, Relative Date, to me dropdown */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm sm:text-base text-gray-900 truncate">
                    {email.from?.name || email.from?.email}
                  </span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-500 fill-sky-100 shrink-0" />
                  <span className="text-xs text-stone-400 font-medium whitespace-nowrap">
                    {relativeTime}
                  </span>
                </div>

                {/* "to me ⌄" toggle button */}
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 font-semibold mt-0.5 py-0.5 cursor-pointer"
                >
                  <span>to me</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${showDetails ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>

            {/* Right: Quick Reply Icon & More in sender row */}
            <div className="flex items-center gap-0.5 shrink-0 text-stone-600">
              <button
                type="button"
                onClick={() => onComposeReply(email, "reply")}
                className="p-2 rounded-full hover:bg-black/5 hover:text-stone-900 transition-colors cursor-pointer"
                title="Reply"
                aria-label="Reply"
              >
                <CornerUpLeft className="h-4 w-4 stroke-[2.2]" />
              </button>
              <button
                type="button"
                onClick={() => setShowTopMenu(!showTopMenu)}
                className="p-2 rounded-full hover:bg-black/5 hover:text-stone-900 transition-colors cursor-pointer"
                title="More"
                aria-label="More"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Collapsible Metadata Details Sheet (When "to me ⌄" is expanded) */}
          {showDetails && (
            <div className="mt-3 p-4 rounded-2xl bg-stone-50 border border-black/5 text-xs space-y-2 text-stone-700 animate-in fade-in duration-150 shadow-xs">
              <div className="grid grid-cols-[60px_1fr] gap-2">
                <span className="font-bold text-stone-400 uppercase tracking-wider text-[11px]">From:</span>
                <span className="font-medium text-stone-900 break-all">
                  {email.from?.name ? `${email.from.name} ` : ""}
                  &lt;{email.from?.email}&gt;
                </span>
              </div>
              <div className="grid grid-cols-[60px_1fr] gap-2">
                <span className="font-bold text-stone-400 uppercase tracking-wider text-[11px]">To:</span>
                <span className="font-medium text-stone-900 break-all">
                  {(email.to || []).map((t) => t.email || t.name).join(", ") || "Me"}
                </span>
              </div>
              <div className="grid grid-cols-[60px_1fr] gap-2">
                <span className="font-bold text-stone-400 uppercase tracking-wider text-[11px]">Date:</span>
                <span className="font-medium text-stone-900">
                  {formattedFullDate}
                </span>
              </div>
              <div className="grid grid-cols-[60px_1fr] gap-2 pt-1 border-t border-black/5">
                <span className="font-bold text-stone-400 uppercase tracking-wider text-[11px]">Security:</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Standard encryption (TLS)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 3. Email Body Viewer (Clean & Seamless, NO "Formatted HTML / Plain Text" buttons) */}
        <div className="py-2 border-t border-black/5 min-h-[150px]">
          {email.bodyHtml ? (
            <EmailBodyIframe html={email.bodyHtml} />
          ) : (
            <div className="text-stone-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans py-2">
              {email.bodyText || "(No message body content available)"}
            </div>
          )}
        </div>

        {/* 4. Attachments Section (if present) */}
        {email.attachments && email.attachments.length > 0 && (
          <div className="border-t border-black/5 pt-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Paperclip className="h-3.5 w-3.5" /> Attachments ({email.attachments.length})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {email.attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl border border-black/10 bg-stone-50 text-xs shadow-xs"
                >
                  <div className="flex items-center gap-2.5 truncate mr-2">
                    <Paperclip className="h-4 w-4 text-primary shrink-0" />
                    <div className="truncate">
                      <p className="font-bold text-stone-900 truncate">{att.filename}</p>
                      <p className="text-[10px] text-stone-500">
                        {Math.round((att.size || 0) / 1024)} KB
                      </p>
                    </div>
                  </div>

                  {att.url && (
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-white border border-black/10 hover:bg-stone-100 text-stone-700 hover:text-stone-900 transition-colors shrink-0"
                      title="Download attachment"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Gmail-Style Bottom Action Pills ([ ⮌ Reply ] and [ ⮎ Forward ]) */}
        <div className="pt-6 pb-2">
          <div className="flex items-center gap-3 max-w-md mx-auto sm:mx-0">
            {/* Reply Pill Button */}
            <button
              type="button"
              onClick={() => onComposeReply(email, "reply")}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-[#3d3330] hover:bg-[#2d2522] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <CornerUpLeft className="h-4 w-4 stroke-[2.4]" />
              <span>Reply</span>
            </button>

            {/* Forward Pill Button */}
            <button
              type="button"
              onClick={() => onComposeReply(email, "forward")}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-[#3d3330] hover:bg-[#2d2522] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Forward className="h-4 w-4 stroke-[2.4]" />
              <span>Forward</span>
            </button>
          </div>
        </div>

        {/* 6. Inline Quick Reply Composer */}
        <div className="pt-2 pb-6">
          <form
            onSubmit={handleQuickReply}
            className="rounded-2xl border border-black/10 bg-stone-50/80 p-3 sm:p-4 space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between text-xs text-stone-600">
              <div className="flex items-center gap-1.5 font-bold">
                <CornerUpLeft className="h-3.5 w-3.5 text-primary" />
                <span className="truncate">Quick Reply to {email.from?.name || email.from?.email}</span>
              </div>
              <button
                type="button"
                onClick={() => onComposeReply(email, "reply")}
                className="text-primary hover:underline font-bold text-[11px] shrink-0"
              >
                Full Composer
              </button>
            </div>

            <textarea
              rows={3}
              placeholder="Write a quick reply..."
              value={quickReplyText}
              onChange={(e) => setQuickReplyText(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-white p-3 text-sm outline-none focus:border-primary placeholder:text-stone-400 resize-y shadow-2xs"
            />

            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-stone-400 truncate hidden sm:inline">
                Dispatched via verified SMTP server
              </span>
              <button
                type="submit"
                disabled={isSendingReply || !quickReplyText.trim()}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-primary/95 transition-all disabled:opacity-50 ml-auto"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSendingReply ? "Sending..." : "Send Reply"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
