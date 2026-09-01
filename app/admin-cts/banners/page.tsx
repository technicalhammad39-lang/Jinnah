"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc, orderBy, query, serverTimestamp, addDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus, Search, Edit2, Trash2, Loader2, Image as ImageIcon, X, UploadCloud } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { getPublicUploadUrl } from "@/lib/utils";

export default function AdminBanners() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
    pageKey: "shop_bottom",
    active: true,
  });

  const PAGE_OPTIONS = [
    { value: "shop_bottom", label: "Shop Page - Bottom" },
    { value: "home_top", label: "Home Page - Top" },
    { value: "home_bottom", label: "Home Page - Bottom" },
    { value: "category_bottom", label: "Category Page - Bottom" },
  ];

  const fetchBanners = async () => {
    try {
      const q = query(collection(db, "banners"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBanners(data);
    } catch (error) {
      console.error("Error fetching banners:", error);
      toast.error("Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete ${title}?`)) {
      try {
        await deleteDoc(doc(db, "banners", id));
        toast.success("Banner deleted successfully");
        setBanners(banners.filter(b => b.id !== id));
      } catch (error) {
        console.error("Error deleting banner:", error);
        toast.error("Failed to delete banner");
      }
    }
  };

  const handleEdit = (banner: any) => {
    setFormData({
      title: banner.title || "",
      imageUrl: banner.imageUrl || "",
      pageKey: banner.pageKey || "shop_bottom",
      active: banner.active ?? true,
    });
    setEditingId(banner.id);
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setFormData({
      title: "",
      imageUrl: "",
      pageKey: "shop_bottom",
      active: true,
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "banners");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed");
      }
      const data = await res.json();
      
      setFormData(prev => ({ ...prev, imageUrl: data.url }));
      toast.success("Banner image uploaded");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      toast.error("Please upload an image");
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        await setDoc(doc(db, "banners", editingId), {
          ...formData,
          updatedAt: serverTimestamp()
        }, { merge: true });
        toast.success("Banner updated successfully");
      } else {
        await addDoc(collection(db, "banners"), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        toast.success("Banner created successfully");
      }
      setIsModalOpen(false);
      fetchBanners();
    } catch (error) {
      console.error("Error saving banner:", error);
      toast.error("Failed to save banner");
    } finally {
      setSaving(false);
    }
  };

  const filteredBanners = banners.filter(b => 
    b.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1917]">Banners</h1>
          <p className="text-[#1a1917]/50 text-sm mt-1">Manage promotional banners across the site</p>
        </div>
        <button 
          onClick={openNewModal}
          className="bg-[#FF6A2A] hover:bg-[#e5591c] text-white font-bold py-2.5 px-5 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Banner
        </button>
      </div>

      <div className="bg-white border border-[#1a1917]/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#1a1917]/5 bg-white">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1a1917]/30" />
            <input 
              type="text"
              placeholder="Search banners..."
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
                <th className="px-6 py-4 font-semibold">Banner</th>
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1917]/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#FF6A2A]" />
                  </td>
                </tr>
              ) : filteredBanners.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[#1a1917]/40">
                    No banners found.
                  </td>
                </tr>
              ) : (
                filteredBanners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-32 h-12 rounded-lg overflow-hidden bg-[#1a1917]/5 border border-[#1a1917]/10 flex items-center justify-center shrink-0">
                          {banner.imageUrl ? (
                            <Image src={getPublicUploadUrl(banner.imageUrl)} alt={banner.title} fill className="object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-[#1a1917]/20" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-[#1a1917]">{banner.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {PAGE_OPTIONS.find(o => o.value === banner.pageKey)?.label || banner.pageKey}
                    </td>
                    <td className="px-6 py-4">
                      {banner.active ? (
                         <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold">Active</span>
                      ) : (
                         <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(banner)}
                          className="p-2 text-[#1a1917]/40 hover:text-[#1a1917] hover:bg-[#1a1917]/5 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(banner.id, banner.title)}
                          className="p-2 text-[#1a1917]/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-[#1a1917]/5">
              <h2 className="text-xl font-bold text-[#1a1917]">{editingId ? 'Edit Banner' : 'Add Banner'}</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-[#1a1917]/40 hover:text-[#1a1917] hover:bg-[#1a1917]/5 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-[#1a1917] mb-2">Title (Internal Name)</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-white border border-[#1a1917]/10 rounded-xl px-4 py-3 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
                  placeholder="e.g. Summer Sale 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1a1917] mb-2">Banner Location</label>
                <select 
                  value={formData.pageKey}
                  onChange={(e) => setFormData(prev => ({ ...prev, pageKey: e.target.value }))}
                  className="w-full bg-white border border-[#1a1917]/10 rounded-xl px-4 py-3 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors appearance-none"
                >
                  {PAGE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#1a1917] mb-2">Banner Image</label>
                <div className="border-2 border-dashed border-[#1a1917]/10 rounded-xl p-6 text-center hover:bg-[#1a1917]/[0.02] transition-colors relative overflow-hidden group">
                  {formData.imageUrl ? (
                    <div className="relative w-full aspect-[4/1]">
                      <Image src={getPublicUploadUrl(formData.imageUrl)} alt="Preview" fill className="object-cover rounded-lg" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                        <span className="text-white font-medium text-sm">Change Image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4">
                      <UploadCloud className="w-8 h-8 text-[#1a1917]/20 mx-auto mb-2" />
                      <p className="text-sm font-medium text-[#1a1917]/60">Click to upload landscape image</p>
                      <p className="text-xs text-[#1a1917]/40 mt-1">Recommended: 1920x400px (JPG/PNG)</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-[#FF6A2A]" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={formData.active}
                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  />
                  <div className="w-11 h-6 bg-[#1a1917]/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6A2A]"></div>
                </label>
                <span className="text-sm font-bold text-[#1a1917]">Active (Show on website)</span>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 text-[#1a1917]/60 font-bold hover:bg-[#1a1917]/5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-1 bg-[#FF6A2A] hover:bg-[#e5591c] text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Saving...' : 'Save Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
