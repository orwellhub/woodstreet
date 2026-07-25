// Wood Street Indoor Market — shared content layer.
// ALL traders, events, articles and available units below are FICTIONAL SAMPLE CONTENT
// for design review (sample:true). Do not publish as fact. See README.md.

export const SITE = {
  name: 'Wood Street Indoor Market',
  addr1: '98 & 102 Wood Street',
  addr2: 'Walthamstow, London E17 3HX',
  phone: '020 8521 0410', // verify before launch
  email: 'hello@woodstreetindoormarket.co.uk', // placeholder — verify
  insta: 'woodstreetindoormarket', // verify handle
  maps: 'https://www.google.com/maps/search/?api=1&query=Wood+Street+Indoor+Market+Walthamstow',
  est: 1955,
};

export const CATS = [
  { id: 'vintage-fashion', label: 'Vintage & Fashion', color: '#C4684E', tint: '#F0D5C9' },
  { id: 'antiques',        label: 'Antiques & Collectables', color: '#7C2A1D', tint: '#E3C9BE' },
  { id: 'vinyl',           label: 'Vinyl & Music', color: '#3E3A32', tint: '#DED8C8' },
  { id: 'art-handmade',    label: 'Art & Handmade', color: '#B98613', tint: '#F4E4B8' },
  { id: 'jewellery',       label: 'Jewellery & Accessories', color: '#34618E', tint: '#D0DCE8' },
  { id: 'toys-gifts',      label: 'Toys & Gifts', color: '#BF3B26', tint: '#F2CFC4' },
  { id: 'plants-home',     label: 'Plants & Home', color: '#17605B', tint: '#C8DCD4' },
  { id: 'food-drink',      label: 'Food & Drink', color: '#A9541F', tint: '#EFD0B8' },
  { id: 'hair-beauty',     label: 'Hair & Beauty', color: '#A5647E', tint: '#EBD2DB' },
  { id: 'services',        label: 'Services', color: '#7A7264', tint: '#DDD8CB' },
];
export const catById = (id) => CATS.find((c) => c.id === id) || CATS[0];

