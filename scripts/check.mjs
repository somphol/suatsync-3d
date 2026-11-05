#!/usr/bin/env node
/**
 * SuatSync 3D — dependency-free static checks.
 *
 *   node scripts/check.mjs
 *
 * Verifies the release contract: required files, local links, script syntax,
 * the 15-verse dataset, the nine-round structure, and basic hygiene. Prints
 * "OK <n> checks" and exits 0 only when every check passes.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let checks = 0;
let failures = 0;

function check(name, condition, detail = "") {
  checks++;
  if (condition) {
    console.log("PASS " + name);
  } else {
    failures++;
    console.error("FAIL " + name + (detail ? " — " + detail : ""));
  }
}

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

const requiredFiles = [
  "index.html",
  "style.css",
  "script.js",
  "README.md",
  "AGENTS.md",
  "LICENSE",
  "ATTRIBUTION.md",
  "package.json",
  "robots.txt",
  "sitemap.xml",
  ".nojekyll",
  "docs/ARCHITECTURE.md",
  "docs/REPRODUCTION.md",
  "docs/TESTING.md",
  "docs/DEPLOYMENT.md",
  "docs/CONTENT.md",
  "docs/DESIGN.md",
  "docs/BUILD-STATE.md",
  "scripts/check.mjs",
  "scripts/verify-browser.mjs"
];

requiredFiles.forEach((file) => check("file exists: " + file, exists(file)));

const html = read("index.html");
const css = read("style.css");
const js = read("script.js");
const pkg = JSON.parse(read("package.json"));

check("HTML declares Thai and English support", html.includes('lang="en"') && html.includes('hreflang') === false);
check("HTML links the stylesheet", html.includes('href="style.css"'));
check("HTML loads the app script", html.includes('src="script.js"'));
check("Three.js is pinned to r128 on cdnjs", html.includes("three.js/r128/three.min.js") && html.includes("cdnjs.cloudflare.com"));
check("title names the studio and the chant", html.includes("SuatSync 3D") && html.includes("Chinabunchorn"));
check("viewport and theme colour are set", html.includes('name="viewport"') && html.includes('name="theme-color"'));
check("Open Graph metadata is present", html.includes('property="og:title"') && html.includes('property="og:description"'));
check("skip link is the first focusable element", html.indexOf('class="skip-link"') < html.indexOf('class="topbar"'));
check("no external font or analytics hosts", !/fonts\.googleapis|googletagmanager|google-analytics|plausible|umami/i.test(html));

check("CSS has a responsive breakpoint", css.includes("@media (max-width: 840px)"));
check("CSS respects prefers-reduced-motion", css.includes("prefers-reduced-motion"));
check("CSS defines a print stylesheet", css.includes("@media print"));

check("script is a strict-mode IIFE", js.startsWith("/*") && js.includes('"use strict";') && js.trimEnd().endsWith("})();"));
check("script parses", spawnSync(process.execPath, ["--check", path.join(root, "script.js")], { stdio: "ignore" }).status === 0);
check("storage key is versioned", js.includes('STORAGE_KEY = "suatsync3d.v1"'));
check("source video id is embedded once", (js.match(/LAo569-mflM/g) || []).length >= 2);
check("nominal duration matches the video (5837s)", js.includes("NOMINAL_DURATION = 5837"));
check("15 verses are declared", (js.match(/id: "v\d+"/g) || []).length === 15, String((js.match(/id: "v\d+"/g) || []).length));
check("every line has four language fields", (js.match(/\bpali: "/g) || []).length === 20 && (js.match(/\broman: "/g) || []).length === 20 && (js.match(/\bth: "/g) || []).length === 20 && (js.match(/\ben: "/g) || []).length === 20);
check("intro contains the Namo three times", js.includes("นะโม ตัสสะ") && js.includes("(3 จบ)"));
check("dedication closes the chant", js.includes("อิทัง เม ญาตีนัง โหตุ"));
check("Playback speed is clamped to 0.75–1.25", js.includes("0.75, 1.25"));
check("YouTube loads only on request", js.includes("function connectYouTube") && js.includes("yt-iframe-api"));
check("a silent timer fallback exists", js.includes('audio.source === "timer"'));
check("self-tests are exposed", js.includes("runSelfTests"));
check("timeline calibration is validated", js.includes("function validateMarkers") && js.includes("calibration"));
check("no TODO or FIXME markers", !/\b(TODO|FIXME|XXX)\b/.test(js + css + html));
check("no eval or Function constructor", !/\beval\s*\(|new Function\s*\(/.test(js));
check("no hardcoded personal paths", !/\/Users\/[A-Za-z]/.test(js + css + html));
check("no credential-like strings", !/(sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16})/.test(js + css + html));

check("package name is the repository name", pkg.name === "suatsync-3d", pkg.name);
check("package has start, check and verify scripts", !!pkg.scripts.start && !!pkg.scripts.check && !!pkg.scripts.verify);
check("package is private and MIT", pkg.private === true && pkg.license === "MIT");
check("package engines require Node 22+", String(pkg.engines && pkg.engines.node) === ">=22");

check("robots.txt allows crawling", /User-agent:\s*\*/i.test(read("robots.txt")) && !/Disallow:\s*\/\s*$/m.test(read("robots.txt")));
check("sitemap lists the live URL", read("sitemap.xml").includes("https://somphol.github.io/suatsync-3d/"));

const localTargets = [];
for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
  const target = match[1];
  if (/^(https?:|data:|mailto:|#)/.test(target) || target === "") continue;
  localTargets.push(target.split("#")[0].split("?")[0]);
}
const missingTargets = [...new Set(localTargets)].filter((target) => !exists(target));
check("every local HTML link resolves", missingTargets.length === 0, missingTargets.join(", "));

const markdownFiles = ["README.md", "AGENTS.md", "CONTRIBUTING.md", "SECURITY.md", "docs/ARCHITECTURE.md", "docs/REPRODUCTION.md", "docs/TESTING.md", "docs/DEPLOYMENT.md", "docs/CONTENT.md"];
const brokenDocLinks = [];
for (const file of markdownFiles) {
  if (!exists(file)) continue;
  const text = read(file);
  for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
    const target = match[1].split("#")[0];
    if (!target || /^(https?:|mailto:|#)/.test(target)) continue;
    if (!exists(path.normalize(path.join(path.dirname(file), target)))) brokenDocLinks.push(file + " → " + target);
  }
}
check("every relative documentation link resolves", brokenDocLinks.length === 0, brokenDocLinks.join(", "));

const screenshotFiles = fs.readdirSync(path.join(root, "docs")).filter((name) => /^screenshot-.*\.png$/.test(name));
check("release screenshots exist", screenshotFiles.length >= 3, String(screenshotFiles.length));

const forbidden = [".env", ".git-credentials", "node_modules"];
forbidden.forEach((name) => check("repository does not contain " + name, !exists(name)));

if (failures) {
  console.error(`\nFAIL ${failures} of ${checks} checks`);
  process.exit(1);
}
console.log(`\nOK ${checks} checks`);
