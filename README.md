# Wood Street Indoor Market

A single-page site. One file, no build step, no dependencies, no framework.

## Files

| Path | Purpose |
|---|---|
| `index.html` | The whole site. Content and styling all live here. |
| `uploads/` | Photography (see the slots below) |
| `brand/` | Walthams logo, light and inverse |
| `archive/` | Earlier layouts kept for reference, not served |
| `.htaccess` | Redirects old URLs to the landing page, plus gzip and caching |
| `robots.txt` | Search engine directives |

## Editing

Everything is in `index.html`, in the order it appears on the page:

1. Header and opening hours strip
2. Hero
3. `#shops` the shop directory, one shop at a time on an easel
4. `#map` the unit map for both buildings
5. Our story
6. `#visit` where, opening hours, getting here, inside the market
7. Photo strip
8. `#join` the join the market call to action
9. Footer, including the social buttons

Opening hours appear in four places, so change all of them together:
the top strip, the hero status line, the `#visit` hours table, and the footer.
They are also in the JSON-LD block in `<head>`, which is what Google reads
for the hours shown in search results.

## Photography

Five images, each in a fixed slot:

| File | Where it appears |
|---|---|
| `market-frontage.jpg` | Hero, top right. Also the social sharing preview. Portrait, shown uncropped. |
| `market-entrance.jpg` | Our story, in the arched frame. Portrait, shown uncropped. |
| `coven-of-wiches.jpg` | Gallery, left |
| `market-corridor.jpg` | Gallery, middle |
| `belas-brocante.jpg` | Gallery, right |

To swap one, keep the same filename and the layout stays put. If you change
the filename or the picture's shape, update the matching `width` and `height`
attributes on the `<img>` tag so the page does not jump about while loading.
The three gallery images are cropped to squares. Both shopfront photos are
portrait, so each carries an `object-position` that pulls the crop upward and
keeps the shop's sign in frame. A replacement of a different shape will need
that value adjusting.

Keep images to roughly 1000px on the long edge. They are only ever shown a
few hundred pixels wide, and large files make the page slow on a phone.

## The shops and the map

Both sections are generated from the client spreadsheet
(`Wood Street Market - Shops Updated.xlsx`), not hand written. The market is one
U-shaped corridor with units down both sides of it. The sheet's two sections are
the two sides: Market Side (units M2 to M38, 102a Wood Street) along the outer
wall, Antique City (units A1 to A16, 98 Wood Street) on the inner block.

Three rules the generated markup follows, worth keeping if it is ever regenerated:

- **Rent and deposit never appear.** Both are columns in the spreadsheet and both
  are commercially sensitive.
- **Owner names are not published as a field.** They appear only where the client's
  own description already names them.
- **A link is only rendered for a genuine address.** The spreadsheet's Website
  column mostly holds pasted link text ("Pritzy logo", "Books From Boxes") rather
  than URLs, so most shops correctly have no website link.

The map is one plan: a U-shaped corridor open at the bottom onto Wood Street, an
outer ring of Market Side units around the walls, an inner ring of Antique City
units on the block in the middle. Both rings run the same way round, in on the
left arm and out on the right. The sequence is the real unit numbering; the shape
is that walk drawn as a loop, not a measured plan, and the page says so. Two
assumptions are baked in and are one-line changes in the generator: that Market
Side is the outer ring (it has more units, so it is the longer side), and that
both rings are numbered in the same direction. If actual floor plans turn up, the
geometry block is the only thing that needs replacing. The map colours each unit by
trade family and every unit also carries its shop name as text, so the colour is
never the only thing carrying the information. Merged units (A2/3, M25/26/27 and so
on) take two cells along their run. Each occupied unit is a link to that shop's
entry, `#shop-a1`, `#shop-m25-26-27` and so on.

### The easel

