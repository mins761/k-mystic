const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'tarot-deck01', '03.png');
const dest = path.join(__dirname, '..', 'public', 'images', 'korean_tarot_hero.png');

// Vercel 빌드 환경 등 자산 폴더가 없는 경우 복사 단계를 예외 처리합니다. (exit 0)
if (!fs.existsSync(src)) {
  console.log(`Source image not found at ${src}. Skipping copy step (using existing public asset).`);
  process.exit(0);
}

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
