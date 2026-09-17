// Builds every page of the site from data/shops.json and the templates below.
//   node tools/build.mjs
// Plain HTML out, nothing to install. The shop data is the client spreadsheet
// reduced to what is safe to publish: no rent, no deposit, no owner names.
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = JSON.parse(readFileSync(join(ROOT, 'data/shops.json'), 'utf8'));

const SITE = {
  name: 'Wood Street Indoor Market',
  url: 'https://woodstreetindoormarket.co.uk/',
  address: '98 &amp; 102 Wood Street',
  town: 'Walthamstow, London E17 3HX',
  phone: '020 8509 0444', tel: 'tel:+442085090444',
  email: 'info@walthamestates.co.uk',
  walthams: 'https://walthamestates.co.uk/',
  directions: 'https://www.google.com/maps/search/?api=1&amp;query=Wood+Street+Indoor+Market+Walthamstow',
  fb: 'https://www.facebook.com/WoodStreetIndoorMarket/',
  ig: 'https://www.instagram.com/woodstreetindoormarket/',
  x: 'https://x.com/WoodStreetMarke',
  hoursShort: 'Tuesday to Saturday, 10.00 to 5.30',
};
const enquire = (subject) => `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}`;

// ---------- helpers ---------------------------------------------------------
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// No long dashes anywhere on the site. Ranges are written in words.
const nodash = (s) => String(s || '').replace(/[‒–—―−]/g, ' to ').replace(/\s+to\s+to\s+/g, ' to ').replace(/\s{2,}/g, ' ').trim();
const unitLabel = (u) => u.replace(/\s*\/\s*/g, '/').trim();
const slug = (u) => unitLabel(u).toLowerCase().replace(/[^a-z0-9]+/g, '-');
const unitSpan = (u) => (u.match(/\d+/g) || ['1']).length;
const sortKey = (u) => parseInt((u.match(/\d+/) || [0])[0], 10);
const fmtPhone = (d) => d.slice(0, 5) + ' ' + d.slice(5);
const telHref = (d) => 'tel:+44' + d.slice(1);

const DAYS = { mon: 'Monday', tue: 'Tuesday', tues: 'Tuesday', wed: 'Wednesday', weds: 'Wednesday',
  thu: 'Thursday', thur: 'Thursday', thurs: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };
