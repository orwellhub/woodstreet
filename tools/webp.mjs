// Re-encode every photo through Chromium's canvas: a WebP copy next to each
// JPEG, and a lighter JPEG where the original is heavier than it needs to be.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
import { readFileSync, writeFileSync, statSync } from 'fs';
const { chromium } = pw;
const files = ['uploads/market-frontage.jpg', 'uploads/market-entrance.jpg', 'uploads/market-corridor.jpg', 'uploads/market-left-side.jpg', 'uploads/coven-of-wiches.jpg', 'uploads/belas-brocante.jpg', 'uploads/shops/shop-a16.jpg', 'uploads/shops/shop-a5-6.jpg', 'uploads/shops/shop-m6-m7.jpg', 'uploads/shops/shop-m9.jpg', 'uploads/shops/shop-m11-12.jpg', 'uploads/shops/shop-m10.jpg', 'uploads/shops/shop-m23-24.jpg', 'uploads/shops/shop-m28.jpg', 'uploads/shops/shop-m34-35.jpg', 'uploads/shops/shop-m36.jpg'];
import { dirname, join } from 'path'; import { fileURLToPath } from 'url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..') + '/';
const b = await chromium.launch();
const p = await b.newPage();
await p.setContent('<html><body></body></html>');
for (const f of files) {
  const before = statSync(ROOT + f).size;
  const data = 'data:image/jpeg;base64,' + readFileSync(ROOT + f).toString('base64');
  const out = await p.evaluate(async (src) => {
    const img = new Image(); img.src = src; await img.decode();
    const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext('2d').drawImage(img, 0, 0);
    return { w: c.width, h: c.height, webp: c.toDataURL('image/webp', 0.78), jpg: c.toDataURL('image/jpeg', 0.8) };
  }, data);
  const webp = Buffer.from(out.webp.split(',')[1], 'base64');
  const jpg = Buffer.from(out.jpg.split(',')[1], 'base64');
  writeFileSync(ROOT + f.replace(/\.jpg$/, '.webp'), webp);
  let note = `jpg kept ${before}`;
  if (jpg.length < before * 0.8) { writeFileSync(ROOT + f, jpg); note = `jpg ${before} -> ${jpg.length}`; }
  console.log(`${f} ${out.w}x${out.h}: ${note}, webp ${webp.length}`);
}
await b.close();