// ---- SAMPLE TRADERS (fictional) ----
const D = 'Tue–Sat, 10.00–5.30';
export const TRADERS = [
  { sample:true, slug:'corner-caff', name:'The Corner Caff', cat:'food-drink', units:[1], featured:true,
    short:'Fry-ups, filter coffee and doughnuts by the front door.',
    story:['First door on the left and usually the first smell of the day — bacon, toast and proper filter coffee. The Caff has fed traders and browsers alike for years.','Grab a window stool, order the small fry-up, and watch Wood Street go by before you do the loop.'],
    specs:['Full English & veggie English','Filter coffee & builder’s tea','Fresh doughnuts, Saturdays','Takeaway hatch to the street'],
    hours:'Tue–Sat, 9.30–4.30', insta:'cornercaff.e17', access:'Level access from the street; a few tight corners between tables.' },
  { sample:true, slug:'velvet-fox', name:'The Velvet Fox', cat:'vintage-fashion', units:[2,3], featured:true,
    short:'Womenswear from the 1960s to the 1990s, picked with a sharp eye.',
    story:['Two knocked-through units of dresses, coats and blouses arranged by colour, not by decade — because that’s how you actually shop. Everything is cleaned, mended and priced on a paper tag.','Ask about the back rail: pieces too good for the floor come out on request.'],
    specs:['60s–90s womenswear','Occasion dresses & coats','Silk scarves by the basket','Repairs on request'],
    hours:D, insta:'thevelvetfox.e17', access:'Step-free unit; changing curtain at the back.' },
  { sample:true, slug:'fern-feather', name:'Fern & Feather', cat:'art-handmade', units:[4],
    short:'Prints, ceramics and cards by East London makers.',
    story:['A small gallery of things made within a few miles of the market — riso prints, hand-thrown mugs, cards you’ll actually want to post.','The stock rotates monthly, with a maker-of-the-month shelf by the till.'],
    specs:['Riso & screen prints','Hand-thrown ceramics','Cards & wrap','Maker-of-the-month shelf'],
    hours:D, insta:'fernandfeather.makes', access:'Compact unit; staff happy to bring pieces to the corridor.' },
  { sample:true, slug:'marcasite-co', name:'Marcasite & Co.', cat:'jewellery', units:[5],
    short:'Antique and estate jewellery, cleaned and cased.',
    story:['Rings, brooches and lockets from Victorian to mid-century, each with a handwritten card noting what’s known of its story.','Valuations and honest advice offered freely — even if the honest advice is “don’t buy it”.'],
    specs:['Victorian–deco rings','Marcasite brooches','Lockets & chains','Free ring sizing'],
    hours:D, insta:'marcasiteandco', access:'Counter service; a stool available on request.' },
  { sample:true, slug:'about-time', name:'About Time', cat:'jewellery', units:[6],
    short:'Vintage watches and clocks, ticking again.',
    story:['Wind-ups, automatics and the odd carriage clock, all serviced on the bench you can see behind the counter.','Bring in the watch you inherited and never wear — most leave the bench ticking.'],
    specs:['Serviced vintage watches','Straps cut to size','Clock repairs','Battery & bracelet fitting'],
    hours:'Wed–Sat, 10.30–5.00', insta:'abouttime.e17', access:'Counter service at standing height.' },
  { sample:true, slug:'needle-groove', name:'Needle & Groove', cat:'vinyl', units:[7,8], featured:true,
    short:'Two units of vinyl, shellac and hi-fi that still smells of sleeves.',
    story:['Soul, reggae, jazz, punk and a wall of London pressings — crates arranged just untidily enough to reward the patient. The listening deck by the window is free to use, headphones provided.','Ray buys collections most Saturdays; bring your boxes before noon.'],
    specs:['Soul, reggae & jazz 45s','London pressings','Serviced turntables','Listening deck & headphones'],
    hours:D, insta:'needleandgroove', access:'Step-free; crates at mixed heights, staff glad to dig for you.' },
  { sample:true, slug:'deco-echo', name:'Deco Echo', cat:'antiques', units:[10],
    short:'Art-deco lighting, mirrors and the odd cocktail cabinet.',
    story:['Fan mirrors, opaline shades and rewired lamps that glow like 1932. Everything electrical leaves the unit PAT-tested.','If it’s curved, chromed or peach-mirrored, it probably passed through here first.'],
    specs:['Rewired deco lamps','Fan & peach mirrors','Bakelite & chrome','Sourcing service'],
    hours:D, insta:'decoecho', access:'Some pieces heavy — delivery can be arranged locally.' },
  { sample:true, slug:'chrome-canvas', name:'Chrome & Canvas', cat:'antiques', units:[11,12], featured:true,
    short:'Mid-century furniture and original film posters — a nod to the building’s cinema past.',
    story:['Sideboards, school chairs and a plan chest of original film posters, quad-sized and priced by condition. The building used to show pictures; this unit keeps a corner of that going.','Posters are backed and sleeved; furniture can be held for a week while you measure the alcove.'],
    specs:['Mid-century furniture','Original quad film posters','Plan-chest browsing','Local delivery'],
    hours:D, insta:'chromeandcanvas', access:'Wide unit; main aisle kept clear for wheelchairs and buggies.' },
  { sample:true, slug:'odd-lots', name:'Odd Lots', cat:'antiques', units:[13,14],
    short:'House-clearance finds: the good, the odd and the unrepeatable.',
    story:['Whatever came out of last week’s clearances — candlesticks, biscuit tins, oil paintings of ships, boxes of postcards sold by the handful.','Stock turns over fast and nothing is ever restocked. If you like it, that’s the only one.'],
    specs:['Weekly clearance stock','Postcards & ephemera','Frames & pictures','Box lots by the handful'],
    hours:D, insta:'oddlots.market', access:'Browsing is close-quarters; ask and we’ll pass things down.' },
  { sample:true, slug:'brassica-bloom', name:'Brassica & Bloom', cat:'plants-home', units:[15],
    short:'Houseplants, pots and honest advice about which ones you’ll kill.',
    story:['A green corner of the corridor: monsteras to string-of-pearls, terracotta to hand-glazed pots, and cuttings from a quid.','Tell them your light and your track record; they’ll match you to something that’ll survive you.'],
    specs:['Houseplants & cuttings','Terracotta & glazed pots','Repotting while you browse','Plant-rescue drop-offs'],
    hours:D, insta:'brassicaandbloom', access:'Level access; watering cans live on the floor — mind your toes.' },
  { sample:true, slug:'turn-ups', name:'Turn-Ups', cat:'vintage-fashion', units:[16],
    short:'Menswear, workwear and denim that’s already done the hard part.',
    story:['Selvedge, chore coats, service shirts and boots resoled to go again. Sizes are on paper tickets; the mirror doesn’t lie.','Hem-while-you-wait on Saturdays — hence the name.'],
    specs:['Vintage denim & workwear','Boots, resoled','Chore & service jackets','Saturday hemming'],
    hours:D, insta:'turnups.e17', access:'Step-free; fitting area behind a curtain.' },
  { sample:true, slug:'shear-class', name:'Shear Class', cat:'hair-beauty', units:[17],
    short:'A proper barbershop halfway round the horseshoe.',
    story:['Two chairs, no fuss, good chat. Walk-ins mostly — take a numbered ticket off the hook and browse the market till you’re up.','Hot-towel shaves on Fridays and Saturdays, bookable by phone.'],
    specs:['Cuts & fades','Hot-towel shaves (Fri–Sat)','Beard trims','Kids before noon'],
    hours:'Wed–Sat, 10.00–5.30', insta:'shearclass.e17', access:'One fixed chair, one adjustable; step-free throughout.' },
  { sample:true, slug:'dressing-up-box', name:'The Dressing-Up Box', cat:'services', units:[18],
    short:'Costume hire for parties, plays and people who commit to the bit.',
    story:['Racks of hireable history — flappers, pirates, pearly kings, and a shelf of hats that solves most fancy-dress emergencies.','Hire runs Thursday to Thursday; deposits returned when the costume comes back in one piece.'],
    specs:['Costume hire, all sizes','Hats, wigs & props','Theatrical alterations','School-play discounts'],
    hours:D, insta:'dressingupbox.e17', access:'Rails are dense; staff will pull options out to the corridor.' },
  { sample:true, slug:'frame-room', name:'The Frame Room', cat:'services', units:[19],
    short:'Picture framing done on the premises, from posters to needlework.',
    story:['Mouldings on the wall, mount-board by the metre, and a guillotine that’s older than most customers. Turnaround is usually under a week.','Bring the awkward thing — the shirt, the medal, the tiny drawing. Awkward is the speciality.'],
    specs:['Bespoke framing','Mount cutting','Poster & canvas mounting','Repairs to old frames'],
    hours:D, insta:'theframeroom', access:'Counter service; finished work carried to your car on request.' },
  { sample:true, slug:'polish-pin', name:'Polish & Pin', cat:'hair-beauty', units:[20],
    short:'Nails and vintage styling by the right-hand door.',
    story:['Manicures with a 1950s magazine rack, victory rolls for weddings and weekends, and a window seat for waiting friends.','Book ahead for Saturdays; weekdays take walk-ins.'],
    specs:['Manicures & pedicures','Vintage hair styling','Wedding & event bookings','Gift vouchers'],
    hours:'Tue–Sat, 10.00–5.00', insta:'polishandpin', access:'Two steps to the styling chairs — ramp available, just ask.' },
  { sample:true, slug:'pepper-thyme', name:'Pepper & Thyme Kitchen', cat:'food-drink', units:[21], featured:true,
    short:'Home-cooked lunches from the island kitchen — follow your nose.',
    story:['A short chalkboard menu that changes daily: stews, curries, patties and one pudding. When it’s gone, it’s gone — usually by two.','Regulars phone ahead to reserve the last portions. That’s allowed, and wise.'],
    specs:['Daily changing lunches','Patties & pastries','One pudding a day','Phone-ahead portions'],
    hours:'Tue–Sat, 11.30–3.30', insta:'pepperandthyme.e17', access:'Counter service; two small tables beside the unit.' },
  { sample:true, slug:'button-box', name:'The Button Box', cat:'art-handmade', units:[23,24],
    short:'Haberdashery heaven: fabric, wool, ribbon and a wall of buttons.',
    story:['Button tins sorted by colour, deadstock fabric by the metre, and wool enough to get you through any winter. The measuring table doubles as a gossip station.','Beginners’ mending classes run on the first Thursday of the month.'],
    specs:['Buttons by the tin','Deadstock fabric','Wool & notions','Monthly mending class'],
    hours:D, insta:'buttonboxE17', access:'Aisles narrow but short; stools dotted about for slow browsing.' },
  { sample:true, slug:'paper-moon', name:'Paper Moon Comics', cat:'toys-gifts', units:[25,26],
    short:'Comics, annuals and printed ephemera, bagged and boarded.',
    story:['Silver-age to small-press, plus a wall of annuals that will locate your childhood in about four seconds.','The 50p longboxes by the door are the market’s best rainy-afternoon entertainment.'],
    specs:['Silver-age & UK comics','Annuals & story papers','Small-press shelf','50p longboxes'],
    hours:'Thu–Sat, 10.00–5.30', insta:'papermooncomics', access:'Longboxes at table height; ladders staff-only.' },
  { sample:true, slug:'tin-toy-co', name:'The Tin Toy Co.', cat:'toys-gifts', units:[27], featured:true,
    short:'Vintage toys: tin, diecast, clockwork and pre-loved teddies.',
    story:['Dinky vans, wind-up robots, farm animals by the scoop and a glass case of the properly rare stuff. Kids get the step-stool; adults get the nostalgia.','Toys are tested and priced honestly — play-worn means play-worn.'],
    specs:['Diecast & tinplate','Clockwork & wind-ups','Teddies & dolls','Glass-case rarities'],
    hours:D, insta:'tintoyco', access:'Low cases for small visitors; step-stool by the counter.' },
  { sample:true, slug:'magpie-son', name:'Magpie & Son', cat:'antiques', units:[28,29],
    short:'Everything-a-tenner corner: brass, china, tools and treasure.',
    story:['The market’s magpie nest — job lots, shed clearances and boxes of shine, with almost everything at a tenner or under.','Half the fun is that nobody, including the Magpies, knows quite what’s in this week.'],
    specs:['Everything ~£10 or under','Brass & china','Old tools','Job lots for makers'],
    hours:D, insta:'magpieandson', access:'Floor-stacked in places; ask for a rummage on your behalf.' },
];
export const traderBySlug = (s) => TRADERS.find((t) => t.slug === s);
export const unitLabel = (units) => 'Unit ' + (units.length > 1 ? units[0] + '–' + units[units.length - 1] : units[0]);

