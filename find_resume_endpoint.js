const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, 'backend/controllers/aiController.js');
const code = fs.readFileSync(filePath, 'utf8');

const lines = code.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('resume') || line.includes('Resume') || line.includes('pdf') || line.includes('PDF')) {
    if (line.includes('exports.') || line.includes('function') || line.includes('const ')) {
      console.log(`Line ${idx + 1}: ${line}`);
    }
  }
});
