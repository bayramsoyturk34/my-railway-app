import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const src = path.join(__dirname, 'client', 'dist');
const dest = path.join(__dirname, 'dist', 'public');

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(item => {
      copyRecursive(path.join(src, item), path.join(dest, item));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

try {
  if (!fs.existsSync(path.dirname(dest))) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
  }
  
  if (fs.existsSync(src)) {
    copyRecursive(src, dest);
    console.log('✅ Client dist copied to dist/public');
  } else {
    console.error('❌ Client dist not found at:', src);
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error copying client dist:', error.message);
  process.exit(1);
}
