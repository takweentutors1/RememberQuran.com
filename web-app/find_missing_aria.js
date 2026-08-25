const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  // Very rough check: look for <button or <Button
  let inButton = false;
  let hasAria = false;
  let hasText = false;
  let buttonStartLine = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Simplistic tag parsing
    if (/<[bB]utton[\s>]/.test(line)) {
      inButton = true;
      hasAria = false;
      hasText = false;
      buttonStartLine = i + 1;
    }
    
    if (inButton) {
      if (/aria-label=/.test(line) || /aria-labelledby=/.test(line)) {
        hasAria = true;
      }
      if (/>[a-zA-Z0-9\s]+</.test(line) && !/></.test(line)) {
        // Text node
        hasText = true;
      }
      if (line.includes('>{') && !line.includes('>{children}')) {
          // Dynamic content might be text
          hasText = true;
      }
      if (/<\/[bB]utton>/.test(line) || /\/>/.test(line) && line.includes('<Button')) {
        if (!hasAria && !hasText) {
          console.log(`Potential missing aria-label in ${file}:${buttonStartLine}`);
        }
        inButton = false;
      }
    }
  }
});