function hoursText(raw) {
  let t = nodash(String(raw || '').replace(/\s*\n\s*/g, ' '));
  if (!t) return '';
  t = t.replace(/(\d\s*(?:am|pm)?)\s*-\s*(\d)/gi, '$1 to $2')
    .replace(/(\d):(\d\d)/g, '$1.$2')
    .replace(/\b(1[3-9]|2[0-3])\.(\d\d)\b/g, (m, h, mm) => (h - 12) + '.' + mm)
    .replace(/\b([a-z]{3,5})\b/gi, (m) => DAYS[m.toLowerCase()] || m)
    .replace(/\s*,\s*$/, '').replace(/\.$/, '').replace(/\s{2,}/g, ' ').trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

// Trade families, derived from the Category column. Each shop still shows its
// own exact category; the family only picks a colour and a filter.
const FAMILIES = [
  { key: 'food',    label: 'Food & drink',        color: '#A9541F', tint: '#EFD0B8' },
  { key: 'jewel',   label: 'Jewellery & gifts',   color: '#34618E', tint: '#D0DCE8' },
  { key: 'books',   label: 'Books, art & toys',   color: '#B98613', tint: '#F4E4B8' },
  { key: 'vintage', label: 'Vintage & pre-loved', color: '#C4684E', tint: '#F0D5C9' },
  { key: 'records', label: 'Records & music',     color: '#3E3A32', tint: '#DED8C8' },
  { key: 'beauty',  label: 'Health & beauty',     color: '#A5647E', tint: '#EBD2DB' },
  { key: 'crafts',  label: 'Crafts & homeware',   color: '#17605B', tint: '#C8DCD4' },
];
const CAT_TO_FAMILY = {
  'Records & music': 'records', 'Vintage & antiques': 'vintage', 'Vintage clothing': 'vintage',
  'Pre-loved clothing': 'vintage', 'Shoes and more': 'vintage', 'Gifts & accessories': 'jewel',
  'Jewellery & repairs': 'jewel', 'Jewellery & accessories': 'jewel', 'Fashion & gifts': 'jewel',
  'Massage & osteopathy': 'beauty', 'Eyelash treatments': 'beauty', 'Beauty services': 'beauty',
  'Barbering': 'beauty', 'Wool & haberdashery': 'crafts', 'Moroccan crafts': 'crafts',
  'Books & stationery': 'books', 'Art': 'books', 'Toys & gifts': 'books', 'Juice bar & snacks': 'food',
};
const NEUTRAL = { key: '', label: 'Other', color: '#7A7264', tint: '#DDD8CB' };
const famOf = (r) => FAMILIES.find((f) => f.key === CAT_TO_FAMILY[r.category]) || NEUTRAL;

const SIDES = {
  'Antique City': { name: 'Antique City', code: 'A', addr: '98 Wood Street', where: 'the inner side of the corridor' },
  'Market Side': { name: 'Market Side', code: 'M', addr: '102a Wood Street', where: 'the outer side of the corridor' },
};

// ---------- the data --------------------------------------------------------
const units = DATA.units.map((r) => ({
  ...r,
  unit: unitLabel(r.unit),
  slug: slug(r.unit),
  fam: r.vacant ? null : famOf(r),
  hoursNice: r.vacant ? '' : hoursText(r.hours),
  about: r.vacant ? '' : nodash(r.about),
  phones: r.vacant ? [] : (r.phones || []).filter((p) => /^0\d{10}$/.test(p)),
  links: r.vacant ? {} : (r.links || {}),
  href: `shop/${slug(r.unit)}.html`,
}));
const bySide = (s) => units.filter((u) => u.side === s).sort((a, b) => sortKey(a.unit) - sortKey(b.unit));
const shops = [...bySide('Antique City'), ...bySide('Market Side')].filter((u) => !u.vacant);
const vacant = [...bySide('Antique City'), ...bySide('Market Side')].filter((u) => u.vacant);
const withPhotoFirst = [...shops.filter((s) => s.image), ...shops.filter((s) => !s.image)];
const famCount = (f) => shops.filter((s) => s.fam.key === f.key).length;
const usedFamilies = FAMILIES.filter((f) => famCount(f) > 0);

// ---------- shared chrome ---------------------------------------------------
const NAV = [
  ['The Shops', 'shops.html', 'shops'], ['Market Map', 'map.html', 'map'], ["What’s On", 'whats-on.html', 'whatson'],
  ['Visit', 'visit.html', 'visit'], ['Our Story', 'story.html', 'story'], ['Journal', 'journal.html', 'journal'],
];
const navLinks = (rel, active, cls) => NAV.map(([label, href, key]) =>
  `<a href="${rel}${href}"${key === active ? ' aria-current="page"' : ''}${cls ? ` class="${cls}"` : ''}>${label}</a>`).join('\n        ');

const ICONS = {
  fb: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
  ig: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
  x: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/></svg>',
};
const socials = (cls = '') => `
        <a class="social ${cls}" href="${SITE.fb}" target="_blank" rel="noopener" aria-label="Wood Street Indoor Market on Facebook" title="Facebook">${ICONS.fb}</a>
        <a class="social ${cls}" href="${SITE.ig}" target="_blank" rel="noopener" aria-label="Wood Street Indoor Market on Instagram" title="Instagram">${ICONS.ig}</a>
        <a class="social ${cls}" href="${SITE.x}" target="_blank" rel="noopener" aria-label="Wood Street Indoor Market on X" title="X">${ICONS.x}</a>`;

function header(rel, active) {
  return `<a href="#main" class="skip">Skip to content</a>

<div class="topstrip">
  <div class="wrap">
    <span style="font-weight:600">Open ${SITE.hoursShort} &middot; Closed Sunday &amp; Monday</span>
    <span>${SITE.address}, Walthamstow E17 &middot; <a href="${SITE.tel}">${SITE.phone}</a></span>
  </div>
</div>

<header class="site-header">
  <div class="bar">
    <div class="brand">
      <a href="${rel}index.html" class="brand-link" aria-label="Wood Street Indoor Market, home">
        <span class="brand-name">WOOD STREET</span>
        <span class="brand-sub">INDOOR MARKET &middot; EST. 1955</span>
      </a>
      <a class="managed" href="${SITE.walthams}" target="_blank" rel="noopener">
        Managed by
        <img src="${rel}brand/walthams-logo.svg" alt="Walthams" width="104" height="17">
      </a>
    </div>
    <div class="right">
      <nav class="nav" aria-label="Main">
        ${navLinks(rel, active)}
      </nav>
      <a href="${rel}visit.html" class="pill" data-open-pill hidden>
        <span class="dot" data-open-dot aria-hidden="true"></span>
        <span data-open-label></span>
      </a>
      <a href="${rel}join.html" class="cta">Join the Market</a>
      <details class="menu">
        <summary aria-label="Menu"><span></span><span></span><span></span></summary>
        <nav class="menu-panel" aria-label="Main menu">
          ${navLinks(rel, active)}
          <a href="${rel}contact.html">Contact</a>
          <a href="${rel}join.html" class="cta">Join the Market</a>
          <span class="st" data-open-detail>Open ${SITE.hoursShort}</span>
        </nav>
      </details>
    </div>
  </div>
</header>
`;
}

function footer(rel) {
  return `<footer class="site-footer">
  <div class="cols">
    <div>
      <span style="display:block;font-family:'Young Serif',serif;font-size:21px;color:#DCA528">WOOD STREET</span>
      <span style="display:block;font-family:'Archivo Narrow',sans-serif;font-weight:700;font-size:10.5px;letter-spacing:.28em;color:#8FB5AE;margin-top:2px">INDOOR MARKET &middot; EST. 1955</span>
      <a class="managed managed-dark" href="${SITE.walthams}" target="_blank" rel="noopener">
        Managed by
        <img src="${rel}brand/walthams-logo-inverse.svg" alt="Walthams" width="104" height="17">
      </a>
      <p style="margin-top:16px;color:#BEB197">Thirty little shops under one roof in Walthamstow, a couple of minutes from Wood Street station.</p>
    </div>
    <div>
      <h2>Find us</h2>
      <p>${SITE.address}<br>${SITE.town}</p>
      <p style="margin-top:10px"><a href="${SITE.directions}" target="_blank" rel="noopener">Get directions</a></p>
      <h2 style="margin-top:22px">Get in touch</h2>
      <p><a href="${SITE.tel}">${SITE.phone}</a><br><a href="mailto:${SITE.email}">${SITE.email}</a></p>
      <p style="font-size:13px;line-height:1.6;margin-top:10px;color:#9A8E77">The market is managed by Walthams, who handle all enquiries.</p>
    </div>
    <div>
      <h2>Opening hours</h2>
      <p>Tuesday to Saturday<br>10.00 to 5.30<br><span style="color:#9A8E77">Closed Sunday and Monday</span></p>
      <p style="font-size:13px;line-height:1.6;margin-top:10px;color:#9A8E77">Individual shops set their own days. Check a shop&rsquo;s page before a special trip.</p>
      <p style="margin-top:10px"><a href="${rel}visit.html">Plan your visit</a></p>
    </div>
    <div>
      <h2>Explore</h2>
      <nav class="fnav" aria-label="Footer">
        ${navLinks(rel, '')}
        <a href="${rel}join.html">Join the Market</a>
        <a href="${rel}contact.html">Contact</a>
      </nav>
      <div class="socials">${socials()}
      </div>
    </div>
  </div>
  <div class="legal">
    <span>&copy; <span data-year>2026</span> Wood Street Indoor Market. Trading since 1955.</span>
    <span style="display:flex;gap:18px;flex-wrap:wrap">
      <a href="${rel}legal.html#privacy">Privacy</a>
      <a href="${rel}legal.html#cookies">Cookies</a>
      <a href="${rel}legal.html#accessibility">Accessibility</a>
    </span>
    <span>Made on Wood Street, E17</span>
  </div>
</footer>
`;
}

const FAVICON = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#BF3B26"/><text x="16" y="22" text-anchor="middle" font-family="Georgia,serif" font-size="18" fill="#FBF3E2">W</text></svg>');

function page({ file, title, desc, active = '', rel = '', body, extraHead = '', ogImage = 'uploads/market-frontage.jpg' }) {
  const canonical = SITE.url + (file === 'index.html' ? '' : file);
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE.url}${ogImage}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#7C2A1D">
<link rel="icon" href="${FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=Archivo+Narrow:wght@500;600;700&family=Young+Serif&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${rel}assets/site.css">
${extraHead}</head>
<body>
${header(rel, active)}
<main id="main">
${body}
</main>

${footer(rel)}
<script src="${rel}assets/site.js" defer></script>
</body>
</html>
`;
}

const eyebrow = (t, light = false) => `<div class="eyebrow${light ? ' eyebrow-light' : ''}"><span></span><span>${t}</span></div>`;
const unitBadge = (u) => `<span class="unit">UNIT ${esc(u)}</span>`;
const catPill = (r) => r.category ? `<span class="cat" style="background:${r.fam.tint}">${esc(r.category)}</span>` : '';
const buildingLine = (r) => `${esc(r.side)} &middot; ${esc(SIDES[r.side].addr)}`;
function contactLinks(r, cls) {
  const out = [];
  for (const p of r.phones) out.push(`<a href="${telHref(p)}" class="${cls}" style="white-space:nowrap">${fmtPhone(p)}</a>`);
  if (r.links.website) out.push(`<a href="${esc(r.links.website)}" target="_blank" rel="noopener" class="${cls}">Website</a>`);
  if (r.links.instagram) out.push(`<a href="${esc(r.links.instagram)}" target="_blank" rel="noopener" class="${cls}">Instagram</a>`);
  if (r.links.email) out.push(`<a href="mailto:${esc(r.links.email)}" class="${cls}">Email</a>`);
  return out;
}
const legend = () => `<div class="legend">
${usedFamilies.map((f) => `        <span class="chip chip-static"><span class="dot" aria-hidden="true" style="background:${f.color}"></span>${esc(f.label)}</span>`).join('\n')}
        <span class="chip chip-tolet">To let</span>
      </div>`;

// ---------- the map ---------------------------------------------------------
// One U-shaped corridor, open at the bottom onto Wood Street. Market Side units
// line the outer wall, Antique City units the inner block. Both rings run the
// same way round: in from Wood Street, up the left arm, across the top, back
// down the right. The sequence is the real unit numbering; the shape is that
// walk drawn as a loop, not a measured plan.
function mapHtml({ rel = '', hrefFor = null, mini = false, highlight = [] } = {}) {
  const OUTER = bySide('Market Side'), INNER = bySide('Antique City');
  const hi = new Set(highlight);
  function splitRuns(list) {
    const boxes = list.map((r) => ({ r, span: unitSpan(r.unit) >= 2 ? 2 : 1 }));
    const total = boxes.reduce((a, b) => a + b.span, 0);
    const tLeft = Math.round(total * 0.3), tTop = Math.max(4, total - 2 * tLeft);
    const runs = { left: [], top: [], right: [] }; let acc = 0;
    for (const bx of boxes) {
      if (acc < tLeft) { runs.left.push(bx); acc += bx.span; }
      else if (acc < tLeft + tTop) { runs.top.push(bx); acc += bx.span; }
      else runs.right.push(bx);
    }
    return runs;
  }
  const slotsOf = (run) => run.reduce((a, b) => a + b.span, 0);
  const oRuns = splitRuns(OUTER), iRuns = splitRuns(INNER);
  const W = 980, PAD = 30, GAP = 8, OCOL = 138, OTOP = 96, CW = 64, ICOL = 126, ITOP = 90;
  const armSlots = Math.max(slotsOf(oRuns.left), slotsOf(oRuns.right));
  const ARM = Math.max(armSlots * 74, Math.max(slotsOf(iRuns.left), slotsOf(iRuns.right)) * 96);
  const oColY0 = PAD + OTOP, iColY0 = PAD + OTOP + CW + ITOP;
  const H = iColY0 + (ARM - CW - ITOP) + 46;
  const px = (v) => (v / W * 100).toFixed(2) + '%', py = (v) => (v / H * 100).toFixed(2) + '%';
  function layRing(runs, x0, x1, yTop, topH, colW, colY0, colLen) {
    const out = [];
    const lc = colLen / Math.max(1, slotsOf(runs.left)), rc = colLen / Math.max(1, slotsOf(runs.right));
    const tc = (x1 - x0) / Math.max(1, slotsOf(runs.top));
    let y = colY0 + colLen;
    for (const bx of runs.left) { y -= bx.span * lc; out.push({ ...bx, x: x0, y: y + GAP / 2, w: colW, h: bx.span * lc - GAP }); }
    let x = x0;
    for (const bx of runs.top) { out.push({ ...bx, x: x + GAP / 2, y: yTop, w: bx.span * tc - GAP, h: topH }); x += bx.span * tc; }
    y = colY0;
    for (const bx of runs.right) { out.push({ ...bx, x: x1 - colW, y: y + GAP / 2, w: colW, h: bx.span * rc - GAP }); y += bx.span * rc; }
    return out;
  }
  const placed = [
    ...layRing(oRuns, PAD, W - PAD, PAD, OTOP, OCOL, oColY0, ARM),
    ...layRing(iRuns, PAD + OCOL + CW, W - PAD - OCOL - CW, PAD + OTOP + CW, ITOP, ICOL, iColY0, ARM - CW - ITOP),
  ];
  const boxes = placed.map(({ r, x, y, w, h }) => {
    const pos = `left:${px(x)};top:${py(y)};width:${px(w)};height:${py(h)}`;
    const cls = hi.has(r.unit) ? ' mu-hi' : '';
    if (r.vacant) {
      return `      <div class="mu mu-vacant${cls}" style="${pos}"><span class="code">${esc(r.unit)}</span><span class="nm">To let</span></div>`;
    }
    const style = `${pos};--c:${r.fam.color};--t:${r.fam.tint}`;
    const inner = `<span class="code">${esc(r.unit)}</span><span class="nm">${esc(r.name)}</span>`;
    if (hrefFor) return `      <a class="mu${cls}" href="${hrefFor(r)}" style="${style}" aria-label="${esc(r.name)}, unit ${esc(r.unit)}">${inner}</a>`;
    return `      <div class="mu${cls}" style="${style}">${inner}</div>`;
  }).join('\n');
  const cx0 = PAD + OCOL, cx1 = W - PAD - OCOL, cy0 = PAD + OTOP;
  const corridor = `      <div class="cor" aria-hidden="true" style="left:${px(cx0)};top:${py(cy0)};width:${px(cx1 - cx0)};height:${py(CW)}"></div>
      <div class="cor" aria-hidden="true" style="left:${px(cx0)};top:${py(cy0)};width:${px(CW)};height:${py(H - cy0 - 40)}"></div>
      <div class="cor" aria-hidden="true" style="left:${px(cx1 - CW)};top:${py(cy0)};width:${px(CW)};height:${py(H - cy0 - 40)}"></div>
      <div class="walk" aria-hidden="true" style="left:${px(cx0 + CW / 2)};top:${py(cy0 + CW / 2)};width:${px(cx1 - cx0 - CW)};height:${py(H - cy0 - 40 - CW / 2)}"></div>
      <span class="lab lab-cor" aria-hidden="true" style="left:50%;transform:translateX(-50%);top:${py(cy0 + 22)}">THE CORRIDOR</span>
      <span class="lab" aria-hidden="true" style="left:${px(cx0 + CW / 2)};transform:translateX(-50%);bottom:${mini ? 6 : 12}px">IN</span>
      <span class="lab" aria-hidden="true" style="left:${px(cx1 - CW / 2)};transform:translateX(-50%);bottom:${mini ? 6 : 12}px">OUT</span>
      <span class="lab" aria-hidden="true" style="left:50%;transform:translateX(-50%);bottom:${mini ? 6 : 12}px;${mini ? '' : 'font-size:12px;letter-spacing:.16em'}">WOOD STREET</span>`;
  const label = mini
    ? 'The market at a glance: a U-shaped corridor with Market Side units along the outer wall and Antique City units on the inner block'
    : 'Map of the market: a U-shaped corridor with Market Side units along the outer wall and Antique City units on the inner block, in walking order from the Wood Street entrance';
  return `<div class="${mini ? 'map-mini' : 'map-scroll'}">
    <div class="map" role="group" aria-label="${label}" style="aspect-ratio:${W}/${H}">
${corridor}
${boxes}
    </div>
  </div>`;
}

// ---------- the easel -------------------------------------------------------
function easelPage(r, rel) {
  const photo = r.image
    ? `<figure class="easel-photo"><img src="${rel}${esc(r.image.src)}" alt="${esc(r.image.alt)}" width="1000" height="750" loading="lazy"></figure>`
    : `<!-- photo: add uploads/shops/shop-${r.slug}.jpg, set "image" for unit ${r.unit} in data/shops.json, rebuild -->
            <figure class="easel-photo easel-photo-empty" aria-hidden="true"><span>Photo on its way</span></figure>`;
  const meta = contactLinks(r, 'easel-meta-link');
  meta.push(`<a href="${rel}${r.href}" class="easel-meta-link">Full listing</a>`);
  return `          <li class="easel-page" id="shop-${r.slug}" data-unit="${esc(r.unit)}" data-building="${esc(r.side)}">
            ${photo}
            <div class="easel-text">
            <span class="easel-tags">
              ${unitBadge(r.unit)}
              <span class="easel-building">${buildingLine(r)}</span>
              ${catPill(r)}
            </span>
            <h3 class="easel-name"><span class="easel-swatch" style="background:${r.fam.color}" aria-hidden="true"></span><a href="${rel}${r.href}">${esc(r.name)}</a></h3>
            ${r.about ? `<p class="easel-about">${esc(r.about)}</p>` : `<p class="easel-about easel-about-pending">A fuller listing for this shop is on its way.</p>`}
            ${r.hoursNice ? `<p class="easel-hours">${esc(r.hoursNice)}</p>` : ''}
            <p class="easel-meta">${meta.join('')}</p>
            </div>
          </li>`;
}
function easelHtml(rel) {
  return `<div class="easel" data-easel tabindex="-1">
        <div class="easel-board">
          <span class="easel-clip" aria-hidden="true"></span>
          <div class="easel-sheet" data-easel-sheet>
          <ol class="easel-pad" data-easel-pad>
${withPhotoFirst.map((r) => easelPage(r, rel)).join('\n')}
          </ol>
          </div>
        </div>
        <div class="easel-stand" aria-hidden="true">
          <span class="easel-ledge"></span>
          <span class="easel-leg easel-leg-l"></span>
          <span class="easel-leg easel-leg-r"></span>
          <span class="easel-bar"></span>
        </div>
        <div class="easel-controls" data-easel-controls hidden>
          <button type="button" class="easel-btn" data-easel-prev aria-label="Previous shop">&larr; Previous</button>
          <span class="easel-count" data-easel-count aria-hidden="true"></span>
          <button type="button" class="easel-btn easel-btn-red" data-easel-next aria-label="Next shop">Next shop &rarr;</button>
        </div>
        <p class="easel-hint" data-easel-hint hidden>Use the arrow keys, or pick a shop from the list below.</p>
        <p class="sr-only" aria-live="polite" data-easel-live></p>
      </div>`;
}

// ---------- shop cards ------------------------------------------------------
function shopCard(r, rel, { withData = false } = {}) {
  const text = withData ? ` data-card data-fam="${r.fam.key}" data-text="${esc((r.name + ' ' + r.category + ' ' + r.about + ' ' + r.unit).toLowerCase())}"` : '';
  const photo = r.image ? `<span class="photo"><img src="${rel}${esc(r.image.src)}" alt="${esc(r.image.alt)}" width="1000" height="750" loading="lazy"></span>` : `<span class="stripe" aria-hidden="true"></span>`;
  return `<a href="${rel}${r.href}" class="shop-card tilt" style="--c:${r.fam.color}"${text}>
            ${photo}
            <span class="body">
              <span class="row">${unitBadge(r.unit)}${catPill(r)}</span>
              <span class="nm">${esc(r.name)}</span>
              <span class="ab">${r.about ? esc(r.about) : 'A fuller listing for this shop is on its way.'}</span>
              ${r.hoursNice ? `<span class="hr">${esc(r.hoursNice)}</span>` : ''}
              <span class="go">Step inside &rarr;</span>
            </span>
          </a>`;
}
const vacancyLine = (rel) => {
  const by = {};
  for (const v of vacant) (by[v.side] = by[v.side] || []).push(v.unit);
  const parts = Object.entries(by).map(([s, us]) => `${us.length} in ${esc(s)} (${us.map((u) => `<strong>${esc(u)}</strong>`).join(', ')})`).join(' and ');
  return `${vacant.length} units are currently available to let: ${parts}. <a href="${rel}join.html" style="font-weight:700">Enquire about taking one on</a>.`;
};

const statusLine = (extra = '') => `<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <span class="status-dot" data-open-dot aria-hidden="true"></span>
          <span data-open-detail style="font-family:'Archivo Narrow',sans-serif;font-weight:700;font-size:13.5px;letter-spacing:.06em;text-transform:uppercase">Open ${SITE.hoursShort}</span>${extra}
        </div>`;

// ---------- pages -----------------------------------------------------------
const out = {};

// Home
{
  const featured = [...shops.filter((s) => s.image), ...shops.filter((s) => !s.image && (s.phones.length || Object.keys(s.links).length)), ...shops.filter((s) => !s.image && !s.phones.length && !Object.keys(s.links).length)].slice(0, 6);
  out['index.html'] = page({
    file: 'index.html', active: '',
    title: 'Wood Street Indoor Market | 30 little shops in Walthamstow, E17',
    desc: 'An independent indoor market of around thirty small shops around one horseshoe corridor in Walthamstow E17, two minutes from Wood Street station. Open Tuesday to Saturday.',
    extraHead: `<script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org', '@type': 'ShoppingCenter', name: SITE.name,
      description: 'Independent indoor market of around thirty small shops arranged around one horseshoe corridor in Walthamstow, east London. Trading since 1955.',
      address: { '@type': 'PostalAddress', streetAddress: '98 & 102 Wood Street', addressLocality: 'Walthamstow, London', postalCode: 'E17 3HX', addressCountry: 'GB' },
      telephone: '+44 20 8509 0444', email: SITE.email, url: SITE.url, sameAs: [SITE.fb, SITE.ig, SITE.x],
      openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '10:00', closes: '17:30' }],
    })}</script>
