"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const adminDoc = await getDoc(doc(db, "adminUsers", currentUser.uid));
          if (adminDoc.exists() && adminDoc.data().role === "admin") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
            if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
              router.push("/admin/login");
            }
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
          router.push("/admin/login");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const logout = async () => {
    await signOut(auth);
    router.push("/admin/login");
  };

  // If loading and trying to access an admin route, show loader
  if (loading && pathname.startsWith("/admin")) {
    return (
      <div className="min-h-screen bg-[#121110] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#FF6A2A] animate-spin" />
      </div>
    );
  }

  // If not admin and trying to access admin (except login), don't render children
  if (!loading && !isAdmin && pathname.startsWith("/admin") && pathname !== "/admin/login") {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
