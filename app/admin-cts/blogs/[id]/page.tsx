"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, UploadCloud, X, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { getPublicUploadUrl } from "@/lib/utils";

export default function BlogEditor() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "",
    excerpt: "",
    content: "",
    coverImage: "",
    published: false,
    author: "Jinnah Hardware",
    seoDescription: ""
  });

  useEffect(() => {
    if (isNew) return;
    
    async function fetchBlog() {
      try {
        const docRef = doc(db, "blogs", params.id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData({ ...formData, ...docSnap.data() } as any);
        } else {
          toast.error("Blog post not found");
          router.push("/admin-cts/blogs");
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
        toast.error("Failed to load blog post");
      } finally {
        setLoading(false);
      }
    }
    fetchBlog();
  }, [params.id, isNew, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "blogs");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed");
      }
      const data = await res.json();
      
      setFormData(prev => ({ ...prev, coverImage: data.url }));
      toast.success("Cover image uploaded");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const dataToSave = {
        ...formData,
        updatedAt: serverTimestamp()
      };

      if (isNew) {
        await addDoc(collection(db, "blogs"), {
          ...dataToSave,
          createdAt: serverTimestamp()
        });
        toast.success("Blog post created successfully");
      } else {
        await setDoc(doc(db, "blogs", params.id as string), dataToSave, { merge: true });
        toast.success("Blog post updated successfully");
      }
      router.push("/admin-cts/blogs");
    } catch (error) {
      console.error("Error saving blog:", error);
      toast.error("Failed to save blog post");
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
    <div className="max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin-cts/blogs"
          className="p-2 bg-[#1a1917]/5 hover:bg-[#1a1917]/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1a1917]">{isNew ? "Write Blog Post" : "Edit Blog Post"}</h1>
          <p className="text-[#1a1917]/50 text-sm mt-1">{isNew ? "Publish a new article to your blog" : "Update existing article details"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-[#1a1917]/5 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Article Title</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors font-bold text-lg"
                  placeholder="Enter a compelling title..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Article Content (Markdown / HTML)</label>
                <textarea 
                  required
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors min-h-[400px] font-mono text-sm"
                  placeholder="Write your article content here..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Excerpt (Short Summary)</label>
                <textarea 
                  required
                  value={formData.excerpt}
                  onChange={e => setFormData({...formData, excerpt: e.target.value})}
                  className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors h-24 resize-none"
                  placeholder="A brief summary for the blog listing page..."
                />
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            <div className="bg-white border border-[#1a1917]/5 rounded-2xl p-6 shadow-xl space-y-6">
              <h3 className="font-bold text-[#1a1917] border-b border-[#1a1917]/5 pb-2">Publish Settings</h3>
              
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={formData.published}
                    onChange={e => setFormData({...formData, published: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-[#1a1917]/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6A2A]"></div>
                  <span className="ml-3 text-sm font-medium text-[#1a1917]">Publish Article</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={saving || uploading}
                className="w-full bg-[#FF6A2A] hover:bg-[#e5591c] text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {isNew ? "Create Post" : "Save Changes"}
              </button>
            </div>

            <div className="bg-white border border-[#1a1917]/5 rounded-2xl p-6 shadow-xl space-y-6">
              <h3 className="font-bold text-[#1a1917] border-b border-[#1a1917]/5 pb-2">Meta Details</h3>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">URL Slug</label>
                <input 
                  type="text" 
                  required
                  value={formData.slug}
                  onChange={e => setFormData({...formData, slug: e.target.value})}
                  className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-2 px-3 text-[#1a1917] text-sm focus:outline-none focus:border-[#FF6A2A] transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Category</label>
                <input 
                  type="text" 
                  required
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-2 px-3 text-[#1a1917] text-sm focus:outline-none focus:border-[#FF6A2A] transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">SEO Description</label>
                <textarea 
                  value={formData.seoDescription}
                  onChange={e => setFormData({...formData, seoDescription: e.target.value})}
                  className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-2 px-3 text-[#1a1917] text-sm focus:outline-none focus:border-[#FF6A2A] transition-colors h-20 resize-none"
                />
              </div>
            </div>

            <div className="bg-white border border-[#1a1917]/5 rounded-2xl p-6 shadow-xl space-y-6">
              <h3 className="font-bold text-[#1a1917] border-b border-[#1a1917]/5 pb-2">Cover Image</h3>
              
              <div className="space-y-4">
                {formData.coverImage ? (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[#1a1917]/10 group">
                    <Image src={getPublicUploadUrl(formData.coverImage)} alt="Cover" fill className="object-cover" />
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, coverImage: ""})}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-8 h-8 text-red-400" />
                    </button>
                  </div>
                ) : (
                  <label className="w-full aspect-video rounded-xl border-2 border-dashed border-[#1a1917]/20 flex flex-col items-center justify-center cursor-pointer hover:border-[#FF6A2A] hover:bg-[#FF6A2A]/5 transition-colors">
                    {uploading ? <Loader2 className="w-8 h-8 animate-spin text-[#FF6A2A]" /> : <UploadCloud className="w-8 h-8 text-[#1a1917]/50" />}
                    <span className="text-xs text-[#1a1917]/50 mt-2 uppercase font-bold">Upload Cover</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
