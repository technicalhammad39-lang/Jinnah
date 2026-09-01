const fs = require('fs');
const targetPath = 'app/shop/[slug]/ProductDetailClient.tsx';
let content = fs.readFileSync(targetPath, 'utf8');

// Replace lucide-react imports
content = content.replace(
  /import \{([^}]*)\} from "lucide-react";/,
  `import {\n  ShoppingCart,\n  Heart,\n  Check,\n  Loader2,\n  MessageCircle,\n  Star,\n  ChevronRight,\n  ShieldCheck,\n  Truck,\n  RotateCcw,\n  Zap,\n  ThumbsUp,\n  ChevronLeft,\n  Minus,\n  Plus,\n  Info\n} from "lucide-react";`
);

// Replace AppContext imports and add discount-engine
content = content.replace(
  /import \{([^}]*)\} from "@\/context\/AppContext";/,
  `import {\n  useCartActions,\n  useWishlistActions,\n  useWishlistState,\n  useOverlayActions,\n  useCartState\n} from "@/context/AppContext";\nimport { calculateProductPrice } from "@/lib/discount-engine";`
);

fs.writeFileSync(targetPath, content, 'utf8');
console.log("Imports fixed!");
