"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, UploadCloud, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

export default function ProductEditor() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "",
    brand: "",
    description: "",
    shortDescription: "",
    price: 0,
    discountPrice: 0,
    currency: "PKR",
    images: [] as string[],
    featured: false,
    bestSeller: false,
    availability: "in-stock"
  });

  useEffect(() => {
    if (isNew) return;
    
    async function fetchProduct() {
      try {
        const docRef = doc(db, "products", params.id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData({ ...formData, ...docSnap.data() } as any);
        } else {
          toast.error("Product not found");
          router.push("/admin/products");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [params.id, isNew, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    
    try {
      const file = e.target.files[0];
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const dataToSave = {
        ...formData,
        price: Number(formData.price),
        discountPrice: Number(formData.discountPrice),
        updatedAt: serverTimestamp()
      };

      if (isNew) {
        await addDoc(collection(db, "products"), {
          ...dataToSave,
          createdAt: serverTimestamp()
        });
        toast.success("Product created successfully");
      } else {
        await setDoc(doc(db, "products", params.id as string), dataToSave, { merge: true });
        toast.success("Product updated successfully");
      }
      router.push("/admin/products");
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
    <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/products"
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
        <div className="bg-white border border-[#1a1917]/5 rounded-2xl p-6 shadow-xl space-y-6">
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
              <input 
                type="text" 
                required
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
              />
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
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Price</label>
              <input 
                type="number" 
                required
                value={formData.price}
                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Discount Price (0 for none)</label>
              <input 
                type="number" 
                value={formData.discountPrice}
                onChange={e => setFormData({...formData, discountPrice: Number(e.target.value)})}
                className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
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

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Product Images</label>
            <div className="flex gap-4 flex-wrap">
              {formData.images.map((img, i) => (
                <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-[#1a1917]/10 group">
                  <Image src={img} alt={`Image ${i}`} fill className="object-cover" />
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
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[#1a1917]/80">Availability:</span>
              <select 
                value={formData.availability}
                onChange={e => setFormData({...formData, availability: e.target.value})}
                className="bg-white border border-[#1a1917]/10 rounded-lg py-1.5 px-3 text-[#1a1917] text-sm focus:outline-none focus:border-[#FF6A2A]"
              >
                <option value="in-stock">In Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
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