// ---- MAP GEOMETRY (illustrated visitor guide; coordinate space 980 x 764) ----
export const MAP_W = 980, MAP_H = 764;
export const UNIT_GEO = [
  { n:1,  x:70,  y:628, w:92, h:72 },
  { n:2,  x:70,  y:538, w:92, h:80 }, { n:3, x:70, y:450, w:92, h:80 }, { n:4, x:70, y:362, w:92, h:80 },
  { n:5,  x:70,  y:274, w:92, h:80 }, { n:6, x:70, y:186, w:92, h:80 },
  { n:7,  x:70,  y:64,  w:92, h:114 },
  { n:8,  x:170, y:64,  w:96, h:100 }, { n:9, x:274, y:64, w:96, h:100 }, { n:10, x:378, y:64, w:96, h:100 },
  { n:11, x:482, y:64,  w:96, h:100 }, { n:12, x:586, y:64, w:96, h:100 }, { n:13, x:690, y:64, w:96, h:100 },
  { n:14, x:818, y:64,  w:92, h:114 },
  { n:15, x:818, y:186, w:92, h:80 }, { n:16, x:818, y:274, w:92, h:80 }, { n:17, x:818, y:362, w:92, h:80 },
  { n:18, x:818, y:450, w:92, h:80 }, { n:19, x:818, y:538, w:92, h:80 },
  { n:20, x:818, y:628, w:92, h:72 },
  { n:21, x:286, y:536, w:96, h:80 }, { n:22, x:286, y:452, w:96, h:80 }, { n:23, x:286, y:368, w:96, h:80 },
  { n:24, x:286, y:284, w:96, h:80 },
  { n:25, x:390, y:284, w:98, h:80 }, { n:26, x:496, y:284, w:98, h:80 },
  { n:27, x:598, y:284, w:96, h:80 }, { n:28, x:598, y:368, w:96, h:80 }, { n:29, x:598, y:452, w:96, h:80 },
  { n:30, x:598, y:536, w:96, h:80 },
];
export const CORRIDOR = [
  { x:162, y:164, w:124, h:454 }, { x:162, y:164, w:656, h:120 },
  { x:694, y:164, w:124, h:454 }, { x:162, y:618, w:656, h:90 },
];
export const AVAILABLE_UNITS = [9, 22, 30];
export const traderByUnit = (n) => TRADERS.find((t) => t.units.includes(n));

