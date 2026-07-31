"use client";

import {
  type ComponentType,
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { PhoneCall } from "lucide-react";

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

const DOCK_TRANSITION = {
  type: "spring" as const,
  stiffness: 280,
  damping: 28,
  mass: 0.78,
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
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 4.25C7.72 4.25 4.25 7.62 4.25 11.78C4.25 13.18 4.64 14.53 5.38 15.72L4.5 19.5L8.39 18.67C9.5 19.28 10.73 19.6 12 19.6C16.28 19.6 19.75 16.23 19.75 12.07C19.75 7.88 16.28 4.25 12 4.25Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.52 8.86C9.67 8.51 9.85 8.45 10.14 8.46C10.33 8.46 10.54 8.47 10.72 8.48C10.95 8.49 11.08 8.54 11.19 8.81C11.31 9.09 11.61 9.82 11.65 9.92C11.7 10.03 11.74 10.17 11.66 10.31C11.58 10.45 11.51 10.53 11.39 10.67C11.27 10.8 11.14 10.97 11.03 11.08C10.91 11.2 10.78 11.34 10.93 11.59C11.08 11.84 11.59 12.68 12.36 13.39C13.35 14.31 14.18 14.61 14.47 14.73C14.76 14.86 14.92 14.84 15.08 14.65C15.27 14.42 15.51 14.04 15.75 13.67C15.86 13.49 16.01 13.46 16.19 13.54C16.38 13.62 17.39 14.12 17.6 14.23C17.81 14.34 17.94 14.39 18 14.49C18.05 14.59 18.04 15.08 17.86 15.48C17.67 15.89 17.11 16.26 16.66 16.35C16.2 16.43 15.62 16.46 14.61 16.09C13.98 15.86 13.17 15.51 12.14 14.62C10.92 13.57 10.11 12.27 9.88 11.94C9.66 11.62 8.99 10.73 8.99 9.79C8.99 9.42 9.16 9.13 9.52 8.86Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function FloatingHeroActions() {
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
    if (activeAction) {
      return activeAction;
    }

    if (canHover && isHovering) {
      return "all";
    }

    return "none";
  }, [activeAction, canHover, isHovering]);

  const transition = reduceMotion ? { duration: 0 } : DOCK_TRANSITION;

  const handleActionClick = (
    event: ReactMouseEvent<HTMLAnchorElement>,
    action: DockAction
  ) => {
    if (activeAction !== action.id) {
      event.preventDefault();
      setActiveAction(action.id);
      return;
    }

    setActiveAction(null);
  };

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[60] sm:right-6 sm:bottom-6 lg:right-8 lg:bottom-8">
      <div
        ref={containerRef}
        className="pointer-events-auto flex flex-col items-center gap-2 rounded-[1.75rem] border border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.68),rgba(255,255,255,0.34))] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.52),0_24px_48px_rgba(22,18,14,0.12)] backdrop-blur-xl"
        onMouseEnter={canHover ? () => setIsHovering(true) : undefined}
        onMouseLeave={
          canHover
            ? () => {
                setIsHovering(false);
              }
            : undefined
        }
      >
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          const isExpanded = expansionMode === "all" || expansionMode === action.id;

          return (
            <motion.a
              key={action.id}
              href={action.href}
              target={action.external ? "_blank" : undefined}
              rel={action.external ? "noopener noreferrer" : undefined}
              aria-label={action.label}
              onClick={(event) => handleActionClick(event, action)}
              animate={{ width: isExpanded ? 184 : 52 }}
              transition={transition}
              className="group flex h-12 items-center justify-start self-center overflow-hidden rounded-full border border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.36))] px-[6px] text-[#181613] shadow-[inset_0_1px_0_rgba(255,255,255,0.58),0_10px_24px_rgba(25,22,18,0.1)] backdrop-blur-xl will-change-[width,transform] hover:-translate-y-0.5"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/68 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                <Icon className={action.iconClassName ?? "h-5 w-5"} />
              </span>

              <motion.span
                animate={
                  isExpanded
                    ? { opacity: 1, x: 0, width: 110, marginLeft: 10 }
                    : { opacity: 0, x: 8, width: 0, marginLeft: 0 }
                }
                transition={transition}
                className="block shrink-0 overflow-hidden whitespace-nowrap pr-3 text-sm font-bold tracking-[0.01em]"
              >
                {action.label}
              </motion.span>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}
