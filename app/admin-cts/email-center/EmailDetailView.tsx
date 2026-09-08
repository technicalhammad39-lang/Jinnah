"use client";

import { useState } from "react";
import { 
  ArrowLeft, 
  Star, 
  Trash2, 
  Archive, 
  AlertOctagon, 
  CornerUpLeft, 
  CornerUpRight, 
  Forward, 
  Printer, 
  Paperclip, 
  Download, 
  Eye, 
  Send, 
  Mail, 
  Clock, 
  Tag, 
  Check, 
  MoreVertical,
  ShieldCheck,
  User
} from "lucide-react";
import { EmailMessage } from "@/lib/email/types";
import { toast } from "sonner";

interface EmailDetailViewProps {
  email: EmailMessage;
  onBack: () => void;
  onUpdate: () => void;
  onComposeReply: (email: EmailMessage, type: "reply" | "reply_all" | "forward") => void;
}

export default function EmailDetailView({
  email,
  onBack,
  onUpdate,
  onComposeReply,
}: EmailDetailViewProps) {
  const [quickReplyText, setQuickReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<any | null>(null);

  // Actions
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

      toast.success("Reply dispatched successfully");
      setQuickReplyText("");
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Failed to send reply");
    } finally {
      setIsSendingReply(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between border-b border-black/5 px-4 py-3 bg-[#faf9f6] shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg border border-black/10 bg-white text-muted-foreground hover:text-foreground hover:bg-black/5"
            title="Back to list"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="h-4 w-px bg-black/10 mx-1" />
          <button
            onClick={() => handleAction(email.isStarred ? "unstar" : "star")}
            className={`p-1.5 rounded-lg border transition-colors ${
              email.isStarred
                ? "bg-amber-100 border-amber-300 text-amber-500"
                : "border-black/10 bg-white text-muted-foreground hover:text-amber-500"
            }`}
            title="Star message"
          >
            <Star className={`h-4 w-4 ${email.isStarred ? "fill-amber-400" : ""}`} />
          </button>
          <button
            onClick={() => handleAction("trash")}
            className="p-1.5 rounded-lg border border-black/10 bg-white text-muted-foreground hover:text-rose-600 hover:border-rose-200"
            title="Move to Trash"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleAction("move", "archive")}
            className="p-1.5 rounded-lg border border-black/10 bg-white text-muted-foreground hover:text-foreground"
            title="Archive"
          >
            <Archive className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleAction("move", "spam")}
            className="p-1.5 rounded-lg border border-black/10 bg-white text-muted-foreground hover:text-amber-600"
            title="Mark Spam"
          >
            <AlertOctagon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onComposeReply(email, "reply")}
            className="inline-flex items-center gap-1 rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-black/5"
          >
            <CornerUpLeft className="h-3.5 w-3.5 text-primary" />
            <span>Reply</span>
          </button>
          <button
            onClick={() => onComposeReply(email, "forward")}
            className="inline-flex items-center gap-1 rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-black/5"
          >
            <Forward className="h-3.5 w-3.5 text-primary" />
            <span>Forward</span>
          </button>
          <button
            onClick={() => window.print()}
            className="p-1.5 rounded-lg border border-black/10 bg-white text-muted-foreground hover:text-foreground"
            title="Print email"
          >
            <Printer className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Email Message Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
        {/* Subject Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded bg-black/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {email.folder}
            </span>
            {email.isImportant && (
              <span className="rounded bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700">
                Important
              </span>
            )}
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-foreground leading-snug">
            {email.subject}
          </h1>
        </div>

        {/* Sender & Recipient Metadata */}
        <div className="flex items-start justify-between gap-4 border-b border-black/5 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-amber-600 text-white font-bold text-sm shadow-sm shrink-0">
              {(email.from?.name || email.from?.email || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-foreground">
                  {email.from?.name || email.from?.email}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  &lt;{email.from?.email}&gt;
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                to: {(email.to || []).map((t) => t.email || t.name).join(", ") || "Me"}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-xs font-semibold text-muted-foreground">
              {new Date(email.createdAt).toLocaleString("en-PK", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 mt-1">
              <ShieldCheck className="h-3 w-3" /> Secure Transmission
            </span>
          </div>
        </div>

        {/* Email Body HTML Viewer (Sandboxed container) */}
        <div className="prose prose-sm max-w-none text-foreground leading-relaxed py-2">
          {email.bodyHtml ? (
            <div
              className="email-body-content overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
            />
          ) : (
            <p className="whitespace-pre-wrap font-sans">{email.bodyText}</p>
          )}
        </div>

        {/* Attachments Section */}
        {email.attachments && email.attachments.length > 0 && (
          <div className="border-t border-black/5 pt-6 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Paperclip className="h-3.5 w-3.5" /> Attachments ({email.attachments.length})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {email.attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl border border-black/10 bg-[#faf9f6] text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate mr-2">
                    <Paperclip className="h-4 w-4 text-primary shrink-0" />
                    <div className="truncate">
                      <p className="font-semibold text-foreground truncate">{att.filename}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {Math.round((att.size || 0) / 1024)} KB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {att.url && (
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md hover:bg-black/5 text-muted-foreground hover:text-foreground"
                        title="Download"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inline Quick Reply Box */}
        <div className="border-t border-black/5 pt-6">
          <form onSubmit={handleQuickReply} className="rounded-2xl border border-black/10 bg-[#faf9f6] p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 font-bold">
                <CornerUpLeft className="h-4 w-4 text-primary" />
                <span>Quick Reply to {email.from.name || email.from.email}</span>
              </div>
              <button
                type="button"
                onClick={() => onComposeReply(email, "reply")}
                className="text-primary hover:underline font-semibold text-[11px]"
              >
                Open Full Composer
              </button>
            </div>

            <textarea
              rows={3}
              placeholder="Type your reply here..."
              value={quickReplyText}
              onChange={(e) => setQuickReplyText(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-white p-3 text-sm outline-none focus:border-primary placeholder:text-muted-foreground/60 resize-y"
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                Sent via your configured SMTP server.
              </span>
              <button
                type="submit"
                disabled={isSendingReply || !quickReplyText.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-primary/95 transition-all disabled:opacity-50 cursor-pointer"
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
