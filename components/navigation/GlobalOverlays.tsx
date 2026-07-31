"use client";

import dynamic from "next/dynamic";

const SearchOverlay = dynamic(
  () => import("@/components/navigation/SearchOverlay").then((module) => module.SearchOverlay),
  { ssr: false }
);

const CartDrawer = dynamic(
  () => import("@/components/navigation/CartDrawer").then((module) => module.CartDrawer),
  { ssr: false }
);

const QuickViewModal = dynamic(
  () => import("@/components/products/QuickViewModal").then((module) => module.QuickViewModal),
  { ssr: false }
);

export function GlobalOverlays() {
  return (
    <>
      <SearchOverlay />
      <CartDrawer />
      <QuickViewModal />
    </>
  );
}
