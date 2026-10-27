// Re-encode every photo through Chromium's canvas: a WebP copy next to each
// JPEG, a lighter JPEG where the original is heavier than it needs to be, and
// narrower WebP copies (name-480.webp, name-800.webp) for places that show
// the photo smaller than its file. The build offers those through srcset.
//   node tools/webp.mjs                  everything
//   node tools/webp.mjs --variants-only  only the narrower copies; leaves the
//                                        full-size WebP and the JPEG alone
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
import { readFileSync, writeFileSync, statSync } from 'fs';
const { chromium } = pw;
const files = ['uploads/market-frontage.jpg', 'uploads/market-entrance.jpg', 'uploads/market-corridor.jpg', 'uploads/market-left-side.jpg', 'uploads/coven-of-wiches.jpg', 'uploads/belas-brocante.jpg', 'uploads/shops/shop-a16.jpg', 'uploads/shops/shop-a5-6.jpg', 'uploads/shops/shop-m6-m7.jpg', 'uploads/shops/shop-m9.jpg', 'uploads/shops/shop-m11-12.jpg', 'uploads/shops/shop-m10.jpg', 'uploads/shops/shop-m23-24.jpg', 'uploads/shops/shop-m28.jpg', 'uploads/shops/shop-m34-35.jpg', 'uploads/shops/shop-m36.jpg', 'uploads/shops/shop-a9.jpg', 'uploads/shops/shop-a10.jpg', 'uploads/shops/shop-m3.jpg', 'uploads/shops/shop-m25-26-27.jpg', 'uploads/shops/shop-m32.jpg', 'uploads/shops/shop-m8.jpg'];
// Must match VARIANT_WIDTHS in tools/build.mjs.
const WIDTHS = [480, 800];
const variantsOnly = process.argv.includes('--variants-only');
import { dirname, join } from 'path'; import { fileURLToPath } from 'url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..') + '/';
const b = await chromium.launch();
const p = await b.newPage();
await p.setContent('<html><body></body></html>');
for (const f of files) {
  const before = statSync(ROOT + f).size;
  const data = 'data:image/jpeg;base64,' + readFileSync(ROOT + f).toString('base64');
  const out = await p.evaluate(async ({ src, widths }) => {
    const img = new Image(); img.src = src; await img.decode();
    const draw = (w) => {
      const h = Math.round(img.naturalHeight * w / img.naturalWidth);
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(img, 0, 0, w, h);
      return c;
    };
    const full = draw(img.naturalWidth);
    return {
      w: full.width, h: full.height,
      webp: full.toDataURL('image/webp', 0.78), jpg: full.toDataURL('image/jpeg', 0.8),
      variants: widths.filter((w) => w < img.naturalWidth).map((w) => [w, draw(w).toDataURL('image/webp', 0.78)]),
    };
  }, { src: data, widths: WIDTHS });
  const sizes = [];
  for (const [w, url] of out.variants) {
    const buf = Buffer.from(url.split(',')[1], 'base64');
    writeFileSync(ROOT + f.replace(/\.jpg$/, `-${w}.webp`), buf);
    sizes.push(`${w}w ${buf.length}`);
  }
  if (variantsOnly) { console.log(`${f} ${out.w}x${out.h}: ${sizes.join(', ') || 'no smaller copies'}`); continue; }
  const webp = Buffer.from(out.webp.split(',')[1], 'base64');
  const jpg = Buffer.from(out.jpg.split(',')[1], 'base64');
  writeFileSync(ROOT + f.replace(/\.jpg$/, '.webp'), webp);
  let note = `jpg kept ${before}`;
  if (jpg.length < before * 0.8) { writeFileSync(ROOT + f, jpg); note = `jpg ${before} -> ${jpg.length}`; }
  console.log(`${f} ${out.w}x${out.h}: ${note}, webp ${webp.length}, ${sizes.join(', ')}`);
}
await b.close();
