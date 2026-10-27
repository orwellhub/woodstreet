// Regression tests for the build. Run with: node --test tools/
// These exist because the shop data is meant to be edited by hand, so the
// build must stay safe no matter what ends up in data/shops.json.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, readdirSync } from 'fs';
import { execFileSync } from 'child_process';
import { createHash } from 'crypto';
import { join, dirname } from 'path';
import vm from 'vm';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Build the site from a poisoned copy of the shop data, into a scratch
// directory, and hand back the pages as text.
function buildWith(poison, env = {}) {
  const data = JSON.parse(readFileSync(join(ROOT, 'data/shops.json'), 'utf8'));
  poison(data.units.find((u) => u.unit === 'M3'));
  const dir = mkdtempSync(join(tmpdir(), 'wsm-test-'));
  mkdirSync(join(dir, 'data'), { recursive: true });
  const dataFile = join(dir, 'data', 'shops.json');
  writeFileSync(dataFile, JSON.stringify(data, null, 1));
  execFileSync('node', [join(ROOT, 'tools/build.mjs')], {
    env: { ...process.env, WSM_DATA: dataFile, WSM_OUT: dir, ...env },
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

test('every headline count says the market has 36 shops', () => {
  const asIs = buildWith(() => {});
  const all = everyPage(asIs);
  assert.ok(!/Thirty little shops|30 little shops|around thirty|thirty doors|thirty small doors/.test(all));
  assert.ok(!/\b25 (little|small|independent) shops|Twenty-five little shops|all 25 shops/.test(all));
  assert.match(asIs['index.html'], /<h1[^>]*>Thirty-six little shops\./);
  assert.match(asIs['index.html'], /<title>Wood Street Indoor Market \| 36 little shops/);
  assert.match(asIs['shops.html'], /Thirty-six little shops under one roof/);
  // The directory's own tally counts the shops it lists and never says "all".
  const listed = JSON.parse(readFileSync(join(ROOT, 'data/shops.json'), 'utf8')).units.filter((u) => !u.vacant && u.name).length;
  assert.match(asIs['shops.html'], new RegExp(`data-count>Showing ${listed} shops<`));
  // A shop moving out changes the directory tally but not the market's own count.
  const fewer = buildWith((m3) => { m3.vacant = true; });
  assert.match(fewer['index.html'], /<h1[^>]*>Thirty-six little shops\./);
  assert.match(fewer['shops.html'], new RegExp(`data-count>Showing ${listed - 1} shops<`));
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

test('every empty unit on the map page opens the contact form for that unit', () => {
  const map = readFileSync(join(ROOT, 'map.html'), 'utf8');
  const data = JSON.parse(readFileSync(join(ROOT, 'data/shops.json'), 'utf8'));
  const empty = data.units.filter((u) => u.vacant);
  assert.ok(empty.length > 0);
  for (const u of empty) {
    const href = `contact.html?topic=unit&unit=${encodeURIComponent(u.label)}`;
    assert.match(map, new RegExp(`<a class="mu mu-vacant[^"]*" href="${href.replace(/[?]/g, '\\?')}"`), `unit ${u.label} on the floorplan is not a link to the contact form`);
  }
});

test('every form posts to the same-origin lead handler, never to FormSubmit', () => {
  const pages = buildWith(() => {});
  const all = everyPage(pages);
  assert.ok(!/formsubmit/i.test(all), 'no FormSubmit anywhere in the built pages');
  const actions = [...all.matchAll(/<form[^>]*\saction="([^"]*)"/g)].map((m) => m[1]);
  assert.ok(actions.length >= 3, 'contact, unit application and news sign-up forms are present');
  for (const a of actions) assert.equal(a, '/lead.php');
  for (const [name, html] of Object.entries(pages)) {
    for (const form of html.match(/<form[\s\S]*?<\/form>/g) || []) {
      assert.ok(/name="_honey"/.test(form), `${name}: every form keeps its honeypot`);
    }
  }
});

// A number a trader has asked us not to publish must stay off the site even
// when a fresh spreadsheet carries it again. 07700 900123 is from Ofcom's
// range reserved for drama, so it can never be anyone's real number.
const DRAMA = '07700900123';
const DRAMA_HASH = createHash('sha256').update(DRAMA).digest('hex');

test('unit 36 publishes no phone number, at the trader\'s request', () => {
  const data = JSON.parse(readFileSync(join(ROOT, 'data/shops.json'), 'utf8'));
  assert.deepEqual(data.units.find((u) => u.unit === 'M36').phones, [], 'unit 36 has a phone number in the data again');
  const page = readFileSync(join(ROOT, 'shop/m36.html'), 'utf8');
  // The market's own number, Walthams', is in the header and footer of every
  // page. Any other phone link on this page would be the trader's.
  const tel = [...page.matchAll(/href="tel:([^"]+)"/g)].map((m) => m[1]).filter((t) => t !== '+442085090444');
  assert.deepEqual(tel, [], 'the Flowerie88 page has a phone link that is not the market\'s');
  assert.doesNotMatch(page, /"telephone"/, 'the Flowerie88 page gives search engines a phone number');
});

test('a withheld number in the shop data is dropped wherever it would appear', () => {
  const all = everyPage(buildWith((m3) => { m3.phones = [DRAMA]; }, { WSM_WITHHOLD: DRAMA_HASH }));
  assert.doesNotMatch(all.replace(/\D/g, ''), /7700900123/, 'the withheld number reached a page');
});

test('the build refuses to finish if a withheld number reaches a page some other way', () => {
  assert.throws(
    () => buildWith((m3) => { m3.about = 'Ring us on 07700 900-123 for repairs.'; }, { WSM_WITHHOLD: DRAMA_HASH }),
    'a withheld number written into a description went out without complaint',
  );
  assert.throws(
    () => buildWith((m3) => { m3.about = 'Or call +44 (0)7700 900123.'; }, { WSM_WITHHOLD: DRAMA_HASH }),
    'a withheld number in international format went out without complaint',
  );
});

// ---------- fixes from the October 2026 website review ----------------------

test('every trading shop sits in a trade family, so some filter shows it', () => {
  const data = JSON.parse(readFileSync(join(ROOT, 'data/shops.json'), 'utf8'));
  const shops = readFileSync(join(ROOT, 'shops.html'), 'utf8');
  const chips = new Set([...shops.matchAll(/data-cat="([^"]+)"/g)].map((m) => m[1]));
  const cards = [...shops.matchAll(/data-card data-fam="([^"]*)"/g)].map((m) => m[1]);
  assert.equal(cards.length, data.units.filter((u) => !u.vacant).length);
  for (const fam of cards) assert.ok(chips.has(fam), `a card with family "${fam}" has no filter chip`);
});

test('the build refuses a shop whose category has no trade family', () => {
  assert.throws(() => buildWith((m3) => { m3.category = 'Something new'; }),
    'a shop with an unmapped category was published without complaint');
});

test('the category filters are real buttons, so Enter and Space both work', () => {
  const shops = readFileSync(join(ROOT, 'shops.html'), 'utf8');
  assert.doesNotMatch(shops, /<a [^>]*role="button"/, 'a link is pretending to be a button');
  assert.match(shops, /<button type="button" class="chip" data-cat="/);
  assert.match(shops, /<button type="button" class="linkbtn" data-clear>/);
});

test('no page promises a robot check that does not exist', () => {
  const all = everyPage(buildWith(() => {}));
  assert.doesNotMatch(all, /not a robot/i);
});

test('the unit ranges in the copy come from the data', () => {
  const pages = buildWith(() => {});
  for (const f of ['index.html', 'map.html']) {
    assert.doesNotMatch(pages[f], /A1 to A16/, `${f} still says A1 to A16`);
    assert.match(pages[f], /A1 to A18/, `${f} does not give the Antique City range`);
  }
});

test('the homepage and the timeline agree about the cinema', () => {
  const home = readFileSync(join(ROOT, 'index.html'), 'utf8');
  assert.doesNotMatch(home, /Crown Cinema from 1912 to 1955/);
  assert.match(home, /Picture Palace, the Crown and the Rio/);
});

test('shop photos declare their real size and offer narrower copies', () => {
  const shops = readFileSync(join(ROOT, 'shops.html'), 'utf8');
  // shop-a5-6.jpg is 1000 by 831.
  assert.match(shops, /shop-a5-6\.jpg\?v=[0-9a-f]{8}" alt="[^"]*" width="1000" height="831"/);
  assert.match(shops, /srcset="uploads\/shops\/shop-a5-6-480\.webp\?v=[0-9a-f]{8} 480w, uploads\/shops\/shop-a5-6-800\.webp\?v=[0-9a-f]{8} 800w, uploads\/shops\/shop-a5-6\.webp\?v=[0-9a-f]{8} 1000w" sizes="/);
  assert.doesNotMatch(shops, /data-sizes=/, 'the size hint is for the build, not the page');
});

test('a shop with no photo gets one line, not an empty frame', () => {
  const page = readFileSync(join(ROOT, 'shop/a1.html'), 'utf8');
  assert.doesNotMatch(page, /photo-slot|Photo on its way/);
  assert.match(page, /No photo of this shop yet\./);
  assert.doesNotMatch(page, /A look inside/);
});

test('fallback text does not claim hours or a drop-in nobody has confirmed', () => {
  const page = readFileSync(join(ROOT, 'shop/a1.html'), 'utf8');
  assert.doesNotMatch(page, /Within market hours|Drop in during market hours/);
  const silent = readFileSync(join(ROOT, 'shop/a8.html'), 'utf8');
  assert.match(silent, /href="\.\.\/contact\.html\?topic=message&unit=A8"/, 'a shop with no contact details offers no route to them');
});

test('a dated exception reaches the page, the Visit table and the structured data', () => {
  const exc = JSON.stringify([{ date: '2026-12-25', closed: true, note: 'Christmas Day' }]);
  const pages = buildWith(() => {}, { WSM_EXCEPTIONS: exc });
  assert.match(pages['index.html'], /<body [^>]*data-exceptions="\[\{&quot;d&quot;:&quot;2026-12-25&quot;,&quot;closed&quot;:true/);
  assert.match(pages['index.html'], /"specialOpeningHoursSpecification":\[\{"@type":"OpeningHoursSpecification","validFrom":"2026-12-25"/);
  assert.match(pages['visit.html'], /Friday 25 December <span class="muted">\(Christmas Day\)<\/span><\/span><span style="font-weight:700">Closed/);
});

// Runs the open/closed script against a fake page at a given London time.
function statusAt(iso, exceptions) {
  const els = {};
  const el = (k) => (els[k] = els[k] || { hidden: true, textContent: '', style: {}, title: '', classList: { toggle() {} }, getAttribute: () => null });
  const attrs = { 'data-open': '10:00', 'data-close': '17:30', 'data-days': '2,3,4,5,6', 'data-exceptions': JSON.stringify(exceptions) };
  const RealDate = Date;
  class FakeDate extends RealDate { constructor(...a) { super(...(a.length ? a : [iso])); } static now() { return new RealDate(iso).getTime(); } }
  const sandbox = {
    Date: FakeDate, Intl, JSON, parseInt, Math, setInterval() {}, console,
    document: {
      documentElement: { classList: { add() {} } },
      body: { getAttribute: (k) => attrs[k] ?? null },
      querySelectorAll: (sel) => [el(sel)],
      querySelector: () => null,
      addEventListener() {},
    },
    location: { hash: '', search: '' }, window: { addEventListener() {} }, history: {}, URLSearchParams,
  };
  vm.runInNewContext(readFileSync(join(ROOT, 'assets/site.js'), 'utf8'), sandbox);
  return { label: els['[data-open-label]'].textContent, detail: els['[data-open-detail]'].textContent };
}

test('the live status honours a dated closure and finds the next open day', () => {
  const exc = [{ d: '2026-12-25', closed: true, n: 'Christmas Day' }, { d: '2026-12-26', closed: true, n: 'Boxing Day' }];
  // Friday 25 December 2026, 11am in London: normally open.
  const s = statusAt('2026-12-25T11:00:00Z', exc);
  assert.equal(s.label, 'Closed today');
  assert.match(s.detail, /Closed \(Christmas Day\), opens Tuesday at 10am/);
  // An ordinary Friday at the same time is open.
  assert.equal(statusAt('2026-12-18T11:00:00Z', exc).label, 'Open now');
});

test('a late opening extends the hours that day', () => {
  const s = statusAt('2026-12-19T19:00:00Z', [{ d: '2026-12-19', o: '10:00', c: '20:00', n: 'Late opening' }]);
  assert.equal(s.label, 'Open now');
  assert.match(s.detail, /closes 8pm \(Late opening\)/);
});

test('reduced motion stops every animation, as the accessibility statement says', () => {
  const css = readFileSync(join(ROOT, 'assets/site.css'), 'utf8');
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)\{\*,\*::before,\*::after\{animation:none!important;transition:none!important\}\}/);
  assert.doesNotMatch(css, /@keyframes[^{]*\{[^}]*background-position/, 'an animation repaints instead of using transform');
});

test('the home page has one address', () => {
  for (const f of ['index.html', 'shop/m3.html', '404.html']) {
    assert.doesNotMatch(readFileSync(join(ROOT, f), 'utf8'), /href="(?:\.\.\/|\/)?index\.html"/, `${f} links to index.html`);
  }
  assert.match(readFileSync(join(ROOT, '.htaccess'), 'utf8'), /RewriteRule \^index\\\.html\$ \/ \[R=301,L\]/);
});
