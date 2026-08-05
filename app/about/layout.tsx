import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - Jinnah Hardware Store | Pakistan's Premier Architectural Hardware",
  description: "Learn about the heritage, mission, and vision of Jinnah Hardware Store. Over 15 years of trust supplying premium Italian and German architectural hardware in Pakistan.",
  openGraph: {
    title: "About Jinnah Hardware Store",
    description: "Pakistan's premier purveyor of luxury architectural hardware.",
    url: "https://jinnahhardware.com/about",
    siteName: "Jinnah Hardware Store",
    locale: "en_PK",
    type: "website",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
