const fs = require('fs');

const targetPath = 'app/shop/[slug]/ProductDetailClient.tsx';
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Imports
content = content.replace(
  /import {([\s\S]*?)ThumbsUp\n} from "lucide-react";/,
  `import {\n  ShoppingCart,\n  Heart,\n  Check,\n  Loader2,\n  MessageCircle,\n  Star,\n  ChevronRight,\n  ShieldCheck,\n  Truck,\n  RotateCcw,\n  Zap,\n  ThumbsUp,\n  ChevronLeft,\n  Minus,\n  Plus,\n  Info\n} from "lucide-react";`
);

content = content.replace(
  /import {([\s\S]*?)useOverlayActions,\n} from "@\/context\/AppContext";/,
  `import {\n  useCartActions,\n  useWishlistActions,\n  useWishlistState,\n  useOverlayActions,\n  useCartState\n} from "@/context/AppContext";\nimport { calculateProductPrice } from "@/lib/discount-engine";`
);

// 2. State and Add to Cart hooks
content = content.replace(
  /const { addToCart } = useCartActions\(\);/,
  `const { addToCart } = useCartActions();\n  const { discounts } = useCartState();`
);

content = content.replace(
  /const \[selectedSize, setSelectedSize\] = useState\(""\);/,
  `const [selectedSize, setSelectedSize] = useState("");\n  const [quantity, setQuantity] = useState(1);`
);

// handleBuyNow
content = content.replace(
  /addToCart\(initialProduct, 1, selectedColor, selectedSize\);/g,
  `addToCart(initialProduct, quantity, selectedColor, selectedSize);`
);

// handleAddToCart (which has a timeout)
// Wait, we replaced all occurrences above, so handleAddToCart is also updated.

// 3. Main structural replacement
const oldMainLayoutStart = content.indexOf('<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">');
const oldMainLayoutEnd = content.indexOf('{/* Tabs Section (Description, Features, Specifications, Reviews) */}');

if (oldMainLayoutStart === -1 || oldMainLayoutEnd === -1 || oldMainLayoutStart > oldMainLayoutEnd) {
    console.error("Could not find main layout", {oldMainLayoutStart, oldMainLayoutEnd});
    process.exit(1);
}

const beforeLayout = content.substring(0, oldMainLayoutStart);
const afterLayout = content.substring(oldMainLayoutEnd);

