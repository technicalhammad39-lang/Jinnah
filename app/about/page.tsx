import { getLeadership } from "@/lib/data-fetcher";
import { AboutClient } from "./AboutClient";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Us | Jinnah Hardware Store",
  description: "Learn about Jinnah Hardware Store, our history, and our leadership team.",
};

export default async function AboutPage() {
  const leadership = await getLeadership();

  return (
    <AboutClient leadership={leadership} />
  );
}
