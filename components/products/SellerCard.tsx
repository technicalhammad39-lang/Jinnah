import React from 'react';
import { Store, ShieldCheck, MessageCircle, Star } from 'lucide-react';
import Link from 'next/link';

export function SellerCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Sold by</span>
          <h3 className="font-bold text-gray-900 text-lg mt-0.5">Jinnah Hardware Store</h3>
        </div>
        <div className="bg-blue-50 text-blue-600 p-2 rounded-full">
          <Store className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-md self-start">
        <ShieldCheck className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider">Verified Seller</span>
      </div>

      <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">Positive Ratings</span>
          <span className="font-bold text-gray-900 text-xl">98%</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">Ship on Time</span>
          <span className="font-bold text-gray-900 text-xl">100%</span>
        </div>
      </div>

      <div className="flex gap-3 mt-1">
        <Link 
          href="/contact" 
          className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
        >
          <MessageCircle className="w-4 h-4" /> Chat
        </Link>
        <Link 
          href="/shop" 
          className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-black transition-colors"
        >
          Go to Store
        </Link>
      </div>
    </div>
  );
}
