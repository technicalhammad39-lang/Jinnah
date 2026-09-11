import type { Metadata } from "next";
import { AdminClientLayout } from "./AdminClientLayout";

export const metadata: Metadata = {
  title: "Admin Portal | Jinnah Hardware Store",
  description: "Administrative control portal for Jinnah Hardware Store.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminClientLayout>{children}</AdminClientLayout>;
}
