import { Metadata } from "next";
import TrackOrderClient from "./TrackOrderClient";

export const metadata: Metadata = {
  title: "Track Your Order | Jinnah Hardware Store",
  description: "Check the status of your premium hardware order.",
};

type PageProps = {
  params: Promise<{ reference: string }>;
};

export default async function TrackOrderPage({ params }: PageProps) {
  const { reference } = await params;
  return <TrackOrderClient reference={reference} />;
}