`,
    body: `
  <section style="padding:52px 24px 64px">
    <div class="wrap two" style="gap:48px">
      <div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
          <span class="stamp" style="transform:rotate(-3deg)">EST. 1955</span>
          <span class="tag" style="transform:rotate(1.5deg)">WALTHAMSTOW &middot; E17</span>
          <span class="tag tag-teal" style="transform:rotate(-1deg)">TUESDAY TO SATURDAY</span>
        </div>
        <h1 style="font-size:clamp(38px,5.2vw,62px);line-height:1.04;margin:20px 0 16px">Thirty little shops. Hundreds of things you weren&rsquo;t looking for.</h1>
        <p style="font-size:17.5px;line-height:1.6;color:#5C5142;max-width:56ch;margin:0 0 26px">An indoor market bent round one horseshoe corridor just off Wood Street. ${shops.length} small independent shops, side by side under one roof, and a different set of finds every time you walk it.</p>
        <div style="display:flex;gap:14px;flex-wrap:wrap">
          <a href="shops.html" class="btn btn-red">Explore the Shops</a>
          <a href="visit.html" class="btn btn-cream">Plan Your Visit</a>
        </div>
        <div style="margin-top:26px">${statusLine(`
          <span class="muted">&middot;</span>
          <span style="font-size:14px;color:#5C5142">Two minutes from Wood Street station</span>`)}</div>
      </div>
      <div style="position:relative;max-width:430px;justify-self:center;width:100%">
        <div aria-hidden="true" style="position:absolute;left:18px;top:18px;right:-14px;bottom:-14px;background:#DCA528;border:2px solid #29231C;border-radius:14px"></div>
        <div class="photo-frame" style="position:relative">
          <img src="uploads/market-frontage.jpg" alt="The painted frontage of 98 Wood Street Indoor Market, red with blue and green window frames and the market name above the door" width="800" height="1067" style="width:100%;height:auto">
        </div>
        <span style="position:absolute;top:-16px;right:14px;background:#BF3B26;color:#FBF3E2;border:2px solid #29231C;border-radius:999px;padding:7px 14px;font-family:'Archivo Narrow',sans-serif;font-weight:700;font-size:12.5px;letter-spacing:.08em;transform:rotate(3deg);box-shadow:2px 2px 0 #29231C">FIND US ON WOOD STREET</span>
      </div>
    </div>
  </section>

  <section class="sec sec-alt">
    <div class="wrap">
      ${eyebrow('Start somewhere')}
      <h2 class="h2">What are you after?</h2>
      <p class="lede" style="margin-bottom:30px">${usedFamilies.length} trades, ${shops.length} shops, one corridor. Pick a thread and pull.</p>
      <div class="grid grid-cats">
