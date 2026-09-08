"use client";

import { Suspense } from "react";
import TrackOrderPortal from "@/components/tracking/TrackOrderPortal";
import { Loader2 } from "lucide-react";

export default function TrackOrderClient({ reference }: { reference: string }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf9f6] pt-32 pb-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <TrackOrderPortal initialReference={reference} />
    </Suspense>
  );
}
