/* ========================================
   Coders Farm — Theme Toggle
   Dark/Light mode with LocalStorage
   ======================================== */

const Theme = (() => {
  const STORAGE_KEY = 'cf-theme';

  function getSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }

  function get() {
    return localStorage.getItem(STORAGE_KEY) || getSystemPreference();
  }

  function set(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    // Update meta theme-color
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'dark' ? '#1e1e1e' : '#ffffff');
    }
  }

  function toggle() {
    const current = get();
    const next = current === 'dark' ? 'light' : 'dark';
    set(next);
    return next;
  }

  function init() {
    // Apply saved/system theme immediately
    set(get());

    // Bind toggle buttons
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        toggle();
      });
    });

    // Listen for system preference changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(STORAGE_KEY)) {
          set(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  return { init, get, set, toggle };
})();