${usedFamilies.map((f) => `        <a href="shops.html#cat=${f.key}" class="cat-card tilt">
          <span class="nm"><span class="sw" aria-hidden="true" style="background:${f.color}"></span>${esc(f.label)}</span>
          <span class="ct">${famCount(f)} ${famCount(f) === 1 ? 'shop' : 'shops'}</span>
        </a>`).join('\n')}
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      <div class="sec-head">
        <div>
          ${eyebrow('Meet the shops')}
          <h2 class="h2">The people behind the counters</h2>
        </div>
        <a href="shops.html" class="more">Explore all ${shops.length} shops &rarr;</a>
      </div>
      <div class="grid grid-cards">
${featured.map((r) => '          ' + shopCard(r, '')).join('\n')}
      </div>
    </div>
  </section>

  <section class="sec sec-alt">
    <div class="wrap two" style="gap:48px">
      <div>
        ${eyebrow('The famous horseshoe')}
        <h2 class="h2" style="margin-bottom:10px">One corridor. Thirty doors.</h2>
        <p style="font-size:16.5px;line-height:1.65;color:#5C5142;max-width:52ch;margin:0 0 22px">The market bends round a single horseshoe corridor. In one door, round the loop, out wherever you end up. Market Side units line the outer wall, Antique City units the inner block, and the map knows every one of them.</p>
        <div style="margin-bottom:26px">${legend()}</div>
        <a href="map.html" class="btn btn-cream">Open the market map &rarr;</a>
      </div>
      <div>
        <a href="map.html" aria-label="Open the market map" style="display:block;text-decoration:none;color:inherit">
          ${mapHtml({ mini: true })}
        </a>
        <p class="note">The order the units come in, not measured distances. Tap for the full map.</p>
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      <div class="sec-head">
        <div>
          ${eyebrow('Worth a diary note')}
          <h2 class="h2">What&rsquo;s on at the market</h2>
        </div>
        <a href="whats-on.html" class="more">See what&rsquo;s on &rarr;</a>
      </div>
      <div class="empty">
        <p class="big">Nothing in the diary just now.</p>
        <p>Fairs, late openings and market days will be listed here as they are fixed. Until then the shops themselves are the event, Tuesday to Saturday.</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">
          <a href="${SITE.ig}" target="_blank" rel="noopener" class="btn btn-cream btn-sm">Follow on Instagram</a>
          <a href="${SITE.fb}" target="_blank" rel="noopener" class="btn btn-cream btn-sm">Follow on Facebook</a>
        </div>
      </div>
    </div>
  </section>

  <section class="sec sec-alt">
    <div class="wrap two" style="gap:48px">
      <div style="position:relative;max-width:380px;width:100%;justify-self:center">
        <div class="photo-arch">
          <img src="uploads/market-entrance.jpg" alt="The Wood Street Market entrance, a red shopfront with a clock above the hand-painted market sign and bunting across the doorway" width="452" height="679" loading="lazy" style="width:100%;height:auto">
        </div>
        <span class="stamp" style="position:absolute;bottom:18px;right:-12px;transform:rotate(-4deg);font-size:12px;padding:6px 13px">SINCE 1955</span>
      </div>
      <div>
        ${eyebrow('Our story')}
        <h2 class="h2" style="margin-bottom:14px">From picture palace to market hall</h2>
        <p style="font-size:16.5px;line-height:1.65;color:#5C5142;max-width:56ch;margin:0 0 14px">Before the stalls came the screen. The site had an earlier life as a local cinema, and the building still carries the shape of it: one long looping corridor where the audience used to be.</p>
        <p style="font-size:16.5px;line-height:1.65;color:#5C5142;max-width:56ch;margin:0 0 26px">Since 1955 it has been a market. Thirty-odd small shops trading side by side while Wood Street changed around them. The faces turn over; the horseshoe holds.</p>
        <a href="story.html" class="btn btn-cream">Read our story &rarr;</a>
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      <div class="sec-head">
        <div>
          ${eyebrow('The practical bit')}
          <h2 class="h2">Plan your visit</h2>
        </div>
        <a href="visit.html" class="more">Everything you need to know &rarr;</a>
      </div>
      <div class="grid grid-3">
        <div class="card">
          <h3 class="card-label">Where</h3>
          <p style="font-size:16px;font-weight:600;color:#29231C">${SITE.address}<br>${SITE.town}</p>
          <a href="${SITE.directions}" target="_blank" rel="noopener" style="display:inline-block;margin-top:14px;font-weight:700;font-size:14.5px">Get directions</a>
        </div>
        <div class="card">
          <h3 class="card-label">When</h3>
          <div style="display:flex;justify-content:space-between;gap:12px;font-size:15px;padding:4px 0"><span>Tuesday to Saturday</span><span style="font-weight:700">10.00 to 5.30</span></div>
          <div style="display:flex;justify-content:space-between;gap:12px;font-size:15px;padding:4px 0;color:#8A7B5E"><span>Sunday &amp; Monday</span><span>Closed</span></div>
          <div style="margin-top:12px">${statusLine()}</div>
        </div>
        <div class="card">
          <h3 class="card-label">Getting here</h3>
          <p>Wood Street station is two minutes on foot, about 17 minutes from Liverpool Street on the Overground. The W16 bus stops right outside; the 123, 212, 230, 275 and W12 are a short walk.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="sec" style="background:#DCA528;padding:56px 24px">
    <div class="wrap" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:28px">
      <div style="max-width:60ch">
        <h2 style="font-size:clamp(28px,3.6vw,40px);line-height:1.08;margin:0 0 10px">Got a shop in you?</h2>
        <p style="font-size:16.5px;line-height:1.6;margin:0 0 16px;color:#4A3C14">${vacant.length} units are looking for their next keeper. Small spaces, straightforward terms, and a ready made Saturday crowd.</p>
        <div style="display:flex;gap:9px;flex-wrap:wrap">
${vacant.map((v) => `          ${unitBadge(v.unit)}`).join('\n')}
        </div>
      </div>
      <a href="join.html" class="btn btn-ink">Join the market &rarr;</a>
    </div>
  </section>

  <section class="sec sec-alt">
    <div class="wrap">
      <div class="sec-head">
        <div>
          ${eyebrow('@woodstreetindoormarket')}
          <h2 class="h2">Inside the market</h2>
        </div>
        <a href="${SITE.ig}" target="_blank" rel="noopener" class="btn btn-cream btn-sm">Follow along</a>
      </div>
      <div class="gallery">
        <div><img src="uploads/market-corridor.jpg" alt="Inside the market corridor, lined with leather bags, rugs and homeware" width="646" height="430" loading="lazy"></div>
        <div><img src="uploads/coven-of-wiches.jpg" alt="The Coven of Wiches at unit 38, a plant based deli and pickle house with a bright yellow shopfront and bunting overhead" width="785" height="1000" loading="lazy" style="object-position:center top"></div>
        <div><img src="uploads/belas-brocante.jpg" alt="Bela's Brocante at unit 31, pictures and collectables around the doorway, looking on down the market corridor" width="730" height="1000" loading="lazy" style="object-position:center 15%"></div>
        <div><img src="uploads/market-entrance.jpg" alt="The market entrance on Wood Street with its clock and bunting" width="452" height="679" loading="lazy" style="object-position:center 30%"></div>
      </div>
    </div>
  </section>
`,
  });
}

// The Shops
{
  out['shops.html'] = page({
    file: 'shops.html', active: 'shops',
    title: 'The Shops | Wood Street Indoor Market',
    desc: `${shops.length} independent shops across two sides of one corridor in Walthamstow E17. Flip through them on the easel, or search by what you are after.`,
    body: `
  <section class="page-head">
    <div class="wrap">
      ${eyebrow('The directory')}
      <h1 class="h1">The Shops</h1>
      <p class="lede" style="max-width:64ch">${shops.length} independents across ${units.length} units, Tuesday to Saturday. Every shop is run by the person behind the counter, so most keep their own days and hours inside the market&rsquo;s opening times. Ring ahead if you are making the trip for one in particular.</p>
    </div>
  </section>

  <section id="easel" style="padding:12px 24px 64px">
    <div class="wrap">
      ${easelHtml('')}
      <p style="font-size:14.5px;line-height:1.6;color:#5C5142;max-width:62ch;margin:30px auto 0;text-align:center">${vacancyLine('')}</p>
    </div>
  </section>

  <section id="all" class="sec sec-alt" data-shops>
    <div class="wrap">
      ${eyebrow('Every shop')}
      <h2 class="h2">Search the market</h2>
      <p class="lede" style="margin-bottom:26px">Try a shop name, a trade or a unit number. Or pick a trade and browse.</p>
      <div class="filters">
        <label style="display:block">
          <span class="label">Search the market</span>
          <input type="search" class="field" data-search placeholder="Try &lsquo;vinyl&rsquo;, &lsquo;jewellery&rsquo;, &lsquo;toys&rsquo;, &lsquo;A16&rsquo;" aria-label="Search shops">
        </label>
        <div class="chips">
${usedFamilies.map((f) => `          <a href="#cat=${f.key}" class="chip" data-cat="${f.key}" aria-pressed="false" role="button"><span class="dot" aria-hidden="true" style="background:${f.color}"></span>${esc(f.label)} <span style="opacity:.6">${famCount(f)}</span></a>`).join('\n')}
          <a href="#" class="linkbtn" data-clear>Clear all</a>
        </div>
      </div>
      <p class="results" aria-live="polite" data-count>Showing all ${shops.length} shops, the ones with photos first</p>
      <div class="grid grid-cards">
${withPhotoFirst.map((r) => '        ' + shopCard(r, '', { withData: true })).join('\n')}
      </div>
      <div class="empty" data-empty hidden>
        <p class="big">Nothing under that name, yet.</p>
        <p>The corridor is full of things that don&rsquo;t match their labels. Clear the search and browse the loop, or ask any trader when you visit.</p>
        <a href="#" class="btn btn-cream btn-sm" data-clear>Clear everything</a>
        <p style="font-size:14px;color:#8A7B5E;margin:20px 0 0">Reckon the market needs it? <a href="join.html" style="font-weight:700">Open the shop yourself &rarr;</a></p>
      </div>
    </div>
  </section>
