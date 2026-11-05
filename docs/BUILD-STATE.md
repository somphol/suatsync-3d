# Build state — SuatSync 3D 1.0.0

> Snapshot of how this release was made and what was verified. The machine-readable copy is
> [../state.json](../state.json). Update both when the release changes.

## Session

| | |
| --- | --- |
| Harness | OpenCode |
| Model | DeepSeek V4.1 Flash (`opencode-go/deepseek-v4.1-flash`) |
| Start | 2026-11-04 22:18:18 −08:00 |
| Snapshot | 2026-11-04 22:35 −08:00 |
| Wall clock at snapshot | ~17 minutes |
| Tokens at snapshot | 193,372 input · 86,083 output · 50,139 reasoning · 5,263,616 cache read · 1,819 cache write |
| Fresh tokens at snapshot | 329,594 |
| Reported total at snapshot | 5,626,821 |

The final metrics are captured after the GitHub repositories and the skill catalog are published; the
numbers above are an interim snapshot and are superseded by `state.json`.

## What was built

- Three-file static app: `index.html`, `style.css`, `script.js`.
- 20 complete chant lines (3 intro, 15 verses, 2 dedication) in Thai Pali, Roman, Thai and English.
- Eleven-marker timeline with proportional line timing and a calibration dialog.
- Three audio sources: consent-gated YouTube, local file, silent timer.
- Progress, sittings, streaks, export, print.
- Procedural Three.js mandala with nine round petals and fifteen verse petals.
- 27 self-tests, 8 DOM checks, 9 interaction checks, 11 Sync Lab markers.
- Documentation set (reproduction, architecture, content, testing, deployment, design), attribution,
  licence, contributing, security, changelog.
- Five release screenshots.

## Artifact counts

| Artifact | Count |
| --- | --- |
| Source files | 3 |
| Source lines | 3,619 (347 HTML + 771 CSS + 2,501 JS) |
| Chant display lines | 20 |
| Verses | 15 |
| Rounds | 9 |
| Sections / markers | 11 |
| i18n languages | 2 |
| Dialogs | 4 |
| Self-tests | 27 |
| Browser checks | 8 DOM + 9 interaction + 1 Sync Lab + 1 console |
| Screenshots | 5 |
| Docs | 7 in `docs/`, plus README, AGENTS, CHANGELOG, CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, ATTRIBUTION |

## Build sequence

1. Measured the source video (`lengthSeconds` 5837) and fetched the chant recension from Thai
   Wikisource.
2. Authored the 20-line bilingual dataset and the eleven-marker timing model.
3. Built the three-column interface and design tokens, then the karaoke renderer and line list.
4. Added the unified audio adapter, consent-gated YouTube loader, local file path and timer.
5. Added progress, streaks, export and print.
6. Built the procedural mandala and wired round petals to session state.
7. Added Sync Lab, i18n coverage and keyboard access.
8. Wrote the static and headless verification harnesses; fixed the dedication boundary and line-index
   test; regenerated screenshots.
9. Wrote the release documentation and this record.
10. Published the repository, enabled Pages, verified the live URL, then published the skill.

## Verification

```text
PASS 27/27 in-app self-tests
PASS 8/8 DOM checks
PASS 9/9 interaction checks
PASS Sync Lab opens with 11 markers
PASS no uncaught runtime errors
OK browser verification complete
```

Environment: macOS 27.2, Node v26.13.0, Chrome 156.0.8078.80 headless (SwiftShader), Python 3 server.

Static check: run `node scripts/check.mjs`; the final count is recorded in
[TESTING.md](TESTING.md) and `state.json`.

## Release

- Repository: <https://github.com/somphol/suatsync-3d>
- Live: <https://somphol.github.io/suatsync-3d/>
- Branch: `main`, Pages root, `.nojekyll` present.
- Licence: MIT for code; CC BY-SA 4.0 for the chant transcription and original glosses.
- Video embedded, not redistributed.

## Credits

Built with **OpenCode** and **DeepSeek V4.1 Flash**. Three.js r128 (MIT) via cdnjs. Chant text from
Thai Wikisource (CC BY-SA 4.0); video by Joao Felix, embedded. Original code, interface and bilingual
glosses by Somphol Boonjing.
