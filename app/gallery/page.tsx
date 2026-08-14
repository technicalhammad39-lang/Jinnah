export const dynamic = "force-dynamic";
import { getGallery } from "@/lib/data-fetcher";
import GalleryClient from "./GalleryClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visual Gallery | Jinnah Hardware Store",
  description: "Browse our project portfolio showcasing premium hardware installations in luxury homes, commercial spaces, and hotels.",
};

export default async function GalleryServerPage() {
  const gallery = await getGallery();

  return <GalleryClient initialGallery={gallery} />;
}

