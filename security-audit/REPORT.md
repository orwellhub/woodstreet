# Security and functionality audit

**Wood Street Indoor Market** &middot; 18 September 2026
Branch `security/audit-2026-09-18` &middot; mode: fix
Live site checked passively, read only, with the owner's authorisation.

---

## 1. Verdict

**Ready once the owner actions below are done.**

Nothing critical or high was found, and the two real flaws that were found are
fixed and covered by tests. What remains needs either a DNS change or a
dashboard the auditor cannot reach, and none of it puts visitor data at risk.

---

## 2. Summary in plain language

This is a brochure site. It has no accounts, no database, no payments and no
customer records. Nobody can log in, so nobody can log in as someone else.
That removes most of the ways a website gets attacked, and it is the main
reason this audit came back as calmly as it did.

Two genuine problems were found, both in the program that turns the shop
spreadsheet into web pages, and both proved by deliberately poisoning a copy of
the shop data and watching what came out.

- **A shop's name could escape into the page as live HTML.** The hidden block
  of data each page publishes for Google was assembled in a way that let a shop
  name containing a closing tag break out of it. Someone editing the shop file
  could have injected anything they liked into the page. The site's existing
  protections would have stopped that injection from running code, so the
  realistic damage was a defaced page or a convincing fake form, not a hijacked
  visitor.
- **A shop's website link was never checked for what kind of link it was.** The
  program checked the text was safe but not the address, so a link could have
  been made to run a script instead of going to a website.

Both are now blocked where the data is first read, so every page inherits the
protection rather than each one being patched separately. Twelve tests now
prove it, and they run automatically on every push.

Beyond that, the site's email arrangements need attention. The domain has no
DMARC record and no DKIM signing, which means anyone can send email pretending
to be Wood Street Indoor Market and nobody would be told. That is the most
valuable thing on the owner action list, and it is a DNS change rather than a
code change.

Nothing in the repository, its full history, or the live site contains a
password, key or token. The rent, deposit and owner-name columns from the
client spreadsheet have never been committed, which was checked commit by
commit rather than assumed.

---

## 3. Owner actions, most urgent first

### 1. Publish a DMARC record (SEC-003)

In hPanel, **Domains &rarr; woodstreetindoormarket.co.uk &rarr; DNS Zone Editor**,
add a TXT record:

| Field | Value |
|---|---|
| Type | TXT |
| Name | `_dmarc` |
| TTL | 3600 |
| Content | `v=DMARC1; p=none; rua=mailto:dmarc@walthamestates.co.uk; fo=1` |

Start at `p=none`, which changes nothing about delivery and only collects
reports. After a few weeks of clean reports, change `p=none` to
`p=quarantine`, and later to `p=reject`. Do not start at reject; legitimate
mail can be caught by it.

### 2. Turn on DKIM signing in Microsoft 365 (SEC-004)

Mail for this domain runs through Microsoft 365. In the **Microsoft 365 admin
centre &rarr; Settings &rarr; Domains**, select the domain, then in the
**Defender portal &rarr; Email &amp; collaboration &rarr; Policies &amp; rules
&rarr; Threat policies &rarr; Email authentication settings &rarr; DKIM**,
select the domain and choose **Create DKIM keys**. Microsoft gives two CNAME
records. Add both in the hPanel DNS Zone Editor, then return and switch
DKIM signing **on**. It will not let you enable signing until the records
resolve.

### 3. Hide the email address in the contact form (SEC-006)

The form currently posts to `https://formsubmit.co/info@walthamestates.co.uk`,
so the address is readable by spam crawlers. FormSubmit issues a random alias
for every activated form. Find it in the activation email, or by logging in at
formsubmit.co, then send it over and it takes one line to swap in. Delivery is
unchanged.

### 4. Check whether FTP is switched on, and remove the record if not (SEC-011)

