/* ========================================
   Coders Farm — Service Worker
   Cache-first strategy for offline access
   ======================================== */

const CACHE_NAME = 'cf-cache-v14';
const MONACO_VERSION = '0.45.0';
const MONACO_BASE = `https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}`;

// App shell — pre-cached on install
const APP_SHELL = [
  '/',
  '/index.html',
  '/offline.html',
  '/css/base.css',
  '/css/layout.css',
  '/css/components.css',
  '/css/lessons.css',
  '/js/app.js',
  '/js/theme.js',
  '/js/editor.js',
  '/js/runner.js',
  '/js/progress.js',
  '/js/quiz.js',
  '/js/narrator.js',
  '/js/lessons.js',
  '/assets/images/codersfarm-logo.svg',
  '/manifest.json',
  '/lessons/career/manifest.json',
  '/lessons/java-spring/manifest.json',
  '/lessons/databases/manifest.json',
  '/lessons/resumator/manifest.json',
  '/lessons/career/10-zero-to-employable.html',
  '/lessons/java-spring/11-setting-up-java.html',
  '/lessons/java-spring/12-intro-to-spring-boot.html',
  '/lessons/java-spring/13-contact-form-api.html',
  '/lessons/java-spring/14-adding-sqlite.html',
  '/lessons/java-spring/15-validation-and-crud.html',
  '/lessons/java-spring/16-whats-next.html',
  '/lessons/databases/17-data-and-data-types.html',
  '/lessons/databases/18-relational-databases.html',
  '/lessons/databases/19-non-relational-databases.html',
  '/lessons/databases/20-legacy-databases.html',
  '/lessons/databases/21-modern-database-landscape.html',
  '/lessons/databases/22-setting-up-mysql.html',
  '/lessons/resumator/23-project-planning-setup.html',
  '/lessons/resumator/24-job-search-api.html',
  '/lessons/resumator/25-search-interface.html',
  '/lessons/resumator/26-when-things-break.html',
  '/lessons/resumator/27-completing-resumator.html',
  '/lessons/resumator/28-api-tracking-thymeleaf.html',
  '/lessons/resumator/29-search-security.html',
  '/lessons/resumator/30-review-whats-next.html',
  '/lessons/side-quests/manifest.json',
  '/lessons/side-quests/build-something-new/discord-bot.html',
  '/lessons/side-quests/build-something-new/encryption-hashing.html',
  '/lessons/side-quests/build-something-new/multiplayer-quiz.html',
  '/lessons/side-quests/build-something-new/android-app.html',
  '/lessons/side-quests/build-something-new/linux-basics.html',
  '/lessons/side-quests/supercharge-resumator/apply-tracker.html',
  '/lessons/side-quests/supercharge-resumator/resume-tailor.html',
  '/lessons/side-quests/supercharge-resumator/salary-heatmap.html',
  '/lessons/side-quests/supercharge-resumator/email-alerts.html',
  '/lessons/side-quests/supercharge-resumator/interview-prep.html'
];

// Monaco Editor core files to pre-cache
const MONACO_FILES = [
  `${MONACO_BASE}/min/vs/loader.js`,
  `${MONACO_BASE}/min/vs/editor/editor.main.js`,
  `${MONACO_BASE}/min/vs/editor/editor.main.css`,
  `${MONACO_BASE}/min/vs/editor/editor.main.nls.js`,
  `${MONACO_BASE}/min/vs/base/worker/workerMain.js`
];

// Install — pre-cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pre-caching app shell');
        // Cache app shell files (don't fail install if some are missing)
        return Promise.allSettled(
          APP_SHELL.map(url => cache.add(url).catch(err => console.log('[SW] Failed to cache:', url, err)))
        ).then(() => {
          // Try to cache Monaco files too
          return Promise.allSettled(
            MONACO_FILES.map(url => cache.add(url).catch(err => console.log('[SW] Failed to cache Monaco:', url, err)))
          );
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Allow the client to tell a waiting SW to activate immediately
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Activate — clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch — cache-first strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // For CDN resources (Monaco) — cache permanently, always serve from cache
  if (request.url.includes('cdn.jsdelivr.net')) {
    event.respondWith(
      caches.match(request)
        .then((cached) => {
          if (cached) return cached;

          return fetch(request)
            .then((response) => {
              if (response.ok) {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
              }
              return response;
            })
            .catch(() => caches.match('/offline.html'));
        })
    );
    return;
  }

  // For local resources — cache-first, fallback to network, then offline page
  event.respondWith(
    caches.match(request)
      .then((cached) => {
        if (cached) {
          // Return cached version but also update cache in background
          const fetchPromise = fetch(request)
            .then((response) => {
              if (response.ok) {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
              }
              return response;
            })
            .catch(() => {}); // Ignore network errors when we have cache

          // Don't await the fetch — return cached immediately
          return cached;
        }

        // Not in cache — try network
        return fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => {
            // Offline and not cached — show offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            // For other resources, just fail
            return new Response('Offline', { status: 503, statusText: 'Offline' });
          });
      })
  );
});
