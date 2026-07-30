export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  categorySlug: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  images: string[];
  colors: string[];
  sizes: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
  discount?: number;
  freeShipping?: boolean;
  description: string;
  specifications: Record<string, string>;
  features: string[];
  availability: "In Stock" | "Low Stock" | "Out of Stock";
}

export interface Brand {
  id: string;
  name: string;
  logoText: string;
  description: string;
  categories: string[];
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
}

export const CATEGORIES = [
  {
    id: "architectural",
    name: "Architectural Hardware",
    slug: "architectural-hardware",
    count: 24,
    description: "Solid forged brass entry handlesets, lever pulls, and precision hinges.",
    image: "https://picsum.photos/seed/arch-hw/800/600",
  },
  {
    id: "security",
    name: "Locks & Security",
    slug: "locks-security",
    count: 18,
    description: "Smart biometric deadbolts, heavy-duty locksets, and secure access systems.",
    image: "https://picsum.photos/seed/security-hw/800/600",
  },
  {
    id: "cabinet",
    name: "Cabinet Hardware",
    slug: "cabinet-hardware",
    count: 32,
    description: "Minimalist knobs, knurled brass drawer pulls, and soft-close mechanics.",
    image: "https://picsum.photos/seed/cabinet-hw/800/600",
  },
  {
    id: "tools",
    name: "Power Tools",
    slug: "power-tools",
    count: 15,
    description: "Brushless cordless drills, heavy-duty saws, and precision digital measurers.",
    image: "https://picsum.photos/seed/tools-hw/800/600",
  },
  {
    id: "electrical",
    name: "Electrical Accessories",
    slug: "electrical-accessories",
    count: 21,
    description: "Sleek matte switches, pop-up floor outlets, and smart home modules.",
    image: "https://picsum.photos/seed/elec-hw/800/600",
  },
];

export const BRANDS: Brand[] = [
  {
    id: "veritas",
    name: "Veritas Steel",
    logoText: "V",
    description: "German-engineered heavy structural fittings and security systems.",
    categories: ["Locks & Security", "Architectural Hardware"],
  },
  {
    id: "aurum",
    name: "Aurum Brass",
    logoText: "Au",
    description: "Italian-designed solid forged brass fittings for elite architectural works.",
    categories: ["Architectural Hardware", "Cabinet Hardware"],
  },
  {
    id: "krypter",
    name: "Krypter Biometrics",
    logoText: "K",
    description: "Next-gen smart locks and high-security access control mechanisms.",
    categories: ["Locks & Security"],
  },
  {
    id: "apex",
    name: "Apex Brushless",
    logoText: "A",
    description: "Industrial grade high-torque brushless power systems and laser levels.",
    categories: ["Power Tools"],
  },
  {
    id: "lumos",
    name: "Lumos Premium",
    logoText: "L",
    description: "Architectural grade electrical interfaces and minimalist flush plates.",
    categories: ["Electrical Accessories"],
  },
];

