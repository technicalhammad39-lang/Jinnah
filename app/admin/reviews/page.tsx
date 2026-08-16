"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Plus, Edit, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getPublicUploadUrl } from "@/lib/utils";

export default function ReviewsAdmin() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ id: "", name: "", text: "", rating: 5, image: "", active: true, order: 0 });

  useEffect(() => {
    if (!authLoading && !user) router.push("/admin/login");
  }, [user, authLoading, router]);

  const fetchReviews = async () => {
    try {
      const snap = await getDocs(collection(db, "reviews"));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => a.order - b.order);
      setReviews(data);
    } catch (error) {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchReviews();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editForm.id) {
        await updateDoc(doc(db, "reviews", editForm.id), {
          name: editForm.name,
          text: editForm.text,
          rating: Number(editForm.rating),
          image: editForm.image,
          active: editForm.active,
          order: Number(editForm.order)
        });
        toast.success("Review updated successfully");
      } else {
        await addDoc(collection(db, "reviews"), {
          name: editForm.name,
          text: editForm.text,
          rating: Number(editForm.rating),
          image: editForm.image,
          active: editForm.active,
          order: Number(editForm.order)
        });
        toast.success("Review created successfully");
      }
      setIsEditing(false);
      fetchReviews();
    } catch (error) {
      toast.error("Failed to save review");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await deleteDoc(doc(db, "reviews", id));
      toast.success("Review deleted successfully");
      fetchReviews();
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "reviews", id), { active: !currentStatus });
      toast.success(currentStatus ? "Review deactivated" : "Review activated");
      fetchReviews();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (authLoading || loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-[#FF6A2A]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Customer Reviews</h1>
          <p className="text-sm text-muted-foreground">Manage testimonials shown on the homepage</p>
        </div>
        <button 
          onClick={() => { setEditForm({ id: "", name: "", text: "", rating: 5, image: "", active: true, order: reviews.length }); setIsEditing(true); }}
          className="bg-[#FF6A2A] hover:bg-[#e5591c] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Add Review
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-black/5 shadow-sm space-y-4 max-w-xl">
          <h2 className="text-lg font-bold">{editForm.id ? "Edit Review" : "New Review"}</h2>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase">Customer Name</label>
            <input required type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full mt-1 border rounded-lg p-2" />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase">Review Text</label>
            <textarea required rows={4} value={editForm.text} onChange={e => setEditForm({...editForm, text: e.target.value})} className="w-full mt-1 border rounded-lg p-2 resize-none" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Rating (1-5)</label>
              <input required type="number" min="1" max="5" value={editForm.rating} onChange={e => setEditForm({...editForm, rating: Number(e.target.value)})} className="w-full mt-1 border rounded-lg p-2" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Order Priority</label>
              <input required type="number" value={editForm.order} onChange={e => setEditForm({...editForm, order: Number(e.target.value)})} className="w-full mt-1 border rounded-lg p-2" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase">Image/Avatar URL (Optional)</label>
            <input type="text" value={editForm.image} onChange={e => setEditForm({...editForm, image: e.target.value})} className="w-full mt-1 border rounded-lg p-2" placeholder="/uploads/avatar.jpg" />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input type="checkbox" checked={editForm.active} onChange={e => setEditForm({...editForm, active: e.target.checked})} className="w-4 h-4 accent-primary" />
            <span className="text-sm font-bold">Active (Visible on homepage)</span>
          </div>
          <div className="flex gap-2 pt-4">
            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded-lg font-bold text-sm">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-[#FF6A2A] hover:bg-[#e5591c] text-white rounded-lg font-bold text-sm">Save Review</button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-xl border border-black/5 overflow-hidden shadow-xl">
          <table className="w-full text-left">
            <thead className="bg-black/5 border-b border-black/5">
              <tr>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Customer</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Review</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Rating</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Order</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(review => (
                <tr key={review.id} className="border-b border-black/5 last:border-0 hover:bg-black/[0.02]">
                  <td className="p-4 font-bold flex items-center gap-3">
                    {review.image && (
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                        <Image src={getPublicUploadUrl(review.image)} alt={review.name} width={32} height={32} className="object-cover w-full h-full" />
                      </div>
                    )}
                    {review.name}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground max-w-xs truncate">{review.text}</td>
                  <td className="p-4 text-sm font-mono text-[#FFB800]">★ {review.rating}</td>
                  <td className="p-4 text-sm font-mono">{review.order}</td>
                  <td className="p-4">
                    <button onClick={() => toggleActive(review.id, review.active)} className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${review.active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {review.active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {review.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    <button onClick={() => { setEditForm(review); setIsEditing(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(review.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No reviews found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
