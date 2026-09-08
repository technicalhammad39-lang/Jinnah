import { Metadata } from "next";
import { Suspense } from "react";
import TrackOrderPortal from "@/components/tracking/TrackOrderPortal";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Track Your Order | Jinnah Hardware Store Logistics",
  description: "Track your hardware order in real-time. Fast courier delivery status across Pakistan.",
};

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf9f6] pt-32 pb-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <TrackOrderPortal />
    </Suspense>
  );
}
