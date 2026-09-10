"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
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
  Sparkles,
  Menu,
  X,
  LayoutGrid,
  ChevronDown
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
  const [isTabsMenuOpen, setIsTabsMenuOpen] = useState(false);
  const tabsMenuRef = useRef<HTMLDivElement>(null);

  // Mobile folders drawer
  const [isMobileFoldersOpen, setIsMobileFoldersOpen] = useState(false);

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

  // In-memory cache for ultra-fast instant folder switching (0ms delay)
  const messagesCacheRef = useRef<Record<string, { messages: EmailMessage[]; folderCounts: Record<string, number> }>>({});

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

  // Close tabs menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tabsMenuRef.current && !tabsMenuRef.current.contains(e.target as Node)) {
        setIsTabsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // Fetch messages for current folder with in-memory caching for realtime speed
  const fetchMessages = useCallback(async (showSpinner = false, targetFolder?: EmailFolder, querySearch?: string) => {
    const folderToUse = targetFolder || currentFolder;
    const activeSearch = querySearch !== undefined ? querySearch : searchTerm;

    // Check instant cache if no search term active
    if (!activeSearch && messagesCacheRef.current[folderToUse]) {
      setMessages(messagesCacheRef.current[folderToUse].messages);
      setFolderCounts(messagesCacheRef.current[folderToUse].folderCounts);
    } else if (showSpinner) {
      setIsLoadingMessages(true);
    }

    try {
      const params = new URLSearchParams({
        folder: folderToUse,
        search: activeSearch,
      });
      const res = await fetch(`/api/admin/email/messages?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        const fetchedMessages = data.messages || [];
        const fetchedCounts = data.folderCounts || {};
        setMessages(fetchedMessages);
        setFolderCounts(fetchedCounts);

        if (!activeSearch) {
          messagesCacheRef.current[folderToUse] = {
            messages: fetchedMessages,
            folderCounts: fetchedCounts,
          };
        }
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      if (showSpinner) {
        toast.error("Failed to load email messages");
      }
    } finally {
      setIsLoadingMessages(false);
    }
  }, [currentFolder, searchTerm]);

  // Switch folder with 0ms instant cache display
  const switchFolder = (newFolder: EmailFolder) => {
    setCurrentFolder(newFolder);
    setSelectedMessage(null);
    setSelectedIds([]);
    setIsMobileFoldersOpen(false);

    if (messagesCacheRef.current[newFolder]) {
      setMessages(messagesCacheRef.current[newFolder].messages);
      setFolderCounts(messagesCacheRef.current[newFolder].folderCounts);
      fetchMessages(false, newFolder);
    } else {
      fetchMessages(true, newFolder);
    }
  };

  // Initial fetch on mount or folder/search change
  useEffect(() => {
    if (user) {
      fetchMessages(messages.length === 0);
      loadTemplates();
    }
  }, [user, currentFolder, searchTerm, fetchMessages, loadTemplates]);

  // Trigger IMAP Sync (Server Socket Sync)
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

  // Real-time lightweight polling (every 8s against fast DB, not heavy IMAP socket)
  useEffect(() => {
    if (!user || activeTab !== "mailbox") return;

    // Single initial silent sync on load
    handleImapSync(true);

    // Fast DB poll for real-time responsiveness without server freezing
    const pollInterval = setInterval(() => {
      fetchMessages(false);
    }, 8000);

    // Background IMAP sync every 60s
    const imapInterval = setInterval(() => {
      handleImapSync(true);
    }, 60000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(imapInterval);
    };
  }, [user, activeTab, handleImapSync, fetchMessages]);

  // Optimistic Star / Unstar
  const handleToggleStar = (msg: EmailMessage, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const msgId = msg.id || msg.dbKey || "";
    const nextStarred = !msg.isStarred;

    // Instant local state update (0ms latency)
    setMessages((prev) =>
      prev.map((m) => ((m.id === msgId || m.dbKey === msgId) ? { ...m, isStarred: nextStarred } : m))
    );
    if (selectedMessage && (selectedMessage.id === msgId || selectedMessage.dbKey === msgId)) {
      setSelectedMessage((prev) => prev ? { ...prev, isStarred: nextStarred } : null);
    }

    // Background sync
    fetch("/api/admin/email/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [msgId], action: nextStarred ? "star" : "unstar" }),
    }).catch((err) => console.error("Star toggle error:", err));
  };

  // Optimistic Read / Unread
  const handleToggleRead = (msg: EmailMessage, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const msgId = msg.id || msg.dbKey || "";
    const nextRead = !msg.isRead;

    // Instant local state update (0ms latency)
    setMessages((prev) =>
      prev.map((m) => ((m.id === msgId || m.dbKey === msgId) ? { ...m, isRead: nextRead } : m))
    );
    setFolderCounts((prev) => ({
      ...prev,
      inbox: Math.max(0, (prev.inbox || 0) + (nextRead ? -1 : 1)),
    }));

    // Background sync
    fetch("/api/admin/email/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [msgId], action: nextRead ? "mark_read" : "mark_unread" }),
    }).catch((err) => console.error("Read toggle error:", err));
  };

  // Optimistic Move to Trash
  const handleTrashSingle = (msgId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // Instant local remove
    setMessages((prev) => prev.filter((m) => m.id !== msgId && m.dbKey !== msgId));
    setSelectedIds((prev) => prev.filter((id) => id !== msgId));
    toast.success("Moved to Trash");

    // Background sync
    fetch("/api/admin/email/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [msgId], action: "trash" }),
    }).catch((err) => console.error("Trash error:", err));
  };

  // Batch actions (mark read, trash, star)
  const handleBatchAction = async (action: string, targetFolder?: string, customIds?: string[]) => {
    const idsToApply = customIds && customIds.length > 0 ? customIds : selectedIds;
    if (idsToApply.length === 0) return;

    // Optimistic UI updates
    if (action === "mark_read") {
      setMessages((prev) =>
        prev.map((m) => {
          const mId = m.id || m.dbKey || "";
          return idsToApply.includes(mId) ? { ...m, isRead: true } : m;
        })
      );
    } else if (action === "mark_unread") {
      setMessages((prev) =>
        prev.map((m) => {
          const mId = m.id || m.dbKey || "";
          return idsToApply.includes(mId) ? { ...m, isRead: false } : m;
        })
      );
    } else if (action === "trash") {
      setMessages((prev) =>
        prev.filter((m) => {
          const mId = m.id || m.dbKey || "";
          return !idsToApply.includes(mId);
        })
      );
    }

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

  // Top Nav Tabs Definition
  const navTabs = [
    { id: "mailbox" as const, label: "Mailbox", icon: Mail },
    { id: "settings" as const, label: "Settings", icon: Settings },
    { id: "templates" as const, label: "Templates", icon: Layers },
    { id: "newsletter" as const, label: "Newsletter", icon: Users },
    { id: "logs" as const, label: "Logs", icon: History },
  ];

  return (
    <div className="flex flex-col h-full w-full rounded-2xl bg-white border border-black/5 shadow-sm overflow-hidden relative">
      {/* Top Header & Tab Navigation */}
      <div className="flex items-center justify-between gap-3 px-3.5 sm:px-6 py-3 bg-[#11100e] text-white shrink-0 border-b border-white/10 relative z-20">
        {/* Left: Jinnah Logo Favicon + Title (No SMTP+IMAP badge) */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-white/10 p-1.5 border border-white/15 shadow-sm shrink-0">
            <Image 
              src="/favicon.png" 
              alt="Jinnah Hardware" 
              width={24} 
              height={24} 
              className="object-contain"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm md:text-base font-bold tracking-tight text-white truncate">
              Enterprise Email Center
            </h1>
          </div>
        </div>

        {/* Right: Desktop Tabs + Mobile Menu Icon for [Mailbox, Settings, Templates, Newsletter, Logs] */}
        <div className="flex items-center gap-1.5">
          {/* Desktop Tabs */}
          <div className="hidden md:flex items-center gap-1 bg-white/10 p-1 rounded-xl text-xs">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsTabsMenuOpen(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-semibold shrink-0 cursor-pointer ${
                    activeTab === tab.id ? "bg-primary text-white shadow-xs" : "text-white/75 hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Icon Dropdown (Hidden under menu icon on mobile) */}
          <div className="relative md:hidden" ref={tabsMenuRef}>
            <button
              type="button"
              onClick={() => setIsTabsMenuOpen(!isTabsMenuOpen)}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/15 px-2.5 py-1.5 text-xs font-bold text-white border border-white/10 shadow-xs transition-all active:scale-95 cursor-pointer"
              aria-label="Navigation Tabs Menu"
            >
              <LayoutGrid className="h-4 w-4 text-primary" />
              <span className="capitalize">{activeTab}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isTabsMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {isTabsMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-[#1c1a17] border border-white/15 p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white/50 border-b border-white/10 mb-1">
                  Email Sections
                </div>
                {navTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsTabsMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? "bg-primary text-white font-bold shadow-xs"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5" />
                        <span>{tab.label}</span>
                      </div>
                      {isActive && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className={`flex-1 bg-[#faf9f6] ${activeTab === "mailbox" ? "overflow-hidden" : "overflow-y-auto custom-scrollbar"}`}>
        {activeTab === "settings" && <EmailSettingsTab />}
        {activeTab === "templates" && <EmailTemplatesTab templates={templates} onRefresh={loadTemplates} />}
        {activeTab === "newsletter" && <EmailNewsletterTab />}
        {activeTab === "logs" && <EmailLogsTab />}

        {/* Gmail / Hostinger Webmail 2-View Mailbox */}
        {activeTab === "mailbox" && (
          <div className="flex h-full overflow-hidden relative">
            {/* 1. Desktop Left Folder Sidebar */}
            <div className="w-56 lg:w-60 border-r border-black/5 bg-white p-3 flex flex-col justify-between shrink-0 hidden md:flex">
              <div className="space-y-4">
                {/* Desktop Compose Button */}
                <button
                  onClick={() => {
                    setComposeInitialData(undefined);
                    setIsComposeOpen(true);
                  }}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-primary/20 hover:bg-primary/95 transition-all active:scale-[0.99]"
                >
                  <Plus className="h-4 w-4" />
                  <span>Compose</span>
                </button>

                {/* Desktop Folder List */}
                <div className="space-y-0.5 text-xs">
                  {folderList.map((folder) => {
                    const Icon = folder.icon;
                    const isActive = currentFolder === folder.id;
                    const count = folder.count || 0;

                    return (
                      <button
                        key={folder.id}
                        onClick={() => switchFolder(folder.id as EmailFolder)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 transition-all font-semibold cursor-pointer ${
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
                  <span>Real-time updates active</span>
                </div>
              </div>
            </div>

            {/* 2. Main Viewport: Swaps between Message List & Email Detail View */}
            <div className="flex-1 min-w-0 bg-white flex flex-col h-full overflow-hidden">
              {selectedMessage ? (
                <EmailDetailView
                  email={selectedMessage}
                  currentFolderName={currentFolder}
                  onBack={() => setSelectedMessage(null)}
                  onUpdate={() => {
                    fetchMessages();
                    if (selectedMessage) {
                      setSelectedMessage({ ...selectedMessage, isRead: true });
                    }
                  }}
                  onComposeReply={handleComposeReply}
                />
              ) : (
                <div className="flex flex-col h-full overflow-hidden">
                  {/* Toolbar with 3-lines menu on mobile & Search */}
                  <div className="px-3 sm:px-4 py-2.5 border-b border-black/5 bg-[#faf9f6] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
                    {/* Left Actions + Mobile 3-Lines Folder Menu */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Mobile 3-Lines (Hamburger) Folder Button */}
                      <button
                        type="button"
                        onClick={() => setIsMobileFoldersOpen(true)}
                        className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-gray-900 transition-colors shadow-xs active:scale-95 shrink-0 cursor-pointer"
                        title="Open Folders (3 Lines)"
                      >
                        <Menu className="h-4 w-4 text-primary stroke-[2.5]" />
                        <span className="text-xs font-black capitalize text-gray-900">{currentFolder}</span>
                        {folderCounts[currentFolder] ? (
                          <span className="rounded-full bg-primary/10 text-primary text-[10px] font-extrabold px-1.5 py-0.2">
                            {folderCounts[currentFolder]}
                          </span>
                        ) : null}
                      </button>

                      {/* Select All Checkbox */}
                      <button
                        onClick={handleToggleSelectAll}
                        className="p-1.5 rounded-lg border border-black/10 bg-white hover:bg-black/5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Select all"
                      >
                        {selectedIds.length === messages.length && messages.length > 0 ? (
                          <CheckSquare className="h-4 w-4 text-primary" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>

                      {/* Refresh Button */}
                      <button
                        onClick={() => fetchMessages(true)}
                        disabled={isLoadingMessages}
                        className="p-1.5 rounded-lg border border-black/10 bg-white hover:bg-black/5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer"
                        title="Refresh messages"
                      >
                        <RefreshCw className={`h-4 w-4 ${isLoadingMessages ? "animate-spin text-primary" : ""}`} />
                      </button>

                      {/* Desktop Folder Label & Count */}
                      <div className="hidden md:flex items-center gap-2 ml-1">
                        <span className="text-sm font-extrabold capitalize text-foreground">
                          {currentFolder}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          ({messages.length} email{messages.length === 1 ? "" : "s"})
                        </span>
                      </div>

                      {/* Batch Action Buttons */}
                      {selectedIds.length > 0 && (
                        <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-black/10 flex-wrap">
                          <span className="text-xs font-bold text-primary mr-1">
                            {selectedIds.length} sel
                          </span>
                          <button
                            onClick={() => handleBatchAction("mark_read")}
                            className="px-2 py-1 rounded-lg border border-black/10 bg-white text-xs font-semibold text-foreground hover:bg-black/5 transition-colors cursor-pointer"
                          >
                            Read
                          </button>
                          <button
                            onClick={() => handleBatchAction("mark_unread")}
                            className="px-2 py-1 rounded-lg border border-black/10 bg-white text-xs font-semibold text-foreground hover:bg-black/5 transition-colors cursor-pointer"
                          >
                            Unread
                          </button>
                          <button
                            onClick={() => handleBatchAction("trash")}
                            className="px-2 py-1 rounded-lg border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                          >
                            Trash
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full sm:w-64 md:w-80">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search sender, subject, keywords..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-xl border border-black/10 bg-white py-1.5 pl-9 pr-3 text-xs outline-none focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Message List Items */}
                  <div className="flex-1 overflow-y-auto divide-y divide-black/5 custom-scrollbar">
                    {isLoadingMessages && messages.length === 0 ? (
                      <div className="flex h-48 items-center justify-center">
                        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="p-12 text-center text-xs text-muted-foreground">
                        <Mail className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="font-semibold text-foreground">No emails in {currentFolder}</p>
                        <p className="text-muted-foreground mt-0.5">Your {currentFolder} folder is completely empty.</p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const msgId = msg.id || msg.dbKey || "";
                        const isSelected = selectedIds.includes(msgId);

                        return (
                          <div
                            key={msgId}
                            onClick={() => {
                              setSelectedMessage(msg);
                              if (!msg.isRead && msgId) {
                                handleToggleRead(msg);
                              }
                            }}
                            className={`group px-3 sm:px-4 py-3 cursor-pointer transition-all border-l-4 ${
                              !msg.isRead
                                ? "bg-amber-50/40 border-l-primary font-semibold hover:bg-amber-50/70"
                                : "bg-white border-l-transparent hover:bg-black/[0.02]"
                            }`}
                          >
                            {/* Mobile View: Clean 2-Line Layout (Gmail Mobile Style) */}
                            <div className="sm:hidden flex items-start gap-2.5 w-full">
                              {/* Checkbox */}
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedIds((prev) =>
                                    prev.includes(msgId) ? prev.filter((id) => id !== msgId) : [...prev, msgId]
                                  );
                                }}
                                className="pt-0.5 text-muted-foreground/60 hover:text-foreground shrink-0 cursor-pointer"
                              >
                                {isSelected ? (
                                  <CheckSquare className="h-4 w-4 text-primary" />
                                ) : (
                                  <Square className="h-4 w-4" />
                                )}
                              </div>

                              {/* Star Button */}
                              <button
                                type="button"
                                onClick={(e) => handleToggleStar(msg, e)}
                                className="pt-0.5 text-muted-foreground/40 hover:text-amber-500 transition-colors shrink-0 cursor-pointer"
                              >
                                <Star className={`h-4 w-4 ${msg.isStarred ? "fill-amber-400 text-amber-400" : ""}`} />
                              </button>

                              {/* Mobile Message Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className={`text-xs truncate ${!msg.isRead ? "font-black text-gray-900" : "font-semibold text-gray-700"}`}>
                                    {msg.from?.name || msg.from?.email || "Unknown"}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground font-medium shrink-0">
                                    {new Date(msg.createdAt).toLocaleDateString("en-PK", {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                </div>

                                <div className="mt-0.5 flex items-center gap-1.5">
                                  <span className={`text-xs truncate ${!msg.isRead ? "font-bold text-gray-900" : "font-medium text-gray-600"}`}>
                                    {msg.subject || "(No Subject)"}
                                  </span>
                                  {msg.hasAttachments && (
                                    <Paperclip className="h-3 w-3 text-muted-foreground shrink-0" />
                                  )}
                                  {!msg.isRead && (
                                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 ml-auto" />
                                  )}
                                </div>

                                {msg.snippet && (
                                  <p className="text-[11px] text-muted-foreground/80 truncate mt-0.5 leading-tight">
                                    {msg.snippet}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Desktop View: Single-Row Wide Layout (Gmail Desktop Style) */}
                            <div className="hidden sm:flex items-center gap-3 w-full">
                              {/* Checkbox */}
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedIds((prev) =>
                                    prev.includes(msgId) ? prev.filter((id) => id !== msgId) : [...prev, msgId]
                                  );
                                }}
                                className="shrink-0 text-muted-foreground/60 hover:text-foreground cursor-pointer"
                              >
                                {isSelected ? (
                                  <CheckSquare className="h-4 w-4 text-primary" />
                                ) : (
                                  <Square className="h-4 w-4" />
                                )}
                              </div>

                              {/* Star Icon */}
                              <button
                                type="button"
                                onClick={(e) => handleToggleStar(msg, e)}
                                className="shrink-0 p-1 text-muted-foreground/40 hover:text-amber-500 transition-colors cursor-pointer"
                                title={msg.isStarred ? "Starred" : "Not starred"}
                              >
                                <Star className={`h-4 w-4 ${msg.isStarred ? "fill-amber-400 text-amber-400" : ""}`} />
                              </button>

                              {/* Sender Name */}
                              <div className="w-40 md:w-48 lg:w-56 shrink-0 truncate">
                                <span
                                  className={`text-xs truncate block ${
                                    !msg.isRead ? "font-extrabold text-foreground" : "font-medium text-foreground/85"
                                  }`}
                                >
                                  {msg.from?.name || msg.from?.email || "Unknown"}
                                </span>
                              </div>

                              {/* Subject & Snippet */}
                              <div className="flex-1 min-w-0 flex items-baseline gap-2 overflow-hidden">
                                <span
                                  className={`text-xs truncate ${
                                    !msg.isRead ? "font-extrabold text-foreground" : "font-semibold text-foreground/90"
                                  }`}
                                >
                                  {msg.subject || "(No Subject)"}
                                </span>
                                <span className="text-xs text-muted-foreground/40 hidden md:inline">-</span>
                                <span className="text-xs text-muted-foreground truncate hidden md:inline">
                                  {msg.snippet}
                                </span>
                              </div>

                              {/* Badges / Attachment Icon */}
                              <div className="shrink-0 flex items-center gap-2">
                                {msg.hasAttachments && (
                                  <Paperclip className="h-3.5 w-3.5 text-muted-foreground/70" />
                                )}
                                {!msg.isRead && (
                                  <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                                )}
                              </div>

                              {/* Date / Time */}
                              <div className="shrink-0 text-[11px] text-muted-foreground font-medium whitespace-nowrap pl-2">
                                {new Date(msg.createdAt).toLocaleDateString("en-PK", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </div>

                              {/* Quick Actions on Hover */}
                              <div className="hidden group-hover:flex items-center gap-1 shrink-0 ml-1">
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleRead(msg, e)}
                                  className="p-1.5 rounded-lg hover:bg-black/5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                  title={!msg.isRead ? "Mark as Read" : "Mark as Unread"}
                                >
                                  <Mail className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleTrashSingle(msgId, e)}
                                  className="p-1.5 rounded-lg hover:bg-rose-50 text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer"
                                  title="Move to Trash"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile 3-Lines Folders Slide-Out Drawer */}
      {isMobileFoldersOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFoldersOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between p-4 z-10 animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-3.5 border-b border-black/5">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900">Email Folders</h3>
                    <p className="text-[10px] text-muted-foreground">Select mailbox directory</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileFoldersOpen(false)}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-black/5 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Folder list */}
              <div className="mt-4 space-y-1 text-xs">
                {folderList.map((folder) => {
                  const Icon = folder.icon;
                  const isActive = currentFolder === folder.id;
                  const count = folder.count || 0;

                  return (
                    <button
                      key={folder.id}
                      onClick={() => switchFolder(folder.id as EmailFolder)}
                      className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 transition-all font-semibold cursor-pointer ${
                        isActive
                          ? "bg-primary text-white font-bold shadow-md shadow-primary/20"
                          : "text-gray-700 hover:bg-black/5 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                        <span>{folder.label}</span>
                      </div>
                      {count > 0 && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                          isActive ? "bg-white text-primary" : "bg-black/5 text-gray-700"
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom IMAP Sync Action */}
            <div className="pt-4 border-t border-black/5 space-y-2">
              <button
                onClick={() => {
                  handleImapSync(false);
                }}
                disabled={isSyncing}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-black/10 bg-[#faf9f6] py-2.5 text-xs font-bold text-gray-900 hover:bg-black/5 transition-all disabled:opacity-60"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-primary" : ""}`} />
                <span>{isSyncing ? "Syncing IMAP..." : "Sync IMAP Inbox"}</span>
              </button>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Real-time polling active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gmail-Style Floating Compose Button on Mobile (Bottom-Right FAB) */}
      {activeTab === "mailbox" && !selectedMessage && (
        <button
          type="button"
          onClick={() => {
            setComposeInitialData(undefined);
            setIsComposeOpen(true);
          }}
          className="md:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-white font-black text-sm shadow-2xl shadow-primary/60 hover:bg-primary/95 active:scale-95 transition-all border-2 border-white/25 cursor-pointer"
          aria-label="Compose Email"
        >
          <Plus className="h-5 w-5 stroke-[2.5]" />
          <span className="tracking-wide">Compose</span>
        </button>
      )}

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
