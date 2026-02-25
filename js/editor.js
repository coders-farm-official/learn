/* ========================================
   Coders Farm — Monaco Editor Integration
   CDN-loaded code editor with helpers
   ======================================== */

const Editor = (() => {
  const MONACO_VERSION = '0.45.0';
  const MONACO_BASE = `https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}`;
  const STORAGE_PREFIX = 'cf-editor-';

  let monacoLoaded = false;
  let monacoLoadPromise = null;
  const editors = [];

  function loadMonaco() {
    if (monacoLoadPromise) return monacoLoadPromise;

    monacoLoadPromise = new Promise((resolve, reject) => {
      if (typeof monaco !== 'undefined') {
        monacoLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `${MONACO_BASE}/min/vs/loader.js`;
      script.onload = () => {
        require.config({
          paths: { vs: `${MONACO_BASE}/min/vs` }
        });

        require(['vs/editor/editor.main'], () => {
          monacoLoaded = true;
          resolve();
        }, reject);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return monacoLoadPromise;
  }

  function getMonacoLanguage(lang) {
    const map = {
      'html': 'html',
      'css': 'css',
      'javascript': 'javascript',
      'js': 'javascript',
      'java': 'java',
      'json': 'json',
      'xml': 'xml'
    };
    return map[lang.toLowerCase()] || 'plaintext';
  }

  function getMonacoTheme() {
    const theme = document.documentElement.getAttribute('data-theme');
    return theme === 'light' ? 'vs' : 'vs-dark';
  }

  function getEditorStorageKey(editorId) {
    return STORAGE_PREFIX + editorId;
  }

  function getSavedCode(editorId) {
    try {
      return localStorage.getItem(getEditorStorageKey(editorId));
    } catch {
      return null;
    }
  }

  function saveCode(editorId, code) {
    try {
      localStorage.setItem(getEditorStorageKey(editorId), code);
    } catch {
      // Storage full, ignore
    }
  }

  function initAll() {
    const editorEls = document.querySelectorAll('.code-editor');
    if (editorEls.length === 0) return Promise.resolve();

    return loadMonaco().then(() => {
      editorEls.forEach((el, index) => {
        initEditor(el, index);
      });
    }).catch((err) => {
      console.warn('Monaco Editor failed to load, using fallback textareas', err);
      editorEls.forEach((el, index) => {
        initFallback(el, index);
      });
    });
  }

  function initEditor(el, index) {
    const language = el.getAttribute('data-language') || 'javascript';
    const editable = el.getAttribute('data-editable') !== 'false';
    const runnable = el.getAttribute('data-runnable') === 'true';

    // Get the original code from the pre/code block
    const codeEl = el.querySelector('pre code') || el.querySelector('pre') || el.querySelector('code');
    const originalCode = codeEl ? decodeHTML(codeEl.textContent) : '';

    // Generate a stable editor ID
    const pageId = document.body.getAttribute('data-lesson-id') || 'page';
    const editorId = `${pageId}-${index}`;

    // Load saved code or use original
    const savedCode = getSavedCode(editorId);
    const currentCode = savedCode !== null ? savedCode : originalCode;

    // Clear the element and build the wrapper
    el.innerHTML = '';
    el.classList.add('code-editor-wrapper');

    // Header bar
    const header = document.createElement('div');
    header.className = 'code-editor-header';

    const langLabel = document.createElement('span');
    langLabel.className = 'code-editor-lang';
    langLabel.textContent = language;
    header.appendChild(langLabel);

    const actions = document.createElement('div');
    actions.className = 'code-editor-actions';

    if (editable) {
      const resetBtn = document.createElement('button');
      resetBtn.className = 'btn btn-secondary btn-sm';
      resetBtn.textContent = 'Reset';
      resetBtn.setAttribute('aria-label', 'Reset code to original');
      resetBtn.addEventListener('click', () => {
        if (editorInstance) {
          editorInstance.setValue(originalCode);
          saveCode(editorId, originalCode);
        }
      });
      actions.appendChild(resetBtn);
    }

    if (runnable) {
      const runBtn = document.createElement('button');
      runBtn.className = 'btn btn-primary btn-sm';
      runBtn.textContent = 'Run';
      runBtn.setAttribute('aria-label', 'Run code');
      runBtn.addEventListener('click', () => {
        const code = editorInstance ? editorInstance.getValue() : currentCode;
        Runner.run(code, language, outputEl, editorId);
      });
      actions.appendChild(runBtn);
    }

    header.appendChild(actions);
    el.appendChild(header);

    // Editor container
    const container = document.createElement('div');
    container.className = 'code-editor-container';
    el.appendChild(container);

    // Create Monaco editor
    const editorInstance = monaco.editor.create(container, {
      value: currentCode,
      language: getMonacoLanguage(language),
      theme: getMonacoTheme(),
      readOnly: !editable,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      lineNumbers: 'on',
      lineNumbersMinChars: 3,
      renderLineHighlight: 'line',
      fontSize: 14,
      fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace",
      tabSize: 2,
      automaticLayout: true,
      wordWrap: 'on',
      padding: { top: 8, bottom: 8 },
      scrollbar: {
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8,
        alwaysConsumeMouseWheel: false
      },
      overviewRulerLanes: 0,
      hideCursorInOverviewRuler: true,
      overviewRulerBorder: false,
      contextmenu: false
    });

    // Auto-resize to fit content
    const updateHeight = () => {
      const contentHeight = Math.max(100, Math.min(600, editorInstance.getContentHeight()));
      container.style.height = contentHeight + 'px';
      editorInstance.layout();
    };
    editorInstance.onDidContentSizeChange(updateHeight);
    updateHeight();

    // Auto-save on edit
    if (editable) {
      let saveTimeout;
      editorInstance.onDidChangeModelContent(() => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
          saveCode(editorId, editorInstance.getValue());
        }, 500);
      });
    }

    // Output area for runnable editors
    let outputEl = null;
    if (runnable) {
      outputEl = createOutputArea(el);
    }

    // Store reference
    editors.push({
      id: editorId,
      instance: editorInstance,
      element: el,
      originalCode
    });
  }

  function initFallback(el, index) {
    const language = el.getAttribute('data-language') || 'javascript';
    const editable = el.getAttribute('data-editable') !== 'false';
    const runnable = el.getAttribute('data-runnable') === 'true';

    const codeEl = el.querySelector('pre code') || el.querySelector('pre') || el.querySelector('code');
    const originalCode = codeEl ? decodeHTML(codeEl.textContent) : '';

    const pageId = document.body.getAttribute('data-lesson-id') || 'page';
    const editorId = `${pageId}-${index}`;
    const savedCode = getSavedCode(editorId);
    const currentCode = savedCode !== null ? savedCode : originalCode;

    el.innerHTML = '';
    el.classList.add('code-editor-wrapper');

    // Header
    const header = document.createElement('div');
    header.className = 'code-editor-header';
    const langLabel = document.createElement('span');
    langLabel.className = 'code-editor-lang';
    langLabel.textContent = language;
    header.appendChild(langLabel);

    const actions = document.createElement('div');
    actions.className = 'code-editor-actions';

    const textarea = document.createElement('textarea');
    textarea.className = 'code-editor-fallback';
    textarea.value = currentCode;
    textarea.readOnly = !editable;
    textarea.spellcheck = false;
    textarea.setAttribute('aria-label', `${language} code editor`);

    if (editable) {
      const resetBtn = document.createElement('button');
      resetBtn.className = 'btn btn-secondary btn-sm';
      resetBtn.textContent = 'Reset';
      resetBtn.addEventListener('click', () => {
        textarea.value = originalCode;
        saveCode(editorId, originalCode);
      });
      actions.appendChild(resetBtn);

      // Auto-save
      let saveTimeout;
      textarea.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
          saveCode(editorId, textarea.value);
        }, 500);
      });

      // Tab key support
      textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }
      });
    }

    let outputEl = null;
    if (runnable) {
      const runBtn = document.createElement('button');
      runBtn.className = 'btn btn-primary btn-sm';
      runBtn.textContent = 'Run';
      runBtn.addEventListener('click', () => {
        Runner.run(textarea.value, language, outputEl, editorId);
      });
      actions.appendChild(runBtn);
    }

    header.appendChild(actions);
    el.appendChild(header);
    el.appendChild(textarea);

    if (runnable) {
      outputEl = createOutputArea(el);
    }

    editors.push({
      id: editorId,
      instance: null,
      element: el,
      originalCode
    });
  }

  function createOutputArea(parentEl) {
    const wrapper = document.createElement('div');
    wrapper.className = 'output-wrapper';

    const header = document.createElement('div');
    header.className = 'output-header';

    const tabs = document.createElement('div');
    tabs.className = 'output-tabs';

    const previewTab = document.createElement('button');
    previewTab.className = 'output-tab active';
    previewTab.textContent = 'Preview';
    previewTab.setAttribute('data-tab', 'preview');

    const consoleTab = document.createElement('button');
    consoleTab.className = 'output-tab';
    consoleTab.textContent = 'Console';
    consoleTab.setAttribute('data-tab', 'console');

    tabs.appendChild(previewTab);
    tabs.appendChild(consoleTab);
    header.appendChild(tabs);
    wrapper.appendChild(header);

    const previewPane = document.createElement('div');
    previewPane.className = 'output-preview';
    previewPane.setAttribute('data-pane', 'preview');
    wrapper.appendChild(previewPane);

    const consolePane = document.createElement('div');
    consolePane.className = 'output-console';
    consolePane.setAttribute('data-pane', 'console');
    consolePane.style.display = 'none';
    wrapper.appendChild(consolePane);

    // Tab switching
    [previewTab, consoleTab].forEach(tab => {
      tab.addEventListener('click', () => {
        previewTab.classList.remove('active');
        consoleTab.classList.remove('active');
        tab.classList.add('active');

        const target = tab.getAttribute('data-tab');
        previewPane.style.display = target === 'preview' ? '' : 'none';
        consolePane.style.display = target === 'console' ? '' : 'none';
      });
    });

    parentEl.appendChild(wrapper);
    return wrapper;
  }

  function updateTheme() {
    if (!monacoLoaded) return;
    const theme = getMonacoTheme();
    monaco.editor.setTheme(theme);
  }

  function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }

  // Listen for theme changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'data-theme') {
        updateTheme();
      }
    });
  });

  if (document.documentElement) {
    observer.observe(document.documentElement, { attributes: true });
  }

  return { initAll, loadMonaco, editors };
})();
