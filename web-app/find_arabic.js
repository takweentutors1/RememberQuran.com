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

const fontClasses = ['font-uthmani', 'quran-arabic', 'font-arabic', 'font-arabic-ui', 'font-noto-naskh', 'font-amiri-quran'];
const regex = /<[^>]+className={?[^>]+>[^<]*/gi;

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx')) {
    const content = fs.readFileSync(filePath, 'utf8');
    let match;
    const lines = content.split('\n');
    while ((match = regex.exec(content)) !== null) {
      const tag = match[0];
      const hasArabicClass = fontClasses.some(c => tag.includes(c));
      if (hasArabicClass) {
        if (!tag.includes('lang="ar"') || !tag.includes('dir="rtl"')) {
            // Ignore some false positives if they are dynamically rendered or part of some complex component, 
            // but log them to check
            console.log(`[Missing RTL/Lang] ${filePath}`);
            console.log(`  ${tag.replace(/\n/g, ' ')}`);
        }
      }
    }
  }
});
