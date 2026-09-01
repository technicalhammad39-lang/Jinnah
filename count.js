const fs = require('fs');
const code = fs.readFileSync('app/shop/[slug]/ProductDetailClient.tsx', 'utf8');
let divOpen = 0;
let divClose = 0;
let bracketOpen = 0;
let bracketClose = 0;
let parenOpen = 0;
let parenClose = 0;

for(let i=0; i<code.length; i++) {
  if (code.slice(i, i+4) === '<div' && (code[i+4] === ' ' || code[i+4] === '>')) divOpen++;
  if (code.slice(i, i+6) === '</div>') divClose++;
  if (code[i] === '{') bracketOpen++;
  if (code[i] === '}') bracketClose++;
  if (code[i] === '(') parenOpen++;
  if (code[i] === ')') parenClose++;
}
console.log({divOpen, divClose, diffDiv: divOpen - divClose, bracketOpen, bracketClose, diffBracket: bracketOpen - bracketClose, parenOpen, parenClose, diffParen: parenOpen - parenClose});