const newLayout = `<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
          {/* LEFT: Image Gallery (col-span-4) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <div className="aspect-square rounded-2xl overflow-hidden bg-white border border-gray-200 mb-4 shadow-sm relative group">
                <img
                  src={activeImage || initialProduct.image || "/placeholder.jpg"}
                  alt={initialProduct.name}
                  className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                />
                {initialProduct.discount > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                    -{initialProduct.discount}%
                  </div>
                )}
                {/* Wishlist Button Overlay */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (isWishlisted) {
                      removeFromWishlist(initialProduct.id);
                    } else {
                      addToWishlist(initialProduct);
                    }
                  }}
                  className="absolute top-4 right-4 h-10 w-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm text-gray-400 hover:text-red-500 hover:scale-110 transition-all border border-gray-100"
                >
                  <Heart className={\`h-5 w-5 \${isWishlisted ? "fill-red-500 text-red-500" : ""}\`} />
                </button>
              </div>
              
              {/* Thumbnails */}
              {initialProduct.images && initialProduct.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {initialProduct.images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={\`aspect-square rounded-xl overflow-hidden border-2 transition-all \${
                        activeImage === img ? "border-primary shadow-sm" : "border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100"
                      }\`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CENTER: Product Info & Actions (col-span-5) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-3">
                <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-md">{initialProduct.brand}</span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-500">{initialProduct.category}</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-black text-[#1a1917] tracking-tight leading-tight mb-4">
                {initialProduct.name}
              </h1>

              {/* Ratings & Sold */}
              <div className="flex items-center gap-4 text-sm mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center text-amber-400">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current opacity-50" />
                  </div>
                  <span className="font-bold text-gray-900 ml-1">4.8</span>
                  <span className="text-gray-500 underline decoration-gray-300 underline-offset-4 cursor-pointer hover:text-primary">
                    ({initialProduct.reviewCount || 0} Reviews)
                  </span>
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                <div className="text-gray-500 font-medium">
                  <span className="text-gray-900 font-bold">1.2k+</span> Sold
                </div>
              </div>

              {/* Pricing Section */}
              {(() => {
                const pricing = calculateProductPrice(initialProduct.price, initialProduct.id, discounts);
                return (
                  <div className="flex flex-col gap-1 mb-8">
                    <div className="flex items-end gap-3">
                      <span className="text-4xl font-black text-gray-900 tracking-tight">
                        Rs. {pricing.finalPrice.toLocaleString()}
                      </span>
                      {pricing.hasDiscount && (
                        <span className="text-xl text-gray-400 line-through font-medium mb-1">
                          Rs. {initialProduct.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {pricing.hasDiscount && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded border border-red-200">
                          Save Rs. {pricing.discountAmount.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">Applied: {pricing.appliedRuleName}</span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Variants */}
            <div className="space-y-6 mb-8">
              {initialProduct.colors && initialProduct.colors.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-gray-900">
                      Color <span className="text-gray-500 font-normal ml-1">{selectedColor}</span>
                    </h3>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {initialProduct.colors.map((color: string) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={\`h-11 w-11 rounded-full border-2 transition-all flex items-center justify-center shadow-sm \${
                          selectedColor === color
                            ? "border-primary ring-2 ring-primary/20 ring-offset-2 scale-110"
                            : "border-gray-200 hover:border-gray-400 hover:scale-105"
                        }\`}
                        style={{ backgroundColor: color }}
                        title={color}
                      >
                         {selectedColor === color && (
                            <Check className={\`h-5 w-5 \${['white','#ffffff','#fff'].includes(color.toLowerCase()) ? 'text-black' : 'text-white'}\`} />
                         )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {initialProduct.sizes && initialProduct.sizes.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-gray-900">
                      Size <span className="text-gray-500 font-normal ml-1">{selectedSize}</span>
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {initialProduct.sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={\`min-w-[3rem] px-4 py-2.5 rounded-lg text-sm font-bold transition-all border \${
                          selectedSize === size
                            ? "bg-gray-900 text-white border-gray-900 shadow-md"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                        }\`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Add to Cart / Purchase Form (Desktop Inline) */}
            <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 mb-6 hidden sm:block">
              
              {/* Quantity */}
              <div className="mb-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50"
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <div className="w-12 h-10 flex items-center justify-center font-bold text-gray-900 border-x border-gray-100">
                      {quantity}
                    </div>
                    <button 
                      onClick={() => setQuantity(Math.min(initialProduct.stockQuantity || 99, quantity + 1))}
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50"
                      disabled={quantity >= (initialProduct.stockQuantity || 99)}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="text-sm">
                    {initialProduct.stockQuantity > 0 ? (
                      <div className="flex flex-col">
                        <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                          <Check className="h-4 w-4" /> In Stock
                        </span>
                        {initialProduct.stockQuantity <= 5 && (
                          <span className="text-xs text-amber-600 font-medium">Only {initialProduct.stockQuantity} left</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-red-500 font-bold">Out of Stock</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleBuyNow}
                  disabled={initialProduct.stockQuantity <= 0}
                  className={\`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-black uppercase tracking-wider shadow-md transition-all \${
                    initialProduct.stockQuantity <= 0
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5"
                  }\`}
                >
                  <Zap className="h-5 w-5" /> Buy Now
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding || isSuccess || initialProduct.stockQuantity <= 0}
                  className={\`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold uppercase tracking-wider shadow-sm transition-all border-2 \${
                    initialProduct.stockQuantity <= 0
                      ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                      : isSuccess
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                      : "bg-white text-gray-900 border-gray-200 hover:border-gray-900 hover:bg-gray-50"
                  }\`}
                >
                  {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : isSuccess ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
                  {isSuccess ? "Added to Cart" : "Add to Cart"}
                </button>
              </div>
            </div>
            
            {/* Short Description */}
            <div className="prose prose-sm text-gray-600 max-w-none">
              <p>{initialProduct.description?.substring(0, 200)}...</p>
            </div>
          </div>

          {/* RIGHT: Delivery & Trust Panel (col-span-3) */}
          <div className="lg:col-span-3">
             <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm sticky top-24">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-5 flex items-center gap-2 pb-4 border-b border-gray-100">
                  <Truck className="h-4 w-4 text-primary" /> Delivery & Services
                </h3>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="text-gray-400 shrink-0 mt-0.5">
                      <Truck className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-1">Standard Delivery</h4>
                      <p className="text-xs text-gray-500 mb-1">2-4 Working Days</p>
                      <div className="text-xs font-bold text-emerald-600">Free Delivery</div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="text-gray-400 shrink-0 mt-0.5">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-1">100% Authentic</h4>
                      <p className="text-xs text-gray-500">Genuine products directly from manufacturers or authorized distributors.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="text-gray-400 shrink-0 mt-0.5">
                      <RotateCcw className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-1">7 Days Return</h4>
                      <p className="text-xs text-gray-500">Change of mind is not applicable. Returns accepted for damaged or incorrect items.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="text-gray-400 shrink-0 mt-0.5">
                      <ThumbsUp className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-1">Warranty</h4>
                      <p className="text-xs text-gray-500">Brand warranty applies as per manufacturer terms.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-4 flex-wrap justify-between">
                  <div className="text-xs text-gray-500 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Secure Checkout
                  </div>
                  <div className="flex gap-2 opacity-60 grayscale">
                    {/* Placeholder for payment icons if needed */}
                    <div className="h-5 w-8 bg-gray-200 rounded"></div>
                    <div className="h-5 w-8 bg-gray-200 rounded"></div>
                    <div className="h-5 w-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
             </div>
          </div>
        </div>\n\n        `;