export const PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Knurled Brass Entry Lever Set",
    brand: "Aurum Brass",
    category: "Architectural Hardware",
    categorySlug: "architectural-hardware",
    price: 189.00,
    originalPrice: 245.00,
    rating: 4.9,
    reviewCount: 78,
    images: [
      "https://picsum.photos/seed/brasslever1/800/1000",
      "https://picsum.photos/seed/brasslever2/800/1000",
      "https://picsum.photos/seed/brasslever3/800/1000",
    ],
    colors: ["#c5a059", "#111111", "#a0a0a0"], // Antique Gold, Matte Black, Satin Chrome
    sizes: ["60mm Backset", "72mm Backset", "85mm Backset"],
    isNew: true,
    isBestSeller: true,
    discount: 22,
    freeShipping: true,
    description: "Forged from 100% solid brass, this entry lever set features a diamond-knurled texture for tactile refinement and robust grip. Designed for modern luxury doors, its internal spring system operates with zero-slop Swiss precision.",
    specifications: {
      "Material": "Solid Forged Brass",
      "Finish": "Satin Brass PVD Coating",
      "Spindle Width": "8mm",
      "Durability Standard": "Grade 1 (Over 800,000 cycles)",
      "Included Components": "Two levers, keyway cylinders, mounting plates, heavy latch",
    },
    features: [
      "Heavy-weight solid feeling (1.2kg per set)",
      "PVD physical vapor deposition coating prevents tarnish or rust for 25 years",
      "Patented low-friction spring-cassette prevents handle-droop",
      "Suitable for doors with thicknesses between 35mm and 55mm",
    ],
    availability: "In Stock",
  },
  {
    id: "prod-2",
    name: "Krypter Biometric Mortise Smart Lock",
    brand: "Krypter Biometrics",
    category: "Locks & Security",
    categorySlug: "locks-security",
    price: 349.00,
    originalPrice: 349.00,
    rating: 4.8,
    reviewCount: 56,
    images: [
      "https://picsum.photos/seed/smartlock1/800/1000",
      "https://picsum.photos/seed/smartlock2/800/1000",
    ],
    colors: ["#111111", "#444444"], // Dark Charcoal, Space Gray
    sizes: ["Standard Mortise", "Multipoint Mortise"],
    isNew: true,
    freeShipping: true,
    description: "The peak of home security. The Krypter Biometric Smart Lock integrates a high-resolution optical fingerprint scanner, encrypted RF keypad, and emergency mechanical override inside a unified aerospace-grade zinc alloy body.",
    specifications: {
      "Fingerprint Capacity": "100 unique prints",
      "Battery Life": "Up to 14 months (4x AA batteries)",
      "Backset Range": "60mm to 70mm adjustable",
      "Wireless Protocol": "Bluetooth 5.2 / Wi-Fi Hub",
      "Locking Mechanism": "3-bolt deadlocking latch with anti-saw steel core",
    },
    features: [
      "0.3-second instant fingerprint recognition",
      "Integrated emergency USB-C power bank contact point",
      "Automated auto-lock upon closing door",
      "Activity feed and temporary digital keys via secure mobile app",
    ],
    availability: "In Stock",
  },
  {
    id: "prod-3",
    name: "Satin Nickel Hexagonal T-Bar Cabinet Pull",
    brand: "Aurum Brass",
    category: "Cabinet Hardware",
    categorySlug: "cabinet-hardware",
    price: 14.50,
    originalPrice: 19.99,
    rating: 4.7,
    reviewCount: 124,
    images: [
      "https://picsum.photos/seed/cabpull1/800/1000",
      "https://picsum.photos/seed/cabpull2/800/1000",
    ],
    colors: ["#d0d0d0", "#c5a059", "#111111"], // Satin Nickel, Antique Gold, Matte Black
    sizes: ["96mm CTC", "128mm CTC", "160mm CTC", "224mm CTC"],
    isBestSeller: true,
    discount: 27,
    freeShipping: false,
    description: "An elegant architectural detail that transforms cabinetry. Featuring a distinctive hexagonal cross-section, this solid-metal T-bar pull provides an industrial yet sleek aesthetic to custom kitchens and credenzas.",
    specifications: {
      "Material": "Solid Zinc Alloy / Solid Brass hybrid",
      "Total Length": "180mm (for 128mm version)",
      "Base Width": "12mm",
      "Projection": "34mm",
      "Thread Type": "#8-32 standard break-away mounting screws included",
    },
    features: [
      "Hexagonal grip prevents visual rotation misalignment",
      "Comfortable finger clearance profile",
      "Rustproof and wear-resistant polymer topcoat",
      "Individually wrapped to prevent shipping scratches",
    ],
    availability: "In Stock",
  },
  {
    id: "prod-4",
    name: "Apex 20V Max Brushless Impact Driver",
    brand: "Apex Brushless",
    category: "Power Tools",
    categorySlug: "power-tools",
    price: 219.00,
    originalPrice: 269.00,
    rating: 4.95,
    reviewCount: 42,
    images: [
      "https://picsum.photos/seed/apexdrill1/800/1000",
      "https://picsum.photos/seed/apexdrill2/800/1000",
    ],
    colors: ["#ff5a1f", "#111111"], // Brand Orange, Brand Dark
    sizes: ["Standard Kit (2.0Ah)", "PRO Kit (5.0Ah)"],
    isNew: true,
    discount: 18,
    freeShipping: true,
    description: "Built for heavy framing, deck construction, and industrial workshops. Delivering up to 2,200 in-lbs of brushless torque, this compact impact driver maximizes runtime and power under peak continuous loads.",
    specifications: {
      "Motor Type": "High-Efficiency Brushless",
      "Max Torque": "2,200 in-lbs / 250 Nm",
      "No-Load Speed": "0-1100 / 0-2300 / 0-3400 RPM",
      "Impact Rate": "0-4000 IPM",
      "Chuck Size": "1/4\" Hex Quick Release",
    },
    features: [
      "Integrated 3-LED bright shadows-free ring light around chuck",
      "4-mode speed and drive selector including Auto-Tapping screw mode",
      "All-metal gear transmission housing for maximum durability",
      "Ultra-compact footprint at just 114mm front-to-back length",
    ],
    availability: "Low Stock",
  },
  {
    id: "prod-5",
    name: "Lumos Minimalist Glass Dual Switch",
    brand: "Lumos Premium",
    category: "Electrical Accessories",
    categorySlug: "electrical-accessories",
    price: 42.00,
    originalPrice: 42.00,
    rating: 4.6,
    reviewCount: 33,
    images: [
      "https://picsum.photos/seed/switch1/800/1000",
      "https://picsum.photos/seed/switch2/800/1000",
    ],
    colors: ["#ffffff", "#111111", "#a0a0a0"], // Pearl White, Obsidian Black, Titanium Gray
    sizes: ["Single Gang", "Double Gang"],
    description: "Replace standard plastic panels with architectural glass elegance. The Lumos plate features high-purity tempered safety glass with flush micro-switches that respond with an extremely crisp tactile click.",
    specifications: {
      "Voltage Rating": "110V - 250V AC",
      "Amperage Support": "16A inductive load",
      "Plate Material": "4mm Tempered Glass with Beveled Edges",
      "Mounting Pattern": "Standard UK/EU and US pattern options available",
    },
    features: [
      "Scratch-resistant and fire-retardant safety glass",
      "Subtle amber LED backlight when switched OFF (locatable in pitch dark)",
      "Completely flush mechanical toggle design",
      "Includes premium matching mounting screws and steel subframe",
    ],
    availability: "In Stock",
  },
  {
    id: "prod-6",
    name: "Solid Brass Heavy Pivoting Hinge",
    brand: "Veritas Steel",
    category: "Architectural Hardware",
    categorySlug: "architectural-hardware",
    price: 79.50,
    originalPrice: 99.00,
    rating: 4.85,
    reviewCount: 19,
    images: [
      "https://picsum.photos/seed/hinge1/800/1000",
      "https://picsum.photos/seed/hinge2/800/1000",
    ],
    colors: ["#c5a059", "#d0d0d0"], // Brass, Chrome
    sizes: ["100x100mm", "125x125mm"],
    discount: 20,
    description: "Heavy-duty dual-axis pivot hinge for premium extra-thick entrance doors. Engineered with dual ball bearing assemblies to support up to 150kg door weights with effortless, silent fluid swings.",
    specifications: {
      "Load Capacity": "150kg per pair",
      "Hinge Pin": "Hardened stainless steel (non-removable for security)",
      "Bearing Type": "Double precision sealed ball bearings",
      "Thickness": "4.0mm solid metal plates",
    },
    features: [
      "Includes solid brass security studs to prevent tampering",
      "Extremely smooth swing motion (fluid dynamic tests to 500k cycles)",
      "Supplied with heavy stainless steel wood screws and concrete masonry anchors",
    ],
    availability: "In Stock",
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Luxury Penthouse Entrance",
    category: "Projects",
    image: "https://picsum.photos/seed/gal1/1000/800",
    description: "Aurum Solid Brass Levers implemented on a 3-meter custom walnut master entrance pivot door."
  },
  {
    id: "gal-2",
    title: "The Industrial Kitchenette",
    category: "Products",
    image: "https://picsum.photos/seed/gal2/1000/800",
    description: "Hexagonal Satin Nickel Cabinet pulls on seamless charcoal matte cabinets."
  },
  {
    id: "gal-3",
    title: "High-Security Office Vault",
    category: "Store",
    image: "https://picsum.photos/seed/gal3/1000/800",
    description: "Integrated Krypter smart locks and Veritas heavy structural systems guarding secure server hubs."
  },
  {
    id: "gal-4",
    title: "Our Flagship Hardware Showroom",
    category: "Store",
    image: "https://picsum.photos/seed/gal4/1000/800",
    description: "A digital walkthrough and physical display of raw materials, tools, and bespoke fittings."
  },
  {
    id: "gal-5",
    title: "Precision Laser Leveling",
    category: "Projects",
    image: "https://picsum.photos/seed/gal5/1000/800",
    description: "Our high-precision Apex measurement modules deployed during custom residential timber framing."
  }
];
