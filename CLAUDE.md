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

37 HTML files across 6 tracks (web-basics, java-spring, databases, resumator, career, side-quests). Each track has a `manifest.json` with lesson metadata and ordering.

**Lesson HTML conventions:**
- `<body data-page="lesson" data-lesson-id="...">`
- Code editors: `<div data-editable="true" data-language="html" data-id="editor-1">`
- Run buttons: `<button data-runnable="editor-1">`
- Quizzes: `<div class="quiz" data-id="quiz-1">`

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
