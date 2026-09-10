"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc, updateDoc, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Search, Trash2, Loader2, CheckCircle2, Circle, Mail, ArrowLeft, Phone, User, Clock, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function AdminMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);

  const fetchMessages = async () => {
    try {
      const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm("Are you sure you want to delete this message?")) {
      try {
        await deleteDoc(doc(db, "messages", id));
        toast.success("Message deleted");
        setMessages(messages.filter(m => m.id !== id));
        if (selectedMessage?.id === id) setSelectedMessage(null);
      } catch (error) {
        console.error("Error deleting message:", error);
        toast.error("Failed to delete message");
      }
    }
  };

  const markAsRead = async (id: string, currentStatus: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await updateDoc(doc(db, "messages", id), {
        read: !currentStatus
      });
      setMessages(messages.map(m => m.id === id ? { ...m, read: !currentStatus } : m));
      if (selectedMessage?.id === id) {
        setSelectedMessage((prev: any) => prev ? { ...prev, read: !currentStatus } : null);
      }
    } catch (error) {
      console.error("Error updating message:", error);
      toast.error("Failed to update status");
    }
  };

  const handleSelectMessage = (msg: any) => {
    setSelectedMessage(msg);
    if (!msg.read) {
      markAsRead(msg.id, false);
    }
  };

  const filteredMessages = messages.filter(m => 
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.subject?.toLowerCase().includes(search.toLowerCase()) ||
    m.message?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 h-[calc(100vh-6.5rem)] sm:h-[calc(100vh-7.5rem)] flex flex-col">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1a1917]">Contact Messages</h1>
          <p className="text-[#1a1917]/50 text-xs sm:text-sm mt-0.5 sm:mt-1">
            Customer inquiries and store contact submissions
          </p>
        </div>
        <span className="rounded-full bg-[#FF6A2A]/10 text-[#FF6A2A] text-xs font-bold px-3 py-1">
          {messages.length} Total
        </span>
      </div>

      <div className="flex-1 bg-white border border-[#1a1917]/10 rounded-2xl overflow-hidden shadow-xl flex flex-col lg:flex-row min-h-0">
        
        {/* Messages List (Sidebar on desktop, full screen when no message selected on mobile) */}
        <div className={`w-full lg:w-96 border-r border-[#1a1917]/10 flex flex-col ${selectedMessage ? 'hidden lg:flex' : 'flex'}`}>
          {/* Search Header */}
          <div className="p-3 sm:p-4 border-b border-[#1a1917]/10 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1a1917]/40" />
              <input 
                type="text"
                placeholder="Search inquiries, names, emails..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#faf9f6] border border-[#1a1917]/10 rounded-xl py-2 pl-9 pr-4 text-[#1a1917] text-xs sm:text-sm focus:outline-none focus:border-[#FF6A2A] transition-colors"
              />
            </div>
          </div>
          
          {/* List Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-[#1a1917]/5">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-[#FF6A2A]" />
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-[#1a1917]/40 text-xs sm:text-sm">
                <Mail className="h-8 w-8 mx-auto mb-2 text-[#1a1917]/20" />
                <p className="font-semibold text-gray-700">No messages found</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Try searching with different keywords</p>
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <div 
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`p-3.5 sm:p-4 cursor-pointer transition-all border-l-4 ${
                    selectedMessage?.id === msg.id 
                      ? 'bg-[#FF6A2A]/5 border-l-[#FF6A2A]' 
                      : !msg.read 
                        ? 'bg-amber-50/50 border-l-[#FF6A2A] hover:bg-amber-50/80 font-semibold' 
                        : 'bg-white border-l-transparent hover:bg-black/[0.02]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={`text-sm truncate ${!msg.read ? 'font-black text-[#1a1917]' : 'font-semibold text-[#1a1917]/75'}`}>
                      {msg.name}
                    </h3>
                    <span className="text-[11px] text-[#1a1917]/40 whitespace-nowrap font-medium shrink-0">
                      {msg.createdAt?.toDate 
                        ? new Date(msg.createdAt.toDate()).toLocaleDateString("en-PK", { month: "short", day: "numeric" }) 
                        : (msg.createdAt ? new Date(msg.createdAt).toLocaleDateString("en-PK", { month: "short", day: "numeric" }) : '')}
                    </span>
                  </div>

                  <p className={`text-xs truncate mb-1.5 ${!msg.read ? 'text-[#1a1917] font-bold' : 'text-[#1a1917]/60'}`}>
                    {msg.subject || 'No Subject'}
                  </p>

                  <p className="text-[11px] text-[#1a1917]/50 truncate mb-2.5">
                    {msg.message || ''}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-[#1a1917]/5">
                    <button 
                      onClick={(e) => markAsRead(msg.id, msg.read, e)}
                      className="text-[#1a1917]/50 hover:text-[#FF6A2A] transition-colors p-1 -ml-1 rounded-md hover:bg-black/5"
                      title={msg.read ? "Mark as unread" : "Mark as read"}
                    >
                      {msg.read ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#FF6A2A] font-bold">
                          <Circle className="w-3.5 h-3.5 fill-[#FF6A2A]" />
                          <span>Unread</span>
                        </span>
                      )}
                    </button>
                    <button 
                      onClick={(e) => handleDelete(msg.id, e)}
                      className="text-[#1a1917]/40 hover:text-rose-600 transition-colors p-1 rounded-md hover:bg-rose-50"
                      title="Delete message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Detail View (Full screen on mobile when selected) */}
        <div className={`flex-1 flex flex-col bg-white ${!selectedMessage ? 'hidden lg:flex' : 'flex'}`}>
          {selectedMessage ? (
            <>
              {/* Mobile Dedicated Top Bar with Prominent Back Button & Icon */}
              <div className="lg:hidden p-3 border-b border-[#1a1917]/10 bg-[#faf9f6] flex items-center justify-between shrink-0">
                <button 
                  onClick={() => setSelectedMessage(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 bg-white text-xs font-bold text-[#1a1917] hover:bg-black/5 active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4 text-[#FF6A2A] stroke-[2.5]" />
                  <span>Back to Messages</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => markAsRead(selectedMessage.id, selectedMessage.read)}
                    className="p-2 rounded-xl text-stone-600 hover:text-[#FF6A2A] hover:bg-white transition-colors"
                    title={selectedMessage.read ? "Mark as unread" : "Mark as read"}
                  >
                    {selectedMessage.read ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Circle className="w-4 h-4 text-[#FF6A2A] fill-[#FF6A2A]" />}
                  </button>
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="p-2 rounded-xl text-stone-600 hover:text-rose-600 hover:bg-white transition-colors"
                    title="Delete message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Detail Header */}
              <div className="p-4 sm:p-6 border-b border-[#1a1917]/10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 shrink-0">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl font-bold text-[#1a1917] leading-snug break-words">
                    {selectedMessage.subject || 'No Subject'}
                  </h2>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#1a1917]/60">
                    <div className="inline-flex items-center gap-1.5 font-bold text-[#1a1917]">
                      <User className="w-3.5 h-3.5 text-[#FF6A2A]" />
                      <span>{selectedMessage.name}</span>
                    </div>
                    <span className="font-mono text-stone-600 break-all">
                      &lt;{selectedMessage.email}&gt;
                    </span>
                    {selectedMessage.phone && (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">
                        <Phone className="w-3 h-3" />
                        <span>{selectedMessage.phone}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1a1917]/5">
                  <div className="text-[11px] sm:text-xs text-[#1a1917]/50 font-medium inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {selectedMessage.createdAt?.toDate 
                        ? new Date(selectedMessage.createdAt.toDate()).toLocaleString("en-PK", {
                            dateStyle: "medium",
                            timeStyle: "short"
                          }) 
                        : (selectedMessage.createdAt ? new Date(selectedMessage.createdAt).toLocaleString("en-PK", {
                            dateStyle: "medium",
                            timeStyle: "short"
                          }) : '')}
                    </span>
                  </div>

                  {/* Desktop actions */}
                  <div className="hidden lg:flex items-center gap-1.5 mt-2">
                    <button
                      onClick={() => markAsRead(selectedMessage.id, selectedMessage.read)}
                      className="px-2.5 py-1 rounded-lg border border-black/10 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-black/5"
                    >
                      {selectedMessage.read ? "Mark Unread" : "Mark Read"}
                    </button>
                    <button
                      onClick={() => handleDelete(selectedMessage.id)}
                      className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                      title="Delete message"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Detail Content Body */}
              <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-6 custom-scrollbar">
                <div className="bg-[#faf9f6] p-4 sm:p-6 rounded-2xl border border-[#1a1917]/10 text-[#1a1917] whitespace-pre-wrap leading-relaxed text-sm sm:text-base font-sans shadow-2xs">
                  {selectedMessage.message}
                </div>
                
                {/* Reply Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a 
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'Your Inquiry - Jinnah Hardware Store'}`}
                    className="inline-flex items-center justify-center gap-2 bg-[#FF6A2A] hover:bg-[#e0561b] text-white font-bold py-2.5 sm:py-3 px-5 sm:px-6 rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-95"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Reply via Email Client</span>
                  </a>

                  {selectedMessage.phone && (
                    <a
                      href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 sm:py-3 px-5 sm:px-6 rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-95"
                    >
                      <Phone className="w-4 h-4" />
                      <span>WhatsApp Customer</span>
                    </a>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#1a1917]/30">
              <div className="h-16 w-16 rounded-2xl bg-[#faf9f6] border border-[#1a1917]/5 flex items-center justify-center mb-3">
                <Mail className="w-8 h-8 opacity-40 text-[#1a1917]" />
              </div>
              <h3 className="text-base font-bold text-gray-700">Select a Message</h3>
              <p className="text-xs text-[#1a1917]/40 max-w-xs mt-1">
                Choose any customer inquiry from the left sidebar to view details, contact info, and reply.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
