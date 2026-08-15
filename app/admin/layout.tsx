"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  FileText, 
  Image as ImageIcon, 
  Settings, 
  MessageSquare,
  Bell,
  LogOut,
  Menu,
  X,
  Store,
  ShoppingCart
} from "lucide-react";
import Image from "next/image";

const sidebarLinks = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Brands", href: "/admin/brands", icon: Tags },
  { name: "Blogs", href: "/admin/blogs", icon: FileText },
  { name: "Gallery", href: "/admin/gallery", icon: ImageIcon },
  { name: "Messages", href: "/admin/messages", icon: MessageSquare },
  { name: "Notifications", href: "/admin/notifications", icon: Bell },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { logout, user } = useAuth();

  // If this is the login page, don't show the dashboard shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="h-screen bg-[#faf9f6] text-[#1a1917] font-sans flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`absolute inset-y-0 left-0 z-50 w-72 bg-white border-r border-[#1a1917]/5 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col shrink-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-[#1a1917]/5 shrink-0">
          <Link href="/admin" className="relative h-10 w-32">
            <Image src="/jinnah-logo.webp" alt="Jinnah Hardware" fill className="object-contain object-left" />
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-[#1a1917]/50 hover:text-[#1a1917]">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          <div className="text-xs font-bold text-[#1a1917]/30 uppercase tracking-wider mb-4 px-3">Main Menu</div>
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                  isActive 
                    ? "bg-[#FF6A2A]/10 text-[#FF6A2A] font-semibold" 
                    : "text-[#1a1917]/60 hover:bg-[#1a1917]/5 hover:text-[#1a1917]"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-[#FF6A2A]" : "text-[#1a1917]/40"}`} />
                {link.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-[#1a1917]/5 shrink-0">
          <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-[#1a1917]/5">
            <div className="w-8 h-8 rounded-full bg-[#FF6A2A]/20 flex items-center justify-center text-[#FF6A2A] font-bold">
              {user?.email?.[0].toUpperCase() || "A"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-[#1a1917]/40">Super Admin</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-3 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#1a1917]/5 flex items-center justify-between px-6 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[#1a1917]/70 hover:text-[#1a1917]">
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold hidden sm:block">
              {sidebarLinks.find(l => l.href === pathname)?.name || "Admin Portal"}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              target="_blank"
              className="flex items-center gap-2 text-sm text-[#1a1917]/50 hover:text-[#1a1917] transition-colors bg-[#1a1917]/5 hover:bg-[#1a1917]/10 px-4 py-2 rounded-full"
            >
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">View Live Site</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}
