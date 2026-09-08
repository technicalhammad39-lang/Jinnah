import { Metadata } from "next";
import EmailCenterClient from "./EmailCenterClient";

export const metadata: Metadata = {
  title: "Email Center | Jinnah Hardware Admin",
  description: "Enterprise SMTP & IMAP Mail Management System",
};

export default function AdminEmailCenterPage() {
  return <EmailCenterClient />;
}