`,
  });
}

// One page per shop
for (const r of shops) {
  const side = bySide(r.side).filter((u) => !u.vacant);
  const idx = side.findIndex((u) => u.unit === r.unit);
  const neighbours = [];
  if (idx > 0) neighbours.push(side[idx - 1]);
  if (idx < side.length - 1) neighbours.push(side[idx + 1]);
  const kin = shops.find((s) => s.unit !== r.unit && s.fam.key === r.fam.key && r.fam.key && !neighbours.includes(s));
  if (kin) neighbours.push(kin);
  const rel = '../';
  const contacts = contactLinks(r, '');
  const photo = r.image
    ? `<div class="photo-real" style="transform:rotate(-.5deg)"><img src="${rel}${esc(r.image.src)}" alt="${esc(r.image.alt)}" width="1000" height="750"></div>`
    : `<!-- photo: add uploads/shops/shop-${r.slug}.jpg, set "image" for unit ${r.unit} in data/shops.json, rebuild -->
            <div class="photo-slot" style="transform:rotate(-.5deg)" aria-hidden="true"><span>Photo on its way</span></div>`;
  const ld = {
    '@context': 'https://schema.org', '@type': 'Store', name: r.name, url: SITE.url + r.href,
    address: { '@type': 'PostalAddress', streetAddress: `${SIDES[r.side].addr}, unit ${r.unit}`, addressLocality: 'Walthamstow, London', postalCode: 'E17 3HX', addressCountry: 'GB' },
    containedInPlace: { '@type': 'ShoppingCenter', name: SITE.name, url: SITE.url },
  };
  if (r.about) ld.description = r.about;
  if (r.phones.length) ld.telephone = '+44 ' + r.phones[0].slice(1);
  if (r.links.website) ld.sameAs = [r.links.website, r.links.instagram].filter(Boolean);
  else if (r.links.instagram) ld.sameAs = [r.links.instagram];
  if (r.image) ld.image = SITE.url + r.image.src;

  out[r.href] = page({
    file: r.href, active: 'shops', rel,
    title: `${r.name} | Wood Street Indoor Market`,
    desc: r.about || `${r.name}, unit ${r.unit} at Wood Street Indoor Market, Walthamstow E17.`,
    ogImage: r.image ? r.image.src : 'uploads/market-frontage.jpg',
    extraHead: `<script type="application/ld+json">${JSON.stringify(ld)}</script>\n`,
    body: `
  <div style="background:${r.fam.tint};border-bottom:2px solid #29231C">
    <div class="wrap" style="padding:36px 24px 40px">
      <nav aria-label="Breadcrumb" class="crumbs">
        <a href="${rel}index.html">Home</a><span class="sep" aria-hidden="true">/</span><a href="${rel}shops.html">The Shops</a><span class="sep" aria-hidden="true">/</span><span style="font-weight:700">${esc(r.name)}</span>
      </nav>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:14px">
        ${unitBadge(r.unit)}
        <span class="cat" style="background:#FBF5E7">${esc(r.side)} &middot; ${esc(SIDES[r.side].addr)}</span>
        ${r.category ? `<span class="cat" style="background:#FBF5E7">${esc(r.category)}</span>` : ''}
      </div>
      <h1 style="font-size:clamp(34px,4.6vw,54px);line-height:1.05;margin:0 0 12px">${esc(r.name)}</h1>
      ${r.about ? `<p style="font-size:18px;line-height:1.55;color:#3E362B;max-width:60ch;margin:0">${esc(r.about)}</p>` : `<p style="font-size:18px;line-height:1.55;color:#5C5142;max-width:60ch;margin:0;font-style:italic">A fuller listing for this shop is on its way. Come and see for yourself in the meantime.</p>`}
    </div>
  </div>
  <section style="padding:56px 24px 72px">
    <div class="wrap two two-top">
      <div style="min-width:0">
        <h2 style="font-size:26px;margin:0 0 16px">A look inside</h2>
        ${photo}
        <h2 style="font-size:26px;margin:36px 0 12px">Finding them</h2>
        <p style="font-size:16.5px;line-height:1.7;margin:0 0 18px">${esc(r.name)} is unit ${esc(r.unit)} in ${esc(r.side)}, ${esc(SIDES[r.side].addr)}, on ${SIDES[r.side].where}. Follow the loop round from the Wood Street entrance and you will pass it.</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <a href="${rel}map.html#unit-${r.slug}" class="btn btn-cream btn-sm">See it on the map</a>
          <a href="${rel}shops.html#shop-${r.slug}" class="btn btn-cream btn-sm">Flip to it on the easel</a>
        </div>
      </div>
      <aside style="display:grid;gap:18px;align-content:start">
        <div class="card">
          <h2 class="card-label">The practical bit</h2>
          <div style="display:grid;gap:12px;font-size:14.5px;line-height:1.55">
            <div><span style="display:block;font-weight:700;font-size:13px;margin-bottom:2px">Open</span>${r.hoursNice ? esc(r.hoursNice) : 'Within market hours'} <span class="muted">(the market opens ${SITE.hoursShort}; shop hours can differ)</span></div>
            <div><span style="display:block;font-weight:700;font-size:13px;margin-bottom:2px">Find them</span>Unit ${esc(r.unit)}, ${esc(r.side)}, ${esc(SIDES[r.side].addr)}</div>
            ${contacts.length ? `<div><span style="display:block;font-weight:700;font-size:13px;margin-bottom:2px">Get in touch</span><span style="display:flex;gap:14px;flex-wrap:wrap;font-weight:700">${contacts.join('')}</span></div>` : `<div><span style="display:block;font-weight:700;font-size:13px;margin-bottom:2px">Get in touch</span><span class="muted">No contact details published yet. Drop in during market hours.</span></div>`}
          </div>
        </div>
        <div class="card">
          <h2 class="card-label">On the corridor</h2>
          ${mapHtml({ mini: true, highlight: [r.unit] })}
          <a href="${rel}map.html#unit-${r.slug}" style="display:inline-block;margin-top:14px;font-weight:700;font-size:14.5px">Open the market map &rarr;</a>
        </div>
        ${neighbours.length ? `<div class="card">
          <h2 class="card-label">Good neighbours</h2>
          <div style="display:grid;gap:9px">
${neighbours.map((n) => `            <a href="${rel}${n.href}" class="row-card">${unitBadge(n.unit)}<span class="nm">${esc(n.name)}</span><span class="ar" aria-hidden="true">&rarr;</span></a>`).join('\n')}
          </div>
        </div>` : ''}
        <a href="${rel}visit.html" class="btn btn-red" style="text-align:center">Plan your visit &rarr;</a>
      </aside>
    </div>
  </section>
`,
  });
}

// Map
{
  const list = (s) => bySide(s).map((u) => u.vacant
    ? `        <li id="unit-${u.slug}"><span class="sw" aria-hidden="true" style="background:#F6EDDA;border-style:dashed;border-color:#C4684E"></span>${unitBadge(u.unit)}<span style="color:#A94A32;font-weight:700;font-size:12px;letter-spacing:.06em;text-transform:uppercase">To let</span><a href="join.html" style="margin-left:auto;font-size:13px;font-weight:600">Enquire</a></li>`
    : `        <li id="unit-${u.slug}"><span class="sw" aria-hidden="true" style="background:${u.fam.color}"></span>${unitBadge(u.unit)}<a href="${u.href}">${esc(u.name)}</a></li>`).join('\n');
  out['map.html'] = page({
    file: 'map.html', active: 'map',
    title: 'The Market Map | Wood Street Indoor Market',
    desc: 'Every unit at Wood Street Indoor Market on one map: a U-shaped corridor with Market Side along the outer wall and Antique City on the inner block.',
    body: `
  <section class="page-head">
    <div class="wrap">
      ${eyebrow('Find your way round')}
      <h1 class="h1">The Market Map</h1>
      <p class="lede" style="max-width:70ch">One corridor, bent into a U, with shops down both sides of the walkway. Market Side units line the outer wall and Antique City units the inner block, and both run the same way round: in from Wood Street, up one arm, across the top and back down the other. The map shows the order the units come in rather than measured distances, so it is a visitor guide, not an architectural plan. Tap any unit to open that shop.</p>
    </div>
  </section>
  <section style="padding:16px 24px 56px">
    <div class="wrap">
      <div class="map-card">
        <div class="head">
          <h2>One corridor, two sides</h2>
          <span>Outer: Market Side (M) &middot; Inner: Antique City (A)</span>
        </div>
        ${mapHtml({ hrefFor: (r) => r.href })}
      </div>
      ${legend()}
    </div>
  </section>
  <section class="sec sec-alt">
    <div class="wrap">
      ${eyebrow('The same thing as a list')}
      <h2 class="h2">Every unit, in walking order</h2>
      <p class="lede" style="margin-bottom:30px">Each side is listed from the Wood Street entrance round to the exit. ${vacancyLine('')}</p>
      <div class="two two-top" style="gap:36px">
        <div>
          <h3 style="font-size:24px;margin:0 0 4px">Market Side</h3>
          <p style="font-family:'Archivo Narrow',sans-serif;font-weight:700;font-size:12.5px;letter-spacing:.14em;text-transform:uppercase;color:#7C2A1D;margin:0 0 16px">Outer wall &middot; 102a Wood Street</p>
          <ul class="unit-list" style="grid-template-columns:1fr">
${list('Market Side')}
          </ul>
        </div>
        <div>
          <h3 style="font-size:24px;margin:0 0 4px">Antique City</h3>
          <p style="font-family:'Archivo Narrow',sans-serif;font-weight:700;font-size:12.5px;letter-spacing:.14em;text-transform:uppercase;color:#7C2A1D;margin:0 0 16px">Inner block &middot; 98 Wood Street</p>
          <ul class="unit-list" style="grid-template-columns:1fr">
${list('Antique City')}
          </ul>
        </div>
      </div>
    </div>
  </section>
