"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus, Edit, Trash2, Loader2, Ticket, Percent, DollarSign } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CouponsAdmin() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchCoupons() {
    try {
      const q = query(collection(db, "coupons"), orderBy("code", "asc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCoupons(data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await deleteDoc(doc(db, "coupons", id));
      toast.success("Coupon deleted successfully");
      fetchCoupons();
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error("Failed to delete coupon");
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
          <h1 className="text-2xl font-bold text-[#1a1917] flex items-center gap-2">
            <Ticket className="h-6 w-6 text-primary" /> Coupons
          </h1>
          <p className="text-[#1a1917]/50 text-sm mt-1">Manage store discounts and promo codes</p>
        </div>
        <Link 
          href="/admin/coupons/new"
          className="bg-[#FF6A2A] hover:bg-[#e5591c] text-white font-bold py-2.5 px-6 rounded-xl transition-colors inline-flex items-center gap-2 justify-center"
        >
          <Plus className="w-5 h-5" />
          Add Coupon
        </Link>
      </div>

      <div className="bg-white border border-[#1a1917]/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1a1917]/5 bg-[#1a1917]/[0.02]">
                <th className="p-4 text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider">Code</th>
                <th className="p-4 text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider">Discount</th>
                <th className="p-4 text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider">Usage</th>
                <th className="p-4 text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1917]/5">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No coupons found. Add one to get started.
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-[#1a1917]/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-[#1a1917] tracking-widest bg-black/5 inline-block px-3 py-1 rounded-md border border-black/10">{coupon.code}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 font-bold">
                        {coupon.discountType === 'percentage' ? (
                          <><Percent className="w-3 h-3 text-emerald-600" /> <span className="text-emerald-600">{coupon.discountValue}% OFF</span></>
                        ) : (
                          <><DollarSign className="w-3 h-3 text-blue-600" /> <span className="text-blue-600">Rs. {coupon.discountValue} OFF</span></>
                        )}
                      </div>
                      {coupon.minOrderAmount > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">Min: Rs. {coupon.minOrderAmount}</div>
                      )}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      <div>Used: {coupon.usedCount || 0}</div>
                      {coupon.usageLimit > 0 && <div>Limit: {coupon.usageLimit}</div>}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${coupon.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {coupon.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/coupons/${coupon.id}`}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(coupon.id)}
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
