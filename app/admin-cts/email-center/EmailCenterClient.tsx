"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  Inbox, 
  Send, 
  FileText, 
  Clock, 
  Star, 
  AlertCircle, 
  AlertOctagon, 
  Archive, 
  Trash2, 
  Search, 
  Plus, 
  RefreshCw, 
  Settings, 
  Layers, 
  Users, 
  History, 
  Mail, 
  Paperclip, 
  CheckSquare, 
  Square, 
  MoreHorizontal, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { EmailFolder, EmailMessage, EmailTemplate } from "@/lib/email/types";
import ComposeModal from "./ComposeModal";
import EmailDetailView from "./EmailDetailView";
import EmailSettingsTab from "./EmailSettingsTab";
import EmailTemplatesTab from "./EmailTemplatesTab";
import EmailNewsletterTab from "./EmailNewsletterTab";
import EmailLogsTab from "./EmailLogsTab";
import { toast } from "sonner";

export default function EmailCenterClient() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Active top navigation tab
  const [activeTab, setActiveTab] = useState<"mailbox" | "settings" | "templates" | "newsletter" | "logs">("mailbox");

  // Mailbox state
  const [currentFolder, setCurrentFolder] = useState<EmailFolder>("inbox");
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [folderCounts, setFolderCounts] = useState<Record<string, number>>({});
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const isSyncingRef = useRef(false);

  // Compose modal state
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeInitialData, setComposeInitialData] = useState<any>(undefined);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);

  // Auth protection
  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin-cts/login");
    }
  }, [user, loading, router]);

  // Load templates
  const loadTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/email/templates");
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates || []);
      }
    } catch (err) {
      console.error("Failed to load templates:", err);
    }
  }, []);

  // Fetch messages for current folder
  const fetchMessages = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsLoadingMessages(true);
    try {
      const params = new URLSearchParams({
        folder: currentFolder,
        search: searchTerm,
      });
      const res = await fetch(`/api/admin/email/messages?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
        setFolderCounts(data.folderCounts || {});
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      if (showSpinner) {
        toast.error("Failed to load email messages");
      }
    } finally {
      if (showSpinner) setIsLoadingMessages(false);
    }
  }, [currentFolder, searchTerm]);

  // Initial fetch on mount or folder/search change
  useEffect(() => {
    if (user) {
      fetchMessages(true);
      loadTemplates();
    }
  }, [user, currentFolder, searchTerm, fetchMessages, loadTemplates]);

  // Trigger IMAP Sync
  const handleImapSync = useCallback(async (silent = false) => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    if (!silent) setIsSyncing(true);
    try {
      const res = await fetch("/api/admin/email/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 25 }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.syncedCount > 0) {
          toast.success(`IMAP: Synced ${data.syncedCount} new email${data.syncedCount > 1 ? "s" : ""}`);
        } else if (!silent) {
          toast.info("Inbox is up to date (0 new emails).");
        }
        fetchMessages(false);
      } else {
        if (!silent) {
          toast.error(data.error || "IMAP synchronization failed.");
        }
      }
    } catch (err: any) {
      if (!silent) toast.error(err.message || "Failed to trigger sync");
    } finally {
      isSyncingRef.current = false;
      if (!silent) setIsSyncing(false);
    }
  }, [fetchMessages]);

  // Auto-sync every 5 seconds when Mailbox tab is active
  useEffect(() => {
    if (!user || activeTab !== "mailbox") return;

    // Trigger sync once immediately when entering Mailbox
    handleImapSync(true);

    const interval = setInterval(() => {
      handleImapSync(true);
      fetchMessages(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [user, activeTab, handleImapSync, fetchMessages]);

  // Batch actions (mark read, trash, star)
  const handleBatchAction = async (action: string, targetFolder?: string, customIds?: string[]) => {
    const idsToApply = customIds && customIds.length > 0 ? customIds : selectedIds;
    if (idsToApply.length === 0) return;
    try {
      const res = await fetch("/api/admin/email/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: idsToApply,
          action,
          targetFolder,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (!customIds) {
        toast.success(data.message || "Updated emails");
        setSelectedIds([]);
      }
      fetchMessages(false);
    } catch (err: any) {
      if (!customIds) toast.error(err.message || "Failed to apply batch action");
    }
  };

  // Toggle select all
  const handleToggleSelectAll = () => {
    if (selectedIds.length === messages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(messages.map((m) => m.id || m.dbKey || ""));
    }
  };

  // Reply/Forward trigger from detail view
  const handleComposeReply = (email: EmailMessage, type: "reply" | "reply_all" | "forward") => {
    let subject = email.subject;
    if (type === "reply" || type === "reply_all") {
      subject = subject.startsWith("Re:") ? subject : `Re: ${subject}`;
    } else if (type === "forward") {
      subject = subject.startsWith("Fwd:") ? subject : `Fwd: ${subject}`;
    }

    const initialBody = `<br/><br/><blockquote>On ${new Date(email.createdAt).toLocaleString()}, ${email.from.name} wrote:<br/>${email.bodyHtml || email.bodyText}</blockquote>`;

    setComposeInitialData({
      to: type === "forward" ? "" : email.from.email,
      subject,
      bodyHtml: initialBody,
      inReplyTo: email.messageId,
      conversationId: email.conversationId,
    });
    setIsComposeOpen(true);
  };

  if (loading) {
    return <div className="p-8 text-center text-sm font-semibold">Loading Email Center...</div>;
  }

  if (!user) return null;

  // Folder Navigation Definitions
  const folderList = [
    { id: "inbox", label: "Inbox", icon: Inbox, count: folderCounts.inbox },
    { id: "sent", label: "Sent", icon: Send, count: folderCounts.sent },
    { id: "drafts", label: "Drafts", icon: FileText, count: folderCounts.drafts },
    { id: "scheduled", label: "Scheduled", icon: Clock, count: folderCounts.scheduled },
    { id: "starred", label: "Starred", icon: Star, count: folderCounts.starred },
    { id: "important", label: "Important", icon: AlertCircle, count: folderCounts.important },
    { id: "spam", label: "Spam", icon: AlertOctagon, count: folderCounts.spam },
    { id: "archive", label: "Archive", icon: Archive, count: folderCounts.archive },
    { id: "trash", label: "Trash", icon: Trash2, count: folderCounts.trash },
  ];

  return (
    <div className="flex flex-col min-h-[750px] lg:h-[calc(100vh-7.5rem)] rounded-3xl bg-white border border-black/5 shadow-md overflow-hidden">
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-3.5 bg-[#11100e] text-white shrink-0 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              <span>Enterprise Email Center</span>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-extrabold text-emerald-400">
                SMTP + IMAP
              </span>
            </h1>
          </div>
        </div>

        {/* Top Tabs */}
        <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl text-xs overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab("mailbox")}
            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold shrink-0 ${
              activeTab === "mailbox" ? "bg-primary text-white" : "text-white/70 hover:text-white"
            }`}
          >
            Mailbox
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold shrink-0 ${
              activeTab === "settings" ? "bg-primary text-white" : "text-white/70 hover:text-white"
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold shrink-0 ${
              activeTab === "templates" ? "bg-primary text-white" : "text-white/70 hover:text-white"
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab("newsletter")}
            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold shrink-0 ${
              activeTab === "newsletter" ? "bg-primary text-white" : "text-white/70 hover:text-white"
            }`}
          >
            Newsletter
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold shrink-0 ${
              activeTab === "logs" ? "bg-primary text-white" : "text-white/70 hover:text-white"
            }`}
          >
            Logs
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className={`flex-1 bg-[#faf9f6] ${activeTab === "mailbox" ? "overflow-hidden" : "overflow-y-auto custom-scrollbar"}`}>
        {activeTab === "settings" && <EmailSettingsTab />}
        {activeTab === "templates" && <EmailTemplatesTab templates={templates} onRefresh={loadTemplates} />}
        {activeTab === "newsletter" && <EmailNewsletterTab />}
        {activeTab === "logs" && <EmailLogsTab />}

        {/* Gmail/Outlook Tri-Panel Mailbox */}
        {activeTab === "mailbox" && (
          <div className="flex h-full overflow-hidden">
            {/* 1. Left Folder Sidebar (w-60) */}
            <div className="w-56 lg:w-64 border-r border-black/5 bg-white p-3 flex flex-col justify-between shrink-0 hidden md:flex">
              <div className="space-y-4">
                {/* Compose Button */}
                <button
                  onClick={() => {
                    setComposeInitialData(undefined);
                    setIsComposeOpen(true);
                  }}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-primary/20 hover:bg-primary/95 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>Compose</span>
                </button>

                {/* Folder List */}
                <div className="space-y-0.5 text-xs">
                  {folderList.map((folder) => {
                    const Icon = folder.icon;
                    const isActive = currentFolder === folder.id;
                    const count = folder.count || 0;

                    return (
                      <button
                        key={folder.id}
                        onClick={() => {
                          setCurrentFolder(folder.id as EmailFolder);
                          setSelectedMessage(null);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 transition-all font-semibold ${
                          isActive
                            ? "bg-primary/10 text-primary font-bold shadow-xs"
                            : "text-muted-foreground hover:bg-black/5 hover:text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                          <span>{folder.label}</span>
                        </div>

                        {count > 0 && (
                          <span
                            className={`rounded-full px-2 py-0.2 text-[10px] font-extrabold ${
                              isActive ? "bg-primary text-white" : "bg-black/5 text-foreground"
                            }`}
                          >
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* IMAP Sync Trigger */}
              <div className="border-t border-black/5 pt-3 space-y-2">
                <button
                  onClick={() => handleImapSync(false)}
                  disabled={isSyncing}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-black/10 bg-[#faf9f6] py-2 text-xs font-bold text-foreground hover:bg-black/5 transition-all disabled:opacity-60"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-primary" : ""}`} />
                  <span>{isSyncing ? "Syncing IMAP..." : "Sync IMAP Inbox"}</span>
                </button>
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Auto-sync active (every 5s)</span>
                </div>
              </div>
            </div>

            {/* 2. Middle Panel: Messages List */}
            <div
              className={`flex flex-col border-r border-black/5 bg-white transition-all overflow-hidden ${
                selectedMessage ? "hidden lg:flex lg:w-96 shrink-0" : "flex-1"
              }`}
            >
              {/* Search and Filter Bar */}
              <div className="p-3 border-b border-black/5 space-y-2.5 bg-[#faf9f6]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search sender, subject, keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-primary"
                  />
                </div>

                {/* Multi-Select Toolbar */}
                <div className="flex items-center justify-between text-xs px-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleSelectAll}
                      className="p-1 rounded hover:bg-black/5 text-muted-foreground"
                      title="Select all"
                    >
                      {selectedIds.length === messages.length && messages.length > 0 ? (
                        <CheckSquare className="h-4 w-4 text-primary" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>

                    {selectedIds.length > 0 && (
                      <span className="text-[11px] font-bold text-primary">
                        {selectedIds.length} selected
                      </span>
                    )}
                  </div>

                  {selectedIds.length > 0 && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleBatchAction("mark_read")}
                        className="p-1.5 rounded hover:bg-black/5 text-xs text-muted-foreground hover:text-foreground"
                        title="Mark as Read"
                      >
                        Read
                      </button>
                      <button
                        onClick={() => handleBatchAction("trash")}
                        className="p-1.5 rounded hover:bg-rose-50 text-xs text-rose-600"
                        title="Delete"
                      >
                        Trash
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Message List Items */}
              <div className="flex-1 overflow-y-auto divide-y divide-black/5">
                {isLoadingMessages ? (
                  <div className="flex h-48 items-center justify-center">
                    <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    No emails in {currentFolder} folder.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const msgId = msg.id || msg.dbKey || "";
                    const isSelected = selectedIds.includes(msgId);
                    const isActive = selectedMessage?.id === msg.id || selectedMessage?.dbKey === msg.dbKey;

                    return (
                      <div
                        key={msgId}
                        onClick={() => {
                          setSelectedMessage(msg);
                          if (!msg.isRead && msgId) {
                            handleBatchAction("mark_read", undefined, [msgId]);
                            setMessages((prev) =>
                              prev.map((m) =>
                                (m.id === msgId || m.dbKey === msgId) ? { ...m, isRead: true } : m
                              )
                            );
                          }
                        }}
                        className={`group flex items-start gap-3 p-3.5 cursor-pointer transition-colors ${
                          isActive
                            ? "bg-primary/5 border-l-4 border-l-primary"
                            : !msg.isRead
                            ? "bg-amber-50/40 font-bold hover:bg-black/5"
                            : "bg-white hover:bg-black/5"
                        }`}
                      >
                        {/* Checkbox */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIds((prev) =>
                              prev.includes(msgId) ? prev.filter((id) => id !== msgId) : [...prev, msgId]
                            );
                          }}
                          className="mt-1 shrink-0"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-primary" />
                          ) : (
                            <Square className="h-4 w-4 text-muted-foreground/50 hover:text-foreground" />
                          )}
                        </div>

                        {/* Email Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`truncate text-xs ${
                                !msg.isRead ? "font-extrabold text-foreground" : "font-medium text-foreground"
                              }`}
                            >
                              {msg.from?.name || msg.from?.email || "Unknown"}
                            </span>
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              {new Date(msg.createdAt).toLocaleDateString("en-PK", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>

                          <p
                            className={`text-xs truncate mt-0.5 ${
                              !msg.isRead ? "font-bold text-foreground" : "text-foreground/90"
                            }`}
                          >
                            {msg.subject || "(No Subject)"}
                          </p>

                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                            {msg.snippet}
                          </p>
                        </div>

                        {/* Badges / Attachment Icon */}
                        <div className="flex flex-col items-end gap-1 shrink-0 mt-1">
                          {msg.hasAttachments && (
                            <Paperclip className="h-3 w-3 text-muted-foreground" />
                          )}
                          {!msg.isRead && (
                            <span className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 3. Right Panel: Email Detail Viewer */}
            <div
              className={`flex-1 bg-white overflow-hidden ${
                !selectedMessage ? "hidden lg:flex" : "flex"
              }`}
            >
              {selectedMessage ? (
                <EmailDetailView
                  email={selectedMessage}
                  onBack={() => setSelectedMessage(null)}
                  onUpdate={() => {
                    fetchMessages();
                    if (selectedMessage) {
                      // refresh detail
                      setSelectedMessage({ ...selectedMessage, isRead: true });
                    }
                  }}
                  onComposeReply={handleComposeReply}
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#faf9f6] border border-black/5 mb-3">
                    <Mail className="h-8 w-8 opacity-30 text-primary" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">Select an Email</h3>
                  <p className="text-xs max-w-xs mt-1">
                    Choose an email conversation from the list to view the full thread, attachments, and reply.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSent={() => {
          fetchMessages();
          setCurrentFolder("sent");
        }}
        templates={templates}
        initialData={composeInitialData}
      />
    </div>
  );
}
