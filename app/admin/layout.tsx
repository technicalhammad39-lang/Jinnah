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
  ShoppingCart,
  CreditCard,
  Users,
  Star,
  FolderTree,
  Ticket,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import Image from "next/image";

const sidebarLinks = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Brands", href: "/admin/brands", icon: Tags },
  { name: "Categories", href: "/admin/categories", icon: FolderTree },
  { name: "Blogs", href: "/admin/blogs", icon: FileText },
  { name: "Gallery", href: "/admin/gallery", icon: ImageIcon },
  { name: "About Profiles", href: "/admin/leadership", icon: Users },
  { name: "Reviews", href: "/admin/reviews", icon: Star },
  { name: "Coupons", href: "/admin/coupons", icon: Ticket },
  { name: "Messages", href: "/admin/messages", icon: MessageSquare },
  { name: "Notifications", href: "/admin/notifications", icon: Bell },
  { name: "Payments", href: "/admin/payment-methods", icon: CreditCard },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
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
        className={`absolute inset-y-4 left-4 z-50 lg:static lg:my-4 lg:ml-4 lg:h-[calc(100vh-2rem)] bg-gradient-to-b from-[#E04A1A] to-[#C8300A] text-white rounded-3xl shadow-2xl transform transition-all duration-300 ease-in-out lg:translate-x-0 flex flex-col shrink-0 overflow-hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-[120%]"
        } ${isCollapsed ? "w-20" : "w-72"}`}
      >
        <div className="h-20 flex items-center justify-between px-4 border-b border-white/10 shrink-0 bg-white/5">
          <Link href="/admin" className={`relative transition-all duration-300 ${isCollapsed ? "h-10 w-10 overflow-hidden" : "h-16 w-52"} flex items-center justify-start`}>
            {isCollapsed ? (
              <Image src="/favicon.svg" alt="Jinnah" fill className="object-contain" />
            ) : (
              <Image src="/jinnah-bottom.png" alt="Jinnah Hardware" fill className="object-contain object-left" />
            )}
          </Link>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              className="hidden lg:flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-colors"
            >
              {isCollapsed ? <ChevronsRight className="w-5 h-5" /> : <ChevronsLeft className="w-5 h-5" />}
            </button>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/70 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className={`flex-1 py-6 px-3 space-y-1 custom-scrollbar ${isCollapsed ? "overflow-y-hidden hover:overflow-y-auto" : "overflow-y-auto"}`}>
          {!isCollapsed && <div className="text-xs font-bold text-white/50 uppercase tracking-wider mb-4 px-3">Main Menu</div>}
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                title={link.name}
                className={`flex items-center gap-3 py-3 rounded-xl transition-all ${isCollapsed ? "px-3 justify-center" : "px-4"} ${
                  isActive 
                    ? "bg-white text-[#FF6A2A] font-bold shadow-md" 
                    : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-[#FF6A2A]" : "text-white/70"}`} />
                {!isCollapsed && <span className="truncate">{link.name}</span>}
              </Link>
            );
          })}
        </div>

        <div className={`p-4 border-t border-white/10 shrink-0 bg-white/5 ${isCollapsed ? "flex flex-col gap-2 items-center" : ""}`}>
          <div className={`flex items-center gap-3 mb-2 rounded-xl bg-white/10 ${isCollapsed ? "p-2 justify-center" : "px-3 py-3"}`}>
            <div className="w-8 h-8 shrink-0 rounded-full bg-white flex items-center justify-center text-[#FF6A2A] font-bold shadow-inner">
              {user?.email?.[0].toUpperCase() || "A"}
            </div>
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden text-white">
                <p className="text-sm font-semibold truncate">{user?.email}</p>
                <p className="text-xs text-white/70">Super Admin</p>
              </div>
            )}
          </div>
          <button 
            onClick={logout}
            title="Logout"
            className={`flex items-center gap-3 py-3 rounded-xl text-white hover:bg-white/10 transition-colors font-medium ${isCollapsed ? "px-3 justify-center" : "px-4 w-full"}`}
          >
            <LogOut className="h-5 w-5 shrink-0 opacity-80" />
            {!isCollapsed && <span>Logout</span>}
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
