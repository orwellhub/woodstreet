# Wood Street Indoor Market

A single-page site. One file, no build step, no dependencies, no framework.

## Files

| Path | Purpose |
|---|---|
| `index.html` | The whole site. Content and styling all live here. |
| `uploads/` | Photography (see the slots below) |
| `.htaccess` | Redirects old URLs to the landing page, plus gzip and caching |
| `robots.txt` | Search engine directives |

## Editing

Everything is in `index.html`, in the order it appears on the page:

1. Header and opening hours strip
2. Hero
3. `#shops` a placeholder until there is a real trader list
4. Our story
5. `#visit` where, opening hours, getting here, inside the market
6. Photo strip
7. `#join` the join the market call to action
8. Footer, including the social buttons

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
The credit under the logo in the header and footer links there, and every
phone number and email address on the page is theirs:

- 020 8509 0444
- info@walthamestates.co.uk

Wood Street has no phone or email of its own. If Walthams' details change,
they appear in the top strip, the two cards under The shops, Inside the
market, the Join the Market button, the footer, and the JSON-LD block.

These came from the original design draft and are still unconfirmed:

- the opening hours
- "Est. 1955", which appears in the logo, the hero and the footer
- the cinema history in Our story, which the draft flagged as needing
  checking against local archives

The invented trader names and descriptions have already been removed.
