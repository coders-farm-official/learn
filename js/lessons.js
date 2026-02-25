/* ========================================
   Coders Farm — Lesson Loading & Rendering
   Handles lesson page initialization
   ======================================== */

const Lessons = (() => {

  function init() {
    initMarkComplete();
    initLessonProgress();
  }

  function initMarkComplete() {
    const btn = document.getElementById('mark-complete-btn');
    if (!btn) return;

    const trackId = btn.getAttribute('data-track');
    const lessonId = btn.getAttribute('data-lesson');
    if (!trackId || !lessonId) return;

    // Check if already completed
    if (Progress.isCompleted(trackId, lessonId)) {
      showCompletedState(btn);
      return;
    }

    btn.addEventListener('click', () => {
      Progress.markComplete(trackId, lessonId);
      showCompletedState(btn);
    });
  }

  function showCompletedState(btn) {
    const section = btn.closest('.mark-complete-section');
    if (section) {
      section.innerHTML = `
        <div class="completed-badge">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7 10l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2"/>
          </svg>
          Lesson Complete!
        </div>
      `;
    }
  }

  function initLessonProgress() {
    const indicator = document.querySelector('.lesson-progress-indicator');
    if (!indicator) return;

    const trackId = indicator.getAttribute('data-track');
    const total = parseInt(indicator.getAttribute('data-total'), 10);
    const current = parseInt(indicator.getAttribute('data-current'), 10);

    if (trackId && total && current) {
      const progress = Progress.getTrackProgress(trackId, total);
      indicator.textContent = `Lesson ${current} of ${total} — ${progress.completed} completed`;
    }
  }

  return { init };
})();
