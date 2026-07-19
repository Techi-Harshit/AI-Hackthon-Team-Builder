const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, 'frontend/src/pages/AIRecommendations.jsx');
const code = fs.readFileSync(filePath, 'utf8');

const lines = code.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('teamSuccessPrediction')) {
    console.log(`Line ${idx + 1}: ${line}`);
  }
});
