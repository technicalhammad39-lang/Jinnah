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
  const [editForm, setEditForm] = useState({
    id: "",
    title: "",
    description: "",
    logo: "",
    active: true,
    order: 0,
    accountTitle: "",
    accountNumber: "",
    bankName: "",
    iban: "",
    instructions: "",
    qrCode: "",
    requireProof: false,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);

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
      const payload = {
        title: editForm.title,
        description: editForm.description,
        logo: editForm.logo || "",
        active: editForm.active,
        order: Number(editForm.order) || 0,
        accountTitle: editForm.accountTitle || "",
        accountNumber: editForm.accountNumber || "",
        bankName: editForm.bankName || "",
        iban: editForm.iban || "",
        instructions: editForm.instructions || "",
        qrCode: editForm.qrCode || "",
        requireProof: Boolean(editForm.requireProof),
      };

      if (editForm.id) {
        await updateDoc(doc(db, "payment-methods", editForm.id), payload);
        toast.success("Payment method updated");
      } else {
        await addDoc(collection(db, "payment-methods"), payload);
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

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingQr(true);
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "payments");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setEditForm(prev => ({ ...prev, qrCode: data.url }));
      toast.success("QR Code uploaded");
    } catch (error) {
      console.error("Error uploading QR code:", error);
      toast.error("Failed to upload QR code");
    } finally {
      setUploadingQr(false);
    }
  };

  if (authLoading || loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-[#FF6A2A]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Payment Methods</h1>
          <p className="text-sm text-muted-foreground">Manage checkout payment options, bank details, and proof rules</p>
        </div>
        <button 
          onClick={() => { 
            setEditForm({ 
              id: "", 
              title: "", 
              description: "", 
              logo: "", 
              active: true, 
              order: methods.length,
              accountTitle: "",
              accountNumber: "",
              bankName: "",
              iban: "",
              instructions: "",
              qrCode: "",
              requireProof: false
            }); 
            setIsEditing(true); 
          }}
          className="bg-[#FF6A2A] hover:bg-[#e5591c] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Add Method
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-black/5 shadow-sm space-y-4 max-w-2xl">
          <h2 className="text-lg font-bold">{editForm.id ? "Edit Method" : "New Method"}</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Title (e.g. JazzCash, EasyPaisa, Bank Transfer)</label>
              <input required type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full mt-1 border rounded-lg p-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Bank / Wallet Name</label>
              <input type="text" placeholder="e.g. Meezan Bank, JazzCash, EasyPaisa" value={editForm.bankName} onChange={e => setEditForm({...editForm, bankName: e.target.value})} className="w-full mt-1 border rounded-lg p-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase">Description</label>
            <input required type="text" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full mt-1 border rounded-lg p-2 text-sm" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Account Title</label>
              <input type="text" placeholder="e.g. Muhammad Jinnah / Jinnah Hardware" value={editForm.accountTitle} onChange={e => setEditForm({...editForm, accountTitle: e.target.value})} className="w-full mt-1 border rounded-lg p-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Account / Mobile Number</label>
              <input type="text" placeholder="e.g. 0300 0421772 or Account #" value={editForm.accountNumber} onChange={e => setEditForm({...editForm, accountNumber: e.target.value})} className="w-full mt-1 border rounded-lg p-2 text-sm font-mono" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase">IBAN Number (Optional)</label>
            <input type="text" placeholder="e.g. PK36MEZN0000000000000000" value={editForm.iban} onChange={e => setEditForm({...editForm, iban: e.target.value})} className="w-full mt-1 border rounded-lg p-2 text-sm font-mono" />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase">Payment Instructions / Notes for Customer</label>
            <textarea rows={3} placeholder="e.g. Transfer via JazzCash app and enter Transaction ID + upload screenshot below." value={editForm.instructions} onChange={e => setEditForm({...editForm, instructions: e.target.value})} className="w-full mt-1 border rounded-lg p-2 text-sm resize-none" />
          </div>

          {/* Logo and QR Code uploaders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Method Logo</label>
              <div className="flex gap-3 items-center mt-1">
                {editForm.logo ? (
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-black/10 bg-white group flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={editForm.logo.startsWith('http') ? editForm.logo : `/uploads/${editForm.logo}`} alt="Logo" className="w-full h-full object-contain p-1" />
                    <button 
                      type="button"
                      onClick={() => setEditForm({...editForm, logo: ""})}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ) : (
                  <label className="w-14 h-14 rounded-xl border-2 border-dashed border-black/20 flex flex-col items-center justify-center cursor-pointer hover:border-[#FF6A2A] transition-colors flex-shrink-0">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin text-[#FF6A2A]" /> : <div className="text-[9px] text-muted-foreground font-bold uppercase text-center">Upload<br/>Logo</div>}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                )}
                <input type="text" value={editForm.logo} onChange={e => setEditForm({...editForm, logo: e.target.value})} className="w-full border rounded-lg p-2 text-xs" placeholder="Logo image path" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Payment QR Code (Optional)</label>
              <div className="flex gap-3 items-center mt-1">
                {editForm.qrCode ? (
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-black/10 bg-white group flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={editForm.qrCode.startsWith('http') ? editForm.qrCode : `/uploads/${editForm.qrCode}`} alt="QR" className="w-full h-full object-contain p-1" />
                    <button 
                      type="button"
                      onClick={() => setEditForm({...editForm, qrCode: ""})}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ) : (
                  <label className="w-14 h-14 rounded-xl border-2 border-dashed border-black/20 flex flex-col items-center justify-center cursor-pointer hover:border-[#FF6A2A] transition-colors flex-shrink-0">
                    {uploadingQr ? <Loader2 className="w-4 h-4 animate-spin text-[#FF6A2A]" /> : <div className="text-[9px] text-muted-foreground font-bold uppercase text-center">Upload<br/>QR</div>}
                    <input type="file" className="hidden" accept="image/*" onChange={handleQrUpload} disabled={uploadingQr} />
                  </label>
                )}
                <input type="text" value={editForm.qrCode} onChange={e => setEditForm({...editForm, qrCode: e.target.value})} className="w-full border rounded-lg p-2 text-xs" placeholder="QR Code path" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Display Order</label>
              <input required type="number" value={editForm.order} onChange={e => setEditForm({...editForm, order: Number(e.target.value)})} className="w-full mt-1 border rounded-lg p-2 text-sm" />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" id="activeCheckout" checked={editForm.active} onChange={e => setEditForm({...editForm, active: e.target.checked})} className="w-4 h-4 accent-primary" />
              <label htmlFor="activeCheckout" className="text-xs font-bold cursor-pointer">Active at Checkout</label>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" id="requireProof" checked={editForm.requireProof} onChange={e => setEditForm({...editForm, requireProof: e.target.checked})} className="w-4 h-4 accent-primary" />
              <label htmlFor="requireProof" className="text-xs font-bold cursor-pointer text-amber-700">Require Screenshot & TID</label>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 border rounded-lg font-bold text-sm">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-[#FF6A2A] hover:bg-[#e5591c] text-white rounded-lg font-bold text-sm">Save Payment Method</button>
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
                    <div>
                      <div>{method.title}</div>
                      {method.accountNumber && (
                        <div className="text-xs text-muted-foreground font-mono font-normal">
                          {method.bankName ? `${method.bankName}: ` : ""}{method.accountNumber}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    <div>{method.description}</div>
                    {method.requireProof && (
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        Requires Proof
                      </span>
                    )}
                  </td>
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
