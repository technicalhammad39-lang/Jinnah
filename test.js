const fs = require('fs');
const ts = require('typescript');
const code = fs.readFileSync('app/shop/[slug]/ProductDetailClient.tsx', 'utf8');
const sourceFile = ts.createSourceFile('test.tsx', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
// print syntax errors
const diagnostics = sourceFile.parseDiagnostics;
if (diagnostics.length > 0) {
  diagnostics.forEach(diag => {
    const pos = sourceFile.getLineAndCharacterOfPosition(diag.start);
    console.log(`Line ${pos.line + 1}: ${diag.messageText}`);
  });
} else {
  console.log("No syntax errors found!");
}