In hPanel, **Files &rarr; FTP Accounts**. Deployment uses GitHub, not FTP, so
if an FTP account exists and is unused, delete it. Then remove the `ftp` A
record from the DNS Zone Editor. Doing this also unblocks a stronger HSTS
setting (SEC-009).

### 5. Turn on the repository protections (SEC-012)

In GitHub, on this repository's **Settings**: enable branch protection on the
deployment branch requiring the new CI check to pass, turn on secret scanning
and push protection under **Code security**, and confirm two-factor
authentication on every account with write access. A push to that branch
publishes straight to the live site, so write access is live-site access.

### 6. Publish a CAA record (SEC-005)

In the DNS Zone Editor, add: type `CAA`, name `@`, flags `0`, tag `issue`,
value `letsencrypt.org`. This stops any other certificate authority issuing
for the domain. Hostinger issues through Let's Encrypt, so renewal is
unaffected.

### 7. Merge and deploy

The audit branch has not been merged or deployed, by design. Merging
`security/audit-2026-09-18` into the deployment branch publishes the fixes.
After it deploys, confirm `/.well-known/security.txt` loads and `/.env` still
does not.

---

## 4. Coverage

### OWASP Top 10:2025

| | Category | Status | Evidence |
|---|---|---|---|
| A01 | Broken access control | N/A | No accounts, sessions or protected resources. Every published file is meant to be public. Inventory section 3 and 5. |
| A02 | Security misconfiguration | Fixed | Headers, CSP, dotfile and directory blocks verified on the live response. `.htaccess` structure now checked in CI. |
| A03 | Software supply chain failures | Pass | Zero runtime dependencies, no lockfile, no `node_modules`. CI uses no third-party actions. |
| A04 | Cryptographic failures | Pass | HTTPS enforced, HSTS set, valid certificate covering apex and www, no cryptography implemented in the project. |
| A05 | Injection | Fixed | SEC-001 and SEC-002, both proven and both closed at the data-loading step. Twelve regression tests. |
| A06 | Insecure design | Pass | A static site with no request handling is the design; there is no trusted client-side decision to subvert. |
| A07 | Authentication failures | N/A | No authentication exists. |
| A08 | Software and data integrity failures | Fixed | CI verifies the committed HTML matches a fresh build, so published pages cannot drift from source. |
| A09 | Logging and alerting failures | Not verified | Hosting-level logging is Hostinger's and was not inspected. No application to log. |
| A10 | Server-side request forgery | N/A | Nothing on the server fetches a URL. |

### Modules

| Module | Status | Note |
|---|---|---|
| A. Access control | N/A | No authenticated surface. |
| B. Authentication and sessions | N/A | None exists. |
| C. Injection and input handling | Fixed | SEC-001, SEC-002. Escaping verified; scheme validation added. |
| D. Secrets and configuration | Pass | No secrets in tree, history or output. Debug surfaces absent. Directory listing off. |
| E. Database and BaaS | N/A | No database. |
| F. APIs, webhooks, automation | Pass with note | Only the FormSubmit contact form. Captcha and honeypot on. No automation webhook is exposed in the page. |
| G. Browser and front-end | Fixed | Full header set live. CSP verified across all 36 pages with zero violations. |
| H. File handling | N/A | No uploads or downloads. |
| I. Cryptography and transport | Pass | See A04. Certificate SAN verified directly, bypassing the sandbox proxy. |
| J. Supply chain and CI/CD | Fixed | No dependencies. CI added with least privilege and no third-party actions. Repository settings need the owner (SEC-012). |
| K. Logging and error handling | N/A | No server-side code. |
| L. Business logic | N/A | No transactions or state. |
| M. AI, LLM and agents | N/A | No AI features. |
| N. Static and programmatic SEO | Fixed | security.txt added; SPF good; DMARC, DKIM and CAA need the owner. |
| O. Mobile | N/A | No mobile app. |
| P. Internal tools | N/A | None. |
| Q. Live deployment, DNS, email | Fixed | 28 sensitive paths probed, none exposed. DNS reviewed. |