// ---- SAMPLE AVAILABLE UNITS ----
export const AVAIL = [
  { sample:true, id:'u9', unit:9, name:'Top-run counter unit', size:'approx. 180 sq ft', sizeNote:'measurement to be confirmed',
    status:'Available now', statusColor:'#2E7D3C',
    where:'On the top run of the horseshoe, between Needle & Groove (7–8) and Deco Echo (10).',
    suits:['Collectables or records','Small retail counter','Repairs & services'],
    includes:['Lockable shopfront (to be confirmed)','Power & lighting','Shared market Wi-Fi (to be confirmed)'] },
  { sample:true, id:'u22', unit:22, name:'Island studio unit', size:'approx. 150 sq ft', sizeNote:'measurement to be confirmed',
    status:'Available now', statusColor:'#2E7D3C',
    where:'West side of the island, between Pepper & Thyme Kitchen (21) and The Button Box (23–24).',
    suits:['Maker or studio use','Alterations & repairs','Small gallery'],
    includes:['Open frontage with roller shutter (to be confirmed)','Power & lighting'] },
  { sample:true, id:'u30', unit:30, name:'Double-aspect corner unit', size:'approx. 220 sq ft', sizeNote:'measurement to be confirmed',
    status:'Under offer', statusColor:'#B98613',
    where:'South-east corner of the island, next to Magpie & Son (28–29), facing the front lobby.',
    suits:['Retail with display frontage','Food-adjacent (no extraction — to be confirmed)'],
    includes:['Two display aspects','Power & lighting'] },
];

