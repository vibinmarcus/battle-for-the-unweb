#!/usr/bin/env node
/**
 * extract-sprites.js
 * Extracts base64 WebP sprites from D2_SPRITES in src/loot.js into sprites/ directory,
 * then rewrites loot.js to reference the file paths instead.
 */

const fs = require('fs');
const path = require('path');

const ROOT    = path.join(__dirname, '..');
const LOOT_JS = path.join(ROOT, 'src', 'loot.js');
const SPRITES = path.join(ROOT, 'sprites');

if (!fs.existsSync(SPRITES)) fs.mkdirSync(SPRITES);

const src = fs.readFileSync(LOOT_JS, 'utf8');

// Format: {"name":"...","category":"...","slot":"...","dataUrl":"data:image/webp;base64,..."}
// All on one huge line. We match each entry that has a base64 dataUrl.
const ENTRY_RE = /\{"name":"([^"]+)","category":"([^"]+)","slot":"([^"]+)","dataUrl":"(data:image\/webp;base64,[^"]+)"\}/g;

const nameCount = {};
function toFilename(name, category) {
  let base = name.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  const key = category + ':' + base;
  nameCount[key] = (nameCount[key] || 0) + 1;
  if (nameCount[key] > 1) base += '_' + nameCount[key];
  return `${category}_${base}.webp`;
}

const matches = [];
let m;
while ((m = ENTRY_RE.exec(src)) !== null) {
  matches.push({ full: m[0], name: m[1], category: m[2], slot: m[3], b64: m[4] });
}

console.log(`Found ${matches.length} base64 sprites to extract.`);

let newSrc = src;
let count  = 0;

for (const entry of matches) {
  const filename = toFilename(entry.name, entry.category);
  const filepath = path.join(SPRITES, filename);

  const b64data = entry.b64.replace(/^data:image\/webp;base64,/, '');
  fs.writeFileSync(filepath, Buffer.from(b64data, 'base64'));

  const replacement = `{"name":"${entry.name}","category":"${entry.category}","slot":"${entry.slot}","dataUrl":"/sprites/${filename}"}`;
  newSrc = newSrc.replace(entry.full, replacement);
  count++;
  if (count % 20 === 0) process.stdout.write(`  ${count}/${matches.length}…\n`);
}

fs.writeFileSync(LOOT_JS, newSrc, 'utf8');
console.log(`\nDone. Extracted ${count} sprites → sprites/  Updated src/loot.js.`);

const before = Buffer.byteLength(src, 'utf8');
const after  = Buffer.byteLength(newSrc, 'utf8');
console.log(`loot.js: ${(before/1024).toFixed(1)} KB → ${(after/1024).toFixed(1)} KB`);
