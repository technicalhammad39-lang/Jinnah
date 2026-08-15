"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { getPublicUploadUrl } from "@/lib/utils";

export default function LeadershipAdmin() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchMembers() {
    try {
      const q = query(collection(db, "leadership"), orderBy("order", "asc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMembers(data);
    } catch (error) {
      console.error("Error fetching leadership members:", error);
      toast.error("Failed to load leadership members");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this member?")) return;
    try {
      await deleteDoc(doc(db, "leadership", id));
      toast.success("Member deleted successfully");
      fetchMembers();
    } catch (error) {
      console.error("Error deleting member:", error);
      toast.error("Failed to delete member");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6A2A]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1917]">Leadership</h1>
          <p className="text-[#1a1917]/50 text-sm mt-1">Manage about page leadership section</p>
        </div>
        <Link 
          href="/admin/leadership/new"
          className="bg-[#FF6A2A] hover:bg-[#e5591c] text-white font-bold py-2.5 px-6 rounded-xl transition-colors inline-flex items-center gap-2 justify-center"
        >
          <Plus className="w-5 h-5" />
          Add Member
        </Link>
      </div>

      <div className="bg-white border border-[#1a1917]/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1a1917]/5 bg-[#1a1917]/[0.02]">
                <th className="p-4 text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider">Image</th>
                <th className="p-4 text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider">Name & Role</th>
                <th className="p-4 text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider">Order</th>
                <th className="p-4 text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1917]/5">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    No leadership members found. Add one to get started.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-[#1a1917]/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/5 relative">
                        {member.image ? (
                          <Image src={getPublicUploadUrl(member.image)} alt={member.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No image</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-[#1a1917]">{member.name}</div>
                      <div className="text-sm text-primary uppercase font-extrabold tracking-wider">{member.role}</div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground font-medium">
                      {member.order || 0}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/leadership/${member.id}`}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(member.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