`,
  });
}

// Visit
{
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const hoursRows = [1, 2, 3, 4, 5, 6, 0].map((d) => {
    const open = d >= 2 && d <= 6;
    return `            <div data-day="${d}"${open ? '' : ' class="closed"'}><span>${days[d]}</span><span>${open ? '10.00 to 5.30' : 'Closed'}</span></div>`;
  }).join('\n');
  const faqs = [
    ['Do all the shops open every day?', `The market opens ${SITE.hoursShort}, but individual traders set their own days and hours, and a few open Wednesday to Saturday or Saturday only. If you are making a special trip for one shop, check its page or ring ahead.`],
    ['Can I pay by card?', 'Most traders take cards. A few of the smaller units are cash friendlier, so a little cash in your pocket never hurts.'],
    ['Is the market step free?', `The market trades on one level inside, around a single looping corridor. For entrance thresholds and facilities, ring ${SITE.phone} and we will talk your visit through.`],
    ['Are dogs welcome?', 'Well behaved dogs on leads are welcome in the corridor. Individual shops set their own rules, so ask at the door.'],
    ['Is there parking?', 'Street parking around Wood Street is limited and mostly pay and display or permit. Coming by train, bus or bike is easier.'],
    ['I want to open a shop here. Who do I talk to?', `Walthams manage the market and handle every unit enquiry. Email ${SITE.email} or ring ${SITE.phone}, or start on the <a href="join.html">Join the Market</a> page.`],
  ];
  out['visit.html'] = page({
    file: 'visit.html', active: 'visit',
    title: 'Plan Your Visit | Wood Street Indoor Market',
    desc: 'Opening hours, directions, buses and trains, and what to expect inside Wood Street Indoor Market, Walthamstow E17.',
    body: `
  <section class="page-head" style="padding-bottom:28px">
    <div class="wrap-n">
      ${eyebrow('The practical bit')}
      <h1 class="h1" style="margin-bottom:14px">Plan Your Visit</h1>
      <div style="display:inline-flex;align-items:center;gap:10px;background:#FBF5E7;border:2px solid #29231C;border-radius:999px;padding:10px 18px;box-shadow:3px 3px 0 rgba(41,35,28,.85)">
        <span class="status-dot" data-open-dot aria-hidden="true" style="width:11px;height:11px"></span>
        <span data-open-detail style="font-family:'Archivo Narrow',sans-serif;font-weight:700;font-size:14px;letter-spacing:.06em;text-transform:uppercase">Open ${SITE.hoursShort}</span>
      </div>
    </div>
  </section>
  <section style="padding:16px 24px 8px">
    <div class="wrap-n grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">
      <div class="card">
        <h2 class="card-label">Where</h2>
        <p style="font-size:16.5px;font-weight:600;color:#29231C">${SITE.address}<br>${SITE.town}</p>
        <p style="margin-top:10px">Two doors onto Wood Street: 98 for Antique City and 102a for Market Side. Inside, it is all one corridor.</p>
        <a href="${SITE.directions}" target="_blank" rel="noopener" class="btn btn-red btn-sm" style="margin-top:14px">Get directions</a>
      </div>
      <div class="card">
        <h2 class="card-label">Opening hours</h2>
        <div class="hours">
${hoursRows}
        </div>
        <p style="font-size:12.5px;margin-top:12px;color:#8A7B5E;line-height:1.55">Individual shops set their own days and hours. Check a shop&rsquo;s page before a special trip.</p>
      </div>
      <div class="card">
        <h2 class="card-label">Getting here</h2>
        <div style="display:grid;gap:12px;font-size:14.5px;line-height:1.6">
          <div><span style="display:block;font-weight:700;font-size:13px">By train</span>Wood Street station is a two minute walk. Turn right out of the station and the market is on your left. Roughly 17 minutes from Liverpool Street on the Overground, 7 from Chingford. Walthamstow Central on the Victoria line is about a 15 minute walk.</div>
          <div><span style="display:block;font-weight:700;font-size:13px">By bus</span>The W16 stops right outside. The 123, 212, 230, 275 and W12 stop within a short walk.</div>
          <div><span style="display:block;font-weight:700;font-size:13px">By bike or car</span>Street parking is limited and mostly pay and display. The train really is easier.</div>
        </div>
      </div>
      <div class="card">
        <h2 class="card-label">Inside the market</h2>
        <div style="display:grid;gap:12px;font-size:14.5px;line-height:1.6">
          <p>The market trades on one level, around a single looping corridor. Some units are snug and browsing can be close quarters, but traders are quick to help reach or fetch things.</p>
          <p>Most traders take cards, though a few of the smaller units are cash friendlier.</p>
          <p>Well behaved dogs on leads are welcome in the corridor. Individual shops set their own rules.</p>
          <p>For anything else, including access questions, ring <a href="${SITE.tel}" style="font-weight:700">${SITE.phone}</a> and we will talk your visit through.</p>
        </div>
      </div>
    </div>
  </section>
  <section style="padding:40px 24px 24px">
    <div class="wrap-n two" style="gap:36px">
      <div>
        <h2 class="h3" style="margin-bottom:10px">Know before you go</h2>
        <p style="font-size:15.5px;line-height:1.65;color:#5C5142;margin:0 0 18px">One corridor, thirty doors, no wrong turns. If you are hunting something specific, check the map or the directory before you set out.</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <a href="map.html" class="btn btn-cream btn-sm">Market map</a>
          <a href="shops.html" class="btn btn-cream btn-sm">The shops</a>
          <a href="whats-on.html" class="btn btn-cream btn-sm">What&rsquo;s on</a>
        </div>
      </div>
      <div>
        <a href="map.html" aria-label="Open the market map" style="display:block;text-decoration:none;color:inherit">
          ${mapHtml({ mini: true })}
        </a>
        <p class="note">The horseshoe at a glance. Tap for the full map.</p>
      </div>
    </div>
  </section>
  <section style="padding:32px 24px 80px">
    <div class="wrap-r">
      <h2 class="h3">Questions people ask</h2>
      <div class="faq">
${faqs.map(([q, a]) => `        <details>
          <summary>${q}</summary>
          <p>${a}</p>
        </details>`).join('\n')}
      </div>
    </div>
  </section>
`,
  });
}

// What's On
{
  out['whats-on.html'] = page({
    file: 'whats-on.html', active: 'whatson',
    title: "What’s On | Wood Street Indoor Market",
    desc: 'Fairs, late openings and market days at Wood Street Indoor Market, Walthamstow E17, as they are announced.',
    body: `
  <section class="page-head">
    <div class="wrap-n">
      ${eyebrow('Fairs, lates &amp; doings')}
      <h1 class="h1">What&rsquo;s On</h1>
      <p class="lede">Record fairs, late openings, kilo sales and the market&rsquo;s birthday will all be listed here as they are fixed. Most things are free and none of them need a ticket. Just turn up.</p>
    </div>
  </section>
  <section style="padding:12px 24px 72px">
    <div class="wrap-n">
      <div class="empty" style="padding:56px 28px">
        <p class="big">Nothing in the diary just now.</p>
        <p>The shops themselves are the event, ${SITE.hoursShort}. When there is something to put in the diary it will appear here first, and on the market&rsquo;s social pages.</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">
          <a href="${SITE.ig}" target="_blank" rel="noopener" class="btn btn-cream btn-sm">Instagram</a>
          <a href="${SITE.fb}" target="_blank" rel="noopener" class="btn btn-cream btn-sm">Facebook</a>
          <a href="${SITE.x}" target="_blank" rel="noopener" class="btn btn-cream btn-sm">X</a>
        </div>
      </div>
      <div style="margin-top:44px;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:18px" class="card">
        <p style="font-size:16px;font-weight:600;max-width:52ch;color:#29231C">Running a fair, a launch or a late at the market? Walthams can help you set it up.</p>
        <a href="${enquire('Wood Street Indoor Market event enquiry')}" class="btn btn-ink btn-sm">Email about an event &rarr;</a>
      </div>
    </div>
  </section>
`,
  });
}

// Journal
{
  out['journal.html'] = page({
    file: 'journal.html', active: 'journal',
    title: 'The Journal | Wood Street Indoor Market',
    desc: 'Trader interviews, collecting guides and market news from Wood Street Indoor Market, Walthamstow E17.',
    body: `
  <section class="page-head">
    <div class="wrap-n">
      ${eyebrow('Stories from inside')}
      <h1 class="h1">The Journal</h1>
      <p class="lede">Trader interviews, collecting guides, market news and the odd wander up Wood Street. The first stories are being written.</p>
    </div>
  </section>
  <section style="padding:12px 24px 80px">
    <div class="wrap-n">
      <div class="empty" style="padding:56px 28px">
        <p class="big">No stories published yet.</p>
        <p>In the meantime, the shops are the best story in the building. Every one of them has a page, and ${shops.filter((s) => s.image).length} already have photographs.</p>
        <a href="shops.html" class="btn btn-red btn-sm">Meet the shops</a>
      </div>
      <div style="margin-top:44px;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:18px;background:#DCA528" class="card">
        <p style="font-size:16px;font-weight:600;max-width:52ch;color:#29231C">Traded here? Shopped here since the sixties? We are collecting the market&rsquo;s history: photographs, receipts, memories, tall tales.</p>
        <a href="contact.html" class="btn btn-ink btn-sm">Share a memory &rarr;</a>
      </div>
    </div>
  </section>