// ---- SAMPLE EVENTS ----
export const EVENT_CATS = [
  { id:'music', label:'Music', color:'#3E3A32' }, { id:'late', label:'Late opening', color:'#7C2A1D' },
  { id:'fashion', label:'Fashion', color:'#C4684E' }, { id:'family', label:'Family', color:'#BF3B26' },
  { id:'seasonal', label:'Seasonal', color:'#B98613' }, { id:'home', label:'Home & garden', color:'#17605B' },
];
export const EVENTS = [
  { sample:true, slug:'record-fair', title:'Wood Street Record & Tape Fair', cat:'music',
    start:'2026-07-25', day:'SAT', dd:'25', mon:'JUL', dateLabel:'Saturday 25 July 2026', time:'10.00–4.00',
    cost:'Free entry', where:'The corridor + Needle & Groove (Units 7–8)', booking:'Just turn up',
    blurb:'Guest crates line the corridor while Needle & Groove opens the back-room boxes.',
    body:['A dozen guest sellers set up along the horseshoe with crates of vinyl, tapes and shellac, joining the market’s own resident record shop. Bring headphones or borrow theirs — the listening deck runs all day.','Sellers start packing at four sharp, so the last hour is famously good for haggling.'],
    related:['needle-groove','corner-caff'], ics:{ s:'20260725T100000', e:'20260725T160000' } },
  { sample:true, slug:'makers-late', title:'Makers’ Late: the market after hours', cat:'late',
    start:'2026-08-06', day:'THU', dd:'06', mon:'AUG', dateLabel:'Thursday 6 August 2026', time:'5.30–8.30pm',
    cost:'Free', where:'Whole market', booking:'Workshops first-come',
    blurb:'One evening only: shutters stay up, workshops at the Button Box and Fern & Feather.',
    body:['The horseshoe stays open past closing for one summer evening. Expect drop-in mending at The Button Box, a print-your-own-card table at Fern & Feather, and the Caff running teas till eight.','Workshop spaces are first-come on the night — no tickets, no fuss.'],
    related:['button-box','fern-feather','corner-caff'], ics:{ s:'20260806T173000', e:'20260806T203000' } },
  { sample:true, slug:'kilo-weekend', title:'Vintage Kilo Weekend', cat:'fashion',
    start:'2026-08-15', day:'SAT', dd:'15', mon:'AUG', dateLabel:'Saturday 15 August 2026', time:'10.00–5.30',
    cost:'Free entry', where:'The Velvet Fox & Turn-Ups (Units 2–3 & 16)', booking:'Just turn up',
    blurb:'Both vintage units sell overstock by the kilo. Bring a bag, leave with a wardrobe.',
    body:['The Velvet Fox and Turn-Ups clear their back rails by weight — £15 a kilo, scales on the counter, mirrors everywhere. Early birds get the coats; the patient get the bargains.','Ordinary stock stays at ordinary prices, so the rest of the market carries on as usual around the scrum.'],
    related:['velvet-fox','turn-ups'], ics:{ s:'20260815T100000', e:'20260815T173000' } },
  { sample:true, slug:'toy-hunt', title:'School Holiday Toy Hunt Trail', cat:'family',
    start:'2026-08-18', end:'2026-08-22', day:'TUE', dd:'18', mon:'AUG', dateLabel:'Tuesday 18 – Saturday 22 August 2026', time:'All day, 10.00–5.30',
    cost:'Free trail sheet', where:'Starts at The Tin Toy Co. (Unit 27)', booking:'Just turn up',
    blurb:'Ten tin toys hidden in shop windows round the horseshoe. Find them all, win a badge.',
    body:['Pick up a trail sheet from The Tin Toy Co., then hunt the ten wind-up toys hiding in windows around the corridor. Every completed sheet wins an enamel market badge — while stocks last.','Designed for ages 4–10 and the adults quietly competing beside them.'],
    related:['tin-toy-co','paper-moon'], ics:{ s:'20260818T100000', e:'20260822T173000' } },
  { sample:true, slug:'birthday-71', title:'The Market’s 71st Birthday Do', cat:'seasonal',
    start:'2026-09-26', day:'SAT', dd:'26', mon:'SEP', dateLabel:'Saturday 26 September 2026', time:'10.00–5.30',
    cost:'Free', where:'Whole market', booking:'Just turn up',
    blurb:'Trading since 1955. Cake at the Caff, records in the corridor, stories on the wall.',
    body:['Seventy-one years of small shops under one roof. The Caff bakes, Needle & Groove spins 1955 pressings, and the corridor wall becomes a pin-board of visitors’ market memories — bring a photo or a story to add.','Traders run birthday offers all day; look for the mustard stickers.'],
    related:['corner-caff','needle-groove','magpie-son'], ics:{ s:'20260926T100000', e:'20260926T173000' } },
];
export const PAST_EVENTS = [
  { sample:true, slug:'plant-swap', title:'Plant Swap Saturday', cat:'home', dateLabel:'Saturday 20 June 2026',
    blurb:'Cuttings traded, rescues rehomed, and Brassica & Bloom judged “leafiest arrival”.' },
  { sample:true, slug:'spring-fair', title:'Spring Collectors’ Fair', cat:'seasonal', dateLabel:'Saturday 18 April 2026',
    blurb:'Guest dealers joined the horseshoe for a day of postcards, coins and curios.' },
];
export const eventBySlug = (s) => EVENTS.find((e) => e.slug === s);
export const icsHref = (ev) => {
  const t = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//WSM//Preview//EN\nBEGIN:VEVENT\nUID:' + ev.slug + '@woodstreetindoormarket.co.uk\nDTSTART:' + ev.ics.s + '\nDTEND:' + ev.ics.e + '\nSUMMARY:' + ev.title.replace(/,/g, '\\,') + '\nLOCATION:Wood Street Indoor Market\\, 98 & 102 Wood Street\\, London E17 3HX\nDESCRIPTION:' + ev.blurb.replace(/,/g, '\\,') + '\nEND:VEVENT\nEND:VCALENDAR';
  return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(t);
};