content = beforeLayout + newLayout + afterLayout;

// 4. Update the bottom bar (make it mobile only!)
const oldBottomBarStart = content.lastIndexOf('{/* Universal Sticky Bottom Purchase Bar (Desktop & Mobile) */}');
const oldBottomBarEnd = content.lastIndexOf('<Footer />');

if (oldBottomBarStart === -1 || oldBottomBarEnd === -1 || oldBottomBarStart > oldBottomBarEnd) {
    console.error("Could not find bottom bar", {oldBottomBarStart, oldBottomBarEnd});
    process.exit(1);
}

// Find the precise start of the `<Footer />` tag.
const beforeBottomBar = content.substring(0, oldBottomBarStart);
const afterBottomBar = content.substring(oldBottomBarEnd);

const newBottomBar = `{/* Mobile Only Sticky Bottom Purchase Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-xl border-t border-gray-200 z-50 flex items-center justify-between shadow-[0_-8px_30px_rgba(0,0,0,0.08)] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={handleBuyNow}
            disabled={initialProduct.stockQuantity <= 0}
            className={\`flex-1 flex items-center justify-center gap-2 rounded-lg py-3.5 text-sm font-black uppercase tracking-wider shadow-md transition-all \${
              initialProduct.stockQuantity <= 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-primary text-white"
            }\`}
          >
            <Zap className="h-4 w-4" /> Buy Now
          </button>
          <button
            onClick={handleAddToCart}
            disabled={isAdding || isSuccess || initialProduct.stockQuantity <= 0}
            className={\`flex h-[3.25rem] w-[3.25rem] flex-shrink-0 items-center justify-center rounded-lg shadow-md transition-all border \${
              initialProduct.stockQuantity <= 0
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : isSuccess
                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                : "bg-white text-gray-900 border-gray-200"
            }\`}
          >
            {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : isSuccess ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
          </button>
        </div>
      </div>\n\n      `;

content = beforeBottomBar + newBottomBar + afterBottomBar;

fs.writeFileSync(targetPath, content, 'utf8');
console.log("Successfully rewrote ProductDetailClient.tsx");
