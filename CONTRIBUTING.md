# Contributing

Thanks for considering a contribution. This is a small, static project; the bar is correctness and
restraint, not volume of code.

## Before you start

1. Read [docs/REPRODUCTION.md](docs/REPRODUCTION.md) and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
2. Run the checks on a clean clone:
   ```bash
   node scripts/check.mjs
   node scripts/verify-browser.mjs
   ```
3. Open an issue for anything that changes the chant text, timing model, storage schema or public
   export format. Those are content/contract decisions, not ordinary refactors.

## What is welcome

- Corrections to Thai or Pali text with an authoritative edition and page/URL.
- Better English glosses that remain plain and faithful.
- Accessibility fixes, especially mobile screen-reader and Thai line-wrapping issues.
- Calibration improvements, including measured markers for the source video (include the exact
  timestamps and how you measured them).
- Bug fixes with a reproduction and a test.
- New translations of the interface, with the full string table.

## What needs discussion first

- Changing the video, the chant edition, or the 15-verse structure.
- Adding a framework, bundler, backend, analytics, webfont or CDN.
- Changing the storage key or export shape.
- Changing completion rules (currently ≥50% coverage and reaching the round end).
- Re-hosting audio or video.

## Code style

- Vanilla ES5-compatible syntax inside the IIFE (`var`, function declarations) for maximum browser
  reach; no transpiler.
- Two-space indent, double quotes, semicolons.
- One responsibility per function; render functions read state, they do not mutate it.
- Comments explain *why*, not *what*. Do not leave commented-out code.
- Keep the three-file structure. Do not split into modules without updating the reproduction book.

## Content style

- Thai: natural contemporary Thai, no machine translation without review.
- English: plain modern English, Pali names with diacritics where useful.
- Do not add doctrine not present in the verse.
- If you change a verse, update its `pali`, `roman`, `th` and `en` together.

## Tests

Every behavioural change needs a check. Add to `runSelfTests` for pure logic, and to
`verify-browser.mjs` for DOM or interaction changes. Screenshots must be regenerated after a visual
change:

```bash
node scripts/verify-browser.mjs --screenshots
```

`scripts/check.mjs` enforces local links; if you add a doc or image, link it.

## Pull request

- One concern per PR.
- Describe what changed, why, and how you verified it.
- State the browser/OS used for manual checks.
- Confirm that no credentials, personal paths, analytics or third-party assets were added.
- By contributing, you agree that code is licensed under MIT and original content under CC BY-SA 4.0.

## Reporting a problem

Use GitHub Issues. For security, follow [SECURITY.md](SECURITY.md) instead of opening a public issue.
