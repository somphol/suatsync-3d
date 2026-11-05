# Changelog

All notable changes to SuatSync 3D are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions use semantic versioning.

## [Unreleased]

### Fixed

- English mode: the Thai and English translations now share the wide content column instead of the
  English line stretching the label column and squeezing Thai into a thin strip with empty space
  beside it.
- `weight` on verses 9 and 15 is now applied as a multiplier. It had been treated as an absolute
  weight, giving both long verses less than a second of cue time and skewing every other verse.

### Added

- `data/timings.csv`: an editable 9 × 15 cue sheet. Set `start_seconds` per verse as `272.4` or
  `4:32.4`, run `node scripts/build-timings.mjs`, and `timings.js` drives exact line timing. Sync Lab
  still takes precedence while active.

## [1.0.0] — 2026-11-04

First public release.

### Added

- Chinabunchorn Chant dataset: 3 intro lines, 15 verses, 2 dedication lines, with Thai Pali, Roman
  transliteration, Thai meaning and English gloss.
- Karaoke engine with proportional line timing, active-line highlighting, click-to-seek and a
  scrollable round list.
- Eleven-marker timeline: intro, nine rounds and dedication, with a Sync Lab for local calibration.
- Three audio sources: consent-gated YouTube IFrame player (`LAo569-mflM`), local audio file, and a
  silent guide timer with a completion chime.
- Fade-aware volume, mute, 0.75×–1.25× tempo, restart and ±15 s seek.
- Nine-round progress tracking, full-sitting records, day streaks, lifetime minutes and a private
  JSON export.
- Procedural Three.js gold lotus mandala: nine outer petals, fifteen inner petals, rings, core, glow
  and 460 particles; petals light with completed rounds.
- Bilingual EN/TH interface, Thai/Roman script toggle, focus mode, keyboard shortcuts, reduced-motion
  support and a print view of the full chant.
- Static release checks, 27 in-app self-tests, headless browser integration checks and five
  screenshots.
- Documentation: reproduction book, architecture, content, testing, deployment, design, attribution.

### Known issues

- Default timings are estimates; the source video has no chapter data.
- YouTube audio cannot feed the Web Audio analyser; its pulse is synthetic.
- No service worker, manifest or offline installation.

[1.0.0]: https://github.com/somphol/suatsync-3d/releases/tag/v1.0.0
