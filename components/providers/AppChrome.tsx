"use client";

import dynamic from "next/dynamic";
import { GlobalOverlays } from "@/components/navigation/GlobalOverlays";

const InteractiveBackground = dynamic(
  () =>
    import("@/components/animations/InteractiveBackground").then(
      (module) => module.InteractiveBackground
    ),
  { ssr: false }
);

export function AppChrome() {
  return (
    <>
      <InteractiveBackground />
      <GlobalOverlays />
    </>
  );
}
