# Wood Street Indoor Market

A single-page site. One file, no build step, no dependencies, no framework.

## Files

| Path | Purpose |
|---|---|
| `index.html` | The whole site. Content and styling all live here. |
| `uploads/` | Photography (see the slots below) |
| `brand/` | Walthams logo, light and inverse |
| `.htaccess` | Redirects old URLs to the landing page, plus gzip and caching |
| `robots.txt` | Search engine directives |

## Editing

Everything is in `index.html`, in the order it appears on the page:

1. Header and opening hours strip
2. Hero
3. `#shops` the shop directory, grouped by building
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
(`Wood Street Market - Shops Updated.xlsx`), not hand written. The market has two
buildings: Antique City at 98 Wood Street (units A1 to A16) and Market Side at
102a Wood Street (units M2 to M38).

Three rules the generated markup follows, worth keeping if it is ever regenerated:

- **Rent and deposit never appear.** Both are columns in the spreadsheet and both
  are commercially sensitive.
- **Owner names are not published as a field.** They appear only where the client's
  own description already names them.
- **A link is only rendered for a genuine address.** The spreadsheet's Website
  column mostly holds pasted link text ("Pritzy logo", "Books From Boxes") rather
  than URLs, so most shops correctly have no website link.

The map colours each unit by trade family and every unit also carries its shop name
as text, so the colour is never the only thing carrying the information. Merged units
(A2/3, M25/26/27 and so on) span two columns.

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
