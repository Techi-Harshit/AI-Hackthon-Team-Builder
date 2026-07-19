const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, 'controllers/teamController.js');
const code = fs.readFileSync(filePath, 'utf8');

const lines = code.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('buildMongooseQuery')) {
    console.log(`Line ${idx + 1}: ${line}`);
  }
});
