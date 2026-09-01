"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Save, Loader2, Globe, Phone, Mail, MapPin, Truck, Gift, QrCode } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    siteName: "Jinnah Hardware",
    seoDescription: "",
    contactEmail: "info@hammadgfx.online",
    contactPhone: "+92 307 6924116",
    contactAddress: "Faisalabad, Pakistan",
    facebook: "",
    instagram: "",
    twitter: "",
    whatsapp: "+923076924116",
    tickerEnabled: false,
    tickerText: "",
    tickerLink: "",
    // Shipping & Delivery
    defaultShippingFee: 200,
    defaultDeliveryEstimate: "3-5 working days",
    // Threshold Benefits
    thresholdEnabled: false,
    thresholdAmount: 10000,
    benefitType: "free_shipping",
    benefitValue: 0,
    // QR Code
    qrDestinationUrl: "https://maps.app.goo.gl/..."
  });

  const fetchSettings = async () => {
    try {
      const docRef = doc(db, "settings", "global");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings({ ...settings, ...docSnap.data() });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await setDoc(doc(db, "settings", "global"), settings, { merge: true });
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
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
      <div>
        <h1 className="text-2xl font-bold text-[#1a1917]">Site Settings</h1>
        <p className="text-[#1a1917]/50 text-sm mt-1">Manage global configuration for your website</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Information */}
        <div className="bg-white border border-[#1a1917]/5 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-[#1a1917]/5 pb-4 mb-4">
            <Globe className="w-5 h-5 text-[#FF6A2A]" />
            <h2 className="text-lg font-bold text-[#1a1917]">General Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Site Name</label>
              <input 
                type="text" 
                value={settings.siteName}
                onChange={e => setSettings({...settings, siteName: e.target.value})}
                className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Global SEO Description</label>
            <textarea 
              value={settings.seoDescription}
              onChange={e => setSettings({...settings, seoDescription: e.target.value})}
              className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors h-24 resize-none"
              placeholder="Meta description for the homepage..."
            />
          </div>
        </div>

        {/* Top Banner Ticker */}
        <div className="bg-white border border-[#1a1917]/5 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#1a1917]/5 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#FF6A2A]" />
              <h2 className="text-lg font-bold text-[#1a1917]">Top Banner Ticker</h2>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={settings.tickerEnabled || false}
                onChange={e => setSettings({...settings, tickerEnabled: e.target.checked})}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6A2A]"></div>
            </label>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Ticker Message</label>
              <input 
                type="text" 
                value={settings.tickerText || ""}
                onChange={e => setSettings({...settings, tickerText: e.target.value})}
                placeholder="e.g., Free shipping on all orders over Rs. 5,000!"
                className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Optional Link</label>
              <input 
                type="url" 
                value={settings.tickerLink || ""}
                onChange={e => setSettings({...settings, tickerLink: e.target.value})}
                placeholder="e.g., /shop"
                className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="bg-white border border-[#1a1917]/5 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-[#1a1917]/5 pb-4 mb-4">
            <Phone className="w-5 h-5 text-[#FF6A2A]" />
            <h2 className="text-lg font-bold text-[#1a1917]">Contact Details</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1 flex items-center gap-2">
                <Mail className="w-3 h-3" /> Email Address
              </label>
              <input 
                type="email" 
                value={settings.contactEmail}
                onChange={e => setSettings({...settings, contactEmail: e.target.value})}
                className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1 flex items-center gap-2">
                <Phone className="w-3 h-3" /> Phone Number
              </label>
              <input 
                type="text" 
                value={settings.contactPhone}
                onChange={e => setSettings({...settings, contactPhone: e.target.value})}
                className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">WhatsApp Number</label>
              <input 
                type="text" 
                value={settings.whatsapp}
                onChange={e => setSettings({...settings, whatsapp: e.target.value})}
                className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1 flex items-center gap-2">
                <MapPin className="w-3 h-3" /> Physical Address
              </label>
              <input 
                type="text" 
                value={settings.contactAddress}
                onChange={e => setSettings({...settings, contactAddress: e.target.value})}
                className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white border border-[#1a1917]/5 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-[#1a1917]/5 pb-4 mb-4">
            <Globe className="w-5 h-5 text-[#FF6A2A]" />
            <h2 className="text-lg font-bold text-[#1a1917]">Social Media Links</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Facebook URL</label>
              <input 
                type="url" 
                value={settings.facebook}
                onChange={e => setSettings({...settings, facebook: e.target.value})}
                className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Instagram URL</label>
              <input 
                type="url" 
                value={settings.instagram}
                onChange={e => setSettings({...settings, instagram: e.target.value})}
                className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Benefits */}
        <div className="bg-white border border-[#1a1917]/5 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-[#1a1917]/5 pb-4 mb-4">
            <Truck className="w-5 h-5 text-[#FF6A2A]" />
            <h2 className="text-lg font-bold text-[#1a1917]">Global Shipping Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Default Shipping Fee (Rs.)</label>
              <input 
                type="number" 
                value={settings.defaultShippingFee}
                onChange={e => setSettings({...settings, defaultShippingFee: Number(e.target.value)})}
                className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
                min="0"
              />
              <p className="text-[10px] text-gray-500 pl-1">Used if a product doesn't have a specific fee.</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Default Delivery Estimate</label>
              <input 
                type="text" 
                value={settings.defaultDeliveryEstimate}
                onChange={e => setSettings({...settings, defaultDeliveryEstimate: e.target.value})}
                className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
                placeholder="e.g. 3-5 working days"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#1a1917]/5 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-[#1a1917]/5 pb-4 mb-4">
            <Gift className="w-5 h-5 text-[#FF6A2A]" />
            <h2 className="text-lg font-bold text-[#1a1917]">Threshold Benefit System</h2>
          </div>

          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.thresholdEnabled}
                onChange={e => setSettings({...settings, thresholdEnabled: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6A2A]"></div>
            </label>
            <span className="text-sm font-semibold text-[#1a1917]">Enable Order Threshold Benefits</span>
          </div>
          
          {settings.thresholdEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Threshold Amount (Rs.)</label>
                <input 
                  type="number" 
                  value={settings.thresholdAmount}
                  onChange={e => setSettings({...settings, thresholdAmount: Number(e.target.value)})}
                  className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
                  min="0"
                />
                <p className="text-[10px] text-gray-500 pl-1">Cart subtotal needed to unlock benefit.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Benefit Type</label>
                <select
                  value={settings.benefitType}
                  onChange={e => setSettings({...settings, benefitType: e.target.value})}
                  className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
                >
                  <option value="free_shipping">Free Shipping</option>
                  <option value="discount_fixed">Extra Discount (Fixed Rs.)</option>
                  <option value="discount_percentage">Extra Discount (%)</option>
                </select>
              </div>

              {(settings.benefitType === "discount_fixed" || settings.benefitType === "discount_percentage") && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Benefit Value</label>
                  <input 
                    type="number" 
                    value={settings.benefitValue}
                    onChange={e => setSettings({...settings, benefitValue: Number(e.target.value)})}
                    className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
                    min="0"
                  />
                  <p className="text-[10px] text-gray-500 pl-1">
                    {settings.benefitType === "discount_fixed" ? "Fixed amount to discount" : "Percentage to discount"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Business QR */}
        <div className="bg-white border border-[#1a1917]/5 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-[#1a1917]/5 pb-4 mb-4">
            <QrCode className="w-5 h-5 text-[#FF6A2A]" />
            <h2 className="text-lg font-bold text-[#1a1917]">Business QR Code</h2>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">QR Destination URL</label>
            <input 
              type="text" 
              value={settings.qrDestinationUrl}
              onChange={e => setSettings({...settings, qrDestinationUrl: e.target.value})}
              className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 px-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
              placeholder="e.g. https://maps.app.goo.gl/..."
            />
            <p className="text-[10px] text-gray-500 pl-1">This link will be dynamically encoded into the shop's QR code shown to customers.</p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#FF6A2A] hover:bg-[#e5591c] text-white font-bold py-3 px-8 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
