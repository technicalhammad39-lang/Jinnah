"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc, updateDoc, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Search, Trash2, Loader2, CheckCircle2, Circle, Mail } from "lucide-react";
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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
    m.subject?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1917]">Contact Messages</h1>
        <p className="text-[#1a1917]/50 text-sm mt-1">Inbox for customer inquiries</p>
      </div>

      <div className="flex-1 bg-white border border-[#1a1917]/5 rounded-2xl overflow-hidden shadow-xl flex flex-col lg:flex-row min-h-0">
        
        {/* Messages List (Sidebar) */}
        <div className={`w-full lg:w-96 border-r border-[#1a1917]/5 flex flex-col ${selectedMessage ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 border-b border-[#1a1917]/5 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1a1917]/30" />
              <input 
                type="text"
                placeholder="Search messages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-[#1a1917]/10 rounded-lg py-2 pl-9 pr-4 text-[#1a1917] text-sm focus:outline-none focus:border-[#FF6A2A] transition-colors"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-[#1a1917]/5">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-[#FF6A2A]" />
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-[#1a1917]/40 text-sm">
                No messages found.
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <div 
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`p-4 cursor-pointer hover:bg-white/[0.02] transition-colors ${selectedMessage?.id === msg.id ? 'bg-[#1a1917]/5' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={`font-semibold truncate ${!msg.read ? 'text-[#1a1917]' : 'text-[#1a1917]/60'}`}>
                      {msg.name}
                    </h3>
                    <span className="text-xs text-[#1a1917]/30 whitespace-nowrap">
                      {msg.createdAt?.toDate 
                        ? new Date(msg.createdAt.toDate()).toLocaleDateString() 
                        : (msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : '')}
                    </span>
                  </div>
                  <p className={`text-sm truncate mb-2 ${!msg.read ? 'text-[#1a1917]/90 font-medium' : 'text-[#1a1917]/50'}`}>
                    {msg.subject || 'No Subject'}
                  </p>
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={(e) => markAsRead(msg.id, msg.read, e)}
                      className="text-[#1a1917]/40 hover:text-[#1a1917] transition-colors"
                      title={msg.read ? "Mark as unread" : "Mark as read"}
                    >
                      {msg.read ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4 text-[#FF6A2A]" fill="currentColor" />}
                    </button>
                    <button 
                      onClick={(e) => handleDelete(msg.id, e)}
                      className="text-[#1a1917]/40 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Detail View */}
        <div className={`flex-1 flex flex-col bg-white ${!selectedMessage ? 'hidden lg:flex' : 'flex'}`}>
          {selectedMessage ? (
            <>
              <div className="p-6 border-b border-[#1a1917]/5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#1a1917] mb-2">{selectedMessage.subject || 'No Subject'}</h2>
                  <div className="flex items-center gap-4 text-sm text-[#1a1917]/50">
                    <div className="flex items-center gap-1 font-medium text-[#1a1917]/80">
                      <Mail className="w-4 h-4" />
                      {selectedMessage.name}
                    </div>
                    <span>&lt;{selectedMessage.email}&gt;</span>
                    {selectedMessage.phone && (
                      <span>• Ph: {selectedMessage.phone}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-[#1a1917]/40 mb-1">
                    {selectedMessage.createdAt?.toDate 
                      ? new Date(selectedMessage.createdAt.toDate()).toLocaleString() 
                      : (selectedMessage.createdAt ? new Date(selectedMessage.createdAt).toLocaleString() : '')}
                  </div>
                  <button 
                    onClick={() => setSelectedMessage(null)}
                    className="lg:hidden text-sm text-[#FF6A2A] hover:underline"
                  >
                    Back to Inbox
                  </button>
                </div>
              </div>
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="bg-white p-6 rounded-2xl border border-[#1a1917]/5 text-[#1a1917]/80 whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message}
                </div>
                
                <div className="mt-8">
                  <a 
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'Your Inquiry'}`}
                    className="inline-flex items-center gap-2 bg-[#1a1917]/5 hover:bg-[#1a1917]/10 text-[#1a1917] font-bold py-3 px-6 rounded-xl transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    Reply via Email
                  </a>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[#1a1917]/30">
              <Mail className="w-16 h-16 mb-4 opacity-50" />
              <p>Select a message to read</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
