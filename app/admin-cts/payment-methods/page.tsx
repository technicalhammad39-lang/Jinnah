"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Plus, Edit, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function PaymentMethodsAdmin() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ id: "", title: "", description: "", logo: "", active: true, order: 0 });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/admin-cts/login");
  }, [user, authLoading, router]);

  const fetchMethods = async () => {
    try {
      const snap = await getDocs(collection(db, "payment-methods"));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => a.order - b.order);
      setMethods(data);
    } catch (error) {
      toast.error("Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchMethods();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editForm.id) {
        await updateDoc(doc(db, "payment-methods", editForm.id), {
          title: editForm.title,
          description: editForm.description,
          logo: editForm.logo || "",
          active: editForm.active,
          order: Number(editForm.order)
        });
        toast.success("Payment method updated");
      } else {
        await addDoc(collection(db, "payment-methods"), {
          title: editForm.title,
          description: editForm.description,
          logo: editForm.logo || "",
          active: editForm.active,
          order: Number(editForm.order)
        });
        toast.success("Payment method created");
      }
      setIsEditing(false);
      fetchMethods();
    } catch (error) {
      toast.error("Failed to save payment method");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteDoc(doc(db, "payment-methods", id));
      toast.success("Deleted successfully");
      fetchMethods();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "payment-methods", id), { active: !currentStatus });
      toast.success("Status updated");
      fetchMethods();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "payments");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed");
      }
      const data = await res.json();
      
      setEditForm(prev => ({ ...prev, logo: data.url }));
      toast.success("Logo uploaded");
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  if (authLoading || loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-[#FF6A2A]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Payment Methods</h1>
          <p className="text-sm text-muted-foreground">Manage checkout payment options</p>
        </div>
        <button 
          onClick={() => { setEditForm({ id: "", title: "", description: "", logo: "", active: true, order: methods.length }); setIsEditing(true); }}
          className="bg-[#FF6A2A] hover:bg-[#e5591c] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Add Method
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-black/5 shadow-sm space-y-4 max-w-xl">
          <h2 className="text-lg font-bold">{editForm.id ? "Edit Method" : "New Method"}</h2>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase">Title (e.g. Cash on Delivery)</label>
            <input required type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full mt-1 border rounded-lg p-2" />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase">Logo URL / Image</label>
            <div className="flex gap-4 items-center mt-1">
              {editForm.logo ? (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-black/10 bg-white group flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={editForm.logo.startsWith('http') ? editForm.logo : `/uploads/${editForm.logo}`} alt="Logo" className="w-full h-full object-contain p-1" />
                  <button 
                    type="button"
                    onClick={() => setEditForm({...editForm, logo: ""})}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              ) : (
                <label className="w-16 h-16 rounded-xl border-2 border-dashed border-black/20 flex flex-col items-center justify-center cursor-pointer hover:border-[#FF6A2A] transition-colors flex-shrink-0">
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin text-[#FF6A2A]" /> : <div className="text-[10px] text-muted-foreground font-bold uppercase text-center leading-tight">Upload<br/>Logo</div>}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                </label>
              )}
              <input type="text" value={editForm.logo} onChange={e => setEditForm({...editForm, logo: e.target.value})} className="w-full border rounded-lg p-2 text-sm" placeholder="Or paste image URL" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase">Description</label>
            <input required type="text" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full mt-1 border rounded-lg p-2" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Order Priority</label>
              <input required type="number" value={editForm.order} onChange={e => setEditForm({...editForm, order: Number(e.target.value)})} className="w-full mt-1 border rounded-lg p-2" />
            </div>
            <div className="flex-1 flex items-center gap-2 mt-6">
              <input type="checkbox" checked={editForm.active} onChange={e => setEditForm({...editForm, active: e.target.checked})} className="w-4 h-4 accent-primary" />
              <span className="text-sm font-bold">Active at Checkout</span>
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded-lg font-bold text-sm">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-[#FF6A2A] hover:bg-[#e5591c] text-white rounded-lg font-bold text-sm">Save Method</button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-xl border border-black/5 overflow-hidden shadow-xl">
          <table className="w-full text-left">
            <thead className="bg-black/5 border-b border-black/5">
              <tr>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Title</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Order</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {methods.map(method => (
                <tr key={method.id} className="border-b border-black/5 last:border-0 hover:bg-black/[0.02]">
                  <td className="p-4 font-bold flex items-center gap-3">
                    {method.logo && (
                      <div className="w-10 h-10 bg-white border rounded-lg flex items-center justify-center p-1 overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={method.logo.startsWith('http') ? method.logo : `/uploads/${method.logo}`} alt="" className="w-full h-full object-contain" />
                      </div>
                    )}
                    {method.title}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{method.description}</td>
                  <td className="p-4 text-sm font-mono">{method.order}</td>
                  <td className="p-4">
                    <button onClick={() => toggleActive(method.id, method.active)} className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${method.active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {method.active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {method.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    <button onClick={() => { setEditForm(method); setIsEditing(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(method.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {methods.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No payment methods found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
