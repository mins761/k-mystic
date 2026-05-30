const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'tarot-deck01', '03.png');
const dest = path.join(__dirname, '..', 'public', 'images', 'korean_tarot_hero.png');

// Ensure destination directory exists
const destDir = path.dirname(dest);
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

try {
  fs.copyFileSync(src, dest);
  console.log('Successfully copied tarot asset to:', dest);
} catch (err) {
  console.error('Failed to copy image:', err);
  process.exit(1);
}