The directory shows one shop at a time on a drawn easel, as a stack of sheets:
Next peels the top sheet off to show the one beneath, Previous peels it back on.
There are Previous and Next buttons, a counter, and the arrow keys. The board is
held at the height of the tallest sheet, measured on load and again on resize, so
the stand and the buttons stay exactly where they are as the shops change. Clicking a unit
on the map flips the easel to that shop and scrolls to it. All 24 entries are in
the HTML; the script only hides all but one, so with JavaScript off the board simply
lists every shop, and search engines see every description either way. The peel is
off for anyone who has asked their system for reduced motion.

Shops that have a photo come first in the stack, then the rest in unit order.

### Shop photos

Each sheet has a photo slot, a pinned polaroid on the right on desktop and above
the text on phones. Photos live in `uploads/shops/`, named after the unit:
`shop-a16.jpg`, `shop-a5-6.jpg`, `shop-m25-26-27.jpg`. Keep them 4:3 and about
1000px wide.

Two are in place, both taken from the spreadsheet: Mrs Tinsley's (A16) and
Moroccan Corner (A5/6). Every other sheet holds a dashed "Photo on its way"
placeholder with an HTML comment beside it giving the exact `<figure>` to paste
in once the file exists. The placeholder is hidden from screen readers; a real
photo needs a proper `alt`.

Two earlier photos, The Coven of Wiches (unit 38) and Bela's Brocante (unit 31),
are not attached to any sheet because the spreadsheet lists M31 and M38 as
available to let. One of the two sources is out of date; until that is settled
those photos stay in the gallery only.

The previous layout, a card grid grouped by building, is kept in
`archive/shops-grid.html` with instructions for putting it back.

To change a shop, edit the page directly. If the spreadsheet is reissued with many
changes, regenerating is easier than patching by hand.

## Social links

Three buttons in the footer, using inline SVG icons so nothing is fetched
from another server:

- Facebook `https://www.facebook.com/WoodStreetIndoorMarket/`
- Instagram `https://www.instagram.com/woodstreetindoormarket/`
- X `https://x.com/WoodStreetMarke`

The same three URLs appear in the `sameAs` list in the JSON-LD block in
`<head>`, which is how search engines tie the profiles to the business.
Change a link and change it in both places.

## Deploy

Hostinger is connected to this repository over GitHub OAuth. Commit, push,
and Hostinger redeploys. `index.html` must stay at the repository root.

## Before it goes live

The market is managed by Walthams (Waltham Estates, walthamestates.co.uk).
The credit under the wordmark in the header and footer carries their logo
and links there. Every phone number and email address on the page is theirs:

- 020 8509 0444
- info@walthamestates.co.uk

Wood Street has no phone or email of its own. If Walthams' details change,
they appear in the top strip, the two cards under The shops, Inside the
market, the Join the Market button, the footer, and the JSON-LD block.

Outstanding on the shop data:

- **Vintage Corner (M34/35)** has no category and no description in the spreadsheet,
  so its card says a fuller listing is coming.
- **One of its two phone numbers is malformed** (12 digits) and is not published.
- **Units M13 to M22 are absent from the spreadsheet** entirely, so they are absent
  from the map. If they exist, they need adding.
- Most shops have no phone number in the source, so most cards show none.

These came from the original design draft and are still unconfirmed:

- the opening hours
- "Est. 1955", which appears in the logo, the hero and the footer
- the cinema history in Our story, which the draft flagged as needing
  checking against local archives

The invented trader names and descriptions have already been removed.

## The Walthams logo

`brand/walthams-logo.svg` and `brand/walthams-logo-inverse.svg` come from the
Walthams site repo (orwellhub/walthamestateswebsite, `public/brand/`). They are
identical except for the wordmark ink: near black for light backgrounds, cream
for dark. Use the plain one on the cream header and the inverse one on the dark
footer. Both are plain vector paths, no scripts and nothing fetched from
elsewhere.

They are shown 104px wide, 92px on phones. Do not go much below that: the
wordmark is roughly six times wider than it is tall, so it loses legibility
quickly. If the logo is ever replaced, keep the two variants in step.