`,
  });
}

// Our Story
{
  const tl = [
    ['Early 1900s', 'A picture house on Wood Street', true, 'Before the stalls came the screen. The site had an earlier life as a local cinema, and the building still carries the shape of it. Exact dates, names and photographs are being confirmed with local archives.'],
    ['1955', 'The market opens its doors', false, 'The building begins trading as an indoor market: small units, low rents, and a corridor that bends round in a horseshoe so no shop is ever a dead end.'],
    ['1960s to 80s', 'Decades of dealers', true, 'Furniture, records, tools and tailoring. The market becomes the kind of place where you could furnish a flat and get your trousers taken up in the same afternoon. Trader histories are being gathered; share yours.'],
    ['1990s to 2000s', 'The high street changes; the horseshoe holds', false, 'Chains come and go on the high streets around it. The market keeps doing what it has always done: small independent shops, side by side, run by the people behind the counter.'],
    ['2010s', 'A new wave joins the old guard', false, 'Vinyl comes back round, makers move in, and a new generation of collectors discovers what E17 already knew. The mix of old hands and new keepers becomes the market&rsquo;s signature.'],
    ['Today', 'Thirty little shops, one corridor', false, `${shops.length} shops trade Tuesday to Saturday: vintage, records, jewellery, toys, books, crafts, beauty and a juice bar, a couple of minutes from Wood Street station.`],
  ];
  out['story.html'] = page({
    file: 'story.html', active: 'story',
    title: 'Our Story | Wood Street Indoor Market',
    desc: 'From picture palace to market hall: the history of Wood Street Indoor Market in Walthamstow, trading since 1955.',
    ogImage: 'uploads/market-entrance.jpg',
    body: `
  <section class="page-head" style="padding-bottom:8px">
    <div class="wrap-n two">
      <div>
        ${eyebrow('Since 1955')}
        <h1 class="h1" style="margin-bottom:14px">Our Story</h1>
        <p style="font-size:17px;line-height:1.65;color:#3E362B;max-width:56ch;margin:0 0 14px">Most markets sprawl. This one bends: one corridor looped like a horseshoe, thirty small doors, and seventy years of people finding things they weren&rsquo;t looking for.</p>
        <p style="font-size:15.5px;line-height:1.65;color:#5C5142;max-width:56ch;margin:0">We are piecing the full history together properly, with local archives and the people who lived it. Items below marked <span class="tbc">TO BE CONFIRMED</span> are still being verified. No invented dates here.</p>
      </div>
      <div style="position:relative;max-width:380px;width:100%;justify-self:center">
        <div class="photo-arch" style="border-radius:190px 190px 12px 12px">
          <img src="uploads/market-entrance.jpg" alt="The Wood Street Market entrance, a red shopfront with a clock above the hand-painted market sign and bunting across the doorway" width="452" height="679" style="width:100%;height:auto">
        </div>
        <span class="stamp" style="position:absolute;bottom:22px;right:-12px;transform:rotate(-4deg);font-size:12px;padding:6px 13px">EST. 1955</span>
      </div>
    </div>
  </section>
  <section style="padding:48px 24px 64px">
    <div class="wrap-r">
      <ol class="tl">
${tl.map(([era, title, tbc, text]) => `        <li>
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span class="era">${era}</span>${tbc ? '<span class="tbc" title="Being verified with local archives">TO BE CONFIRMED</span>' : ''}</div>
          <h2>${title}</h2>
          <p>${text}</p>
        </li>`).join('\n')}
      </ol>
    </div>
  </section>
  <section class="sec" style="background:#17605B;color:#F3ECD9;padding:56px 24px">
    <div class="wrap-r" style="text-align:center">
      <h2 style="font-size:clamp(26px,3.4vw,36px);margin:0 0 12px;color:#F8F1E1">Traded here? Shopped here since the sixties?</h2>
      <p style="font-size:16px;line-height:1.65;color:#BFD8D0;margin:0 auto 24px;max-width:56ch">We are collecting the market&rsquo;s history: photographs, receipts, memories, tall tales. Help us tell it properly.</p>
      <a href="contact.html" class="btn btn-gold">Share a memory &rarr;</a>
    </div>
  </section>
  <section class="sec" style="padding:56px 24px">
    <div class="wrap-n" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:24px">
      <div>
        <h2 class="h3" style="margin-bottom:8px">The story continues on the shop floor</h2>
        <p style="font-size:15.5px;color:#5C5142;margin:0">${shops.length} independents are writing the next chapter, Tuesday to Saturday.</p>
      </div>
      <a href="shops.html" class="btn btn-red">Explore the Shops</a>
    </div>
  </section>
`,
  });
}

// Join the Market
{
  const faqs = [
    ['What does a unit cost?', `Rents depend on unit size and position and are not published here. Email ${SITE.email} or ring ${SITE.phone} and Walthams will send current figures. Terms are deliberately simple and aimed at small independent businesses.`],
    ['How long are the terms?', 'Arrangements are flexible compared with a high street lease. Notice periods and deposits are set out when you enquire.'],
    ['What is included?', 'Each unit varies. Power, lighting and shopfront details are confirmed at viewing, along with the practical questions about rates and insurance.'],
    ['Who suits the market best?', 'Independent traders who like talking to people: collectors, makers, menders, specialists. If your business gets better when customers can pick things up, the horseshoe will suit you.'],
    ['How fast does it move?', 'Every enquiry gets a reply. If a unit fits, the next step is a viewing on a trading day so you can feel the footfall for yourself.'],
  ];
  out['join.html'] = page({
    file: 'join.html', active: 'join',
    title: 'Join the Market | Wood Street Indoor Market',
    desc: `${vacant.length} units are available to let at Wood Street Indoor Market, Walthamstow E17. Small spaces, straightforward terms, managed by Walthams.`,
    body: `
  <section class="page-head" style="padding-bottom:32px">
    <div class="wrap-n">
      ${eyebrow('Join the market')}
      <h1 class="h1" style="margin-bottom:12px">Got a shop in you?</h1>
      <p style="font-size:17px;line-height:1.65;color:#3E362B;max-width:62ch;margin:0 0 22px">${shops.length} independents already trade here. ${vacant.length} doors are waiting for their next keeper: small spaces with straightforward terms, inside a market people cross London to wander. The market is managed by Walthams, who handle every enquiry.</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
        <a href="${enquire('Wood Street Indoor Market unit enquiry')}" class="btn btn-red">Email about a unit &rarr;</a>
        <a href="${SITE.tel}" class="btn btn-cream">Ring ${SITE.phone}</a>
      </div>
    </div>
  </section>
  <section style="padding:24px 24px 8px">
    <div class="wrap-n grid grid-4">
      <div class="card"><h2 class="card-title">A ready made crowd</h2><p>Browsers do the whole loop. Every door on the horseshoe gets walked past, Tuesday to Saturday.</p></div>
      <div class="card"><h2 class="card-title">Low fuss spaces</h2><p>Small units, simple arrangements, none of the weight of a high street lease. Start small; grow sideways.</p></div>
      <div class="card"><h2 class="card-title">Good neighbours</h2><p>${shops.length} traders who lend tape, watch counters and send customers next door. The corridor looks after its own.</p></div>
      <div class="card"><h2 class="card-title">E17, on the up</h2><p>Walthamstow&rsquo;s independent scene keeps growing, and the market is its longest running chapter.</p></div>
    </div>
  </section>
  <section style="padding:48px 24px 24px">
    <div class="wrap-n">
      <h2 style="font-size:clamp(26px,3.4vw,36px);margin:0 0 8px">The doors that are open</h2>
      <p style="font-size:15.5px;color:#5C5142;margin:0 0 24px">${vacant.length} units right now. Rents are not published here; enquire and Walthams will send current figures.</p>
      <div class="two two-top" style="gap:36px">
        <div style="display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));align-content:start">
${vacant.map((v) => `          <a href="${enquire(`Wood Street Indoor Market: unit ${v.unit} enquiry`)}" class="card" style="display:block;text-decoration:none;color:#29231C;transition:transform .15s,box-shadow .15s" onmouseover="this.style.transform='translate(-2px,-2px)';this.style.boxShadow='6px 6px 0 #29231C'" onmouseout="this.style.transform='';this.style.boxShadow=''">
            <span style="display:flex;gap:9px;align-items:center;flex-wrap:wrap">${unitBadge(v.unit)}<span class="cat" style="color:#A94A32">Available</span></span>
            <span style="display:block;font-family:'Young Serif',serif;font-size:22px;margin:12px 0 6px">Unit ${esc(v.unit)}, ${esc(v.side)}</span>
            <span style="display:block;font-size:14px;color:#5C5142;line-height:1.6">${esc(SIDES[v.side].addr)}, on ${SIDES[v.side].where} &middot; Rent: enquire</span>
            <span style="display:block;font-weight:700;font-size:14px;color:#7C2A1D;margin-top:12px">Email about this unit &rarr;</span>
          </a>`).join('\n')}
        </div>
        <div>
          ${mapHtml({ mini: true, highlight: vacant.map((v) => v.unit) })}
          <p class="note">The open doors, outlined in red. <a href="map.html">See them on the full map &rarr;</a></p>
        </div>
      </div>
    </div>
  </section>
  <section style="padding:32px 24px 48px">
    <div class="wrap-r">
      <h2 class="h3">Trading questions, answered</h2>
      <div class="faq">
${faqs.map(([q, a]) => `        <details>
          <summary>${q}</summary>
          <p>${a}</p>
        </details>`).join('\n')}
      </div>
    </div>
  </section>
  <section class="sec" style="background:#DCA528;padding:56px 24px">
    <div class="wrap-n" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:24px">
      <div>
        <h2 style="font-size:clamp(26px,3.4vw,38px);margin:0 0 8px">Fancy the corridor life?</h2>
        <p style="font-size:16px;color:#4A3C14;margin:0">Email Walthams with a line about what you sell and which unit caught your eye. Every enquiry gets a reply.</p>
      </div>
      <a href="${enquire('Wood Street Indoor Market unit enquiry')}" class="btn btn-ink">Email about a unit &rarr;</a>
    </div>
  </section>
