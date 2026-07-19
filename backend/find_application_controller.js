const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, 'controllers/applicationController.js');
if (fs.existsSync(filePath)) {
  const code = fs.readFileSync(filePath, 'utf8');
  const lines = code.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('status') || line.includes('update') || line.includes('approve') || line.includes('accept')) {
      console.log(`Line ${idx + 1}: ${line}`);
    }
  });
} else {
  console.log("No applicationController.js found");
}
