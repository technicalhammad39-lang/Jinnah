"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc, orderBy, query, serverTimestamp, addDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Plus, Search, Edit2, Trash2, Loader2, Image as ImageIcon, X, UploadCloud } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function AdminBrands() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    brandName: "",
    logo: "",
    description: "",
    website: "",
    featured: false,
  });

  const fetchBrands = async () => {
    try {
      const q = query(collection(db, "brands"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBrands(data);
    } catch (error) {
      console.error("Error fetching brands:", error);
      toast.error("Failed to load brands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteDoc(doc(db, "brands", id));
        toast.success("Brand deleted successfully");
        setBrands(brands.filter(b => b.id !== id));
      } catch (error) {
        console.error("Error deleting brand:", error);
        toast.error("Failed to delete brand");
      }
    }
  };

  const handleEdit = (brand: any) => {
    setFormData({
      brandName: brand.brandName || "",
      logo: brand.logo || "",
      description: brand.description || "",
      website: brand.website || "",
      featured: brand.featured || false,
    });
    setEditingId(brand.id);
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setFormData({
      brandName: "",
      logo: "",
      description: "",
      website: "",
      featured: false,
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    
    try {
      const file = e.target.files[0];
      const storageRef = ref(storage, `brands/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, logo: url }));
      toast.success("Logo uploaded");
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        await setDoc(doc(db, "brands", editingId), {
          ...formData,
          updatedAt: serverTimestamp()
        }, { merge: true });
        toast.success("Brand updated successfully");
      } else {
        await addDoc(collection(db, "brands"), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        toast.success("Brand created successfully");
      }
      setIsModalOpen(false);
      fetchBrands();
    } catch (error) {
      console.error("Error saving brand:", error);
      toast.error("Failed to save brand");
    } finally {
      setSaving(false);
    }
  };

  const filteredBrands = brands.filter(b => 
    b.brandName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1917]">Brands</h1>
          <p className="text-[#1a1917]/50 text-sm mt-1">Manage your partner brands</p>
        </div>
        <button 
          onClick={openNewModal}
          className="bg-[#FF6A2A] hover:bg-[#e5591c] text-white font-bold py-2.5 px-5 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Brand
        </button>
      </div>

      <div className="bg-white border border-[#1a1917]/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#1a1917]/5 bg-white">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1a1917]/30" />
            <input 
              type="text"
              placeholder="Search brands..."
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
                <th className="px-6 py-4 font-semibold">Brand</th>
                <th className="px-6 py-4 font-semibold">Description</th>
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
              ) : filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[#1a1917]/40">
                    No brands found.
                  </td>
                </tr>
              ) : (
                filteredBrands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#1a1917]/5 border border-[#1a1917]/10 flex items-center justify-center shrink-0 p-2">
                          {brand.logo ? (
                            <Image src={brand.logo} alt={brand.brandName} fill className="object-contain p-2" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-[#1a1917]/20" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-[#1a1917]">{brand.brandName}</div>
                          {brand.website && (
                            <a href={brand.website} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">Website</a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="line-clamp-2 max-w-xs">{brand.description || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {brand.featured ? (
                        <span className="bg-[#FF6A2A]/10 text-[#FF6A2A] px-2.5 py-1 rounded-full text-xs font-semibold">Featured</span>
                      ) : (
                        <span className="bg-[#1a1917]/5 text-[#1a1917]/50 px-2.5 py-1 rounded-full text-xs font-semibold">Standard</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(brand)}
                          className="p-2 text-[#1a1917]/40 hover:text-[#1a1917] hover:bg-[#1a1917]/5 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(brand.id, brand.brandName)}
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

      {/* Brand Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#1a1917]/5 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white border-b border-[#1a1917]/5 p-6 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-[#1a1917]">{editingId ? "Edit Brand" : "Create Brand"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#1a1917]/5 rounded-full transition-colors text-[#1a1917]/50 hover:text-[#1a1917]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Brand Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.brandName}
                  onChange={e => setFormData({...formData, brandName: e.target.value})}
                  className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Brand Logo</label>
                <div className="flex gap-4 items-center">
                  {formData.logo ? (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-[#1a1917]/10 bg-white group">
                      <Image src={formData.logo} alt="Logo" fill className="object-contain p-2" />
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, logo: ""})}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-6 h-6 text-red-400" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-24 h-24 rounded-xl border-2 border-dashed border-[#1a1917]/20 flex flex-col items-center justify-center cursor-pointer hover:border-[#FF6A2A] hover:bg-[#FF6A2A]/5 transition-colors">
                      {uploading ? <Loader2 className="w-6 h-6 animate-spin text-[#FF6A2A]" /> : <UploadCloud className="w-6 h-6 text-[#1a1917]/50" />}
                      <span className="text-[10px] text-[#1a1917]/50 mt-1 uppercase font-bold">Upload</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors h-24 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Website URL (Optional)</label>
                <input 
                  type="url" 
                  value={formData.website}
                  onChange={e => setFormData({...formData, website: e.target.value})}
                  className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
                />
              </div>

              <div className="border-t border-[#1a1917]/5 pt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.featured}
                    onChange={e => setFormData({...formData, featured: e.target.checked})}
                    className="w-5 h-5 rounded border-[#1a1917]/10 bg-white text-[#FF6A2A] focus:ring-[#FF6A2A] focus:ring-offset-[#1a1917]"
                  />
                  <span className="text-sm font-medium text-[#1a1917]/80">Featured Brand</span>
                </label>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl font-bold text-[#1a1917]/70 hover:bg-[#1a1917]/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="bg-[#FF6A2A] hover:bg-[#e5591c] text-white font-bold py-3 px-8 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {editingId ? "Save Changes" : "Create Brand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
