"use client";

import { SpaceCard, type SpaceCardTheme } from "./SpaceCard";

export function DiscoverBySpace() {
  const themes: SpaceCardTheme[] = [
    {
      background: "linear-gradient(145deg, #171311 0%, #070706 54%, #000000 100%)",
      hoverBackground: "linear-gradient(145deg, #211713 0%, #0b0a09 52%, #000000 100%)",
      border: "rgba(255, 241, 225, 0.16)",
      badge: "linear-gradient(145deg, rgba(255,255,255,0.18), rgba(255,255,255,0.045))",
      badgeBorder: "rgba(255, 246, 236, 0.28)",
      text: "#fff7ef",
      muted: "rgba(255, 247, 239, 0.72)",
      glow: "rgba(255, 106, 42, 0.42)",
      softGlow: "rgba(255, 155, 84, 0.18)",
      highlight: "rgba(255, 235, 214, 0.13)",
      shadow: "0 28px 82px -34px rgba(0, 0, 0, 0.92), inset 0 1px 0 rgba(255,255,255,0.14)",
      pattern: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 34%), radial-gradient(circle at 50% -10%, rgba(255,106,42,0.22), transparent 30%)",
      iconRotate: -6,
    },
    {
      background: "linear-gradient(145deg, #191512 0%, #0a0908 50%, #030202 100%)",
      hoverBackground: "linear-gradient(145deg, #261a13 0%, #100d0b 50%, #040302 100%)",
      border: "rgba(255, 229, 203, 0.15)",
      badge: "linear-gradient(145deg, rgba(255,255,255,0.19), rgba(255,255,255,0.05))",
      badgeBorder: "rgba(255, 235, 212, 0.28)",
      text: "#fff7ef",
      muted: "rgba(255, 247, 239, 0.72)",
      glow: "rgba(255, 116, 38, 0.44)",
      softGlow: "rgba(255, 190, 114, 0.16)",
      highlight: "rgba(255, 238, 214, 0.14)",
      shadow: "0 28px 82px -34px rgba(0, 0, 0, 0.92), inset 0 1px 0 rgba(255,255,255,0.13)",
      pattern: "linear-gradient(115deg, rgba(255,255,255,0.075) 0%, transparent 38%), radial-gradient(circle at 50% -10%, rgba(255,143,54,0.20), transparent 30%)",
      iconRotate: 7,
    },
    {
      background: "linear-gradient(145deg, #18191d 0%, #0b0c0f 52%, #000000 100%)",
      hoverBackground: "linear-gradient(145deg, #232429 0%, #111217 52%, #020202 100%)",
      border: "rgba(239, 244, 250, 0.15)",
      badge: "linear-gradient(145deg, rgba(255,255,255,0.18), rgba(255,255,255,0.045))",
      badgeBorder: "rgba(238, 242, 248, 0.26)",
      text: "#fff7ef",
      muted: "rgba(255, 247, 239, 0.70)",
      glow: "rgba(255, 106, 42, 0.40)",
      softGlow: "rgba(255, 141, 71, 0.15)",
      highlight: "rgba(255, 255, 255, 0.12)",
      shadow: "0 28px 82px -34px rgba(0, 0, 0, 0.94), inset 0 1px 0 rgba(255,255,255,0.13)",
      pattern: "linear-gradient(140deg, rgba(255,255,255,0.075), transparent 42%), radial-gradient(circle at 50% -10%, rgba(255,106,42,0.18), transparent 30%)",
      iconRotate: -5,
    },
    {
      background: "linear-gradient(145deg, #11100e 0%, #050505 52%, #000000 100%)",
      hoverBackground: "linear-gradient(145deg, #1c1712 0%, #0a0908 52%, #000000 100%)",
      border: "rgba(255, 231, 206, 0.14)",
      badge: "linear-gradient(145deg, rgba(255,255,255,0.17), rgba(255,255,255,0.04))",
      badgeBorder: "rgba(255, 232, 207, 0.25)",
      text: "#fffaf4",
      muted: "rgba(255, 250, 244, 0.70)",
      glow: "rgba(255, 106, 42, 0.43)",
      softGlow: "rgba(255, 178, 96, 0.16)",
      highlight: "rgba(255, 239, 220, 0.12)",
      shadow: "0 28px 82px -34px rgba(0, 0, 0, 0.95), inset 0 1px 0 rgba(255,255,255,0.12)",
      pattern: "linear-gradient(120deg, rgba(255,255,255,0.07) 0%, transparent 36%), radial-gradient(circle at 50% -10%, rgba(255,106,42,0.20), transparent 30%)",
      iconRotate: 6,
    },
    {
      background: "linear-gradient(145deg, #17120f 0%, #070605 50%, #000000 100%)",
      hoverBackground: "linear-gradient(145deg, #241811 0%, #0c0907 50%, #000000 100%)",
      border: "rgba(255, 234, 214, 0.15)",
      badge: "linear-gradient(145deg, rgba(255,255,255,0.19), rgba(255,255,255,0.05))",
      badgeBorder: "rgba(255, 235, 218, 0.27)",
      text: "#fff7ef",
      muted: "rgba(255, 247, 239, 0.72)",
      glow: "rgba(255, 111, 31, 0.43)",
      softGlow: "rgba(255, 150, 70, 0.16)",
      highlight: "rgba(255, 255, 255, 0.13)",
      shadow: "0 28px 82px -34px rgba(0, 0, 0, 0.93), inset 0 1px 0 rgba(255,255,255,0.13)",
      pattern: "linear-gradient(130deg, rgba(255,255,255,0.075) 0%, transparent 42%), radial-gradient(circle at 50% -10%, rgba(255,106,42,0.21), transparent 30%)",
      iconRotate: -7,
    },
    {
      background: "linear-gradient(145deg, #151615 0%, #070808 48%, #000000 100%)",
      hoverBackground: "linear-gradient(145deg, #20211f 0%, #0d0f0e 48%, #000000 100%)",
      border: "rgba(255, 255, 255, 0.16)",
      badge: "linear-gradient(145deg, rgba(255,255,255,0.18), rgba(255,255,255,0.045))",
      badgeBorder: "rgba(255, 255, 255, 0.28)",
      text: "#fff7ef",
      muted: "rgba(255, 247, 239, 0.70)",
      glow: "rgba(255, 106, 42, 0.40)",
      softGlow: "rgba(255, 158, 86, 0.15)",
      highlight: "rgba(255, 255, 255, 0.12)",
      shadow: "0 28px 82px -34px rgba(0, 0, 0, 0.94), inset 0 1px 0 rgba(255,255,255,0.13)",
      pattern: "linear-gradient(135deg, rgba(255,255,255,0.075) 0%, transparent 38%), radial-gradient(circle at 50% -10%, rgba(255,106,42,0.19), transparent 30%)",
      iconRotate: 5,
    },
  ];

  const spaces = [
    {
      title: "Doors & Entry",
      items: ["Smart Locks", "Door Handles", "Premium Hinges", "Door Closers"],
      iconSrc: "/door.png",
      iconAlt: "3D smart lock and key icon",
      theme: themes[0],
      href: "/shop?space=doors-entry",
    },
    {
      title: "Kitchen",
      items: ["Cabinet Handles", "Channels", "Kitchen Accessories", "PVC Sheets"],
      iconSrc: "/kitchen.png",
      iconAlt: "3D premium kitchen icon",
      theme: themes[1],
      href: "/shop?space=kitchen",
    },
    {
      title: "Bedroom",
      items: ["Wardrobe Hardware", "Sliding Systems", "Soft Close Fittings", "Cabinet Locks"],
      iconSrc: "/bedroom.png",
      iconAlt: "3D bedroom interior icon",
      theme: themes[2],
      href: "/shop?space=bedroom",
    },
    {
      title: "Office",
      items: ["Glass Hardware", "Door Systems", "Security Locks", "Office Accessories"],
      iconSrc: "/office.png",
      iconAlt: "3D office building icon",
      theme: themes[3],
      href: "/shop?space=office",
    },
    {
      title: "Interior Finishing",
      items: ["UV Sheets", "Decorative Panels", "Wood Beading", "Wall Profiles"],
      iconSrc: "/interior.png",
      iconAlt: "3D interior finishing icon",
      theme: themes[4],
      href: "/shop?space=interior-finishing",
    },
    {
      title: "Workshop",
      items: ["Power Tools", "Measuring Tools", "Cutting Tools", "Tool Accessories"],
      iconSrc: "/tools.png",
      iconAlt: "3D workshop tools icon",
      theme: themes[5],
      href: "/shop?space=workshop",
    }
  ];

  return (
    <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden bg-transparent z-10">
      {/* Background Engine */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Soft warm architectural background */}
        <div className="absolute inset-0 bg-[#faf9f6]" />
        
        {/* Subtle SVG grid texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        
        {/* Radial lighting / Ambient glow behind the section */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] md:w-[50vw] md:h-[50vw] rounded-full bg-[#FF6A2A]/5 blur-[120px]" />
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[10%] left-[20%] w-2 h-2 bg-black/5 rounded-full animate-[ping_5s_ease-in-out_infinite]" />
          <div className="absolute top-[70%] left-[80%] w-3 h-3 bg-[#FF6A2A]/10 rounded-full animate-[pulse_4s_ease-in-out_infinite]" />
          <div className="absolute top-[40%] left-[90%] w-1.5 h-1.5 bg-black/10 rounded-full animate-[ping_6s_ease-in-out_infinite_2s]" />
          <div className="absolute top-[80%] left-[10%] w-2 h-2 bg-[#FF6A2A]/5 rounded-full animate-[pulse_5s_ease-in-out_infinite_1s]" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24 space-y-6">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-4 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest backdrop-blur-sm"
          >
            <span className="w-2 h-2 rounded-full bg-[#FF6A2A] animate-pulse" />
            <span>DISCOVER BY SPACE</span>
          </div>
          
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-[#1a1917] leading-[1.05]"
          >
            Find Products For <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A2A] to-[#FF9A55] font-stylish normal-case text-[1.1em]">
              Every Space
            </span>
          </h2>

          <p
            className="text-sm md:text-base text-muted-foreground leading-relaxed font-medium max-w-2xl mx-auto"
          >
            Whether you&apos;re building a new home, renovating a kitchen, upgrading office interiors, or completing a commercial project, discover carefully curated hardware collections designed for every environment.
          </p>
        </div>

        {/* Space Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
          {spaces.map((space) => (
            <SpaceCard 
              key={space.title}
              title={space.title}
              items={space.items}
              iconSrc={space.iconSrc}
              iconAlt={space.iconAlt}
              theme={space.theme}
              href={space.href}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
