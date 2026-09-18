# Audit state

Branch `security/audit-2026-09-18` &middot; mode: fix &middot; started and completed 18 September 2026.

| Phase | Status | Output |
|---|---|---|
| 0. Reconnaissance and inventory | Done | `00-inventory.md` |
| 1. Automated baseline | Done | No dependencies to audit. Secret scan of working tree and full history: clean. Build reproducibility: verified. |
| 2. Manual review modules | Done | A, B, E, H, K, L, M, O, P marked N/A with reasons. C, D, F, G, I, J, N, Q reviewed. See REPORT section 4. |
| 3. Functionality and completeness | Done | No stubs, mock data or fake success paths. Four FUNC-Minor completeness gaps, all already visible to users as honest empty states. |
| 4. Triage | Done | `findings.json` |
| 5. Fix | Done | SEC-001, SEC-002, SEC-007 fixed. Three accepted with reasons. Six need the owner. |
| 6. Verify | Done | 12 regression tests pass. 36 pages re-audited for CSP and accessibility: zero violations. Live paths re-probed. |
| 7. Prevention | Done | `CLAUDE.md` baseline, `.github/workflows/ci.yml`, `tools/test.mjs`, `.well-known/security.txt` |
| 8. Report | Done | `REPORT.md` |

## If this is resumed

Everything is committed on the audit branch. The branch has **not** been merged
into the deployment branch and **nothing has been deployed**, deliberately.

Open items are all in REPORT section 3 and need either DNS access, a Hostinger
or Microsoft 365 dashboard, a FormSubmit login, or GitHub repository settings.
None of them can be closed from a code session.

Re-running the audit: `node --test tools/test.mjs` for regressions,
`node tools/build.mjs` to confirm the output is reproducible, and
`node tools/audit.mjs` (needs `npm install --no-save playwright axe-core`) for
the CSP and accessibility sweep. Diff any new findings against `findings.json`.
