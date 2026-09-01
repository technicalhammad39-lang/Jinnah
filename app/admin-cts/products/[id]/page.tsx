"use client";

import { useState, useEffect, use } from "react";
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, UploadCloud, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { getPublicUploadUrl } from "@/lib/utils";

export default function ProductEditor({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [categories, setCategories] = useState<{id: string; name: string; slug: string}[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "",
    categoryId: "",
    categorySlug: "",
    brand: "",
    description: "",
    shortDescription: "",
    price: 0,
    currency: "PKR",
    images: [] as string[],
    featured: false,
    bestSeller: false,
    stockQuantity: 10,
    dimensions: "",
    weight: "",
    shippingClass: "",
    shippingType: "default",
    shippingFee: 0,
    deliveryEstimate: "",
    shippingNote: "",
    features: "",
    allowedPaymentMethods: ["ALL"]
  });

  useEffect(() => {
    // Fetch payment methods and categories
    async function fetchInitialData() {
      try {
        const [pmSnap, catSnap] = await Promise.all([
          getDocs(query(collection(db, "payment-methods"), orderBy("order", "asc"))),
          getDocs(query(collection(db, "categories"), orderBy("name", "asc")))
        ]);
        setPaymentMethods(pmSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setCategories(catSnap.docs.map(d => ({ id: d.id, name: (d.data() as any).name || '', slug: (d.data() as any).slug || '' })));
      } catch (err) {
        console.error("Error fetching initial data", err);
      }
    }
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (isNew) return;
    
    async function fetchProduct() {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            ...formData,
            ...data,
            price: data.price || 0,
            stockQuantity: data.stockQuantity !== undefined ? data.stockQuantity : (data.availability === "in-stock" ? 50 : 0),
            features: Array.isArray(data.features) ? data.features.join("\n") : (data.features || ""),
            allowedPaymentMethods: data.allowedPaymentMethods || ["ALL"]
          } as any);
        } else {
          toast.error("Product not found");
          router.push("/admin-cts/products");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id, isNew, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    
    try {
      const file = e.target.files[0];
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("folder", "products");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed");
      }
      const data = await res.json();
      
      setFormData(prev => ({ ...prev, images: [...prev.images, data.url] }));
      toast.success("Image uploaded");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handlePaymentMethodToggle = (methodId: string) => {
    setFormData(prev => {
      let current = [...prev.allowedPaymentMethods];
      
      if (methodId === "ALL") {
        if (!current.includes("ALL")) return { ...prev, allowedPaymentMethods: ["ALL"] };
        return prev;
      }
      
      // If ALL was selected, clear it and select this one
      if (current.includes("ALL")) {
        return { ...prev, allowedPaymentMethods: [methodId] };
      }
      
      if (current.includes(methodId)) {
        current = current.filter(id => id !== methodId);
        // If empty, revert to ALL
        if (current.length === 0) current = ["ALL"];
      } else {
        current.push(methodId);
      }
      
      return { ...prev, allowedPaymentMethods: current };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const featuresArray = formData.features.split("\n").filter(f => f.trim() !== "");
      
      const dataToSave = {
        ...formData,
        price: Number(formData.price),
        stockQuantity: Number(formData.stockQuantity),
        shippingFee: Number(formData.shippingFee),
        features: featuresArray,
        updatedAt: serverTimestamp()
      };

      if (isNew) {
        await addDoc(collection(db, "products"), {
          ...dataToSave,
          createdAt: serverTimestamp()
        });
        toast.success("Product created successfully");
      } else {
        await setDoc(doc(db, "products", id), dataToSave, { merge: true });
        toast.success("Product updated successfully");
      }
      router.push("/admin-cts/products");
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
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
          href="/admin-cts/products"
          className="p-2 bg-[#1a1917]/5 hover:bg-[#1a1917]/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1a1917]">{isNew ? "Create Product" : "Edit Product"}</h1>
          <p className="text-[#1a1917]/50 text-sm mt-1">{isNew ? "Add a new product to your catalog" : "Update existing product details"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-[#1a1917]/5 rounded-2xl p-6 shadow-xl space-y-8">
          
          {/* BASIC INFO */}
          <div>
            <h2 className="text-lg font-bold mb-4 border-b pb-2">Basic Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Product Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Slug (URL-friendly)</label>
                <input 
                  type="text" 
                  required
                  value={formData.slug}
                  onChange={e => setFormData({...formData, slug: e.target.value})}
                  className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Category</label>
                <select
                  required
                  value={formData.categoryId || formData.category}
                  onChange={e => {
                    const selected = categories.find(c => c.id === e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      categoryId: selected?.id || '',
                      category: selected?.name || '',
                      categorySlug: selected?.slug || ''
                    }));
                  }}
                  className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {formData.category && !formData.categoryId && (
                  <p className="text-xs text-amber-600 pl-1">Current: "{formData.category}" (legacy text). Please re-select.</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Brand</label>
                <input 
                  type="text" 
                  value={formData.brand}
                  onChange={e => setFormData({...formData, brand: e.target.value})}
                  className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* PRICING & INVENTORY */}
          <div>
            <h2 className="text-lg font-bold mb-4 border-b pb-2">Pricing & Inventory</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Base Price (Rs.)</label>
                <input 
                  type="number" 
                  required
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                  className="w-full bg-white border border-emerald-200 focus:border-emerald-500 ring-1 ring-emerald-100 rounded-xl py-3 px-4 text-emerald-800 font-bold focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Stock Quantity</label>
                <input 
                  type="number" 
                  required
                  value={formData.stockQuantity}
                  onChange={e => setFormData({...formData, stockQuantity: Number(e.target.value)})}
                  className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Shipping & Delivery */}
          <div>
            <h2 className="text-lg font-bold mb-4 border-b pb-2 text-[#FF6A2A]">Shipping & Delivery</h2>
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Shipping Type</label>
                  <select
                    value={formData.shippingType}
                    onChange={e => setFormData({...formData, shippingType: e.target.value})}
                    className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
                  >
                    <option value="default">Use Global Default Fee</option>
                    <option value="free">Free Shipping (Rs. 0)</option>
                    <option value="fixed">Fixed Shipping Fee</option>
                  </select>
                </div>
                
                {formData.shippingType === "fixed" && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Shipping Fee (Rs.)</label>
                    <input 
                      type="number" 
                      value={formData.shippingFee}
                      onChange={e => setFormData({...formData, shippingFee: Number(e.target.value)})}
                      className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
                      min="0"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Custom Delivery Estimate (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.deliveryEstimate}
                    onChange={e => setFormData({...formData, deliveryEstimate: e.target.value})}
                    placeholder="e.g. 5-7 working days"
                    className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
                  />
                  <p className="text-[10px] text-gray-500 pl-1">Leave empty to use global default estimate.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Shipping Note (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.shippingNote}
                    onChange={e => setFormData({...formData, shippingNote: e.target.value})}
                    placeholder="e.g. Special rates apply for heavy items."
                    className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* PAYMENT METHODS */}
          <div>
            <h2 className="text-lg font-bold mb-4 border-b pb-2">Allowed Payment Methods</h2>
            <div className="flex flex-wrap gap-4">
              <label className={`cursor-pointer px-4 py-2 rounded-xl border ${formData.allowedPaymentMethods.includes("ALL") ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-black/10'}`}>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={formData.allowedPaymentMethods.includes("ALL")}
                  onChange={() => handlePaymentMethodToggle("ALL")}
                />
                All Methods
              </label>
              {paymentMethods.map(method => (
                <label key={method.id} className={`cursor-pointer px-4 py-2 rounded-xl border ${!formData.allowedPaymentMethods.includes("ALL") && formData.allowedPaymentMethods.includes(method.id) ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-black/10'}`}>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={!formData.allowedPaymentMethods.includes("ALL") && formData.allowedPaymentMethods.includes(method.id)}
                    onChange={() => handlePaymentMethodToggle(method.id)}
                  />
                  {method.title}
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Restrict which payment methods are available during checkout for this specific product (e.g. Bank Transfer only for expensive items).</p>
          </div>

          {/* SPECIFICATIONS & FEATURES */}
          <div>
            <h2 className="text-lg font-bold mb-4 border-b pb-2">Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Dimensions</label>
                <input 
                  type="text" 
                  value={formData.dimensions}
                  onChange={e => setFormData({...formData, dimensions: e.target.value})}
                  className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Weight</label>
                <input 
                  type="text" 
                  value={formData.weight}
                  onChange={e => setFormData({...formData, weight: e.target.value})}
                  className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Shipping Class</label>
                <input 
                  type="text" 
                  value={formData.shippingClass}
                  onChange={e => setFormData({...formData, shippingClass: e.target.value})}
                  className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Features (One per line)</label>
              <textarea 
                value={formData.features}
                onChange={e => setFormData({...formData, features: e.target.value})}
                placeholder="- High strength steel&#10;- Anti-corrosion coating"
                className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors h-24"
              />
            </div>

            <div className="space-y-2 mb-6">
              <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Short Description</label>
              <textarea 
                value={formData.shortDescription}
                onChange={e => setFormData({...formData, shortDescription: e.target.value})}
                className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors h-24 resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Detailed Description</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors h-48"
              />
            </div>
          </div>

          {/* IMAGES */}
          <div>
            <h2 className="text-lg font-bold mb-4 border-b pb-2">Images</h2>
            <div className="flex gap-4 flex-wrap">
              {formData.images.map((img, i) => (
                <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-[#1a1917]/10 group">
                  <Image src={getPublicUploadUrl(img)} alt={`Image ${i}`} fill className="object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 rounded-full p-1 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              <label className="w-24 h-24 rounded-xl border-2 border-dashed border-[#1a1917]/20 flex flex-col items-center justify-center cursor-pointer hover:border-[#FF6A2A] hover:bg-[#FF6A2A]/5 transition-colors">
                {uploading ? <Loader2 className="w-6 h-6 animate-spin text-[#FF6A2A]" /> : <UploadCloud className="w-6 h-6 text-[#1a1917]/50" />}
                <span className="text-[10px] text-[#1a1917]/50 mt-1 uppercase font-bold">Upload</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
          </div>

          <div className="flex gap-8 border-t border-[#1a1917]/5 pt-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.featured}
                onChange={e => setFormData({...formData, featured: e.target.checked})}
                className="w-5 h-5 rounded border-[#1a1917]/10 bg-white text-[#FF6A2A] focus:ring-[#FF6A2A] focus:ring-offset-[#1a1917]"
              />
              <span className="text-sm font-medium text-[#1a1917]/80">Featured Product</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.bestSeller}
                onChange={e => setFormData({...formData, bestSeller: e.target.checked})}
                className="w-5 h-5 rounded border-[#1a1917]/10 bg-white text-[#FF6A2A] focus:ring-[#FF6A2A] focus:ring-offset-[#1a1917]"
              />
              <span className="text-sm font-medium text-[#1a1917]/80">Best Seller</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end pb-8">
          <button
            type="submit"
            disabled={saving || uploading}
            className="bg-[#FF6A2A] hover:bg-[#e5591c] text-white font-bold py-3 px-8 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isNew ? "Create Product" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
