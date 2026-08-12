# Wood Street Indoor Market

A single-page site. One file, no build step, no dependencies, no framework.

## Files

| Path | Purpose |
|---|---|
| `index.html` | The whole site. Content, styling and the market map all live here. |
| `uploads/` | Photography |
| `.htaccess` | Redirects old URLs to the landing page, plus gzip and caching |
| `robots.txt` | Search engine directives |

## Editing

Everything is in `index.html`, in the order it appears on the page:

1. Header and opening hours strip
2. Hero
3. `#shops` the shop cards, in walking order from the front doors
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

The map is a grid of absolutely positioned boxes using percentage
coordinates from a 980 by 764 drawing. To move a shop between units, change
the number and the fill colour on the relevant box, and update the matching
card in `#shops`.

## Deploy

Hostinger is connected to this repository over GitHub OAuth. Commit, push,
and Hostinger redeploys. `index.html` must stay at the repository root.

## Before it goes live

The shop names and descriptions came from the original design draft and are
sample content. Confirm the real trader list, and check the phone number,
the email address, the Instagram handle and the opening hours.
