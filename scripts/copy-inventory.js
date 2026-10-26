const fs = require('node:fs');
const path = require('node:path');

const source = path.join(__dirname, '..', 'public');
const target = path.join(__dirname, '..', 'frontend', 'dist', 'inventory');

fs.rmSync(target, { recursive: true, force: true });
fs.cpSync(source, target, { recursive: true });
console.log(`Copied inventory dashboard to ${path.relative(process.cwd(), target)}`);
