const fs = require('fs');
const code = fs.readFileSync('app/shop/[slug]/ProductDetailClient.tsx', 'utf8');
const lines = code.split('\n');
let d = 0;
for(let i=0; i<lines.length; i++) {
  const line = lines[i];
  for(let c=0; c<line.length; c++) {
    if (line[c] === '{') d++;
    if (line[c] === '}') d--;
  }
  if (d === 0 && i > 50) {
    console.log(`Depth is 0 on line ${i+1}: ${line}`);
  }
}
