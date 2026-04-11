# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Coders Farm Learn — a free, open-source technology education platform. Static site hosted on GitHub Pages at learn.codersfarm.org. PWA with full offline support.

## Development

There is **no build step, no package manager, no dependencies** (except Monaco Editor via CDN). To develop:

- Open `index.html` in a browser, or serve with any static server (e.g., `python -m http.server`)
- Changes to HTML/CSS/JS take effect on reload
- Service worker caching can interfere during development — use DevTools > Application > Service Workers > "Update on reload" or unregister

### Version Bumping

When making changes, three version-like values may need updating:
- `SITE_VERSION` in `js/app.js` — app version shown to users
- `CACHE_NAME` in `sw.js` — cache version string (e.g., `cf-cache-v16`); bump this when any cached asset changes so the service worker picks up new files
- `APP_SHELL` array in `sw.js` — list of files pre-cached on install; add new assets here if they should work offline

## Architecture

Pure vanilla HTML/CSS/JS. No frameworks, no bundlers. 8 JS modules loaded via `<script>` tags (not ES modules), each a self-contained closure exposing a public API on a global object.

### JS Modules (js/)

| Module | Global | Purpose |
|---|---|---|
| `app.js` | — | Entry point. Routes by `data-page` attribute on `<body>` |
| `theme.js` | `Theme` | Dark/light mode, persists to localStorage |
| `editor.js` | `Editor` | Lazy-loads Monaco Editor, manages editable code blocks |
| `runner.js` | `Runner` | Executes user code in sandboxed iframes |
| `progress.js` | `Progress` | Tracks lesson completion in localStorage |
| `quiz.js` | `Quiz` | Interactive knowledge checks (radio/checkbox) |
| `narrator.js` | `Narrator` | Text-to-speech with word highlighting (Web Speech API) |
| `lessons.js` | `Lessons` | Lesson page init, completion marking |

### CSS (css/)

4 files: `base.css` (reset, variables, typography), `layout.css` (grid, responsive), `components.css` (UI elements, editor chrome), `lessons.css` (lesson-specific).

### Lesson Content (lessons/)

47 lesson HTML files across 6 tracks: `web-basics`, `java-spring`, `databases`, `resumator`, `career`, `side-quests` (37 core lessons + 10 side quests). Each leaf track has a `manifest.json` with lesson metadata and ordering.

**`side-quests/` is structured differently** from the other tracks: it has no lessons of its own, just two sub-tracks (`build-something-new/` and `supercharge-resumator/`), each with its own `manifest.json`. The top-level `side-quests/manifest.json` indexes the sub-tracks. Any code that walks the track tree (`Progress`, catalog rendering) has to handle this nested shape.

**Lesson HTML conventions:**
- `<body data-page="lesson" data-lesson-id="...">`
- Code editors: `<div data-editable="true" data-language="html" data-id="editor-1">`
- Run buttons: `<button data-runnable="editor-1">`
- Quizzes: `<div class="quiz" data-id="quiz-1">`

### Other files worth knowing

- `sw.js` `APP_SHELL` enumerates **every lesson HTML file by path** — new lessons must be added here or they won't work offline.
- `offline.html` — the service worker serves this when a request misses the cache and the network is down.
- `manifest.json` (root) — PWA install manifest. Track-level `manifest.json` files under `lessons/<track>/` are a different thing (lesson metadata).
- `CNAME` — GitHub Pages custom-domain pointer for `learn.codersfarm.org`. Do not delete.
- `test-progress-all-complete.json` — a seed file representing the "everything finished" localStorage state. Useful for screenshots and for testing completion UI without clicking through every lesson. Paste its contents into the `cf-progress` localStorage key in DevTools.
- `changelog/` — dated markdown files (`YYYY-MM-DD_slug.md`) documenting notable changes. User-visible changes to lessons or the platform should land a new file here following the existing naming pattern.
- `convert_side_quests.py` — one-off migration script from when side-quests gained its nested sub-track structure. Not part of the normal workflow; don't re-run without understanding what it does.

### LocalStorage Keys

- `cf-progress` — lesson completion state
- `cf-editor-{id}` — saved code per editor
- `cf-quiz` — quiz results
- `cf-theme`, `cf-narrator-voice`, `cf-narrator-rate` — preferences

## Code Style

- Every module follows the same closure pattern with private state, private helpers, and an explicit public API returned at the bottom
- Verbose, self-documenting names (e.g., `getTrackProgress` not `getProgress`)
- Defensive coding: try-catch on all localStorage access, null guards on DOM queries
- The codebase intentionally uses the same technologies it teaches (HTML/CSS/JS) so students can read the source
