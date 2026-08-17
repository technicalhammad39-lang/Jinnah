"use client";

import { useEffect, useState, use } from "react";
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CouponEditor({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage", // 'percentage' | 'fixed'
    discountValue: "",
    minOrderAmount: "",
    usageLimit: "",
    expiryDate: "",
    active: true,
    usedCount: 0,
  });

  useEffect(() => {
    if (!isNew) {
      const fetchCoupon = async () => {
        try {
          const docRef = doc(db, "coupons", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData({
              code: data.code || "",
              discountType: data.discountType || "percentage",
              discountValue: data.discountValue || "",
              minOrderAmount: data.minOrderAmount || "",
              usageLimit: data.usageLimit || "",
              expiryDate: data.expiryDate || "",
              active: data.active ?? true,
              usedCount: data.usedCount || 0,
            });
          } else {
            toast.error("Coupon not found");
            router.push("/admin/coupons");
          }
        } catch (error) {
          console.error("Error fetching coupon:", error);
          toast.error("Failed to load coupon details");
        } finally {
          setLoading(false);
        }
      };
      fetchCoupon();
    }
  }, [id, isNew, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue) {
      toast.error("Code and discount value are required.");
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        code: formData.code.toUpperCase(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderAmount: Number(formData.minOrderAmount) || 0,
        usageLimit: Number(formData.usageLimit) || 0,
        expiryDate: formData.expiryDate || null,
        active: formData.active,
        usedCount: formData.usedCount,
        updatedAt: serverTimestamp(),
      };

      if (isNew) {
        await addDoc(collection(db, "coupons"), {
          ...dataToSave,
          createdAt: serverTimestamp()
        });
        toast.success("Coupon created successfully!");
      } else {
        await setDoc(doc(db, "coupons", id), dataToSave, { merge: true });
        toast.success("Coupon updated successfully!");
      }
      router.push("/admin/coupons");
    } catch (error) {
      console.error("Error saving coupon:", error);
      toast.error("Failed to save coupon.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/admin/coupons"
          className="p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1a1917]">{isNew ? "Create Coupon" : "Edit Coupon"}</h1>
          <p className="text-[#1a1917]/50 text-sm mt-1">Configure discount logic and limits.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-black/5 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Coupon Code <span className="text-red-500">*</span></label>
              <input
                required
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g. SUMMER25"
                className="w-full uppercase rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Status</label>
              <div className="flex items-center h-12">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  <span className="ml-3 text-sm font-medium text-foreground">{formData.active ? 'Active' : 'Inactive'}</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Discount Type</label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (Rs.)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Discount Value <span className="text-red-500">*</span></label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                placeholder={formData.discountType === 'percentage' ? "e.g. 20" : "e.g. 500"}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Min. Order Amount (Rs.)</label>
              <input
                type="number"
                min="0"
                name="minOrderAmount"
                value={formData.minOrderAmount}
                onChange={handleChange}
                placeholder="Leave blank for no minimum"
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Usage Limit</label>
              <input
                type="number"
                min="0"
                name="usageLimit"
                value={formData.usageLimit}
                onChange={handleChange}
                placeholder="e.g. 100 (Leave blank for unlimited)"
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-semibold text-foreground">Expiry Date</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 gap-4">
          <Link 
            href="/admin/coupons"
            className="px-6 py-3 rounded-xl border border-black/10 font-bold hover:bg-black/5 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-xl transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Coupon
          </button>
        </div>
      </form>
    </div>
  );
}
