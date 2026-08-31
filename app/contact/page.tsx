import { ContactClient } from "./ContactClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Jinnah Hardware Store",
  description: "Get in touch with Jinnah Hardware Store for premium architectural hardware.",
};

export default function ContactPage() {
  return <ContactClient />;
}
