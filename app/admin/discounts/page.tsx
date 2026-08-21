"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2, Loader2, Tag } from "lucide-react";
import { toast } from "sonner";
import { Discount } from "@/lib/discount-engine";

export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchDiscounts = async () => {
    try {
      const q = query(collection(db, "discounts"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as Discount[];
      setDiscounts(data);
    } catch (error) {
      console.error("Error fetching discounts:", error);
      toast.error("Failed to load discounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the discount "${name}"?`)) {
      try {
        await deleteDoc(doc(db, "discounts", id));
        toast.success("Discount deleted successfully");
        setDiscounts(discounts.filter(d => d.id !== id));
      } catch (error) {
        console.error("Error deleting discount:", error);
        toast.error("Failed to delete discount");
      }
    }
  };

  const filteredDiscounts = discounts.filter(d => 
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.scope?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1917]">Discounts</h1>
          <p className="text-[#1a1917]/50 text-sm mt-1">Manage automatic discounts and sales</p>
        </div>
        <Link 
          href="/admin/discounts/new"
          className="bg-[#FF6A2A] hover:bg-[#e5591c] text-white font-bold py-2.5 px-5 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Discount
        </Link>
      </div>

      <div className="bg-white border border-[#1a1917]/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#1a1917]/5 bg-white">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1a1917]/30" />
            <input 
              type="text"
              placeholder="Search discounts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-[#1a1917]/10 rounded-lg py-2 pl-9 pr-4 text-[#1a1917] text-sm focus:outline-none focus:border-[#FF6A2A] transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#1a1917]/70">
            <thead className="text-xs uppercase bg-white text-[#1a1917]/40 border-b border-[#1a1917]/5">
              <tr>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Value</th>
                <th className="px-6 py-4 font-semibold">Scope</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1917]/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#FF6A2A]" />
                  </td>
                </tr>
              ) : filteredDiscounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#1a1917]/40">
                    No discounts found.
                  </td>
                </tr>
              ) : (
                filteredDiscounts.map((discount) => {
                  const now = new Date();
                  const isScheduled = discount.startsAt && new Date(discount.startsAt) > now;
                  const isExpired = discount.endsAt && new Date(discount.endsAt) < now;
                  const statusLabel = !discount.isActive ? "Disabled" : (isExpired ? "Expired" : (isScheduled ? "Scheduled" : "Active"));
                  const statusColor = statusLabel === "Active" ? "bg-emerald-500/10 text-emerald-600" 
                    : statusLabel === "Disabled" ? "bg-red-500/10 text-red-600" 
                    : "bg-amber-500/10 text-amber-600";
                  
                  return (
                  <tr key={discount.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                          <Tag className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <div className="font-bold text-[#1a1917]">{discount.name}</div>
                          <div className="text-xs text-[#1a1917]/40 truncate w-48">{discount.description || "No description"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600">
                      {discount.type === 'percentage' ? `${discount.value}% OFF` : `Rs. ${discount.value.toLocaleString()} OFF`}
                    </td>
                    <td className="px-6 py-4 capitalize">
                      {discount.scope.replace('_', ' ')}
                      {discount.scope !== 'all_products' && discount.productIds?.length && (
                        <span className="ml-2 text-xs bg-black/5 px-2 py-1 rounded-full">{discount.productIds.length} items</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`${statusColor} px-2.5 py-1 rounded-full text-xs font-bold`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/discounts/${discount.id}`}
                          className="p-2 text-[#1a1917]/40 hover:text-[#1a1917] hover:bg-[#1a1917]/5 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(discount.id, discount.name)}
                          className="p-2 text-[#1a1917]/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
