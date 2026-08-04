"use client";

import dynamic from "next/dynamic";
import { GlobalOverlays } from "@/components/navigation/GlobalOverlays";
import { LenisScrollProvider } from "@/components/animations/LenisScrollProvider";

const PremiumScrollAnimations = dynamic(
  () =>
    import("@/components/animations/PremiumScrollAnimations").then(
      (module) => module.PremiumScrollAnimations
    ),
  { ssr: false }
);

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
      <LenisScrollProvider />
      <PremiumScrollAnimations />
      <InteractiveBackground />
      <GlobalOverlays />
    </>
  );
}
