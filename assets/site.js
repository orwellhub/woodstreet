/* Wood Street Indoor Market. Progressive enhancement only: every page reads
   correctly with this file missing. */
document.documentElement.classList.add('is-js');

(function () {
  var y = document.querySelectorAll('[data-year]');
  for (var i = 0; i < y.length; i++) y[i].textContent = new Date().getFullYear();
})();

/* Live open/closed status, Europe/London. The hours come from the page
   (<body data-open data-close data-days>), which the build fills from one
   place, so this script never carries its own copy. */
(function () {
  var body = document.body;
  function mins(t) { var p = (t || '').split(':'); return parseInt(p[0], 10) * 60 + parseInt(p[1] || '0', 10); }
  var OPEN = mins(body.getAttribute('data-open') || '10:00'), CLOSE = mins(body.getAttribute('data-close') || '17:30');
  var openDays = (body.getAttribute('data-days') || '2,3,4,5,6').split(',').map(function (d) { return parseInt(d, 10); });
  function clock(m) { var h = Math.floor(m / 60), mm = m % 60, ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12; return h + (mm ? '.' + (mm < 10 ? '0' : '') + mm : '') + ap; }
  var OPEN_T = clock(OPEN), CLOSE_T = clock(CLOSE);
  function londonNow() {
    var parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false
    }).formatToParts(new Date());
    function get(t) { for (var i = 0; i < parts.length; i++) if (parts[i].type === t) return parts[i].value; return ''; }
    var wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    return { wd: wd, mins: (parseInt(get('hour'), 10) % 24) * 60 + parseInt(get('minute'), 10) };
  }
  function status() {
    var n = londonNow();
    var names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var isOpenDay = openDays.indexOf(n.wd) !== -1;
    if (isOpenDay && n.mins >= OPEN && n.mins < CLOSE) return { open: true, label: 'Open now', detail: 'Open now, closes ' + CLOSE_T, wd: n.wd };
    if (isOpenDay && n.mins < OPEN) return { open: false, label: 'Opens ' + OPEN_T, detail: 'Closed, opens today at ' + OPEN_T, wd: n.wd };
    var next = n.wd;
    for (var i = 1; i <= 7; i++) { var d = (n.wd + i) % 7; if (openDays.indexOf(d) !== -1) { next = d; break; } }
    var tomorrow = (n.wd + 1) % 7 === next;
    return { open: false, label: 'Closed now', detail: 'Closed, opens ' + (tomorrow ? 'tomorrow' : names[next]) + ' at ' + OPEN_T, wd: n.wd };
  }
  function setAll(sel, fn) { var els = document.querySelectorAll(sel); for (var i = 0; i < els.length; i++) fn(els[i]); }
  function paint() {
    var s = status(), colour = s.open ? '#2E7D3C' : '#BF3B26';
    setAll('[data-open-pill]', function (el) { el.hidden = false; el.title = s.detail; });
    setAll('[data-open-label]', function (el) { el.textContent = s.label; });
    setAll('[data-open-detail]', function (el) { el.textContent = s.detail; });
    setAll('[data-open-dot]', function (el) { el.style.background = colour; });
    setAll('[data-day]', function (el) { el.classList.toggle('today', parseInt(el.getAttribute('data-day'), 10) === s.wd); });
  }
  try { paint(); setInterval(paint, 60000); } catch (e) { /* the static hours stand */ }
})();

/* Mobile menu: close it when a link is chosen or Escape is pressed. */
(function () {
  var menu = document.querySelector('.menu');
  if (!menu) return;
  menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') menu.removeAttribute('open'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.hasAttribute('open')) { menu.removeAttribute('open'); menu.querySelector('summary').focus(); } });
})();


