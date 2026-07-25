# Wood Street Indoor Market — website

Static site. No build step, no dependencies: every file here is served as-is.

## Deploy: GitHub → Hostinger

1. Create a new **empty** GitHub repo (public or private).
2. Upload **the contents of this folder** to the repo root — not the folder itself.
   `index.html` must sit at the top level of the repo.
   - Via the web: GitHub → *Add file* → *Upload files* → drag everything in, including the `uploads` folder.
   - Via git:
     ```bash
     git init
     git add -A
     git commit -m "Wood Street Indoor Market site"
     git branch -M main
     git remote add origin https://github.com/<you>/<repo>.git
     git push -u origin main
     ```
   - Note: `.gitignore` and `.htaccess` start with a dot and are hidden in Finder/Explorer.
     Press **Cmd+Shift+.** (Mac) or enable *Hidden items* (Windows) so they upload too.
3. In **hPanel** → *Website* → **Git**:
   - Click **Connect with GitHub** and authorise (OAuth).
   - Repository: your new repo. Branch: `main`. Install path: leave blank (= `public_html`).
   - Click **Create**, then **Deploy**.
4. Optional: hit **Auto deployment** and copy the webhook URL into
   GitHub → repo *Settings* → *Webhooks*, so every push republishes automatically.

## After the first deploy — check

- `https://yourdomain.com/` lands on the home page (`index.html` redirects to `Home.dc.html`).
- The photos in the hero, story and gallery load (they come from `uploads/`).
- Nav links, trader directory search, market map and the events calendar all work.
- A bad URL shows the custom 404 page.

## What's here

| Path | Purpose |
|---|---|
| `index.html` | Entry point — redirects to the home page |
| `Home.dc.html` | Home |
| `Traders.dc.html` / `Trader.dc.html` | Directory + trader profiles |
| `Map.dc.html` | Interactive market map |
| `WhatsOn.dc.html` / `Event.dc.html` | Events + event detail |
| `Visit.dc.html`, `Story.dc.html` | Visit info, history |
| `Journal.dc.html` / `Article.dc.html` | Journal + articles |
| `Join.dc.html`, `Unit.dc.html`, `Apply.dc.html` | Trading with the market |
| `Contact.dc.html`, `Legal.dc.html`, `NotFound.dc.html` | Contact, policies, 404 |
| `Header.dc.html`, `Footer.dc.html`, `MiniMap.dc.html` | Shared components (needed — don't delete) |
| `data.js` | All site content — edit here to change copy, traders, events |
| `support.js`, `image-slot.js` | Runtime (needed) |
| `uploads/` | Photography |
| `.htaccess` | Custom 404, gzip, caching |

## Editing content

Copy, traders, events, articles, opening hours and FAQs all live in **`data.js`**.
Change it, commit, push — Hostinger redeploys.

## Before you call it live

Traders, events, articles and available units are **sample content**. Also confirm:
the address wording, phone number and email, the Instagram handle, opening hours,
the cinema-era history, entrance positions and unit layout, and physical accessibility
details. The legal pages are drafts and need a legal read.
