import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Categories - Jinnah Hardware Store",
  description: "Browse our comprehensive catalog of architectural hardware. From mechanical masterpieces to smart security solutions.",
  openGraph: {
    title: "Categories - Jinnah Hardware Store",
    description: "Architectural hardware collections and categories.",
    url: "https://jinnahhardware.com/categories",
    siteName: "Jinnah Hardware Store",
    locale: "en_PK",
    type: "website",
  },
};

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
