# Build state — SuatSync 3D 1.0.0

> Snapshot of how this release was made and what was verified. The machine-readable copy is
> [../state.json](../state.json). Update both when the release changes.

## Session

| | |
| --- | --- |
| Harness | OpenCode |
| Model | DeepSeek V4.1 Flash (`opencode-go/deepseek-v4.1-flash`) |
| Start | 2026-11-04 22:18:18 −08:00 |
| Snapshot | 2026-11-04 23:14:47 −08:00 |
| Wall clock | 56m 29s (includes a stalled verification attempt; ~23m uninterrupted build to first release) |
| Tokens | 229,081 input · 101,877 output · 58,080 reasoning · 13,654,400 cache read · 1,819 cache write |
| Fresh tokens | 389,038 |
| Reported total | 14,045,257 |
| Cost | $0 on the OpenCode Go plan |

The snapshot was taken after the app and skill catalog were published and the live URLs verified. It
excludes only the final commit that records these figures. `state.json` is the canonical numeric copy.

## What was built

- Three-file static app: `index.html`, `style.css`, `script.js`.
- 20 complete chant lines (3 intro, 15 verses, 2 dedication) in Thai Pali, Roman, Thai and English.
- Eleven-marker timeline with measured verse cues from `data/timings.csv`; no in-app calibration.
- Three audio sources: auto-loading YouTube, local file, silent timer.
- Progress, sittings, streaks, export, print.
- Procedural Three.js mandala with nine round petals and fifteen verse petals.
- Seven themes (four dark, three light), three reading sizes and four animated backdrops, persisted locally.
- 27 self-tests, 8 DOM checks, 9 interaction checks, 135 measured cues.
- Documentation set (reproduction, architecture, content, testing, deployment, design), attribution,
  licence, contributing, security, changelog.
- Seven release screenshots (landing, karaoke, Roman, forest, ocean, daylight, mobile).
- A reusable skill with a working template, scaffold script and references, published in the
  OpenCode skill catalog.

## Artifact counts

| Artifact | Count |
| --- | --- |
| Source files | 3 |
| Source lines | 4,261 (364 HTML + 1,090 CSS + 2,807 JS) |
| Source bytes | 190,800 |
| Chant display lines | 20 |
| Verses | 15 |
| Rounds | 9 |
| Sections / markers | 11 |
| i18n languages | 2 |
| Dialogs | 3 |
| Self-tests | 27 |
| Browser checks | 8 DOM + 9 interaction + 1 console |
| Screenshots | 7 |
| Docs | 7 in `docs/`, plus README, AGENTS, CHANGELOG, CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, ATTRIBUTION |
| Repository files | 31 |

## Build sequence

1. Measured the source video (`lengthSeconds` 5837) and fetched the chant recension from Thai
   Wikisource.
2. Authored the 20-line bilingual dataset and the eleven-marker timing model.
3. Built the three-column interface and design tokens, then the karaoke renderer and line list.
4. Added the unified audio adapter, auto-loading YouTube player, local file path and timer.
5. Added progress, streaks, export and print.
6. Built the procedural mandala and wired round petals to session state.
7. Added the timing sheet pipeline, i18n coverage and keyboard access.
8. Wrote the static and headless verification harnesses; fixed the dedication boundary and line-index
   test; regenerated screenshots.
9. Wrote the release documentation and this record.
10. Published the app repository, enabled Pages, verified the live boot, then published the skill to the
    existing catalog and verified `index.json` and `SKILL.md` over HTTP.

## Verification

```text
OK 62 checks                                   (static contract)
PASS 27/27 in-app self-tests
PASS 8/8 DOM checks
PASS 9/9 interaction checks
PASS no uncaught runtime errors
OK browser verification complete
```

Live boot: HTTP 200, `data-suat-sync="ready"`, intro Pali line rendered in headless Chrome. Catalog:
13 skills in `index.json`; `suatsync-3d-studio/SKILL.md` returns 200.

Environment: macOS 27.2, Node v26.13.0, Chrome 156.0.8078.80 headless (SwiftShader), Python 3 server.

## Release

- App repository: <https://github.com/somphol/suatsync-3d>
- Live: <https://somphol.github.io/suatsync-3d/>
- Skill catalog: <https://somphol.github.io/opencode-skills/>
- Skill: <https://somphol.github.io/opencode-skills/suatsync-3d-studio/>
- Branch: `main`, Pages root, `.nojekyll` present.
- Licence: MIT for code; CC BY-SA 4.0 for the chant transcription and original glosses.
- Video embedded, not redistributed.

## Credits

Built with **OpenCode** and **DeepSeek V4.1 Flash**. Three.js r128 (MIT) via cdnjs. Chant text from
Thai Wikisource (CC BY-SA 4.0); video by Joao Felix, embedded. Original code, interface and bilingual
glosses by Somphol Boonjing.
