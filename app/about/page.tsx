import { getLeadership } from "@/lib/data-fetcher";
import { AboutClient } from "./AboutClient";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Us | Jinnah Hardware Store",
  description: "Learn about Jinnah Hardware Store. Quality architectural hardware, door locks, handles, and dependable service at competitive prices in Pakistan.",
  alternates: {
    canonical: "https://jinnah-hardwarestore.com/about",
  },
  openGraph: {
    title: "About Us | Jinnah Hardware Store",
    description: "Quality architectural hardware, door locks, handles, and dependable service at competitive prices in Pakistan.",
    url: "https://jinnah-hardwarestore.com/about",
    siteName: "Jinnah Hardware Store",
    images: [{ url: "/jinnah-bottom.png", width: 1200, height: 630, alt: "About Jinnah Hardware Store" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | Jinnah Hardware Store",
    description: "Quality architectural hardware, door locks, handles, and dependable service at competitive prices in Pakistan.",
    images: ["/jinnah-bottom.png"],
  },
};

export default async function AboutPage() {
  const leadership = await getLeadership();

  return (
    <AboutClient leadership={leadership} />
  );
}
