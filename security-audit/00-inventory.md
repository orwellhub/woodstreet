# Phase 0: inventory

Audited 18 September 2026, branch `security/audit-2026-09-18`.

## 1. What this is

A **static brochure site**. Every page is plain HTML generated ahead of time by
`tools/build.mjs` from `data/shops.json`. There is no server-side code, no
database, no accounts, no sessions, no customer data and no payments.

Classifications that apply: static site. Classifications that do **not** apply,
and therefore whole modules that are N/A: SPA on a backend-as-a-service, full
stack app, API, mobile app, internal tool, automation or bot, AI or agent
system.

This narrow shape is the single most important fact in the audit. Most of the
damage classes the standard is built around (broken object-level
authorisation, SQL injection, session handling, mass assignment, tenant
isolation) have no surface here because nothing on the server reads a request.

## 2. Stack and versions

| Part | What |
|---|---|
| Output | Static HTML, CSS, one JS file, WebP and JPEG images, WOFF2 fonts |
| Generator | Node (ES modules), `tools/build.mjs`, run by hand and in CI |
| Dependencies | **None.** No `package.json`, no lockfile, no `node_modules` in the repo |
| Hosting | Hostinger shared hosting, LiteSpeed |
| TLS | Let's Encrypt via Hostinger "Lifetime SSL", covers apex and www |
| Deployment | GitHub OAuth integration; a push to the deployment branch publishes |
| CI | Added by this audit: `.github/workflows/ci.yml`, no third-party actions |
| DNS | Hostinger nameservers; email on Microsoft 365 |

Dev-only tooling (`tools/audit.mjs`) uses Playwright and axe-core, installed
on demand and never committed.

## 3. Entry points

There is no application to enumerate. Every "entry point" is a static file the
web server hands over unchanged.

| Entry | Method | Who calls it | Auth enforced | Data touched |
|---|---|---|---|---|
| `/` and 11 other top-level pages | GET | Anyone | None needed, all public | None |
| `/shop/*.html` (24 pages) | GET | Anyone | None needed, all public | None |
| `/assets/*`, `/uploads/*`, `/brand/*` | GET | Anyone | None needed | None |
| `/sitemap.xml`, `/robots.txt`, `/.well-known/security.txt` | GET | Anyone, crawlers | None needed | None |
| Contact form | POST to `formsubmit.co` | Anyone | Third party: captcha and honeypot | Name, email, phone, message, in transit only |
| `/tools/`, `/data/`, `/archive/`, `README.md`, `CLAUDE.md`, dotfiles | GET | Blocked | `.htaccess` returns 404 or 403 | None |

The only place a visitor can send anything is the contact form, and that posts
directly to a third party. This site never receives a request it has to trust.

## 4. Data inventory

| Data | Where | Who can read it | Where it flows |
|---|---|---|---|
| Shop names, descriptions, categories, opening hours | `data/shops.json`, published on every page | Everyone, by design | Nowhere else |
| Trader mobile numbers (6 shops) | Same, published | Everyone, by design | Nowhere else |
| Enquiry name, email, phone, message | Nowhere on this site | Walthams | Browser to FormSubmit to Walthams' mailbox |
| Rent, deposit, owner names | **Deliberately absent.** Confirmed absent from the working tree and from every commit in history | Nobody | Nowhere |

Trader phone numbers are published business contact details, supplied by the
client for that purpose. No personal data is stored by the site.

## 5. Trust boundaries and roles

One role: anonymous visitor. There is no logged-in state anywhere, so there is
no privilege escalation path and no authorisation model to get wrong.

The meaningful trust boundary is at **build time**, not request time: whoever
edits `data/shops.json` or the generator decides what every visitor sees. That
is where this audit concentrated.

## 6. Third parties

| Party | Purpose | Credential | Reaches the browser |
|---|---|---|---|
| FormSubmit | Delivers the contact form to Walthams | None; the destination address is in the form action | Yes, on form submit |
| Google reCAPTCHA | FormSubmit's own bot check | None held by us | Only on FormSubmit's page, after submit |
| Google Maps | "Get directions" link | None | Only if the visitor clicks |
| Facebook, Instagram, X | Social links | None | Only if the visitor clicks |
| Microsoft 365 | Email for the domain | None in this repo | No |

Nothing is embedded. No analytics, no tag manager, no tracking pixel, no
third-party script or stylesheet. Fonts were moved off Google and are served
from this site.

## 7. Secrets inventory

**None.** There is no secret anywhere in the repository, its history, the built
output or the deployed site, because the architecture has nowhere to use one.
Verified by pattern scan of the working tree and of every commit on every
branch.

The nearest thing is `info@walthamestates.co.uk` in the contact form's action
URL. That is a published business address, not a secret, but it is
machine-readable to address harvesters (SEC-006).

## 8. Deployment path

Push to the deployment branch, Hostinger pulls and publishes. No build step
runs on the host, which is why the generated HTML is committed. The whole
repository lands in the web root, so anything that should not be public is
blocked in `.htaccess` rather than excluded from the upload. That list is now
`tools/`, `data/`, `archive/`, `security-audit/`, `README.md`, `CLAUDE.md` and
every dotfile except `/.well-known/`.

No FTP is used for deployment. No deploy credentials exist in the repository.
