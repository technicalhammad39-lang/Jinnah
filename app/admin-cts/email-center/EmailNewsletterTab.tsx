"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Send, 
  Upload, 
  Download, 
  Plus, 
  CheckCircle2, 
  Loader2, 
  Mail, 
  Megaphone,
  Clock,
  Sparkles
} from "lucide-react";
import { EmailSubscriber, NewsletterCampaign } from "@/lib/email/types";
import { toast } from "sonner";

export default function EmailNewsletterTab() {
  const [subscribers, setSubscribers] = useState<EmailSubscriber[]>([]);
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New subscriber modal
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [isAddingSubscriber, setIsAddingSubscriber] = useState(false);

  // Campaign dispatch
  const [campaignTitle, setCampaignTitle] = useState("");
  const [campaignSubject, setCampaignSubject] = useState("");
  const [campaignBody, setCampaignBody] = useState("");
  const [isDispatching, setIsDispatching] = useState(false);

  const loadData = async () => {
    try {
      const res = await fetch("/api/admin/email/newsletter");
      const data = await res.json();
      if (data.success) {
        setSubscribers(data.subscribers || []);
        setCampaigns(data.campaigns || []);
      }
    } catch (err) {
      console.error("Failed to load newsletter data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;

    try {
      const res = await fetch("/api/admin/email/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_subscriber",
          email: newEmail,
          name: newName,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      toast.success(data.message);
      setNewEmail("");
      setNewName("");
      setIsAddingSubscriber(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to add subscriber");
    }
  };

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignSubject || !campaignBody) {
      toast.error("Subject and Body are required for campaign");
      return;
    }

    if (!confirm(`Are you sure you want to broadcast this campaign to ${subscribers.length} subscribers?`)) {
      return;
    }

    setIsDispatching(true);
    try {
      const res = await fetch("/api/admin/email/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_campaign",
          title: campaignTitle || campaignSubject,
          subject: campaignSubject,
          bodyHtml: campaignBody,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      toast.success(data.message);
      setCampaignTitle("");
      setCampaignSubject("");
      setCampaignBody("");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to send campaign");
    } finally {
      setIsDispatching(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    if (subscribers.length === 0) {
      toast.info("No subscribers to export.");
      return;
    }
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Email,Name,SubscribedAt", ...subscribers.map((s) => `"${s.email}","${s.name || ""}","${s.subscribedAt}"`)].join(
        "\n"
      );
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8 pb-20">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Subscribers</p>
            <h3 className="text-2xl font-extrabold text-foreground">{subscribers.length}</h3>
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <Megaphone className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Campaigns Sent</p>
            <h3 className="text-2xl font-extrabold text-foreground">{campaigns.length}</h3>
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</p>
            <p className="text-xs text-foreground font-semibold mt-1">Manage Audience</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingSubscriber(true)}
              className="p-2 rounded-xl bg-primary text-white hover:bg-primary/95 shadow-sm"
              title="Add Subscriber"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={handleExportCsv}
              className="p-2 rounded-xl border border-black/10 bg-white text-muted-foreground hover:text-foreground"
              title="Export CSV"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Campaign Composer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2 border-b border-black/5 pb-4 mb-5">
              <Megaphone className="h-5 w-5 text-primary" />
              <h3 className="text-base font-bold text-foreground">Broadcast Newsletter Campaign</h3>
            </div>

            <form onSubmit={handleSendCampaign} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Campaign Reference Name</label>
                <input
                  type="text"
                  placeholder="e.g. Eid Mega Sale / Summer Hardware Promo"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-[#faf9f6] p-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Email Subject Line</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Exclusive Discounts on Hardware Tools - Jinnah Store"
                  value={campaignSubject}
                  onChange={(e) => setCampaignSubject(e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-[#faf9f6] p-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1">HTML Newsletter Body</label>
                <textarea
                  rows={8}
                  required
                  placeholder="<p>Dear Customer,<br/>Explore our latest architectural hardware...</p>"
                  value={campaignBody}
                  onChange={(e) => setCampaignBody(e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-[#faf9f6] p-3 text-xs font-mono outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isDispatching || subscribers.length === 0}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-primary/20 hover:bg-primary/95 transition-all disabled:opacity-50"
                >
                  {isDispatching ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Broadcasting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Dispatch Campaign ({subscribers.length} Recipients)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Subscribers Table (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-black/5 pb-4 mb-4">
              <h3 className="text-sm font-bold text-foreground">Subscriber List ({subscribers.length})</h3>
              <button
                onClick={() => setIsAddingSubscriber(true)}
                className="text-xs font-bold text-primary hover:underline"
              >
                + Add
              </button>
            </div>

            <div className="max-h-[380px] overflow-y-auto divide-y divide-black/5">
              {subscribers.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No subscribers found.</p>
              ) : (
                subscribers.map((sub) => (
                  <div key={sub.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="truncate mr-2">
                      <p className="font-semibold text-foreground truncate">{sub.email}</p>
                      {sub.name && <p className="text-[10px] text-muted-foreground">{sub.name}</p>}
                    </div>
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 shrink-0">
                      {sub.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Subscriber Modal */}
      {isAddingSubscriber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <form
            onSubmit={handleAddSubscriber}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-foreground">Add New Subscriber</h3>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="subscriber@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full rounded-xl border border-black/10 p-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Name (Optional)</label>
              <input
                type="text"
                placeholder="Muhammad Ali"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded-xl border border-black/10 p-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingSubscriber(false)}
                className="px-4 py-2 rounded-xl border border-black/10 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-primary text-xs font-bold uppercase text-white hover:bg-primary/95"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
