const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        walkSync(filePath, filelist);
      }
    } else {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        filelist.push(filePath);
      }
    }
  });
  return filelist;
};

const componentsDir = path.join(__dirname, '../components');
const files = walkSync(componentsDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  if (content.includes('max-w-7xl')) {
    // Replace max-w-7xl with w-full or max-w-[1920px]
    // If it's a section container, replacing max-w-7xl with w-full makes it edge-to-edge
    // If there is an existing w-full, replacing max-w-7xl with empty string is better, 
    // but max-w-[1920px] is safer to prevent ultra-ultrawide stretching.
    content = content.replace(/max-w-7xl/g, 'max-w-[1920px]');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
