const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, 'controllers/aiController.js');
const code = fs.readFileSync(filePath, 'utf8');

const lines = code.split('\n');
lines.forEach((line, idx) => {
  if (line.toLowerCase().includes('idea') || line.toLowerCase().includes('project') || line.toLowerCase().includes('blueprint')) {
    if (line.includes('const ') || line.includes('exports.')) {
      console.log(`Line ${idx + 1}: ${line}`);
    }
  }
});