// ---- SAMPLE JOURNAL ----
export const ARTICLES = [
  { sample:true, slug:'crate-digging-ray', title:'Crate digging with Ray from Needle & Groove', cat:'Trader interviews',
    author:'Asha Reid', date:'2 July 2026', related:['needle-groove'],
    excerpt:'Forty years of buying records, one rule: “If your foot taps, your hand pays.” Ray on London pressings, lucky finds and the listening deck.',
    body:[
      { p:'Ray has run the record units at the top of the horseshoe for longer than he’ll commit to in print. The crates are arranged in a system he describes as “alphabetical, emotionally”, and regulars seem to navigate it fine.' },
      { p:'He buys collections most Saturdays, before noon, over a mug from the Caff. “People bring their dad’s records in a Bag for Life and an apology. Half the time there’s something lovely in there.”' },
      { q:'“If your foot taps, your hand pays. That’s the whole business.”' },
      { p:'The listening deck by the window is free to use and, he insists, the point of the shop. “Streaming tells you what you already like. A crate argues with you.”' },
      { p:'His tip for first-timers? Start at the 45s, ask about the London pressings, and never leave the market without walking the whole loop. “The horseshoe pays you back for patience.”' },
    ] },
  { sample:true, slug:'vintage-denim-guide', title:'How to buy vintage denim without the guesswork', cat:'Guides',
    author:'Tom Carey', date:'18 June 2026', related:['turn-ups','velvet-fox'],
    excerpt:'Sizes lie, rivets don’t. A practical field guide to buying denim that’s already done the hard part — from the rails at Turn-Ups.',
    body:[
      { p:'Vintage sizing is a rumour. Ignore the waistband number, carry a tape measure, and trust the flat measurement — the rails at Turn-Ups tag both, which saves the changing-curtain queue.' },
      { p:'Check the hardware before the fabric: rivets, buttons and stitching tell you age and honesty faster than any label. Fading should map to a body — whiskers at the hips, honeycombs behind the knees.' },
      { q:'“Worn right is worth more than mint. You’re buying someone’s ten-year head start.”' },
      { p:'Repairs are a feature, not a flaw, if they’re done well. Chain-stitched hems and patched knees mean the jeans were loved enough to fix — and Turn-Ups hems while you wait on Saturdays.' },
      { p:'Budget-wise: good vintage denim at the market runs a fraction of the Soho price, and the mirror is more truthful. Bring cash for haggling politely, and always do the full squat test.' },
    ] },
  { sample:true, slug:'three-new-doors', title:'Three new doors open on the horseshoe', cat:'Market news',
    author:'The Market Desk', date:'9 July 2026', related:['fern-feather','polish-pin','pepper-thyme'],
    excerpt:'A makers’ gallery, a nail-and-styling parlour and an island kitchen join the loop — the corridor’s newest reasons to lose an afternoon.',
    body:[
      { p:'The horseshoe has three new keepers this season. Fern & Feather brings riso prints and hand-thrown ceramics from makers within a few miles of the market; the maker-of-the-month shelf is already a small institution.' },
      { p:'By the right-hand door, Polish & Pin pairs manicures with vintage styling — victory rolls for weddings, walk-ins on weekdays, and a window seat for moral support.' },
      { p:'And in the island, Pepper & Thyme Kitchen chalks up a daily menu that tends to sell out by two. Regulars have already learned to phone ahead for the pudding.' },
      { q:'“Small shops don’t open quietly here. The whole corridor notices.”' },
      { p:'All three are trading now, Tuesday to Saturday. Say hello, and check their individual hours before a special trip.' },
    ] },
  { sample:true, slug:'saturday-on-wood-street', title:'A Saturday on Wood Street', cat:'Neighbourhood',
    author:'Asha Reid', date:'30 May 2026', related:['corner-caff','brassica-bloom'],
    excerpt:'Coffee at the hatch, a loop of the horseshoe, lunch from the island and a wander up to the forest edge. One street, one very good day.',
    body:[
      { p:'Start at the takeaway hatch: coffee in hand by ten, when the shutters go up and the corridor still smells of floor polish and toast. Do the loop once without buying anything. You won’t manage it, but do try.' },
      { p:'Wood Street itself rewards a wander — the parade’s bakeries and charity shops, the passage murals, and the station clock that has opinions about your timekeeping.' },
      { q:'“The trick to Wood Street is having nowhere in particular to be.”' },
      { p:'Lunch is whatever the island kitchen chalked up that morning. Eat it on the bench by the front doors and watch the buses. This is prime people-watching territory and locals know it.' },
      { p:'If the weather holds, keep walking north and the streets run out into the forest edge. Bring back a plant from Brassica & Bloom as proof you left the house.' },
    ] },
];
export const articleBySlug = (s) => ARTICLES.find((a) => a.slug === s);

