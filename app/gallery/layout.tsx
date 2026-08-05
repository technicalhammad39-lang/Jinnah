import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project Portfolio - Jinnah Hardware Store",
  description: "Explore our curated gallery of luxury installations, showcasing the seamless integration of premium hardware in elite architectural spaces.",
  openGraph: {
    title: "Project Portfolio - Jinnah Hardware",
    description: "Gallery of luxury installations and premium architectural hardware.",
    url: "https://jinnahhardware.com/gallery",
    siteName: "Jinnah Hardware Store",
    locale: "en_PK",
    type: "website",
  },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
