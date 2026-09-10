"use client";

import { useState } from "react";
import { 
  Plus, 
  FileText, 
  Eye, 
  Trash2, 
  Smartphone, 
  Monitor, 
  Edit3, 
  X, 
  Save, 
  Check, 
  Sparkles,
  Code
} from "lucide-react";
import { EmailTemplate } from "@/lib/email/types";
import { toast } from "sonner";

interface EmailTemplatesTabProps {
  templates: EmailTemplate[];
  onRefresh: () => void;
}

export default function EmailTemplatesTab({ templates, onRefresh }: EmailTemplatesTabProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState<Partial<EmailTemplate>>({});

  const handleOpenEdit = (template?: EmailTemplate) => {
    if (template) {
      setFormData(template);
    } else {
      setFormData({
        name: "",
        slug: "",
        subject: "",
        category: "general",
        bodyHtml: "<p>Hello {{customer_name}},</p><p>Your message here...</p>",
        variables: ["customer_name", "company_name"],
      });
    }
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/email/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      toast.success("Template saved successfully.");
      setIsEditing(false);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save template");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      const res = await fetch("/api/admin/email/templates", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Template deleted.");
      if (selectedTemplate?.id === id) setSelectedTemplate(null);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete template");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Email Template Library</h2>
          <p className="text-xs text-muted-foreground">
            Standard transactional and promotional templates supporting dynamic variables like {"{{customer_name}}"}.
          </p>
        </div>

        <button
          onClick={() => handleOpenEdit()}
          className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-primary/95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>New Template</span>
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="rounded-2xl border border-black/5 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="rounded bg-black/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {tpl.category}
                </span>
                {tpl.isDefault && (
                  <span className="rounded bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                    System Default
                  </span>
                )}
              </div>

              <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                {tpl.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1 font-mono">
                Subject: {tpl.subject}
              </p>

              <div className="mt-3 flex flex-wrap gap-1">
                {(tpl.variables || []).map((v) => (
                  <span
                    key={v}
                    className="rounded-md bg-primary/5 px-1.5 py-0.5 text-[10px] font-semibold text-primary"
                  >
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-black/5 flex items-center justify-between">
              <button
                onClick={() => setSelectedTemplate(tpl)}
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Preview</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(tpl)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5"
                  title="Edit"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                {!tpl.isDefault && (
                  <button
                    onClick={() => handleDelete(tpl.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="flex flex-col rounded-2xl bg-white shadow-2xl border border-black/10 w-full max-w-4xl h-[85vh] overflow-hidden animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#11100e] text-white shrink-0">
              <div>
                <h3 className="text-sm font-bold">{selectedTemplate.name}</h3>
                <p className="text-xs text-white/60 font-mono">Subject: {selectedTemplate.subject}</p>
              </div>

              <div className="flex items-center gap-3">
                {/* Desktop / Mobile Switcher */}
                <div className="flex items-center bg-white/10 rounded-xl p-1 text-xs">
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                      previewDevice === "desktop" ? "bg-white text-[#11100e] font-bold" : "text-white/70 hover:text-white"
                    }`}
                  >
                    <Monitor className="h-3.5 w-3.5" />
                    <span>Desktop</span>
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                      previewDevice === "mobile" ? "bg-white text-[#11100e] font-bold" : "text-white/70 hover:text-white"
                    }`}
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    <span>Mobile</span>
                  </button>
                </div>

                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Preview Viewport */}
            <div className="flex-1 bg-[#faf9f6] p-6 overflow-y-auto flex items-center justify-center">
              <div
                className={`bg-white rounded-xl shadow-lg border border-black/10 overflow-hidden transition-all duration-300 ${
                  previewDevice === "mobile" ? "w-[360px] h-full" : "w-full max-w-[640px] h-full"
                }`}
              >
                <iframe
                  srcDoc={selectedTemplate.bodyHtml}
                  title="Template Preview"
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Create Template Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <form
            onSubmit={handleSave}
            className="flex flex-col rounded-2xl bg-white shadow-2xl border border-black/10 w-full max-w-3xl h-[85vh] overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 bg-[#11100e] text-white shrink-0">
              <h3 className="text-sm font-bold">
                {formData.id ? "Edit Template" : "Create New Template"}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">Template Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VIP Order Confirmation"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-black/10 bg-[#faf9f6] p-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">Category</label>
                  <select
                    value={formData.category || "general"}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full rounded-xl border border-black/10 bg-[#faf9f6] p-2.5 text-sm outline-none focus:border-primary"
                  >
                    <option value="order">Order Automation</option>
                    <option value="customer">Customer Inquiry</option>
                    <option value="marketing">Marketing & Newsletter</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Email Subject Line</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Your Order #{{order_number}} is ready"
                  value={formData.subject || ""}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full rounded-xl border border-black/10 bg-[#faf9f6] p-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1">HTML Template Body</label>
                <textarea
                  rows={14}
                  required
                  value={formData.bodyHtml || ""}
                  onChange={(e) => setFormData({ ...formData, bodyHtml: e.target.value })}
                  className="w-full rounded-xl border border-black/10 bg-[#faf9f6] p-3 text-xs font-mono outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-3.5 bg-[#faf9f6] border-t border-black/5 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl border border-black/10 text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-primary text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-primary/95"
              >
                Save Template
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
