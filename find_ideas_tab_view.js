const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, 'frontend/src/pages/AIRecommendations.jsx');
const code = fs.readFileSync(filePath, 'utf8');

const lines = code.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('activeTab === "ideas"') || line.includes('activeTab === \'ideas\'')) {
    console.log(`Line ${idx + 1}: ${line}`);
  }
});
