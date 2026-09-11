"use client";

import {
  type ComponentType,
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { PhoneCall } from "lucide-react";
import { useOverlayState } from "@/context/AppContext";

type ActionId = "call" | "directions" | "whatsapp";
type DockIconProps = { className?: string };

interface DockAction {
  id: ActionId;
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  iconClassName?: string;
  external?: boolean;
}

const ACTIONS: DockAction[] = [
  {
    id: "call",
    label: "Call Now",
    href: "tel:03000421772",
    icon: PhoneCall,
    iconClassName: "h-5 w-5",
  },
  {
    id: "directions",
    label: "Location",
    href: "https://maps.google.com/?q=Jinnah+Hardware+Store",
    icon: LocationIcon,
    iconClassName: "h-[1.35rem] w-[1.35rem]",
    external: true,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    href: "https://wa.me/923000421772",
    icon: WhatsAppIcon,
    iconClassName: "h-[1.35rem] w-[1.35rem]",
    external: true,
  },
];

const DOCK_SPRING = {
  type: "spring",
  stiffness: 280,
  damping: 28,
  mass: 0.75,
};

function LocationIcon({ className }: DockIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 21C15.5 17.35 18 14.36 18 10.72C18 7.01 15.31 4 12 4C8.69 4 6 7.01 6 10.72C6 14.36 8.5 17.35 12 21Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10.5" r="2.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function WhatsAppIcon({ className }: DockIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

const containerVariants = {
  collapsed: {
    width: 64,
    borderRadius: 32,
    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.7), 0 12px 32px rgba(22,18,14,0.08), 0 0 0 1px rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.25)",
    backdropFilter: "blur(16px) saturate(1.2)",
    WebkitBackdropFilter: "blur(16px) saturate(1.2)",
    transition: { ...DOCK_SPRING, delay: 0.15 }
  },
  expanded: {
    width: 196,
    borderRadius: 32,
    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.95), 0 24px 64px rgba(255,106,42,0.15), 0 0 0 1px rgba(255,255,255,0.4)",
    backgroundColor: "rgba(255,255,255,0.5)",
    backdropFilter: "blur(28px) saturate(1.2)",
    WebkitBackdropFilter: "blur(28px) saturate(1.2)",
    transition: { ...DOCK_SPRING }
  }
};

const buttonVariants = {
  collapsed: {
    width: 48,
    backgroundColor: "rgba(255,255,255,0.35)",
    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.5), 0 4px 12px rgba(0,0,0,0.05)",
    y: 0,
    transition: { ...DOCK_SPRING, delay: 0.1 }
  },
  expanded: {
    width: 180,
    backgroundColor: "rgba(255,255,255,0.75)",
    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.9), 0 8px 24px rgba(0,0,0,0.08)",
    y: 0,
    transition: { ...DOCK_SPRING }
  },
  hover: {
    width: 180,
    backgroundColor: "rgba(255,255,255,0.95)",
    boxShadow: "inset 0 1px 1px rgba(255,255,255,1), 0 12px 32px rgba(0,0,0,0.12)",
    y: -2,
    transition: { ...DOCK_SPRING }
  }
};

const labelVariants = {
  collapsed: {
    opacity: 0,
    x: 10,
    filter: "blur(4px)",
    WebkitFilter: "blur(4px)",
    transition: { duration: 0.15, ease: "easeOut", delay: 0 }
  },
  expanded: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    WebkitFilter: "blur(0px)",
    transition: { duration: 0.3, ease: "easeOut", delay: 0.15 }
  },
  hover: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    WebkitFilter: "blur(0px)",
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

const iconBgVariants = {
  collapsed: {
    scale: 1,
    backgroundColor: "#ffffff",
    color: "#FF6A2A",
    rotate: 0,
    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.8), 0 2px 8px rgba(0,0,0,0)",
    transition: { ...DOCK_SPRING, delay: 0.05 }
  },
  expanded: {
    scale: 1,
    backgroundColor: "#ffffff",
    color: "#FF6A2A",
    rotate: 0,
    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.8), 0 2px 8px rgba(0,0,0,0)",
    transition: { ...DOCK_SPRING }
  },
  hover: {
    scale: 1.08,
    backgroundColor: "#FF6A2A",
    color: "#ffffff",
    rotate: -3,
    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.3), 0 8px 20px rgba(255,106,42,0.45)",
    transition: { ...DOCK_SPRING }
  }
};

export function FloatingHeroActions() {
  const { cartOpen } = useOverlayState();
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [canHover, setCanHover] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [activeAction, setActiveAction] = useState<ActionId | null>(null);

  useEffect(() => {
    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

    const syncHoverCapability = () => {
      setCanHover(hoverQuery.matches);

      if (!hoverQuery.matches) {
        setIsHovering(false);
      }
    };

    syncHoverCapability();
    hoverQuery.addEventListener("change", syncHoverCapability);

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setActiveAction(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveAction(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      hoverQuery.removeEventListener("change", syncHoverCapability);
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const expansionMode = useMemo<"none" | "all" | ActionId>(() => {
    if (canHover && isHovering) {
      return "all";
    }
    if (activeAction) {
      return activeAction;
    }
    return "none";
  }, [canHover, isHovering, activeAction]);

  const isAnyExpanded = expansionMode !== "none";

  const handleActionClick = (event: ReactMouseEvent, action: DockAction) => {
    if (!canHover) {
      if (activeAction !== action.id) {
        event.preventDefault();
        setActiveAction(action.id);
      } else {
        setActiveAction(null);
      }
    }
  };

  return (
    <div className={`pointer-events-none fixed right-4 bottom-4 z-[60] sm:right-6 sm:bottom-6 lg:right-8 lg:bottom-8 transition-all duration-500 ${cartOpen ? "opacity-0 translate-y-12" : "opacity-100 translate-y-0"}`}>
      <motion.div
        ref={containerRef}
        initial="collapsed"
        animate={isAnyExpanded ? "expanded" : "collapsed"}
        variants={containerVariants}
        className="pointer-events-auto flex flex-col items-center justify-center gap-2 overflow-visible p-2 will-change-[width,transform,filter]"
        onMouseEnter={canHover ? () => setIsHovering(true) : undefined}
        onMouseLeave={canHover ? () => setIsHovering(false) : undefined}
      >
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          const isItemExpanded = expansionMode === "all" || expansionMode === action.id;

          return (
            <motion.a
              key={action.id}
              href={action.href}
              target={action.external ? "_blank" : undefined}
              rel={action.external ? "noopener noreferrer" : undefined}
              aria-label={action.label}
              onClick={(event) => handleActionClick(event, action)}
              initial="collapsed"
              animate={isItemExpanded ? "expanded" : "collapsed"}
              whileHover={isItemExpanded ? "hover" : undefined}
              variants={buttonVariants}
              className="group relative flex h-12 items-center justify-end rounded-full text-[#181613] will-change-[width,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A2A]"
            >
              <motion.span
                variants={labelVariants}
                className="pointer-events-none absolute left-4 whitespace-nowrap text-sm font-bold tracking-[0.01em] will-change-[opacity,transform,filter]"
              >
                {action.label}
              </motion.span>

              <motion.span
                variants={iconBgVariants}
                className="absolute right-[4px] top-1/2 grid h-10 w-10 flex-shrink-0 -translate-y-1/2 place-items-center rounded-full will-change-[transform,background-color]"
              >
                <Icon className={action.iconClassName ?? "h-5 w-5"} />
              </motion.span>
            </motion.a>
          );
        })}
      </motion.div>
    </div>
  );
}
