const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        searchDir(filePath);
      }
    } else if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
      const code = fs.readFileSync(filePath, 'utf8');
      if (code.includes('generate-ideas') || code.includes('generateIdeas')) {
        console.log(`Found in: ${filePath}`);
        const lines = code.split('\n');
        lines.forEach((line, idx) => {
          if (line.includes('generate-ideas') || line.includes('generateIdeas')) {
            console.log(`  Line ${idx+1}: ${line.trim()}`);
          }
        });
      }
    }
  }
}

searchDir(path.resolve(__dirname, 'frontend/src'));
