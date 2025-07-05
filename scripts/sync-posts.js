const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '../src/data/posts.json');
const destPath = path.join(__dirname, '../public/posts.json');

try {
  // Copy posts.json from src/data to public
  fs.copyFileSync(srcPath, destPath);
  console.log('✅ posts.json synced successfully');
} catch (error) {
  console.error('❌ Error syncing posts.json:', error.message);
  process.exit(1);
}