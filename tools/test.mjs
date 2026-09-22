// Regression tests for the build. Run with: node --test tools/
// These exist because the shop data is meant to be edited by hand, so the
// build must stay safe no matter what ends up in data/shops.json.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, readdirSync } from 'fs';
import { execFileSync } from 'child_process';
import { join, dirname } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Build the site from a poisoned copy of the shop data, into a scratch
// directory, and hand back the pages as text.
function buildWith(poison) {
  const data = JSON.parse(readFileSync(join(ROOT, 'data/shops.json'), 'utf8'));
  poison(data.units.find((u) => u.unit === 'M3'));
  const dir = mkdtempSync(join(tmpdir(), 'wsm-test-'));
  mkdirSync(join(dir, 'data'), { recursive: true });
  const dataFile = join(dir, 'data', 'shops.json');
  writeFileSync(dataFile, JSON.stringify(data, null, 1));
  execFileSync('node', [join(ROOT, 'tools/build.mjs')], {
    env: { ...process.env, WSM_DATA: dataFile, WSM_OUT: dir },
    stdio: ['ignore', 'ignore', 'ignore'],
  });
  const pages = {};
  const walk = (d, base = '') => {
    for (const f of readdirSync(d, { withFileTypes: true })) {
      if (f.isDirectory()) { if (f.name !== 'data') walk(join(d, f.name), base + f.name + '/'); }
      else if (f.name.endsWith('.html')) pages[base + f.name] = readFileSync(join(d, f.name), 'utf8');
    }
  };
  walk(dir);
  return pages;
}
const everyPage = (pages) => Object.values(pages).join('\n');

test('a javascript: URL in the shop data never reaches a link', () => {
  const pages = buildWith((m3) => { m3.links.website = 'javascript:alert(document.domain)'; });
  assert.doesNotMatch(everyPage(pages), /href="javascript:/i);
  assert.doesNotMatch(everyPage(pages), /alert\(document\.domain\)/);
});

test('a data: URL in the shop data never reaches a link', () => {
  const pages = buildWith((m3) => { m3.links.instagram = 'data:text/html;base64,PHNjcmlwdD4='; });
  // The favicon is a deliberate inline SVG data: URL, so check the body only.
  const bodies = Object.values(pages).map((h) => h.slice(h.indexOf('<body'))).join('\n');
  assert.doesNotMatch(bodies, /href="data:/i);
  assert.doesNotMatch(everyPage(pages), /PHNjcmlwdD4=/);
});

test('an http link is not published as https', () => {
  const pages = buildWith((m3) => { m3.links.website = 'http://insecure.example/'; });
  assert.doesNotMatch(everyPage(pages), /insecure\.example/);
});

test('HTML in a shop name is escaped, not rendered', () => {
  const pages = buildWith((m3) => { m3.name = 'Rose<img src=x onerror=alert(1)>Craft'; });
  const all = everyPage(pages);
  assert.doesNotMatch(all, /<img src=x onerror/);
  assert.match(all, /Rose&lt;img src=x onerror=alert\(1\)&gt;Craft/);
});

test('a shop name cannot break out of the structured-data script block', () => {
  const pages = buildWith((m3) => { m3.name = 'Rose</scr' + 'ipt><img src=x onerror=alert(1)>Craft'; });
  const all = everyPage(pages);
  // The only </script> tags in the output are the ones the build wrote itself.
  assert.doesNotMatch(all, /<\/script><img/i);
  assert.match(all, /\\u003c\\u002fscript\\u003e|\\u003c\/script\\u003e|\\u003c\\\/script/i);
});

test('an image path outside uploads/ is dropped', () => {
  const pages = buildWith((m3) => { m3.image = { src: '../../etc/passwd', alt: 'x' }; });
  assert.doesNotMatch(everyPage(pages), /etc\/passwd/);
});

test('an off-site image URL is dropped', () => {
  const pages = buildWith((m3) => { m3.image = { src: 'https://tracker.example/pixel.jpg', alt: 'x' }; });
  assert.doesNotMatch(everyPage(pages), /tracker\.example/);
});

test('a malformed email is not turned into a mailto link', () => {
  const pages = buildWith((m3) => { m3.links.email = 'not an email" onmouseover="alert(1)'; });
  const all = everyPage(pages);
  assert.doesNotMatch(all, /onmouseover/);
  assert.doesNotMatch(all, /mailto:not/);
});

test('a phone number that is not a UK 11-digit number is not published', () => {
  const pages = buildWith((m3) => { m3.phones = ['0791234567890123', '999']; });
  const all = everyPage(pages);
  assert.doesNotMatch(all, /0791234567890123/);
  assert.doesNotMatch(all, /tel:\+44999/);
});

test('rent, deposit and owner names never appear in the output', () => {
  const pages = buildWith((m3) => { m3.rent = '£500 pcm'; m3.deposit = '£1000'; m3.owner = 'A Person'; });
  const all = everyPage(pages);
  assert.doesNotMatch(all, /£\s?\d/);
  assert.doesNotMatch(all, /A Person/);
});

test('the shipped pages carry the security-relevant markup', () => {
  const home = readFileSync(join(ROOT, 'index.html'), 'utf8');
  assert.doesNotMatch(home, /<script(?![^>]*src=)(?![^>]*application\/ld\+json)/, 'no inline scripts, so the CSP needs no unsafe-inline');
  assert.doesNotMatch(home, /\son(click|error|load|mouseover|mouseout)=/i, 'no inline event handlers');
  for (const m of home.matchAll(/<a [^>]*target="_blank"[^>]*>/g)) {
    assert.match(m[0], /rel="noopener"/, `target=_blank without rel=noopener: ${m[0].slice(0, 80)}`);
  }
});

test('no page contains a long dash', () => {
  for (const f of ['index.html', 'shops.html', 'story.html', 'visit.html', 'legal.html']) {
    assert.doesNotMatch(readFileSync(join(ROOT, f), 'utf8'), /[‒–—―−]/, f);
  }
});

test('every photo the pages load carries a cache stamp', () => {
  // .htaccess tells browsers to hold images for a month and photos keep
  // their file names when they are replaced, so an unstamped URL means a
  // returning visitor goes on seeing the old picture. Comments are ignored:
  // they name files that do not exist yet.
  for (const f of ['index.html', 'shops.html', 'story.html', 'shop/m36.html']) {
    const page = readFileSync(join(ROOT, f), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
    for (const m of page.matchAll(/(?:\.\.\/)*(?:uploads|brand)\/[A-Za-z0-9._/-]+\.(?:jpg|webp|png|svg)(\?v=[0-9a-f]{8})?/g)) {
      assert.ok(m[1], `${f}: ${m[0]} has no ?v= stamp, so a replaced file stays cached`);
    }
  }
});
