"use client";

import { useState } from "react";
import { Send, Loader2, Bell } from "lucide-react";
import { toast } from "sonner";

export default function AdminNotifications() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    link: "/"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Notification sent successfully!");
        setFormData({ title: "", body: "", link: "/" });
      } else {
        toast.error(data.error || "Failed to send notification");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1917]">Push Notifications</h1>
        <p className="text-[#1a1917]/50 text-sm mt-1">Send marketing alerts and updates to subscribed users</p>
      </div>

      <div className="bg-white border border-[#1a1917]/5 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#1a1917]/5">
          <div className="p-3 bg-[#FF6A2A]/10 rounded-xl">
            <Bell className="w-5 h-5 text-[#FF6A2A]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1a1917]">Compose Message</h2>
            <p className="text-sm text-[#1a1917]/50">This will be broadcasted to all active devices</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Notification Title</label>
            <input 
              type="text" 
              required
              maxLength={60}
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
              placeholder="e.g. Flash Sale: 50% Off Door Handles!"
            />
            <div className="text-right text-xs text-[#1a1917]/30">{formData.title.length}/60</div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Message Body</label>
            <textarea 
              required
              maxLength={150}
              value={formData.body}
              onChange={e => setFormData({...formData, body: e.target.value})}
              className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors h-24 resize-none"
              placeholder="A brief compelling description of the offer or update..."
            />
            <div className="text-right text-xs text-[#1a1917]/30">{formData.body.length}/150</div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Target Link (Path)</label>
            <input 
              type="text" 
              value={formData.link}
              onChange={e => setFormData({...formData, link: e.target.value})}
              className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors font-mono text-sm text-blue-400"
              placeholder="/products/category-slug"
            />
            <p className="text-xs text-[#1a1917]/30 pl-1">Where users will be directed when they tap the notification.</p>
          </div>

          <div className="pt-4 border-t border-[#1a1917]/5">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF6A2A] hover:bg-[#e5591c] text-white font-bold py-3.5 px-8 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              Broadcast Notification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