/* The shop directory: search and trade filters. Without JS every card shows. */
(function () {
  var box = document.querySelector('[data-shops]');
  if (!box) return;
  var cards = [].slice.call(box.querySelectorAll('[data-card]'));
  var chips = [].slice.call(box.querySelectorAll('[data-cat]'));
  var search = box.querySelector('[data-search]');
  var count = box.querySelector('[data-count]'), empty = box.querySelector('[data-empty]');
  var clears = [].slice.call(box.querySelectorAll('[data-clear]'));
  var state = { q: '', cat: '' };

  function parse() {
    var out = { q: '', cat: '' };
    location.hash.slice(1).split('&').forEach(function (kv) {
      var p = kv.split('='); if (p[0] === 'q') out.q = decodeURIComponent(p[1] || ''); if (p[0] === 'cat') out.cat = p[1] || '';
    });
    return out;
  }
  function apply(push) {
    var ql = state.q.trim().toLowerCase(), shown = 0;
    cards.forEach(function (c) {
      var ok = (!state.cat || c.getAttribute('data-fam') === state.cat) && (!ql || c.getAttribute('data-text').indexOf(ql) !== -1);
      c.hidden = !ok; if (ok) shown++;
    });
    chips.forEach(function (ch) { ch.setAttribute('aria-pressed', ch.getAttribute('data-cat') === state.cat ? 'true' : 'false'); });
    if (search && search.value !== state.q) search.value = state.q;
    if (count) count.textContent = shown === cards.length ? 'Showing all ' + cards.length + ' shops, the ones with photos first' : 'Showing ' + shown + ' of ' + cards.length + ' shops';
    if (empty) empty.hidden = shown !== 0;
    if (push) {
      var parts = [];
      if (state.q.trim()) parts.push('q=' + encodeURIComponent(state.q.trim()));
      if (state.cat) parts.push('cat=' + state.cat);
      history.replaceState(null, '', parts.length ? '#' + parts.join('&') : location.pathname + location.search);
    }
  }
  chips.forEach(function (ch) {
    ch.addEventListener('click', function (e) {
      e.preventDefault();
      var c = ch.getAttribute('data-cat');
      state.cat = state.cat === c ? '' : c; apply(true);
    });
  });
  if (search) search.addEventListener('input', function () { state.q = search.value; apply(true); });
  clears.forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); state = { q: '', cat: '' }; apply(true); if (search) search.focus(); }); });
  window.addEventListener('hashchange', function () { state = parse(); apply(false); });
  state = parse(); apply(false);
})();

/* The contact form. Buttons around the site arrive with ?topic=unit&unit=A4,
   which fills the form in; the email subject follows whatever is chosen.
   Without JS the form still sends, with a plain subject. */
(function () {
  var f = document.querySelector('[data-enquiry]');
  if (!f) return;
  var q = new URLSearchParams(location.search);
  var topic = f.querySelector('[name="topic"]'), unit = f.querySelector('[name="unit"]');
  var unitRow = f.querySelector('[data-unit-field]'), subject = f.querySelector('[name="_subject"]');
  var want = q.get('topic');
  if (want && topic) for (var i = 0; i < topic.options.length; i++) if (topic.options[i].value === want) topic.value = want;
  if (q.get('unit') && unit) unit.value = q.get('unit');
  function sync() {
    var t = topic.options[topic.selectedIndex].text, u = unit && unit.value.trim();
    subject.value = 'Wood Street Indoor Market: ' + t + (u ? ' (unit ' + u + ')' : '');
    if (unitRow) unitRow.hidden = !(topic.value === 'unit' || topic.value === 'trader' || u);
  }
  topic.addEventListener('change', sync);
  if (unit) unit.addEventListener('input', sync);
  sync();
  if (q.get('topic') || q.get('unit')) {
    f.scrollIntoView({ block: 'start' });
    var first = f.querySelector('[name="name"]'); if (first) first.focus({ preventScroll: true });
  }
})();

/* Policies page: one document at a time. Without JS all three show in full. */
(function () {
  var tabs = document.querySelector('[data-tabs]');
  if (!tabs) return;
  var links = [].slice.call(tabs.querySelectorAll('a[href^="#"]'));
  var docs = [].slice.call(document.querySelectorAll('[data-doc]'));
  function pick() {
    var h = location.hash.slice(1), ok = docs.some(function (d) { return d.id === h; });
    var cur = ok ? h : docs[0].id;
    docs.forEach(function (d) { d.hidden = d.id !== cur; });
    links.forEach(function (a) { if (a.getAttribute('href') === '#' + cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }
  window.addEventListener('hashchange', pick);
  pick();
})();
