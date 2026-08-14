"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc, orderBy, query, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus, Trash2, Loader2, UploadCloud } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function AdminGallery() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchImages = async () => {
    try {
      const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setImages(data);
    } catch (error) {
      console.error("Error fetching gallery:", error);
      toast.error("Failed to load gallery images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "gallery");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed");
      }
      const data = await res.json();
      
      const docRef = await addDoc(collection(db, "gallery"), {
        url: data.url,
        path: data.url, // Path not needed for local storage directly, but keep for compatibility
        createdAt: serverTimestamp()
      });

      toast.success("Image uploaded to gallery");
      
      // Optimistic update
      setImages([{ id: docRef.id, url: data.url, path: data.url, createdAt: new Date() }, ...images]);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleDelete = async (id: string, path: string) => {
    if (confirm("Are you sure you want to delete this image?")) {
      try {
        // Delete from local storage API
        if (path && path.startsWith("/")) {
          await fetch("/api/upload", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: path })
          }).catch(console.error); // Ignore if failed
        }
        
        // Delete from Firestore
        await deleteDoc(doc(db, "gallery", id));
        
        toast.success("Image deleted successfully");
        setImages(images.filter(img => img.id !== id));
      } catch (error) {
        console.error("Error deleting image:", error);
        toast.error("Failed to delete image");
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1917]">Gallery</h1>
          <p className="text-[#1a1917]/50 text-sm mt-1">Manage images shown in your site's portfolio</p>
        </div>
        <div>
          <input 
            type="file" 
            id="gallery-upload"
            className="hidden" 
            accept="image/*" 
            onChange={handleUpload} 
            disabled={uploading} 
          />
          <label 
            htmlFor="gallery-upload"
            className="bg-[#FF6A2A] hover:bg-[#e5591c] text-white font-bold py-2.5 px-5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {uploading ? "Uploading..." : "Upload Image"}
          </label>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-2xl border border-[#1a1917]/5">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF6A2A]" />
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-[#1a1917]/5 text-[#1a1917]/40">
          <UploadCloud className="w-12 h-12 mb-4 opacity-50" />
          <p>No images in gallery yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-[#1a1917]/5 group shadow-xl">
              <Image 
                src={image.url} 
                alt="Gallery Item" 
                fill 
                className="object-cover group-hover:scale-110 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  onClick={() => handleDelete(image.id, image.path)}
                  className="bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-[#1a1917] p-3 rounded-full transition-colors backdrop-blur-sm"
                  title="Delete Image"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
