"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, orderBy, query, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { getPublicUploadUrl } from "@/lib/utils";

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchCategories() {
    try {
      const q = query(collection(db, "categories"), orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteDoc(doc(db, "categories", id));
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      await updateDoc(doc(db, "categories", id), { status: newStatus });
      toast.success(`Category ${newStatus === "active" ? "activated" : "deactivated"}`);
      fetchCategories();
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Failed to update status");
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
          <h1 className="text-2xl font-bold text-[#1a1917]">Categories</h1>
          <p className="text-[#1a1917]/50 text-sm mt-1">Manage your product categories</p>
        </div>
        <Link 
          href="/admin-cts/categories/new"
          className="bg-[#FF6A2A] hover:bg-[#e5591c] text-white font-bold py-2.5 px-6 rounded-xl transition-colors inline-flex items-center gap-2 justify-center"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </Link>
      </div>

      <div className="bg-white border border-[#1a1917]/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1a1917]/5 bg-[#1a1917]/[0.02]">
                <th className="p-4 text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider">Image</th>
                <th className="p-4 text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider">Name & Slug</th>
                <th className="p-4 text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider">Description</th>
                <th className="p-4 text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1917]/5">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    No categories found. Add one to get started.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#1a1917]/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/5 relative">
                        {cat.image ? (
                          <Image src={getPublicUploadUrl(cat.image)} alt={cat.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No image</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-[#1a1917]">{cat.name}</div>
                      <div className="text-sm text-primary uppercase font-extrabold tracking-wider">{cat.slug}</div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      <div className="max-w-xs truncate">{cat.description}</div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(cat.id, cat.status || "active")}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                          (cat.status || "active") === "active"
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          (cat.status || "active") === "active" ? "bg-emerald-500" : "bg-gray-400"
                        }`} />
                        {(cat.status || "active") === "active" ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin-cts/categories/${cat.id}`}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(cat.id)}
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
