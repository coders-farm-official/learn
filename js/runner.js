/* ========================================
   Coders Farm — Code Runner
   Sandboxed iframe execution for HTML/CSS/JS
   ======================================== */

const Runner = (() => {

  function run(code, language, outputWrapper, editorId) {
    if (!outputWrapper) return;

    const previewPane = outputWrapper.querySelector('.output-preview');
    const consolePane = outputWrapper.querySelector('.output-console');

    // Clear previous output
    if (consolePane) consolePane.innerHTML = '';
    if (previewPane) previewPane.innerHTML = '';

    const lang = language.toLowerCase();

    if (lang === 'javascript' || lang === 'js') {
      runJavaScript(code, previewPane, consolePane);
    } else if (lang === 'html' || lang === 'css') {
      runHTML(code, lang, previewPane, consolePane);
    }
  }

  function runJavaScript(code, previewPane, consolePane) {
    // Show console tab
    const consoleTab = consolePane.closest('.output-wrapper').querySelector('[data-tab="console"]');
    const previewTab = consolePane.closest('.output-wrapper').querySelector('[data-tab="preview"]');
    if (consoleTab && previewTab) {
      consoleTab.click();
    }

    const iframe = createSandboxIframe(previewPane);

    // Inject console capture script + user code
    const wrappedCode = `
      <html><head><style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 12px; margin: 0; color: #333; }
      </style></head><body>
      <script>
        (function() {
          const logs = [];
          function sendLog(type, args) {
            window.parent.postMessage({
              type: 'console',
              level: type,
              args: args.map(function(a) {
                if (a === undefined) return 'undefined';
                if (a === null) return 'null';
                if (typeof a === 'object') {
                  try { return JSON.stringify(a, null, 2); } catch(e) { return String(a); }
                }
                return String(a);
              })
            }, '*');
          }

          console.log = function() { sendLog('log', Array.from(arguments)); };
          console.error = function() { sendLog('error', Array.from(arguments)); };
          console.warn = function() { sendLog('warn', Array.from(arguments)); };
          console.info = function() { sendLog('log', Array.from(arguments)); };

          window.onerror = function(msg, url, line, col, error) {
            sendLog('error', [msg + (line ? ' (line ' + line + ')' : '')]);
            return true;
          };

          try {
            ${escapeForScript(code)}
          } catch(e) {
            sendLog('error', [e.toString()]);
          }
        })();
      <\/script></body></html>
    `;

    // Listen for console messages
    const handler = (event) => {
      if (event.source === iframe.contentWindow && event.data && event.data.type === 'console') {
        addConsoleLine(consolePane, event.data.level, event.data.args.join(' '));
      }
    };
    window.addEventListener('message', handler);

    // Clean up listener after 30 seconds
    setTimeout(() => window.removeEventListener('message', handler), 30000);

    iframe.srcdoc = wrappedCode;
  }

  function runHTML(code, lang, previewPane, consolePane) {
    // Show preview tab
    const previewTab = previewPane.closest('.output-wrapper').querySelector('[data-tab="preview"]');
    if (previewTab) {
      previewTab.click();
    }

    const iframe = createSandboxIframe(previewPane);

    let htmlContent;

    if (lang === 'css') {
      // Wrap CSS in a basic HTML document with sample content
      htmlContent = `
        <html><head><style>${code}</style></head>
        <body>
          <h1>Styled Preview</h1>
          <p>This is a preview of your CSS styles applied to sample HTML content.</p>
          <a href="#">A sample link</a>
          <ul><li>Item one</li><li>Item two</li><li>Item three</li></ul>
        </body></html>
      `;
    } else {
      // Check if code already has html/head/body tags
      if (code.toLowerCase().includes('<html') || code.toLowerCase().includes('<!doctype')) {
        htmlContent = code;
      } else {
        // Wrap in basic HTML structure
        htmlContent = `<html><head><style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 12px; margin: 0; }
        </style></head><body>${code}</body></html>`;
      }
    }

    // Add console capture for any inline JS
    const consoleCapture = `
      <script>
        (function() {
          function sendLog(type, args) {
            window.parent.postMessage({
              type: 'console',
              level: type,
              args: args.map(function(a) {
                if (a === undefined) return 'undefined';
                if (a === null) return 'null';
                if (typeof a === 'object') {
                  try { return JSON.stringify(a, null, 2); } catch(e) { return String(a); }
                }
                return String(a);
              })
            }, '*');
          }
          console.log = function() { sendLog('log', Array.from(arguments)); };
          console.error = function() { sendLog('error', Array.from(arguments)); };
          console.warn = function() { sendLog('warn', Array.from(arguments)); };
          window.onerror = function(msg, url, line) {
            sendLog('error', [msg + (line ? ' (line ' + line + ')' : '')]);
            return true;
          };
        })();
      <\/script>
    `;

    // Inject console capture before closing </head> or at the start
    if (htmlContent.toLowerCase().includes('</head>')) {
      htmlContent = htmlContent.replace(/<\/head>/i, consoleCapture + '</head>');
    } else if (htmlContent.toLowerCase().includes('<body')) {
      htmlContent = htmlContent.replace(/<body/i, '<head>' + consoleCapture + '</head><body');
    } else {
      htmlContent = consoleCapture + htmlContent;
    }

    // Listen for console messages
    const handler = (event) => {
      if (event.source === iframe.contentWindow && event.data && event.data.type === 'console') {
        addConsoleLine(consolePane, event.data.level, event.data.args.join(' '));
      }
    };
    window.addEventListener('message', handler);
    setTimeout(() => window.removeEventListener('message', handler), 30000);

    iframe.srcdoc = htmlContent;

    // Auto-resize iframe after content loads
    iframe.onload = () => {
      try {
        const body = iframe.contentDocument.body;
        const height = Math.max(120, Math.min(400, body.scrollHeight + 20));
        iframe.style.height = height + 'px';
      } catch {
        // Cross-origin, use default height
      }
    };
  }

  function createSandboxIframe(container) {
    container.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-scripts allow-modals');
    iframe.style.width = '100%';
    iframe.style.minHeight = '120px';
    iframe.style.border = 'none';
    iframe.style.display = 'block';
    iframe.style.backgroundColor = '#ffffff';
    container.appendChild(iframe);
    return iframe;
  }

  function addConsoleLine(consolePane, level, text) {
    if (!consolePane) return;
    const line = document.createElement('div');
    line.className = `console-line ${level}`;
    line.textContent = text;
    consolePane.appendChild(line);
    consolePane.scrollTop = consolePane.scrollHeight;
  }

  function escapeForScript(code) {
    // Escape closing script tags in user code
    return code.replace(/<\/script>/gi, '<\\/script>');
  }

  return { run };
})();
