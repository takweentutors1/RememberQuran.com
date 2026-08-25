const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const regex = /<button[^>]*>/gi;

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx')) {
    const content = fs.readFileSync(filePath, 'utf8');
    let match;
    const lines = content.split('\n');
    while ((match = regex.exec(content)) !== null) {
      const buttonTag = match[0];
      // if it has no aria-label and has a title
      if (buttonTag.includes('title=') && !buttonTag.includes('aria-label=')) {
        console.log(`[Missing aria-label but has title] ${filePath}`);
        console.log(`  ${buttonTag.replace(/\n/g, ' ')}`);
      }
      
      // if it's size="icon" or icon-sm and no aria-label
      if (buttonTag.includes('size="icon') && !buttonTag.includes('aria-label=')) {
         console.log(`[Icon size but no aria-label] ${filePath}`);
         console.log(`  ${buttonTag.replace(/\n/g, ' ')}`);
      }
    }
  }
});
