"use client";

import React from "react";
import QRCode from "react-qr-code";
import { useCartState } from "@/context/AppContext";

export function BusinessQRCode() {
  const { shippingSettings } = useCartState();

  if (!shippingSettings || !shippingSettings.qrDestinationUrl) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col items-center justify-center gap-3">
      <h3 className="font-bold text-gray-900 text-sm tracking-wide uppercase mb-2">Visit Our Shop</h3>
      <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
        <QRCode 
          value={shippingSettings.qrDestinationUrl} 
          size={120} 
          bgColor="#ffffff"
          fgColor="#1a1917"
        />
      </div>
      <p className="text-xs text-gray-500 text-center max-w-[200px] mt-2">
        Scan to find our physical location on maps!
      </p>
    </div>
  );
}
