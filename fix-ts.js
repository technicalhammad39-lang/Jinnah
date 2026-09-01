const fs = require('fs');
const targetPath = 'app/shop/[slug]/ProductDetailClient.tsx';
let content = fs.readFileSync(targetPath, 'utf8');

// Fix toggleWishlist
content = content.replace(
  /if \(isWishlisted\) {\s*removeFromWishlist\(initialProduct\.id\);\s*} else {\s*addToWishlist\(initialProduct\);\s*}/g,
  'toggleWishlist(initialProduct);'
);

// Fix appliedRuleName
content = content.replace(
  /<span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded border border-red-200">\s*Save Rs\. \{pricing\.discountAmount\.toLocaleString\(\)\}\s*<\/span>\s*<span className="text-xs text-gray-500 font-medium">Applied: \{pricing\.appliedRuleName\}<\/span>/g,
  '<span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded border border-red-200">\n                          Save Rs. {pricing.discountAmount.toLocaleString()}\n                        </span>'
);

fs.writeFileSync(targetPath, content, 'utf8');
console.log("TypeScript errors fixed!");
