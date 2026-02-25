# Coders Farm — Learn

**Free technology education**

[Coders Farm](https://codersfarm.org) is a nonprofit dedicated to making technology education accessible to everyone. We are based in Lansing, MI. Our curriculum is completely free, runs entirely in your browser, and works offline — no accounts, no installs, no strings attached.

**Start learning now:** [learn.codersfarm.org](https://learn.codersfarm.org)

---

## About Coders Farm

Coders Farm is a civic technology nonprofit based in Lansing, Michigan. We believe that access to quality tech education shouldn't depend on your zip code, your income, or your background. Our mission is to meet people where they are and give them a real path from curious beginner to employable developer — at zero cost.

Everything we build is open source. Everything we teach is free. We don't collect your data, and we don't sell your attention.

---

## The Curriculum

The learning path is designed to take you from zero experience to building real applications. Each track builds on the last, and every lesson includes hands-on coding exercises you complete right in the browser.

### Web Development Basics — 6 lessons
Your starting point. Learn the three languages that power every website: HTML, CSS, and JavaScript. You'll write your first web page, style it, and make it interactive — no prior experience needed.

### Java & Spring Boot — 6 lessons
Move from frontend to backend. Set up a Java development environment, learn the fundamentals, and build a working REST API with Spring Boot and SQLite.

### Understanding Databases — 6 lessons
Learn how applications store and retrieve data. Covers relational databases (SQL), non-relational databases (MongoDB, Redis), the history of data storage, and hands-on MySQL setup.

### Building Resumator — 8 lessons (capstone project)
A full-stack project where you build a job search application from scratch. You'll integrate a real job search API, build a search interface, add favorites, implement tracking, and learn about security — all while working through the kind of real-world problems professional developers face every day.

### Career & Employability — 1 lesson
Practical guidance on turning your new skills into a career. Covers resumes, job searching, and interviewing.

### Side Quests — 10 optional projects
For learners who want to go deeper. Build a Discord bot, create an Android app, explore encryption, set up a Linux environment, or extend Resumator with features like a salary heatmap and AI-powered resume tailoring.

**Total: 37 core lessons + 10 side quests**

---

## What to Expect

**No setup required.** Open the site and start coding. The platform includes a full code editor (the same one that powers VS Code) with syntax highlighting, auto-complete, and a live preview pane — all running in your browser.

**Learn by doing.** Every lesson has interactive code editors where you write and run real code. There are inline quizzes to check your understanding, and your progress is saved automatically so you can pick up where you left off.

**Work at your own pace.** There are no deadlines, no cohorts, and no pressure. Lessons include estimated completion times so you can plan your sessions, but you're free to take as long as you need.

**Works offline.** The entire platform is a Progressive Web App. Once you've visited the site, you can install it on your phone or computer and use it without an internet connection.

**Your privacy is respected.** We collect zero data. No analytics, no cookies, no tracking. Your progress and preferences are stored locally on your device and never leave it.

---

## Under the Hood

For those curious about the technical side, the platform is built with intentional simplicity:

- **Pure HTML, CSS, and vanilla JavaScript** — no frameworks, no bundlers, no build step
- **Monaco Editor** (v0.45.0 via CDN) for the in-browser code editing experience
- **Sandboxed iframes** for safe code execution — your code runs isolated from the platform
- **Service Worker** with cache-first strategy for full offline support
- **LocalStorage** for progress tracking and preferences — everything stays on your device
- **Static hosting** on GitHub Pages — fast, reliable, and free

The entire platform ships as static files. There is exactly one external dependency (Monaco Editor). This was a deliberate design choice: the technology students are learning (HTML, CSS, JavaScript) is the same technology the platform is built with.

---

## Why This Architecture Works

This project was built with AI-assisted development — sometimes called "vibe coding" — and the architecture reflects the strengths of that approach. The result is a codebase that is more verbose than what a solo developer might write by hand, but significantly more readable, maintainable, and approachable because of it.

### Explicitness over cleverness

Every JavaScript module follows the same pattern: a self-contained closure with private state, private helpers, and an explicitly returned public API. There are no magic globals, no implicit dependencies, and no inherited behavior you have to trace through multiple files. When you open any module — `progress.js`, `editor.js`, `quiz.js` — the pattern is immediately familiar, and the public interface is declared right there at the bottom.

This kind of consistency is what AI-assisted development excels at. A human developer working alone might cut corners, introduce shortcuts, or let patterns drift over time. Vibe coding with an AI collaborator produces uniform structure across every file because the AI doesn't get bored, doesn't forget the pattern, and doesn't introduce inconsistency out of convenience.

### Self-documenting naming

Functions are named `getTrackProgress`, not `getProgress`. Storage keys are `STORAGE_KEY` and `STORAGE_PREFIX`, not `key` or `pfx`. Data attributes spell out their purpose: `data-editable="true"`, `data-runnable="true"`, `data-track-id="web-basics"`. This level of naming verbosity means the code reads like documentation. You rarely need to check a comment or trace a call chain to understand what something does.

This is a direct benefit of vibe coding. When you're working with an AI that generates clear, descriptive names by default, you get a codebase where every identifier communicates its intent. The verbose naming costs nothing at runtime and pays for itself every time someone reads the code.

### Defensive by default

Every localStorage read is wrapped in a try-catch. Every DOM query is guarded against null. Every external interaction (Monaco loading, iframe messaging, service worker registration) has explicit error handling. This isn't paranoid programming — it's the kind of thorough defensive coding that AI collaborators produce naturally, covering edge cases that a human developer might skip under time pressure.

### Separation of concerns without over-engineering

The codebase has seven focused JavaScript modules, four CSS files, and a clean content directory. Each module owns exactly one responsibility. But there's no framework, no state management library, no build system, no abstraction layers, and no dependency graph to manage. The architecture is clean without being complex.

Vibe coding made this balance possible. AI-assisted development encourages you to think in terms of clear boundaries and explicit interfaces without pulling in the heavyweight patterns (CQRS, event buses, dependency injection containers) that often come along for the ride in traditionally architected projects. The AI helps you be disciplined about separation without reaching for a framework to enforce it.

### The codebase teaches what it teaches

Because the platform is built with the same technologies it teaches — HTML, CSS, and vanilla JavaScript — a curious student can view source and understand the platform itself. The verbose, explicit style isn't just a maintenance benefit; it's an educational one. A student who finishes the curriculum and opens `runner.js` to see how code execution works will find code that looks like what they just learned, not a wall of framework abstractions.

### Consistency at scale

The project contains over 20,000 lines of lesson content across 47 HTML files, and every one follows the same structural conventions: learning objectives at the top, code editors declared with data attributes, quizzes with explicit answer markup, callouts with semantic class names. This kind of large-scale consistency is where AI-assisted development shines. The AI maintains the same patterns across the 37th lesson that it applied to the 1st, producing a content library that feels cohesive rather than accumulated.

### What verbose gets you

A terser codebase might feel more elegant to write, but this project optimizes for a different audience: contributors who might be early in their careers, students who want to learn from the source, and future maintainers who need to understand the code quickly. The verbosity is the feature. Every explicit name, every guarded access, every consistent module pattern is a decision to prioritize the reader over the writer — and when you're building educational software for a community, that's exactly the right trade-off.

---

## Contributing

Coders Farm is open source and community-driven. If you'd like to contribute lessons, fix bugs, or improve the platform, check out the [contribution guidelines](CONTRIBUTING.md) or open an issue.

## License

See [LICENSE](LICENSE) for details.

---

Built for the Lansing community by [Coders Farm](https://codersfarm.org).
