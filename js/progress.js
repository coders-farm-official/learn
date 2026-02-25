/* ========================================
   Coders Farm — Progress Tracking
   LocalStorage-based lesson progress
   ======================================== */

const Progress = (() => {
  const STORAGE_KEY = 'cf-progress';

  function getAll() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function isCompleted(trackId, lessonId) {
    const data = getAll();
    return !!(data[trackId] && data[trackId][lessonId] && data[trackId][lessonId].completed);
  }

  function markComplete(trackId, lessonId) {
    const data = getAll();
    if (!data[trackId]) data[trackId] = {};
    data[trackId][lessonId] = {
      completed: true,
      completedAt: new Date().toISOString()
    };
    save(data);
  }

  function markIncomplete(trackId, lessonId) {
    const data = getAll();
    if (data[trackId] && data[trackId][lessonId]) {
      delete data[trackId][lessonId];
      if (Object.keys(data[trackId]).length === 0) {
        delete data[trackId];
      }
      save(data);
    }
  }

  function getTrackProgress(trackId, totalLessons) {
    const data = getAll();
    const trackData = data[trackId] || {};
    const completedCount = Object.values(trackData).filter(l => l.completed).length;
    return {
      completed: completedCount,
      total: totalLessons,
      percentage: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
    };
  }

  function exportData() {
    const data = getAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codersfarm-progress-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importData() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const imported = JSON.parse(event.target.result);
            // Merge with existing data
            const existing = getAll();
            for (const track of Object.keys(imported)) {
              if (!existing[track]) existing[track] = {};
              for (const lesson of Object.keys(imported[track])) {
                existing[track][lesson] = imported[track][lesson];
              }
            }
            save(existing);
            resolve(existing);
          } catch {
            reject(new Error('Invalid progress file'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      };
      input.click();
    });
  }

  function clearAll() {
    localStorage.removeItem(STORAGE_KEY);
  }

  return {
    getAll,
    isCompleted,
    markComplete,
    markIncomplete,
    getTrackProgress,
    exportData,
    importData,
    clearAll
  };
})();
