/* ========================================
   Coders Farm — Main Application
   Initialization and page routing
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme first (prevents flash)
  Theme.init();

  // Initialize hamburger menu
  initMobileNav();

  // Initialize page-specific features
  const page = document.body.getAttribute('data-page');

  if (page === 'catalog') {
    initCatalog();
  } else if (page === 'lesson') {
    // Initialize lesson features
    Lessons.init();
    Quiz.initAll();
    Editor.initAll();
    initInstallTabs();
  }

  // Register service worker
  registerServiceWorker();
});

function initMobileNav() {
  const hamburger = document.querySelector('.hamburger-btn');
  const mobileNav = document.querySelector('.mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
        mobileNav.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

function initCatalog() {
  // Update progress bars for each track
  document.querySelectorAll('[data-track-id]').forEach(card => {
    const trackId = card.getAttribute('data-track-id');
    const total = parseInt(card.getAttribute('data-total-lessons'), 10) || 0;

    const progress = Progress.getTrackProgress(trackId, total);

    const fill = card.querySelector('.progress-bar-fill');
    if (fill) {
      fill.style.width = progress.percentage + '%';
    }

    const text = card.querySelector('.progress-text');
    if (text) {
      text.textContent = `${progress.completed} / ${progress.total} lessons`;
    }

    // Update button text
    const btn = card.querySelector('.track-btn');
    if (btn) {
      if (progress.completed === 0) {
        btn.textContent = 'Start Learning';
      } else if (progress.completed >= progress.total) {
        btn.textContent = 'Review';
      } else {
        btn.textContent = 'Continue';
      }
    }
  });

  // Export/Import progress
  const exportBtn = document.getElementById('export-progress');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      Progress.exportData();
    });
  }

  const importBtn = document.getElementById('import-progress');
  if (importBtn) {
    importBtn.addEventListener('click', () => {
      Progress.importData()
        .then(() => {
          window.location.reload();
        })
        .catch((err) => {
          alert('Failed to import: ' + err.message);
        });
    });
  }
}

function initInstallTabs() {
  document.querySelectorAll('.install-tabs').forEach(tabGroup => {
    const buttons = tabGroup.querySelectorAll('.install-tab-btn');
    const contents = tabGroup.querySelectorAll('.install-tab-content');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        buttons.forEach(b => b.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        tabGroup.querySelector(`.install-tab-content[data-tab="${tab}"]`).classList.add('active');
      });
    });
  });
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('Service Worker registered:', reg.scope);
      })
      .catch(err => {
        console.log('Service Worker registration failed:', err);
      });
  }
}
