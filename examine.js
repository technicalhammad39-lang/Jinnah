const fs = require('fs');
const code = fs.readFileSync('app/shop/[slug]/ProductDetailClient.tsx', 'utf8');

const s1 = code.indexOf('<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">');
const s2 = code.indexOf('{/* Tabs Section (Description, Features, Specifications, Reviews) */}');
const s3 = code.indexOf('{/* Universal Sticky Bottom Purchase Bar (Desktop & Mobile) */}');
const s4 = code.indexOf('<Footer />');

console.log({s1, s2, s3, s4});
