const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../apps/dashboard/dist');
const dest = path.resolve(__dirname, '../dist');

if (fs.existsSync(src)) {
  fs.cpSync(src, dest, { recursive: true });
  console.log('Successfully copied apps/dashboard/dist to root dist/');
} else {
  console.warn('Source dist does not exist:', src);
}