// ---- OUR STORY (unverified items flagged) ----
export const TIMELINE = [
  { era:'Early 1900s', title:'A picture house on Wood Street', verify:true,
    text:'Before the stalls came the screen: the site had an earlier life as a local cinema, and the building still carries the shape of it. Exact dates, names and photographs are being confirmed with local archives.' },
  { era:'1955', title:'The market opens its doors', verify:false,
    text:'The building begins trading as an indoor market — small units, low rents, and a corridor that bends round in a horseshoe so no shop is ever a dead end.' },
  { era:'1960s–80s', title:'Decades of dealers', verify:true,
    text:'Furniture, records, tools and tailoring: the market becomes the kind of place where you could furnish a flat and get your trousers taken up in the same afternoon. (Trader histories being gathered — share yours.)' },
  { era:'1990s–2000s', title:'The high street changes; the horseshoe holds', verify:false,
    text:'Chains come and go on the high streets around it. The market keeps doing what it has always done: small independent shops, side by side, run by the people behind the counter.' },
  { era:'2010s', title:'A new wave joins the old guard', verify:false,
    text:'Vinyl comes back round, makers move in, and a new generation of collectors discovers what E17 already knew. The mix of old hands and new keepers becomes the market’s signature.' },
  { era:'Today', title:'Thirty little shops, one corridor', verify:false,
    text:'Around thirty units trade Tuesday to Saturday — vintage, antiques, vinyl, plants, food, framing, haircuts and haberdashery — a few minutes from Wood Street station.' },
];