`,
  });
}

// Contact
{
  out['contact.html'] = page({
    file: 'contact.html', active: '',
    title: 'Contact | Wood Street Indoor Market',
    desc: 'How to reach Wood Street Indoor Market in Walthamstow E17. The market is managed by Walthams: 020 8509 0444, info@walthamestates.co.uk.',
    body: `
  <section class="page-head" style="padding-bottom:28px">
    <div class="wrap-n">
      ${eyebrow('Say hello')}
      <h1 class="h1">Contact</h1>
      <p class="lede">Quickest of all: come in and ask. Someone behind a counter will know. Otherwise ring or write to Walthams, who manage the market and handle every enquiry. Individual shops are best reached through their own pages.</p>
    </div>
  </section>
  <section style="padding:16px 24px 80px">
    <div class="wrap-n two two-top" style="gap:36px">
      <div style="display:grid;gap:16px">
        <div class="card">
          <h2 class="card-label">The market office</h2>
          <div style="display:grid;gap:12px;font-size:15px;line-height:1.6">
            <div><span style="display:block;font-weight:700;font-size:13px">Phone</span><a href="${SITE.tel}">${SITE.phone}</a></div>
            <div><span style="display:block;font-weight:700;font-size:13px">Email</span><a href="mailto:${SITE.email}">${SITE.email}</a></div>
            <div><span style="display:block;font-weight:700;font-size:13px">Post &amp; visits</span>${SITE.address}, ${SITE.town}</div>
            <div><span style="display:block;font-weight:700;font-size:13px">Market hours</span>${SITE.hoursShort}</div>
            <div><span style="display:block;font-weight:700;font-size:13px">Managed by</span><a href="${SITE.walthams}" target="_blank" rel="noopener">Walthams</a></div>
          </div>
        </div>
        <div class="card">
          <h2 class="card-label">Faster answers</h2>
          <div style="display:grid;gap:9px;font-size:14.5px">
            <a href="visit.html">Opening hours, directions &amp; access &rarr;</a>
            <a href="shops.html">Find a particular shop &rarr;</a>
            <a href="join.html">Renting a unit &rarr;</a>
            <a href="whats-on.html">Events &amp; fairs &rarr;</a>
          </div>
        </div>
      </div>
      <div>
        <div class="card" style="padding:26px;border-radius:14px;box-shadow:5px 5px 0 rgba(41,35,28,.85)">
          <h2 style="font-size:22px;margin:0 0 10px">Drop us a line</h2>
          <p style="margin:0 0 20px">Tell us what it is about and Walthams will come back to you. Unit enquiries, event ideas, press, lost property, memories of the market: it all goes to the same place.</p>
          <div style="display:grid;gap:12px">
            <a href="${enquire('Wood Street Indoor Market enquiry')}" class="btn btn-red" style="text-align:center">Email ${SITE.email}</a>
            <a href="${SITE.tel}" class="btn btn-cream" style="text-align:center">Ring ${SITE.phone}</a>
          </div>
          <p style="margin-top:22px;font-size:13.5px">Or find the market on social media:</p>
          <div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap">${socials('social-ink')}
          </div>
        </div>
      </div>
    </div>
  </section>
`,
  });
}

// Policies
{
  out['legal.html'] = page({
    file: 'legal.html', active: '',
    title: 'Policies | Wood Street Indoor Market',
    desc: 'Privacy, cookies and accessibility statements for the Wood Street Indoor Market website.',
    body: `
  <section style="padding:48px 24px 80px">
    <div style="max-width:920px;margin:0 auto">
      <h1 style="font-size:clamp(32px,4.4vw,46px);line-height:1.06;margin:0 0 8px">The small print</h1>
      <p style="font-size:14.5px;color:#8A7B5E;margin:0 0 26px;font-style:italic">Drafts for review. To be checked by someone with a law degree before they are relied on.</p>
      <div class="legal-tabs" data-tabs role="tablist" aria-label="Policies">
        <a href="#privacy">Privacy</a>
        <a href="#cookies">Cookies</a>
        <a href="#accessibility">Accessibility</a>
      </div>
      <div class="card" style="padding:32px;border-radius:14px;box-shadow:5px 5px 0 rgba(41,35,28,.85);display:grid;gap:40px">
        <div class="legal-doc" id="privacy" data-doc>
          <h2>Privacy Policy</h2>
          <p style="font-size:13px;color:#8A7B5E">Draft &middot; September 2026</p>
          <p><strong>Who we are.</strong> Wood Street Indoor Market, ${SITE.address}, ${SITE.town}. The market is managed by Walthams. Questions about this policy: <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
          <p><strong>What we collect.</strong> Only what you give us: your contact details and business information if you email about a unit or send a message. This website has no forms, no accounts and no newsletter, and it does not buy or sell data. This is a market, not that kind of market.</p>
          <p><strong>Why we use it.</strong> To reply to you and to progress unit enquiries. Legal bases: legitimate interest and steps taken before a contract.</p>
          <p><strong>Where it lives.</strong> Emails go to Walthams&rsquo; mailbox and are handled under their own privacy policy.</p>
          <p><strong>How long.</strong> Enquiries: up to 12 months. Unit applications: for the length of the process plus 6 months.</p>
          <p><strong>Your rights.</strong> Ask us what we hold, ask us to correct it, ask us to delete it. Email or write to the office and we will sort it. You can also complain to the ICO (ico.org.uk).</p>
        </div>
        <div class="legal-doc" id="cookies" data-doc>
          <h2>Cookie Policy</h2>
          <p style="font-size:13px;color:#8A7B5E">Draft &middot; September 2026</p>
          <p><strong>The short version.</strong> This site sets no cookies and runs no analytics or tracking. None.</p>
          <p><strong>If that changes.</strong> If the market adds analytics to count visits, it will only switch on after you say yes to a consent banner. Decline and the site works exactly the same.</p>
          <p><strong>Third parties.</strong> Fonts load from Google Fonts. The directions link opens Google Maps, and the social buttons open Facebook, Instagram and X, each of which has its own policies once you are there. Nothing from those services is embedded in this site.</p>
          <p><strong>Managing cookies.</strong> Your browser settings can block or clear cookies at any time. The site will carry on politely without them.</p>
        </div>
        <div class="legal-doc" id="accessibility" data-doc>
          <h2>Accessibility Statement</h2>
          <p style="font-size:13px;color:#8A7B5E">Draft &middot; September 2026</p>
          <p><strong>Our aim.</strong> This website is built to meet WCAG 2.2 AA. Everyone should be able to find a shop, plan a visit and enquire about a unit, whatever they browse with.</p>
          <p><strong>What that means here.</strong> Full keyboard navigation with visible focus; a skip to content link; proper headings and labels; colour contrast checked against AA; touch targets of 44px and up; and every animation switches off when your device asks for reduced motion.</p>
          <p><strong>The market map.</strong> Every unit on the illustrated map is a keyboard operable link, and the same information is published as a plain list on the same page. You never need the picture to get the information.</p>
          <p><strong>Known limitations.</strong> Most shop photographs are still being gathered; where one is missing the page says so rather than showing a stand in.</p>
          <p><strong>The building itself.</strong> The market trades on one level inside. For entrance thresholds and facilities, ring ${SITE.phone} and we will talk it through.</p>
          <p><strong>Spotted a problem?</strong> Tell us: <a href="mailto:${SITE.email}">${SITE.email}</a>. We would rather know.</p>
        </div>
      </div>
    </div>
  </section>
`,
  });
}

// 404
{
  out['404.html'] = page({
    file: '404.html', active: '',
    title: 'Wrong turning | Wood Street Indoor Market',
    desc: 'That page is not on the corridor.',
    body: `
  <section style="padding:80px 24px 100px;text-align:center">
    <div style="max-width:640px;margin:0 auto">
      <div style="display:inline-block;position:relative;background:#FBF5E7;border:2px solid #29231C;border-radius:14px;padding:36px 44px;box-shadow:6px 6px 0 rgba(41,35,28,.85);transform:rotate(-1.5deg)">
        <span class="stamp" style="position:absolute;top:-14px;left:24px;transform:rotate(2deg);font-size:11.5px;padding:5px 13px">ADMIT NOBODY</span>
        <h1 style="font-size:clamp(64px,10vw,110px);line-height:1;margin:0;color:#7C2A1D">404</h1>
        <p style="font-family:'Archivo Narrow',sans-serif;font-weight:700;font-size:14px;letter-spacing:.22em;text-transform:uppercase;margin:8px 0 0;color:#5C5142">Wrong turning</p>
      </div>
      <p style="font-size:17px;line-height:1.65;color:#3E362B;margin:34px auto 8px;max-width:44ch">Even a horseshoe has its dead ends, and this page isn&rsquo;t on the corridor.</p>
      <p style="font-size:15px;color:#8A7B5E;margin:0 0 30px">The good stuff is this way.</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">
        <a href="/" class="btn btn-red btn-sm">Back to the front door</a>
        <a href="/shops.html" class="btn btn-cream btn-sm">Explore the Shops</a>
        <a href="/map.html" class="btn btn-cream btn-sm">Consult the map</a>
      </div>
    </div>
  </section>
`,
  });
  // The 404 page can be served from any path, so its assets must be root-relative.
  out['404.html'] = out['404.html'].replace(/(href|src)="(assets|brand|index\.html|shops\.html|map\.html|whats-on\.html|visit\.html|story\.html|journal\.html|join\.html|contact\.html|legal\.html)/g, '$1="/$2');
}

// Sitemap
{
  const files = Object.keys(out).filter((f) => f !== '404.html');
  out['sitemap.xml'] = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${files.map((f) => `  <url><loc>${SITE.url}${f === 'index.html' ? '' : f}</loc></url>`).join('\n')}
</urlset>
`;
}

// ---------- write and check -------------------------------------------------
let problems = 0;
for (const [file, html] of Object.entries(out)) {
  const bad = html.match(/[‒–—―−]/);
  if (bad) { console.error(`  ! long dash in ${file}`); problems++; }
  if (/£\s?\d|\bdeposit\b(?! are set out| and)|\bowner\b/i.test(html)) { console.error(`  ! possible rent/deposit/owner leak in ${file}`); problems++; }
  mkdirSync(join(ROOT, dirname(file)), { recursive: true });
  writeFileSync(join(ROOT, file), html);
}
console.log(`wrote ${Object.keys(out).length} files: ${shops.length} shops, ${vacant.length} vacant units, ${shops.filter((s) => s.image).length} with photos`);
if (problems) { console.error(`${problems} problem(s)`); process.exit(1); }
