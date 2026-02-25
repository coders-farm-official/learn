# Coders Farm — Learn

**Free technology education for the Lansing, Michigan community.**

[Coders Farm](https://codersfarm.org) is a nonprofit dedicated to making technology education accessible to everyone in the greater Lansing area. Our curriculum is completely free, runs entirely in your browser, and works offline — no accounts, no installs, no strings attached.

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

## Contributing

Coders Farm is open source and community-driven. If you'd like to contribute lessons, fix bugs, or improve the platform, check out the [contribution guidelines](CONTRIBUTING.md) or open an issue.

## License

See [LICENSE](LICENSE) for details.

---

Built for the Lansing community by [Coders Farm](https://codersfarm.org).
