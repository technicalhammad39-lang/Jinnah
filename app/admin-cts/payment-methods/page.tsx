"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Plus, Edit, Trash2, CheckCircle2, XCircle, Banknote, Building2, Smartphone, QrCode, Upload } from "lucide-react";
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
    type: "bank" as "bank" | "wallet" | "cod" | "other",
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
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
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

  const handleTypeChange = (newType: "bank" | "wallet" | "cod" | "other") => {
    if (newType === "cod") {
      setEditForm(prev => ({
        ...prev,
        type: "cod",
        title: prev.title || "Cash on Delivery (COD)",
        description: prev.description || "Pay with cash upon delivery of your parcel.",
        instructions: prev.instructions || "Please have the exact amount in cash ready for the courier delivery rider.",
        bankName: "",
        accountTitle: "",
        accountNumber: "",
        iban: "",
        qrCode: "",
        requireProof: false
      }));
    } else if (newType === "wallet") {
      setEditForm(prev => ({
        ...prev,
        type: "wallet",
        title: prev.title === "Cash on Delivery (COD)" ? "JazzCash / EasyPaisa" : prev.title,
        description: prev.description || "Send payment via mobile wallet app and attach receipt screenshot.",
        instructions: prev.instructions || "Transfer funds to our account number and attach the payment screenshot below to verify your order.",
        requireProof: true
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        type: newType,
        title: prev.title === "Cash on Delivery (COD)" ? "" : prev.title,
        description: prev.description || "Direct transfer to our official bank account.",
        instructions: prev.instructions || "Transfer amount to our bank account and attach transaction screenshot below.",
        requireProof: true
      }));
    }
  };

  const handleCreateDefaultCod = async () => {
    try {
      const existingCod = methods.find(m => m.type === "cod" || m.id === "cod" || m.title?.toLowerCase().includes("cash on delivery"));
      if (existingCod) {
        toast.info("Cash on Delivery already exists! You can enable or edit it.");
        return;
      }

      await addDoc(collection(db, "payment-methods"), {
        type: "cod",
        title: "Cash on Delivery (COD)",
        description: "Pay with cash upon doorstep delivery.",
        instructions: "Please keep exact cash ready upon delivery.",
        logo: "",
        active: true,
        order: methods.length,
        accountTitle: "",
        accountNumber: "",
        bankName: "",
        iban: "",
        qrCode: "",
        requireProof: false
      });
      toast.success("Cash on Delivery (COD) enabled!");
      fetchMethods();
    } catch (err) {
      toast.error("Failed to add COD method");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        type: editForm.type || "bank",
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        logo: editForm.logo || "",
        active: editForm.active,
        order: Number(editForm.order) || 0,
        accountTitle: editForm.type === "cod" ? "" : (editForm.accountTitle || "").trim(),
        accountNumber: editForm.type === "cod" ? "" : (editForm.accountNumber || "").trim(),
        bankName: editForm.type === "cod" ? "" : (editForm.bankName || "").trim(),
        iban: editForm.type === "cod" ? "" : (editForm.iban || "").trim(),
        instructions: editForm.instructions.trim(),
        qrCode: editForm.type === "cod" ? "" : (editForm.qrCode || ""),
        requireProof: editForm.type === "cod" ? false : Boolean(editForm.requireProof),
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
    if (!confirm("Are you sure you want to delete this payment method?")) return;
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
      toast.success(currentStatus ? "Disabled at checkout" : "Enabled at checkout");
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1917]">Payment Methods</h1>
          <p className="text-sm text-muted-foreground">Manage checkout payment options, Cash on Delivery (COD), bank accounts, and wallet details</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button 
            type="button"
            onClick={handleCreateDefaultCod}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 text-xs shadow-sm transition-all"
          >
            <Banknote className="w-4 h-4" /> Enable / Add COD
          </button>
          <button 
            type="button"
            onClick={() => { 
              setEditForm({ 
                id: "", 
                type: "bank",
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
                requireProof: true
              }); 
              setIsEditing(true); 
            }}
            className="bg-[#FF6A2A] hover:bg-[#e5591c] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-xs shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Add Payment Method
          </button>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-black/10 shadow-lg space-y-5 max-w-2xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-black/5 pb-3">
            <h2 className="text-lg font-bold text-foreground">{editForm.id ? "Edit Payment Method" : "New Payment Method"}</h2>
            <span className="text-xs text-muted-foreground font-semibold uppercase">{editForm.type}</span>
          </div>

          {/* Payment Method Type Selector */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase block mb-1.5">Payment Method Category / Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange("bank")}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  editForm.type === "bank"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-black/10 hover:border-black/20 text-muted-foreground"
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Bank Transfer</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange("wallet")}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  editForm.type === "wallet"
                    ? "border-purple-600 bg-purple-50 text-purple-700"
                    : "border-black/10 hover:border-black/20 text-muted-foreground"
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Mobile Wallet</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange("cod")}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  editForm.type === "cod"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                    : "border-black/10 hover:border-black/20 text-muted-foreground"
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Cash on Delivery</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange("other")}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  editForm.type === "other"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-black/10 hover:border-black/20 text-muted-foreground"
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>Other / Online</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Display Title</label>
              <input 
                required 
                type="text" 
                placeholder="e.g. Meezan Bank, JazzCash, Cash on Delivery" 
                value={editForm.title} 
                onChange={e => setEditForm({...editForm, title: e.target.value})} 
                className="w-full mt-1 border rounded-xl p-2.5 text-sm outline-none focus:border-primary" 
              />
            </div>
            {editForm.type !== "cod" && (
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Bank / Platform Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Meezan Bank, JazzCash, EasyPaisa, SadaPay" 
                  value={editForm.bankName} 
                  onChange={e => setEditForm({...editForm, bankName: e.target.value})} 
                  className="w-full mt-1 border rounded-xl p-2.5 text-sm outline-none focus:border-primary" 
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase">Checkout Short Description</label>
            <input 
              required 
              type="text" 
              placeholder="e.g. Pay with cash upon delivery or Send via JazzCash App" 
              value={editForm.description} 
              onChange={e => setEditForm({...editForm, description: e.target.value})} 
              className="w-full mt-1 border rounded-xl p-2.5 text-sm outline-none focus:border-primary" 
            />
          </div>

          {/* Account details only for Bank / Wallet / Other */}
          {editForm.type !== "cod" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase">Account Title / Beneficiary</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Muhammad Ahsan Khalil" 
                    value={editForm.accountTitle} 
                    onChange={e => setEditForm({...editForm, accountTitle: e.target.value})} 
                    className="w-full mt-1 border rounded-xl p-2.5 text-sm outline-none focus:border-primary" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase">Account / Mobile Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 03000694543 or 010101029381" 
                    value={editForm.accountNumber} 
                    onChange={e => setEditForm({...editForm, accountNumber: e.target.value})} 
                    className="w-full mt-1 border rounded-xl p-2.5 text-sm font-mono outline-none focus:border-primary" 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">IBAN / Raast ID (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. PK36MEZN0000000000000000" 
                  value={editForm.iban} 
                  onChange={e => setEditForm({...editForm, iban: e.target.value})} 
                  className="w-full mt-1 border rounded-xl p-2.5 text-sm font-mono outline-none focus:border-primary" 
                />
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase">Instructions / Notes for Customer</label>
            <textarea 
              rows={2} 
              placeholder="e.g. Transfer via JazzCash app and attach screenshot below to verify your payment." 
              value={editForm.instructions} 
              onChange={e => setEditForm({...editForm, instructions: e.target.value})} 
              className="w-full mt-1 border rounded-xl p-2.5 text-sm resize-none outline-none focus:border-primary" 
            />
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
                <input type="text" value={editForm.logo} onChange={e => setEditForm({...editForm, logo: e.target.value})} className="w-full border rounded-xl p-2 text-xs" placeholder="Logo image path or URL" />
              </div>
            </div>

            {editForm.type !== "cod" && (
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
                  <input type="text" value={editForm.qrCode} onChange={e => setEditForm({...editForm, qrCode: e.target.value})} className="w-full border rounded-xl p-2 text-xs" placeholder="QR Code image path or URL" />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Display Order</label>
              <input required type="number" value={editForm.order} onChange={e => setEditForm({...editForm, order: Number(e.target.value)})} className="w-full mt-1 border rounded-xl p-2 text-sm" />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" id="activeCheckout" checked={editForm.active} onChange={e => setEditForm({...editForm, active: e.target.checked})} className="w-4 h-4 accent-primary" />
              <label htmlFor="activeCheckout" className="text-xs font-bold cursor-pointer">Active at Checkout</label>
            </div>
            {editForm.type !== "cod" && (
              <div className="flex items-center gap-2 mt-6">
                <input type="checkbox" id="requireProof" checked={editForm.requireProof} onChange={e => setEditForm({...editForm, requireProof: e.target.checked})} className="w-4 h-4 accent-primary" />
                <label htmlFor="requireProof" className="text-xs font-bold cursor-pointer text-amber-700">Require Screenshot Proof</label>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 border rounded-xl font-bold text-sm">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-[#FF6A2A] hover:bg-[#e5591c] text-white rounded-xl font-bold text-sm shadow-sm">Save Payment Method</button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-2xl border border-black/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-black/5 border-b border-black/5">
                <tr>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Title</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Type</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Order</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {methods.map(method => {
                  const isCod = method.type === "cod" || method.id === "cod" || method.title?.toLowerCase().includes("cash on delivery");
                  const isWallet = method.type === "wallet" || method.title?.toLowerCase().includes("jazzcash") || method.title?.toLowerCase().includes("easypaisa");
                  
                  return (
                    <tr key={method.id} className="border-b border-black/5 last:border-0 hover:bg-black/[0.02]">
                      <td className="p-4 font-bold flex items-center gap-3">
                        {method.logo && (
                          <div className="w-10 h-10 bg-white border rounded-xl flex items-center justify-center p-1 overflow-hidden shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={method.logo.startsWith('http') ? method.logo : `/uploads/${method.logo}`} alt="" className="w-full h-full object-contain" />
                          </div>
                        )}
                        <div>
                          <div className="text-foreground font-extrabold">{method.title}</div>
                          {method.accountNumber && (
                            <div className="text-xs text-muted-foreground font-mono font-normal">
                              {method.bankName ? `${method.bankName}: ` : ""}{method.accountNumber}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-xs">
                        {isCod ? (
                          <span className="inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800">
                            <Banknote className="w-3 h-3" /> COD
                          </span>
                        ) : isWallet ? (
                          <span className="inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-md bg-purple-100 text-purple-800">
                            <Smartphone className="w-3 h-3" /> Wallet
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-md bg-blue-100 text-blue-800">
                            <Building2 className="w-3 h-3" /> Bank
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground max-w-xs truncate">
                        <div>{method.description}</div>
                        {method.requireProof && (
                          <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                            Requires Screenshot
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-sm font-mono">{method.order}</td>
                      <td className="p-4">
                        <button 
                          onClick={() => toggleActive(method.id, method.active)} 
                          className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer transition-all ${
                            method.active ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                        >
                          {method.active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {method.active ? "Active" : "Disabled"}
                        </button>
                      </td>
                      <td className="p-4 flex justify-end gap-2">
                        <button 
                          onClick={() => { 
                            setEditForm({
                              ...method,
                              type: method.type || (isCod ? "cod" : isWallet ? "wallet" : "bank"),
                              accountTitle: method.accountTitle || "",
                              accountNumber: method.accountNumber || "",
                              bankName: method.bankName || "",
                              iban: method.iban || "",
                              instructions: method.instructions || "",
                              qrCode: method.qrCode || "",
                              requireProof: Boolean(method.requireProof)
                            }); 
                            setIsEditing(true); 
                          }} 
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(method.id)} 
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {methods.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground text-sm">No payment methods configured yet. Click above to add COD or Bank Transfer.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
