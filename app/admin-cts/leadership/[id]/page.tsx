"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, UploadCloud, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { getPublicUploadUrl } from "@/lib/utils";

export default function LeadershipEditor() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    image: "",
    description1: "",
    description2: "",
    feature1Title: "",
    feature2Title: "",
    order: 0
  });

  useEffect(() => {
    if (isNew) return;
    
    async function fetchMember() {
      try {
        const docRef = doc(db, "leadership", params.id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData({ ...formData, ...docSnap.data() } as any);
        } else {
          toast.error("Member not found");
          router.push("/admin-cts/leadership");
        }
      } catch (error) {
        console.error("Error fetching member:", error);
        toast.error("Failed to load member");
      } finally {
        setLoading(false);
      }
    }
    fetchMember();
  }, [params.id, isNew, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    
    try {
      const file = e.target.files[0];
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "gallery"); // re-using gallery folder for general images

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }
      const responseData = await res.json();
      
      setFormData(prev => ({ ...prev, image: responseData.url }));
      toast.success("Image uploaded");
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
        order: Number(formData.order),
        updatedAt: serverTimestamp()
      };

      if (isNew) {
        await addDoc(collection(db, "leadership"), {
          ...dataToSave,
          createdAt: serverTimestamp()
        });
        toast.success("Member created successfully");
      } else {
        await setDoc(doc(db, "leadership", params.id as string), dataToSave, { merge: true });
        toast.success("Member updated successfully");
      }
      router.push("/admin-cts/leadership");
    } catch (error) {
      console.error("Error saving member:", error);
      toast.error("Failed to save member");
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
          href="/admin-cts/leadership"
          className="p-2 bg-[#1a1917]/5 hover:bg-[#1a1917]/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1a1917]">{isNew ? "Add Leadership Member" : "Edit Member"}</h1>
          <p className="text-[#1a1917]/50 text-sm mt-1">{isNew ? "Add a new member to your leadership section" : "Update existing member details"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-[#1a1917]/5 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Full Name</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Role & Title</label>
              <input 
                type="text" 
                required
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
                className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Order (Sort index)</label>
              <input 
                type="number" 
                required
                value={formData.order}
                onChange={e => setFormData({...formData, order: Number(e.target.value)})}
                className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">First Paragraph Description</label>
            <textarea 
              value={formData.description1}
              onChange={e => setFormData({...formData, description1: e.target.value})}
              className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors h-24 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Second Paragraph Description (Optional)</label>
            <textarea 
              value={formData.description2}
              onChange={e => setFormData({...formData, description2: e.target.value})}
              className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors h-24 resize-none"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Feature 1 Title</label>
              <input 
                type="text" 
                value={formData.feature1Title}
                onChange={e => setFormData({...formData, feature1Title: e.target.value})}
                className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
                placeholder="e.g. Uncompromising Quality"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Feature 2 Title</label>
              <input 
                type="text" 
                value={formData.feature2Title}
                onChange={e => setFormData({...formData, feature2Title: e.target.value})}
                className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
                placeholder="e.g. Consultative Approach"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Profile Image</label>
            <div className="flex gap-4 items-center">
              {formData.image ? (
                <div className="relative w-32 h-40 rounded-xl overflow-hidden border border-[#1a1917]/10 group">
                  <Image src={getPublicUploadUrl(formData.image)} alt="Profile" fill className="object-cover" />
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, image: ""})}
                    className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 rounded-full p-1 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <label className="w-32 h-40 rounded-xl border-2 border-dashed border-[#1a1917]/20 flex flex-col items-center justify-center cursor-pointer hover:border-[#FF6A2A] hover:bg-[#FF6A2A]/5 transition-colors">
                  {uploading ? <Loader2 className="w-6 h-6 animate-spin text-[#FF6A2A]" /> : <UploadCloud className="w-6 h-6 text-[#1a1917]/50" />}
                  <span className="text-[10px] text-[#1a1917]/50 mt-2 uppercase font-bold text-center px-2">Upload Photo</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                </label>
              )}
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
            {isNew ? "Create Member" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
