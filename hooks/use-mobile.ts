import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const syncMobileState = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    mediaQuery.addEventListener("change", syncMobileState);
    syncMobileState();

    return () => mediaQuery.removeEventListener("change", syncMobileState);
  }, []);

  return !!isMobile;
}
