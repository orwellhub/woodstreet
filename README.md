# Wood Street Indoor Market

A single-page site. One file, no build step, no dependencies, no framework.

## Files

| Path | Purpose |
|---|---|
| `index.html` | The whole site. Content, styling and the market map all live here. |
| `uploads/` | Photography (see the slots below) |
| `.htaccess` | Redirects old URLs to the landing page, plus gzip and caching |
| `robots.txt` | Search engine directives |

## Editing

Everything is in `index.html`, in the order it appears on the page:

1. Header and opening hours strip
2. Hero
3. `#shops` a placeholder until there is a real trader list
4. `#map` the illustrated horseshoe map
5. Our story
6. `#visit` where, opening hours, getting here, inside the market
7. Photo strip
8. `#join` the join the market call to action
9. Footer

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
| `street-market.webp` | Gallery, left |
| `market-corridor.jpg` | Gallery, middle |
| `market-hall.jpg` | Gallery, right |

To swap one, keep the same filename and the layout stays put. If you change
the filename or the picture's shape, update the matching `width` and `height`
attributes on the `<img>` tag so the page does not jump about while loading.
The three gallery images are cropped to squares, so anything important should
sit near the middle of the frame.

Keep images to roughly 1000px on the long edge. They are only ever shown a
few hundred pixels wide, and large files make the page slow on a phone.

## The map

The map is a grid of absolutely positioned boxes using percentage
coordinates from a 980 by 764 drawing. Every unit is drawn the same, with
just its number, because there is no confirmed record of who trades where.

Once the real trader list exists, the units can carry a fill colour per
trade and a tooltip naming the shop, and `#shops` can go back to being a
card per trader. Both were built that way before and were removed because
the names in the original design draft were invented.

## Deploy

Hostinger is connected to this repository over GitHub OAuth. Commit, push,
and Hostinger redeploys. `index.html` must stay at the repository root.

## Before it goes live

These came from the original design draft and are still unconfirmed:

- the phone number, the email address and the Instagram handle
- the opening hours
- "Est. 1955", which appears in the logo, the hero and the footer
- the cinema history in Our story, which the draft flagged as needing
  checking against local archives
- the map: thirty units in a horseshoe, and the position of the two doors

The invented trader names and descriptions have already been removed.
