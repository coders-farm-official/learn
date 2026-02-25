# Coders Farm — Learn

**Free civic technology education for the Lansing, Michigan community.**

This is the curriculum platform for [Coders Farm](https://codersfarm.org), a nonprofit focused on making technology education accessible to everyone in the Lansing area. All courses are free, run entirely in the browser, and work offline.

🌐 **Live site:** [learn.codersfarm.org](https://learn.codersfarm.org)

---

## Features

- **Interactive Code Editors** — Monaco Editor (the same editor that powers VS Code) with syntax highlighting, auto-complete, and live preview
- **In-Browser Code Runner** — Run HTML, CSS, and JavaScript directly in your browser with sandboxed execution
- **Progress Tracking** — Your progress is saved locally (no accounts needed, no tracking)
- **Quizzes** — Inline knowledge checks with immediate feedback
- **Dark/Light Theme** — Toggle between themes, respects your system preference
- **Offline Access** — Progressive Web App (PWA) with service worker caching
- **Mobile Friendly** — Fully responsive design that works on any device
- **Zero Build Step** — Pure HTML, CSS, and vanilla JavaScript. No frameworks, no bundlers.

## Getting Started

### View the site locally

Just open `index.html` in your browser:

```bash
# Option 1: Open directly
open index.html

# Option 2: Use any static file server
python3 -m http.server 8000
# Then visit http://localhost:8000

# Option 3: Use Node's http-server
npx http-server .
```

> **Note:** For the service worker and PWA features to work correctly, you'll need to serve the files over HTTP (option 2 or 3) rather than opening the file directly.

### Deploy to GitHub Pages

This project is designed to deploy to GitHub Pages with zero configuration:

1. Push to the `main` branch
2. In your GitHub repo, go to **Settings > Pages**
3. Set the source to "Deploy from a branch" and select `main`
4. Your site will be live at `https://<username>.github.io/<repo-name>/`

For a custom domain (like `learn.codersfarm.org`), add a `CNAME` file with your domain.

## Project Structure

```
/
├── index.html                  # Landing page / course catalog
├── manifest.json               # PWA manifest
├── sw.js                       # Service worker for offline caching
├── offline.html                # Offline fallback page
├── css/
│   ├── base.css                # Reset, CSS variables, typography, themes
│   ├── layout.css              # Page structure, navigation, footer
│   ├── components.css          # Buttons, cards, editor, quiz, progress
│   └── lessons.css             # Lesson content styling
├── js/
│   ├── app.js                  # Main initialization and routing
│   ├── theme.js                # Dark/light mode toggle
│   ├── editor.js               # Monaco Editor integration
│   ├── runner.js               # Sandboxed code execution
│   ├── progress.js             # LocalStorage progress tracking
│   ├── quiz.js                 # Quiz logic and scoring
│   └── lessons.js              # Lesson page helpers
├── lessons/
│   ├── web-basics/             # Web Development Basics track
│   │   ├── manifest.json       # Track metadata
│   │   ├── 01-intro-to-html.html
│   │   ├── 02-html-elements.html
│   │   ├── 03-intro-to-css.html
│   │   ├── 04-css-selectors.html
│   │   ├── 05-intro-to-js.html
│   │   └── 06-js-basics.html
│   └── java-spring/            # Java & Spring Boot (coming soon)
│       └── manifest.json
├── assets/
│   ├── images/
│   │   └── codersfarm-logo.svg
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   └── favicon.ico
└── README.md
```

## Available Courses

### Web Development Basics (6 lessons)
Learn HTML, CSS, and JavaScript from scratch — no prior experience needed.

1. **Intro to HTML** — What HTML is, document structure, your first web page
2. **HTML Elements** — Headings, paragraphs, links, images, lists
3. **Intro to CSS** — Styling web pages with colors, fonts, and spacing
4. **CSS Selectors & Layout** — Classes, IDs, box model, and flexbox
5. **Intro to JavaScript** — Variables, data types, and console output
6. **JavaScript Basics** — Functions, conditionals, and DOM manipulation

### Java & Spring Boot (coming soon)
Learn Java programming and build web APIs with Spring Boot.

## Contributing

We welcome contributions! Here's how to get involved:

### Adding a New Lesson

1. Create a new HTML file in the appropriate track folder (e.g., `lessons/web-basics/07-new-lesson.html`)
2. Copy the structure from an existing lesson file — the boilerplate includes the nav, footer, theme toggle, and all script tags
3. Write your educational content inside the `<div class="lesson-content">` section
4. Add the lesson to the track's `manifest.json`
5. Update navigation links in adjacent lessons (Previous/Next)

### Adding a New Track

1. Create a new folder under `lessons/` (e.g., `lessons/python-basics/`)
2. Create a `manifest.json` with track metadata and lesson list
3. Add a track card to `index.html`
4. Create lesson files following the existing patterns

### Interactive Elements

**Code editors** — Add editable, runnable code editors:
```html
<div class="code-editor" data-language="html" data-editable="true" data-runnable="true">
  <pre><code>&lt;h1&gt;Hello World&lt;/h1&gt;</code></pre>
</div>
```
Supported languages: `html`, `css`, `javascript`, `java` (read-only)

**Quizzes** — Add inline knowledge checks:
```html
<div class="quiz" data-id="unique-id">
  <p class="quiz-question">Your question here?</p>
  <div class="quiz-options">
    <label><input type="radio" name="unique-id" value="a"> Option A</label>
    <label><input type="radio" name="unique-id" value="b"> Option B</label>
    <label><input type="radio" name="unique-id" value="c"> Option C</label>
  </div>
  <div class="quiz-answer" data-correct="b">Explanation of the correct answer.</div>
</div>
```

### Style Guide

- Write for complete beginners — no jargon without explanation
- Use "you" and "we" language to keep it conversational
- Include Lansing/Michigan community references where natural
- Every concept should have an interactive example
- Use callout boxes for tips and important notes

### Technical Requirements

- **No build tools** — everything must work as static files
- **No npm packages** — CDN dependencies only (currently just Monaco Editor)
- **No tracking** — respect student privacy, LocalStorage only
- **Accessible** — semantic HTML, proper contrast, focus indicators
- **Mobile responsive** — test on small screens

## Tech Stack

- **HTML5 / CSS3 / Vanilla JavaScript** — no frameworks
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)** via CDN (v0.45.0, pinned) — code editing with syntax highlighting
- **LocalStorage** — progress tracking and user preferences
- **Service Worker** — offline caching with cache-first strategy
- **GitHub Pages** — static file hosting

## Privacy

This platform collects **zero** user data. No analytics, no cookies, no tracking. All data (progress, theme preference, saved code) is stored locally in your browser's LocalStorage and never leaves your device.

## License

See [LICENSE](LICENSE) for details.

---

Made with care for the Lansing community by [Coders Farm](https://codersfarm.org).
