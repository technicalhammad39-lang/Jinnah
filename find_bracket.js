const fs = require('fs');
const ts = require('typescript');
const code = fs.readFileSync('app/shop/[slug]/ProductDetailClient.tsx', 'utf8');

let depth = 0;
for(let i=0; i<code.length; i++) {
  if (code[i] === '{') depth++;
  if (code[i] === '}') {
    depth--;
    if (depth < 0) {
      const pos = ts.createSourceFile('test', code, ts.ScriptTarget.Latest).getLineAndCharacterOfPosition(i);
      console.log(`Extra } at line ${pos.line + 1}`);
      break;
    }
  }
}
