"use client";

import { useState, useEffect, use } from "react";
import { doc, getDoc, setDoc, collection, serverTimestamp, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Tag, Percent, DollarSign } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Discount } from "@/lib/discount-engine";

export default function DiscountEditor({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  const [formData, setFormData] = useState<Partial<Discount>>({
    name: "",
    description: "",
    type: "percentage",
    value: 0,
    scope: "all_products",
    productIds: [],
    isActive: true,
    startsAt: "",
    endsAt: "",
  });

  // Helper to format ISO string to local datetime-local format
  const formatForInput = (isoString?: string) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  useEffect(() => {
    async function fetchProducts() {
      try {
        const q = query(collection(db, "products"), orderBy("name", "asc"));
        const snap = await getDocs(q);
        setProducts(snap.docs.map(doc => ({ id: doc.id, name: doc.data().name, price: doc.data().price })));
      } catch (err) {
        console.error("Error fetching products", err);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    if (isNew) return;
    
    async function fetchDiscount() {
      try {
        const docRef = doc(db, "discounts", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            ...data,
            startsAt: formatForInput(data.startsAt),
            endsAt: formatForInput(data.endsAt),
          } as any);
        } else {
          toast.error("Discount not found");
          router.push("/admin/discounts");
        }
      } catch (error) {
        console.error("Error fetching discount:", error);
        toast.error("Failed to load discount");
      } finally {
        setLoading(false);
      }
    }
    fetchDiscount();
  }, [id, isNew, router]);

  const handleProductToggle = (productId: string) => {
    setFormData(prev => {
      const current = prev.productIds || [];
      if (current.includes(productId)) {
        // Since 'product' scope expects 1 product, if they uncheck it, maybe clear it.
        // For 'selected_products' multiple can be checked.
        return { ...prev, productIds: current.filter(id => id !== productId) };
      } else {
        if (prev.scope === 'product') {
          return { ...prev, productIds: [productId] };
        }
        return { ...prev, productIds: [...current, productId] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.scope !== 'all_products' && (!formData.productIds || formData.productIds.length === 0)) {
      toast.error("Please select at least one product.");
      return;
    }

    setSaving(true);

    try {
      const dataToSave = {
        ...formData,
        value: Number(formData.value),
        startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : "",
        endsAt: formData.endsAt ? new Date(formData.endsAt).toISOString() : "",
        productIds: formData.scope === 'all_products' ? [] : formData.productIds,
        updatedAt: serverTimestamp()
      };

      if (isNew) {
        const newRef = doc(collection(db, "discounts"));
        await setDoc(newRef, {
          ...dataToSave,
          id: newRef.id,
          createdAt: serverTimestamp()
        });
        toast.success("Discount created successfully");
      } else {
        await setDoc(doc(db, "discounts", id), dataToSave, { merge: true });
        toast.success("Discount updated successfully");
      }
      router.push("/admin/discounts");
    } catch (error) {
      console.error("Error saving discount:", error);
      toast.error("Failed to save discount");
    } finally {
      setSaving(false);
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
    <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/discounts"
          className="p-2 bg-[#1a1917]/5 hover:bg-[#1a1917]/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1a1917]">{isNew ? "Create Discount" : "Edit Discount"}</h1>
          <p className="text-[#1a1917]/50 text-sm mt-1">{isNew ? "Set up a new automatic discount rule" : "Modify existing discount settings"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-[#1a1917]/5 rounded-2xl p-6 shadow-xl space-y-8">
          
          {/* BASIC INFO */}
          <div>
            <h2 className="text-lg font-bold mb-4 border-b pb-2 flex items-center gap-2"><Tag className="w-5 h-5"/> Basic Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Discount Name (Internal)</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Summer Sale 2026"
                  value={formData.name || ""}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Description (Optional)</label>
                <input 
                  type="text" 
                  value={formData.description || ""}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
                />
              </div>
            </div>
            
            <div className="mt-6 flex items-center gap-3">
               <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.isActive}
                  onChange={e => setFormData({...formData, isActive: e.target.checked})}
                  className="w-5 h-5 rounded border-[#1a1917]/10 bg-white text-[#FF6A2A] focus:ring-[#FF6A2A] focus:ring-offset-[#1a1917]"
                />
                <span className="text-sm font-bold text-[#1a1917]">Is Active</span>
              </label>
              <p className="text-xs text-[#1a1917]/50 ml-2">Uncheck to disable this discount immediately.</p>
            </div>
          </div>

          {/* VALUE */}
          <div>
            <h2 className="text-lg font-bold mb-4 border-b pb-2">Discount Value</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Discount Type</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'percentage'})}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-bold transition-colors ${formData.type === 'percentage' ? 'border-primary bg-primary/10 text-primary' : 'border-black/10 text-black/60 hover:bg-black/5'}`}
                  >
                    <Percent className="w-4 h-4" /> Percentage
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'fixed'})}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-bold transition-colors ${formData.type === 'fixed' ? 'border-primary bg-primary/10 text-primary' : 'border-black/10 text-black/60 hover:bg-black/5'}`}
                  >
                    <DollarSign className="w-4 h-4" /> Fixed Amount
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Value {formData.type === 'percentage' ? '(%)' : '(Rs.)'}</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  max={formData.type === 'percentage' ? 100 : undefined}
                  value={formData.value || ""}
                  onChange={e => setFormData({...formData, value: Number(e.target.value)})}
                  className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] font-bold focus:outline-none focus:border-[#FF6A2A] transition-colors text-xl"
                />
              </div>
            </div>
          </div>

          {/* SCOPE */}
          <div>
            <h2 className="text-lg font-bold mb-4 border-b pb-2">Applies To (Scope)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setFormData({...formData, scope: 'all_products'})}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-colors ${formData.scope === 'all_products' ? 'border-primary bg-primary/5 text-primary' : 'border-black/10 text-black/60 hover:bg-black/5'}`}
              >
                <span className="font-bold">All Products</span>
                <span className="text-xs opacity-70">Applies to everything</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, scope: 'selected_products'})}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-colors ${formData.scope === 'selected_products' ? 'border-primary bg-primary/5 text-primary' : 'border-black/10 text-black/60 hover:bg-black/5'}`}
              >
                <span className="font-bold">Selected Products</span>
                <span className="text-xs opacity-70">Pick multiple items</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, scope: 'product'})}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-colors ${formData.scope === 'product' ? 'border-primary bg-primary/5 text-primary' : 'border-black/10 text-black/60 hover:bg-black/5'}`}
              >
                <span className="font-bold">Specific Product</span>
                <span className="text-xs opacity-70">One specific item</span>
              </button>
            </div>

            {formData.scope !== 'all_products' && (
              <div className="bg-black/5 p-4 rounded-xl max-h-60 overflow-y-auto space-y-2 border border-black/10">
                <p className="text-sm font-bold mb-2">Select Product{formData.scope === 'selected_products' ? 's' : ''}</p>
                {products.map(product => (
                  <label key={product.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors">
                    <input 
                      type={formData.scope === 'product' ? "radio" : "checkbox"} 
                      name="productSelection"
                      checked={formData.productIds?.includes(product.id) || false}
                      onChange={() => handleProductToggle(product.id)}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-sm">{product.name} <span className="text-xs text-muted-foreground ml-2">Rs. {product.price?.toLocaleString()}</span></span>
                  </label>
                ))}
              </div>
            )}
          </div>
          
          {/* SCHEDULE */}
          <div>
            <h2 className="text-lg font-bold mb-4 border-b pb-2">Schedule (Optional)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between pl-1">
                  <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider">Starts At</label>
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, startsAt: ""})}
                    className="text-xs font-bold text-[#FF6A2A] hover:underline"
                  >
                    Publish Now
                  </button>
                </div>
                <input 
                  type="datetime-local" 
                  value={formData.startsAt || ""}
                  onChange={e => setFormData({...formData, startsAt: e.target.value})}
                  className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
                />
                <p className="text-xs text-[#1a1917]/50 pl-1">Leave empty or click "Publish Now" to activate immediately.</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Ends At</label>
                <input 
                  type="datetime-local" 
                  value={formData.endsAt || ""}
                  onChange={e => setFormData({...formData, endsAt: e.target.value})}
                  className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
                />
              </div>
            </div>
          </div>
          
        </div>

        <div className="flex justify-end pb-8">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#FF6A2A] hover:bg-[#e5591c] text-white font-bold py-3 px-8 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-orange-500/20"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isNew ? "Create Discount" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
