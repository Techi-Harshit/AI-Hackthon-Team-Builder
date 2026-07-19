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
      if (code.includes('discover_teams')) {
        console.log(`Found in: ${filePath}`);
      }
    }
  }
}

searchDir(path.resolve(__dirname, 'frontend/src'));
