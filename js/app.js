/* ========================================
   Coders Farm — Main Application
   Initialization and page routing
   ======================================== */

const SITE_VERSION = '1.8';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme first (prevents flash)
  Theme.init();

  // Initialize hamburger menu
  initMobileNav();

  // Initialize page-specific features
  const page = document.body.getAttribute('data-page');

  if (page === 'catalog') {
    initCatalog();
    initSideQuests();
  } else if (page === 'lesson') {
    // Initialize lesson features
    Lessons.init();
    if (typeof Quiz !== 'undefined') Quiz.initAll();
    if (typeof Editor !== 'undefined') Editor.initAll();
    if (typeof Narrator !== 'undefined') Narrator.init();
    initInstallTabs();
  }

  // Available on every page
  initCheckForUpdates();
  showSiteVersion();

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

function showSiteVersion() {
  const footerLeft = document.querySelector('.footer-left');
  if (!footerLeft) return;
  const versionEl = document.createElement('span');
  versionEl.className = 'site-version';
  versionEl.textContent = ' v' + SITE_VERSION;
  footerLeft.appendChild(versionEl);
}

function initCheckForUpdates() {
  const trigger = document.getElementById('check-updates');
  if (!trigger) return;

  trigger.addEventListener('click', async (e) => {
    e.preventDefault();
    const origText = trigger.textContent;
    trigger.disabled = true;
    trigger.textContent = 'Updating…';

    try {
      // Unregister all service workers so the reload fetches from network
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }

      // Clear all SW caches
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }

      // Reload — the page will re-register a fresh SW on load
      window.location.reload();
    } catch (err) {
      trigger.disabled = false;
      trigger.textContent = origText;
      alert('Update failed: ' + err.message);
    }
  });
}

function initSideQuests() {
  const CORE_TRACKS = {
    'web-basics': 6,
    'career': 1,
    'java-spring': 6,
    'databases': 6,
    'resumator': 8
  };
  const TOTAL_CORE = 30;
  function countCompletedCoreLessons() {
    const progress = Progress.getAll();
    let count = 0;
    for (const trackId of Object.keys(CORE_TRACKS)) {
      const trackData = progress[trackId] || {};
      count += Object.values(trackData).filter(l => l.completed).length;
    }
    return count;
  }

  function areAllCoreLessonsComplete() {
    const progress = Progress.getAll();
    for (const [trackId, total] of Object.entries(CORE_TRACKS)) {
      const trackData = progress[trackId] || {};
      const completed = Object.values(trackData).filter(l => l.completed).length;
      if (completed < total) return false;
    }
    return true;
  }

  const unlocked = areAllCoreLessonsComplete();
  const cards = document.querySelectorAll('.side-quest-card');
  let sqCompleted = 0;

  cards.forEach(card => {
    const questId = card.getAttribute('data-quest-id');

    // Check if completed (uses same Progress module as core lessons)
    if (Progress.isCompleted('side-quests', questId)) {
      sqCompleted++;
      const badge = document.createElement('div');
      badge.className = 'sq-completed-badge';
      badge.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>';
      card.appendChild(badge);
    }

    if (unlocked) {
      const wasLocked = card.classList.contains('locked');
      card.classList.remove('locked');
      card.classList.add('unlocked');
      if (wasLocked) {
        card.classList.add('just-unlocked');
        setTimeout(() => card.classList.remove('just-unlocked'), 1500);
      }
    } else {
      card.classList.add('locked');
      card.classList.remove('unlocked');
      card.removeAttribute('href');
    }
  });

  // Update header
  const header = document.getElementById('side-quests-header');
  if (header) {
    if (unlocked) {
      header.textContent = 'Side Quests';
    } else {
      const completed = countCompletedCoreLessons();
      header.innerHTML = 'Side Quests <span class="sq-progress">' + completed + '/' + TOTAL_CORE + ' core lessons complete</span>';
    }
  }

  // Update completed count
  const countEl = document.getElementById('sq-completed-count');
  if (countEl) {
    if (sqCompleted > 0 || unlocked) {
      countEl.textContent = sqCompleted + '/10 Side Quests Completed';
    } else {
      countEl.textContent = 'Complete all 30 core lessons to unlock';
    }
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
