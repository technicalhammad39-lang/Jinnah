"use client";

import { useState, useRef } from "react";
import { 
  X, 
  Send, 
  Paperclip, 
  Clock, 
  Save, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  FileText, 
  Maximize2, 
  Minimize2, 
  Smile, 
  Trash2, 
  ChevronDown,
  Sparkles,
  Loader2
} from "lucide-react";
import { EmailTemplate, EmailAttachment } from "@/lib/email/types";
import { toast } from "sonner";

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSent: () => void;
  templates: EmailTemplate[];
  initialData?: {
    to?: string;
    subject?: string;
    bodyHtml?: string;
    inReplyTo?: string;
    conversationId?: string;
  };
}

export default function ComposeModal({
  isOpen,
  onClose,
  onSent,
  templates,
  initialData,
}: ComposeModalProps) {
  const [to, setTo] = useState(initialData?.to || "");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [subject, setSubject] = useState(initialData?.subject || "");
  const [bodyHtml, setBodyHtml] = useState(initialData?.bodyHtml || "");
  const [attachments, setAttachments] = useState<EmailAttachment[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  // Insert variable into editor
  const insertVariable = (varName: string) => {
    const placeholder = `{{${varName}}}`;
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand("insertText", false, placeholder);
      setBodyHtml(editorRef.current.innerHTML);
    } else {
      setBodyHtml((prev) => prev + placeholder);
    }
  };

  // Select template
  const handleSelectTemplate = (template: EmailTemplate) => {
    if (!subject) setSubject(template.subject);
    setBodyHtml(template.bodyHtml);
    if (editorRef.current) {
      editorRef.current.innerHTML = template.bodyHtml;
    }
    toast.info(`Loaded template: "${template.name}"`);
  };

  // Text formatting commands
  const formatText = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setBodyHtml(editorRef.current.innerHTML);
    }
  };

  // Handle file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds 10MB limit`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64Content = (reader.result as string).split(",")[1];
        setAttachments((prev) => [
          ...prev,
          {
            filename: file.name,
            contentType: file.type || "application/octet-stream",
            size: file.size,
            content: base64Content,
          },
        ]);
        toast.success(`Attached ${file.name}`);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  // Submit handler: send immediately, draft, or schedule
  const handleSubmit = async (isDraft = false) => {
    if (!to && !isDraft) {
      toast.error("Please provide at least one recipient email");
      return;
    }

    if (!subject && !isDraft) {
      toast.error("Please enter a subject line");
      return;
    }

    const currentHtml = editorRef.current?.innerHTML || bodyHtml;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: to.split(",").map((s) => s.trim()).filter(Boolean),
          cc: cc ? cc.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
          bcc: bcc ? bcc.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
          subject,
          bodyHtml: currentHtml,
          attachments,
          isDraft,
          scheduledAt: isScheduled && scheduledAt ? scheduledAt : undefined,
          inReplyTo: initialData?.inReplyTo,
          conversationId: initialData?.conversationId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to dispatch email");
      }

      toast.success(data.message || (isDraft ? "Draft saved" : "Email sent successfully"));
      onSent();
      onClose();
    } catch (err: any) {
      console.error("Compose submit error:", err);
      toast.error(err.message || "An error occurred while sending email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`flex flex-col rounded-2xl bg-white shadow-2xl border border-black/10 transition-all duration-200 overflow-hidden ${
          isMaximized
            ? "fixed inset-2 sm:inset-4"
            : "w-full max-w-3xl max-h-[90vh] h-[720px]"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#11100e] text-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-primary" />
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-white">
              {initialData?.inReplyTo ? "Reply Message" : "New Message"}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1.5 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Recipients Form */}
        <div className="border-b border-black/5 px-5 py-2 text-xs space-y-1.5 bg-[#faf9f6]/60 shrink-0">
          {/* TO */}
          <div className="flex items-center gap-3">
            <span className="w-14 font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
              To:
            </span>
            <input
              type="text"
              placeholder="customer@example.com (comma-separated)"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full bg-transparent py-1.5 text-sm font-medium outline-none focus:text-foreground text-foreground"
            />
            <div className="flex items-center gap-2 shrink-0 text-muted-foreground">
              {!showCc && (
                <button
                  type="button"
                  onClick={() => setShowCc(true)}
                  className="hover:text-foreground text-[11px] font-semibold"
                >
                  Cc
                </button>
              )}
              {!showBcc && (
                <button
                  type="button"
                  onClick={() => setShowBcc(true)}
                  className="hover:text-foreground text-[11px] font-semibold"
                >
                  Bcc
                </button>
              )}
            </div>
          </div>

          {/* CC */}
          {showCc && (
            <div className="flex items-center gap-3 pt-1 border-t border-black/5">
              <span className="w-14 font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
                Cc:
              </span>
              <input
                type="text"
                placeholder="cc@example.com"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                className="w-full bg-transparent py-1 text-sm outline-none text-foreground"
              />
            </div>
          )}

          {/* BCC */}
          {showBcc && (
            <div className="flex items-center gap-3 pt-1 border-t border-black/5">
              <span className="w-14 font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
                Bcc:
              </span>
              <input
                type="text"
                placeholder="bcc@example.com"
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
                className="w-full bg-transparent py-1 text-sm outline-none text-foreground"
              />
            </div>
          )}

          {/* SUBJECT */}
          <div className="flex items-center gap-3 pt-1 border-t border-black/5">
            <span className="w-14 font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
              Subject:
            </span>
            <input
              type="text"
              placeholder="Enter subject line..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-transparent py-1.5 text-sm font-bold text-foreground outline-none"
            />
          </div>
        </div>

        {/* Toolbar: Formatting, Templates & Variables */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/5 px-4 py-2 bg-white text-xs shrink-0">
          <div className="flex items-center gap-1 text-muted-foreground">
            <button
              type="button"
              onClick={() => formatText("bold")}
              className="p-1.5 rounded hover:bg-black/5 hover:text-foreground"
              title="Bold"
            >
              <Bold className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => formatText("italic")}
              className="p-1.5 rounded hover:bg-black/5 hover:text-foreground"
              title="Italic"
            >
              <Italic className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => formatText("underline")}
              className="p-1.5 rounded hover:bg-black/5 hover:text-foreground"
              title="Underline"
            >
              <Underline className="h-3.5 w-3.5" />
            </button>
            <span className="h-4 w-px bg-black/10 mx-1" />
            <button
              type="button"
              onClick={() => formatText("insertUnorderedList")}
              className="p-1.5 rounded hover:bg-black/5 hover:text-foreground"
              title="Bullet List"
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => formatText("insertOrderedList")}
              className="p-1.5 rounded hover:bg-black/5 hover:text-foreground"
              title="Numbered List"
            >
              <ListOrdered className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                const url = prompt("Enter link URL:");
                if (url) formatText("createLink", url);
              }}
              className="p-1.5 rounded hover:bg-black/5 hover:text-foreground"
              title="Insert Link"
            >
              <LinkIcon className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Template & Variable dropdowns */}
          <div className="flex items-center gap-2">
            {/* Template Selector */}
            <select
              onChange={(e) => {
                const t = templates.find((tpl) => tpl.id === e.target.value);
                if (t) handleSelectTemplate(t);
              }}
              defaultValue=""
              className="rounded-lg border border-black/10 bg-black/5 py-1 px-2 text-xs font-semibold outline-none hover:border-primary"
            >
              <option value="" disabled>
                Insert Template...
              </option>
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name}
                </option>
              ))}
            </select>

            {/* Variable Pills */}
            <div className="hidden sm:flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Tags:</span>
              <button
                type="button"
                onClick={() => insertVariable("customer_name")}
                className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary hover:bg-primary/20"
              >
                + Name
              </button>
              <button
                type="button"
                onClick={() => insertVariable("order_number")}
                className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary hover:bg-primary/20"
              >
                + Order #
              </button>
              <button
                type="button"
                onClick={() => insertVariable("tracking_number")}
                className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary hover:bg-primary/20"
              >
                + Tracking #
              </button>
            </div>
          </div>
        </div>

        {/* Rich Text Editable Area */}
        <div className="flex-1 p-5 overflow-y-auto bg-white font-sans text-sm leading-relaxed outline-none">
          <div
            ref={editorRef}
            contentEditable
            onInput={() => {
              if (editorRef.current) setBodyHtml(editorRef.current.innerHTML);
            }}
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
            className="min-h-full outline-none focus:outline-none"
            data-placeholder="Compose your email message..."
          />
        </div>

        {/* Attachments List Preview */}
        {attachments.length > 0 && (
          <div className="border-t border-black/5 bg-[#faf9f6] p-3 flex flex-wrap gap-2 shrink-0">
            {attachments.map((att, i) => (
              <div
                key={i}
                className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-2.5 py-1 text-xs shadow-xs"
              >
                <Paperclip className="h-3 w-3 text-muted-foreground" />
                <span className="font-semibold text-foreground truncate max-w-[150px]">{att.filename}</span>
                <span className="text-[10px] text-muted-foreground">({Math.round(att.size / 1024)} KB)</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(i)}
                  className="text-rose-500 hover:text-rose-700 ml-1"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Schedule Selector Drawer */}
        {isScheduled && (
          <div className="border-t border-black/5 bg-amber-50/70 px-5 py-2.5 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2 text-amber-900">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="font-semibold">Schedule Delivery:</span>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="rounded border border-amber-300 bg-white px-2 py-1 text-xs outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsScheduled(false)}
              className="text-amber-800 hover:underline font-bold text-[11px]"
            >
              Cancel Schedule
            </button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-black/5 bg-[#faf9f6] px-5 py-3.5 shrink-0">
          <div className="flex items-center gap-2">
            {/* Primary Send Button */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(false)}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-primary/20 hover:bg-primary/95 transition-all disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>{isScheduled ? "Schedule Mail" : "Send Mail"}</span>
                </>
              )}
            </button>

            {/* Schedule Toggle */}
            <button
              type="button"
              onClick={() => setIsScheduled(!isScheduled)}
              className={`p-2.5 rounded-xl border transition-colors ${
                isScheduled
                  ? "bg-amber-100 border-amber-300 text-amber-900"
                  : "bg-white border-black/10 text-muted-foreground hover:text-foreground"
              }`}
              title="Schedule Send"
            >
              <Clock className="h-4 w-4" />
            </button>

            {/* Attachment Button */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl border border-black/10 bg-white text-muted-foreground hover:text-foreground transition-colors"
              title="Add Attachments"
            >
              <Paperclip className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Save Draft */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(true)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3.5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-all"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Draft</span>
            </button>

            {/* Discard */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-rose-600 transition-colors"
              title="Discard"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