// ---- VISIT ----
export const FAQS_VISIT = [
  { q:'Do all the shops open every day?', a:'The market opens Tuesday–Saturday, 10.00–5.30, but individual traders set their own days and hours — a few open Wednesday–Saturday or Thursday–Saturday. If you’re making a special trip for one shop, check its page or ring ahead.' },
  { q:'Can I pay by card?', a:'Most traders take cards; some smaller units and the 50p boxes are cash-friendlier. There are cash machines on Wood Street itself (locations to be confirmed).' },
  { q:'Is the market step-free?', a:'The market is on one level inside. Details of entrance thresholds and accessible facilities are being confirmed and will be published here — meanwhile, ring 020 8521 0410 and we’ll talk you through it.' },
  { q:'Are dogs welcome?', a:'Well-behaved dogs on leads are welcome in the corridor; individual shops set their own rules (the food units ask dogs to wait outside). Water bowl by the front doors on warm days.' },
  { q:'Is there parking?', a:'Street parking around Wood Street is limited and mostly pay-and-display or permit — coming by train, bus or bike is easier. Cycle racks are near the station (to be confirmed).' },
  { q:'Where do I find toilets and baby-changing?', a:'Facilities information is being confirmed for this page. Ask any trader in the meantime — they’ll point you the right way.' },
];

// ---- JOIN ----
export const FAQS_JOIN = [
  { q:'What does a unit cost?', a:'Rents depend on unit size and position, and aren’t published here — enquire and we’ll send current figures. Terms are deliberately simple and aimed at small independent businesses.' },
  { q:'How long are the terms?', a:'Arrangements are flexible compared with a high-street lease — details on notice periods and deposits come with the information pack (enquire below).' },
  { q:'What’s included in the rent?', a:'Each unit varies — power, lighting and shopfront details are listed per unit, with the rest confirmed at viewing. Business rates and insurance questions are covered in the pack.' },
  { q:'Who suits the market best?', a:'Independent traders who like talking to people: collectors, makers, menders, specialists. If your business gets better when customers can pick things up, the horseshoe will suit you.' },
  { q:'How fast do applications move?', a:'We reply to every application. If a unit fits, the next step is a viewing on a trading day so you can feel the footfall for yourself.' },
];

// ---- opening hours / status (Europe/London) ----
export const HOURS = [
  { d:'Monday', v:'Closed' }, { d:'Tuesday', v:'10.00–5.30' }, { d:'Wednesday', v:'10.00–5.30' },
  { d:'Thursday', v:'10.00–5.30' }, { d:'Friday', v:'10.00–5.30' }, { d:'Saturday', v:'10.00–5.30' },
  { d:'Sunday', v:'Closed' },
];
export function londonParts() {
  const p = new Intl.DateTimeFormat('en-GB', { timeZone:'Europe/London', weekday:'short', hour:'numeric', minute:'numeric', hour12:false }).formatToParts(new Date());
  const g = (t) => (p.find((x) => x.type === t) || {}).value;
  const wd = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(g('weekday'));
  return { wd, mins: (parseInt(g('hour'), 10) % 24) * 60 + parseInt(g('minute'), 10) };
}
export function openStatus() {
  const { wd, mins } = londonParts();
  const openDays = [2,3,4,5,6];
  if (openDays.includes(wd) && mins >= 600 && mins < 1050) return { open:true, label:'Open now', detail:'Open now — closes 5.30pm' };
  if (openDays.includes(wd) && mins < 600) return { open:false, label:'Opens 10am', detail:'Closed — opens today at 10am' };
  const names = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  let next = wd;
  for (let i = 1; i <= 7; i++) { const n = (wd + i) % 7; if (openDays.includes(n)) { next = n; break; } }
  const tomorrow = (wd + 1) % 7 === next;
  return { open:false, label:'Closed now', detail:'Closed — opens ' + (tomorrow ? 'tomorrow' : names[next]) + ' at 10am' };
}
export function todayIndex() { const { wd } = londonParts(); return (wd + 6) % 7; } // HOURS starts Monday

// ---- analytics (consent-gated in production; console/dataLayer only here) ----
export function track(ev, props) {
  (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: ev }, props || {}));
  if (window.console) console.debug('[analytics]', ev, props || {});
}

// ---- form adapters (mock — swap for Mailchimp/Brevo/CRM; see README) ----
export function subscribe(rec) { return new Promise((r) => setTimeout(() => r({ ok:true, mock:true, rec }), 700)); }
export function submitApplication(rec) { return new Promise((r) => setTimeout(() => r({ ok:true, mock:true, ref:'WSM-' + Math.floor(1000 + Math.random() * 9000) }), 900)); }
export function sendMessage(rec) { return new Promise((r) => setTimeout(() => r({ ok:true, mock:true }), 700)); }
