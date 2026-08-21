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

const appDir = path.join(__dirname, '../app');
const files = walkSync(appDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  if (content.includes('max-w-7xl')) {
    content = content.replace(/max-w-7xl/g, 'max-w-[1920px]');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