---

## 5. Findings

Full detail, machine readable, in `findings.json`. Counts:

| Severity | Found | Fixed | Needs owner | Accepted |
|---|---|---|---|---|
| Critical | 0 | 0 | 0 | 0 |
| High | 0 | 0 | 0 | 0 |
| Medium | 4 | 2 | 2 | 0 |
| Low | 6 | 1 | 4 | 1 |
| Info | 2 | 0 | 0 | 2 |
| FUNC Blocker | 0 | 0 | 0 | 0 |
| FUNC Minor | 4 | 0 | 3 | 1 |

Fixed in this audit: SEC-001, SEC-002, SEC-007.
Accepted with a stated reason: SEC-008, SEC-009, SEC-010.

---

## 6. Not verified

Listed so silence is not mistaken for a pass.

- **Hostinger account settings.** FTP status, two-factor authentication on the
  hosting account, and server-level logging. No panel access.
- **FormSubmit account.** Whether the form alias exists, and what retention
  FormSubmit applies to messages in transit. No account access.
- **Microsoft 365 tenant.** Mailbox security, who can read the enquiry inbox,
  and whether DKIM has simply not been enabled or was deliberately skipped.
- **GitHub repository settings.** Branch protection, secret scanning, 2FA,
  collaborator list, deploy keys.
- **The CI workflow has never run.** It is written but unproven until the
  branch reaches GitHub.
- **Live verification of this audit's fixes.** Nothing was deployed, per the
  audit's own rules, so the new `.htaccess` rules and security.txt are verified
  locally but not on the live server.
- **Whether units M13 to M22 exist.** A data question for the client.
- **Formal accessibility conformance.** Every page passes automated axe-core
  testing, which catches perhaps a third of real issues. No audit with
  assistive technology users has been done, and the accessibility statement on
  the site says exactly that.

---

## 7. Residual risk

An automated review of this kind establishes that the obvious classes of flaw
are absent and that the specific ones found are closed. It cannot establish
that a site is secure, and this report does not claim it.

For this site the honest picture is that the residual risk is low and mostly
sits outside the code:

- **The deployment path is the weak point.** Anyone with write access to the
  repository publishes to the live site immediately, with no review. That is
  now the highest-value thing to protect, which is why repository protections
  are on the action list.
- **The shop data is a trusted input that does not look like one.** It is a
  plain file a non-technical person is invited to edit. This audit hardened the
  build against what might be put in it, but the build still trusts whoever
  holds the keys to the repository.
- **Email spoofing is currently unmitigated** and is the most likely real-world
  abuse of this domain, because the market's name has value even though the
  website holds nothing worth stealing.

A penetration test is not proportionate here: there is no application to test,
no data to exfiltrate and no authentication to bypass. If the site ever gains
accounts, payments or a form that writes to a database, that judgement changes
and a test should be commissioned before launch.

---

## 8. For the client

> The Wood Street Indoor Market website has been through a full security and
> functionality review covering the OWASP Top 10, the site's configuration and
> hosting, its DNS and email records, and its accessibility.
>
> The site is a static brochure site: it holds no customer accounts, no
> personal records and no payment information, which removes most common
> categories of risk by design. Two issues were identified in the tool that
> generates the pages, both of which could have allowed unwanted content to be
> placed on a page by someone editing the shop data. Both have been fixed at
> source and are now covered by automated tests that run on every change.
>
> The site enforces HTTPS, sends a full set of browser security headers
> including a content security policy, serves its own fonts rather than calling
> out to third parties, and exposes no administrative or configuration files.
> A small number of items remain for the domain owner to action, principally
> the addition of DMARC and DKIM email authentication records.
>
> No evidence of compromise was found, and no credentials or sensitive
> commercial data appear anywhere in the site or its version history.

---

*Prepared on branch `security/audit-2026-09-18`. Nothing was deployed and
nothing was pushed to the deployment branch.*
