"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, Inbox, Clock, Send, Sparkles } from "lucide-react";
import { EmailMessage } from "@/lib/email/types";

export default function EmailDashboardWidget() {
  const [recentEmails, setRecentEmails] = useState<EmailMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadWidgetData() {
      try {
        const res = await fetch("/api/admin/email/messages?folder=inbox&limit=3");
        const data = await res.json();
        if (data.success) {
          setRecentEmails(data.messages || []);
          setUnreadCount(data.folderCounts?.inbox || 0);
        }
      } catch (err) {
        console.error("Failed to load email widget data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadWidgetData();
  }, []);

  return (
    <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-black/5 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Email Center</h3>
              <p className="text-xs text-muted-foreground">SMTP & IMAP Inbox</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                {unreadCount} Unread
              </span>
            ) : (
              <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                All Read
              </span>
            )}
          </div>
        </div>

        {/* Mini recent emails list */}
        <div className="space-y-2">
          {isLoading ? (
            <p className="text-xs text-muted-foreground text-center py-4">Checking mailbox...</p>
          ) : recentEmails.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No recent messages in Inbox.</p>
          ) : (
            recentEmails.map((msg) => (
              <Link
                key={msg.id || msg.dbKey}
                href="/admin-cts/email-center"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#faf9f6] transition-colors border border-transparent hover:border-black/5"
              >
                <div className="truncate mr-2">
                  <p className={`text-xs truncate ${!msg.isRead ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                    {msg.from?.name || msg.from?.email}
                  </p>
                  <p className="text-[11px] text-foreground truncate font-medium">{msg.subject}</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                  {new Date(msg.createdAt).toLocaleDateString("en-PK", { month: "short", day: "numeric" })}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-black/5 mt-4">
        <Link
          href="/admin-cts/email-center"
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-black/5 py-2.5 text-xs font-bold text-foreground hover:bg-primary hover:text-white transition-all shadow-xs"
        >
          <span>Open Email Center</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
