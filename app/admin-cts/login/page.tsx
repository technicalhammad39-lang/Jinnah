"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Lock, Mail } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin-cts");
    } catch (err: any) {
      setError("Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#1a1917]/5 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="relative h-16 w-48 mb-6">
            <Image 
              src="/jinnah-logo.webp" 
              alt="Jinnah Hardware" 
              fill 
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-black text-[#1a1917]">Admin Portal</h1>
          <p className="text-[#1a1917]/50 text-sm mt-2">Sign in to manage your CMS</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#1a1917]/30" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 pl-10 pr-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
                placeholder="admin@jinnahhardware.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1a1917]/50 uppercase tracking-wider pl-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#1a1917]/30" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white border border-[#1a1917]/10 rounded-xl py-3 pl-10 pr-4 text-[#1a1917] focus:outline-none focus:border-[#FF6A2A] transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF6A2A] hover:bg-[#e5591c] text-white font-bold py-3.5 rounded-xl transition-colors mt-6 flex items-center justify-center disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Secure Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
