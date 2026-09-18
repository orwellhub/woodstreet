// Loads every page with the production CSP applied, records CSP violations and
// script errors, and runs axe-core on each.
//   npm install --no-save playwright axe-core && node tools/audit.mjs
import pw from 'playwright';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
const { chromium } = pw;
import { dirname } from 'path'; import { fileURLToPath } from 'url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const AXE = readFileSync(join(ROOT, 'node_modules/axe-core/axe.min.js'), 'utf8');
const csp = readFileSync(join(ROOT, '.htaccess'), 'utf8').match(/Content-Security-Policy "([^"]+)"/)[1].replace(/frame-ancestors[^;]*;\s*/, '');
const pages = [];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) { if (!['archive', 'tools', 'data', '.git', 'assets', 'uploads', 'brand'].includes(f)) walk(p); } else if (p.endsWith('.html')) pages.push(p); } })(ROOT);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.route('**/*.html', async (route) => {
  const body = readFileSync(route.request().url().replace('file://', ''), 'utf8').replace(/="\/(assets|brand|index|shops|map)/g, '="$1').replace('<head>', `<head><meta http-equiv="Content-Security-Policy" content="${csp}">`);
  route.fulfill({ body, contentType: 'text/html' });
});
await ctx.addInitScript({ content: AXE });
const p = await ctx.newPage();
let bad = 0; const issues = {};
p.on('console', (m) => { if (/Content Security Policy|Refused to/.test(m.text())) { console.log('CSP:', m.text().slice(0, 160)); bad++; } });
p.on('pageerror', (e) => { console.log('JS error:', e.message); bad++; });
for (const f of pages) {
  await p.goto('file://' + f, { waitUntil: 'load' });
  const r = await p.evaluate(() => axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] }));
  for (const v of r.violations) { const k = v.id + ' (' + v.impact + '): ' + v.help; issues[k] = issues[k] || []; issues[k].push(f.replace(ROOT, '') + ' x' + v.nodes.length + ' e.g. ' + v.nodes[0].target[0]); }
}
console.log(`${pages.length} pages audited`);
for (const [k, v] of Object.entries(issues)) console.log('AXE ' + k + '\n   ' + v.slice(0, 4).join('\n   ') + (v.length > 4 ? `\n   ...and ${v.length - 4} more` : ''));
console.log('CSP/JS problems:', bad, '| axe violation types:', Object.keys(issues).length);
await b.close();
