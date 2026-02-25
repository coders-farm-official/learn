/* ========================================
   Coders Farm — Narrator
   Text-to-speech with word highlighting
   Uses the Web Speech API (fully offline)
   ======================================== */

const Narrator = (() => {
  const STORAGE_KEY_VOICE = 'cf-narrator-voice';
  const STORAGE_KEY_RATE = 'cf-narrator-rate';

  // Elements to skip when extracting readable content
  const SKIP_SELECTORS = [
    'pre', '.code-editor-wrapper', '.quiz', '.try-it',
    '.mark-complete-section', '.lesson-nav', 'script', 'style',
    '.narrator-play-wrapper', '.install-tabs', '.architecture-diagram',
    '.error-display'
  ];

  // Block-level elements that contain readable text directly
  const BLOCK_TAGS = ['P', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE', 'TD', 'TH', 'DT', 'DD', 'FIGCAPTION'];

  // Container elements to recurse into
  const CONTAINER_TAGS = ['UL', 'OL', 'DIV', 'SECTION', 'TABLE', 'TBODY', 'THEAD', 'TR', 'DL', 'FIGURE'];

  // State
  let playing = false;
  let paused = false;
  let blocks = [];
  let currentBlockIndex = -1;
  let currentWordMap = null;
  let currentOriginalHTML = null;
  let currentBlockElement = null;
  let floatingEl = null;
  let playBtnEl = null;
  let keepAliveTimer = null;
  let chunkWatchdog = null;
  let restarting = false; // guards against double-speak on cancel()

  // Mobile detection — keepAlive pause/resume kills speech on mobile
  var mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // --- Feature detection ---

  function isSupported() {
    return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }

  // --- Preferences (localStorage with try-catch) ---

  function getSavedVoice() {
    try { return localStorage.getItem(STORAGE_KEY_VOICE); }
    catch (e) { return null; }
  }

  function saveVoice(voiceName) {
    try { localStorage.setItem(STORAGE_KEY_VOICE, voiceName); }
    catch (e) { /* ignore */ }
  }

  function getSavedRate() {
    try {
      const r = parseFloat(localStorage.getItem(STORAGE_KEY_RATE));
      return isNaN(r) ? 1 : r;
    } catch (e) { return 1; }
  }

  function saveRate(rate) {
    try { localStorage.setItem(STORAGE_KEY_RATE, String(rate)); }
    catch (e) { /* ignore */ }
  }

  function getPreferredVoice() {
    const voices = speechSynthesis.getVoices();
    if (!voices.length) return null;

    // Try the user's saved preference first
    const savedName = getSavedVoice();
    if (savedName) {
      const found = voices.find(v => v.name === savedName);
      if (found) return found;
    }

    // Fall back to a good English voice
    const english = voices.filter(v => v.lang.startsWith('en'));
    const preferred = english.find(v => v.localService && v.default) ||
                      english.find(v => v.default) ||
                      english.find(v => v.localService) ||
                      english[0];
    return preferred || voices[0];
  }

  // --- Content extraction ---

  function shouldSkip(el) {
    return SKIP_SELECTORS.some(sel => el.matches && el.matches(sel));
  }

  function hasBlockChildren(el) {
    return Array.from(el.children).some(child =>
      BLOCK_TAGS.includes(child.tagName) || CONTAINER_TAGS.includes(child.tagName)
    );
  }

  function extractReadableBlocks() {
    const container = document.querySelector('.lesson-content');
    if (!container) return [];

    const result = [];

    function walk(parent) {
      for (const child of parent.children) {
        if (shouldSkip(child)) continue;

        const tag = child.tagName;
        const isBlock = BLOCK_TAGS.includes(tag);
        const isContainer = CONTAINER_TAGS.includes(tag);

        if (isBlock) {
          const text = child.textContent.trim();
          if (text.length > 0) {
            result.push(child);
          }
        } else if (isContainer) {
          // If this container has block-level children, recurse into them.
          // Otherwise treat the container itself as a readable leaf.
          if (hasBlockChildren(child)) {
            walk(child);
          } else {
            const text = child.textContent.trim();
            if (text.length > 0) {
              result.push(child);
            }
          }
        }
      }
    }

    walk(container);
    return result;
  }

  // --- Word wrapping for per-word highlighting ---

  function wrapWordsInElement(element) {
    const originalHTML = element.innerHTML;
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    let charOffset = 0;
    const wordMap = [];

    textNodes.forEach(textNode => {
      const text = textNode.textContent;
      const parts = text.split(/(\S+)/);
      const fragment = document.createDocumentFragment();

      parts.forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          fragment.appendChild(document.createTextNode(part));
          charOffset += part.length;
        } else {
          const span = document.createElement('span');
          span.className = 'narrator-word';
          span.textContent = part;
          fragment.appendChild(span);
          wordMap.push({ span: span, start: charOffset, end: charOffset + part.length });
          charOffset += part.length;
        }
      });

      textNode.parentNode.replaceChild(fragment, textNode);
    });

    return { originalHTML, wordMap };
  }

  function unwrapCurrentBlock() {
    if (currentBlockElement && currentOriginalHTML !== null) {
      currentBlockElement.innerHTML = currentOriginalHTML;
      currentBlockElement.classList.remove('narrator-block-active');
    }
    currentWordMap = null;
    currentOriginalHTML = null;
    currentBlockElement = null;
  }

  // --- Desktop Chrome workaround: speech synthesis stops after ~15s ---
  // On mobile, pause/resume kills speech — skip keepAlive entirely.
  // Mobile relies on short chunks + watchdog instead.

  function startKeepAlive() {
    stopKeepAlive();
    if (mobile) return;
    keepAliveTimer = setInterval(() => {
      if (speechSynthesis.speaking && !speechSynthesis.paused) {
        speechSynthesis.pause();
        speechSynthesis.resume();
      }
    }, 10000);
  }

  function stopKeepAlive() {
    if (keepAliveTimer) {
      clearInterval(keepAliveTimer);
      keepAliveTimer = null;
    }
  }

  function clearChunkWatchdog() {
    if (chunkWatchdog) {
      clearTimeout(chunkWatchdog);
      chunkWatchdog = null;
    }
  }

  // --- Text chunking (mobile Chrome kills utterances after ~15s) ---

  function splitTextIntoChunks(text) {
    // Split on sentence-ending punctuation. The trailing |[^.!?]+$ catches
    // text that doesn't end with punctuation (e.g. headings).
    var parts = text.match(/[^.!?]+[.!?]+[\s]*|[^.!?]+$/g);
    if (!parts || parts.length <= 1) return [text];

    // Merge short consecutive sentences so we don't create too many
    // utterances. Mobile browsers need shorter chunks (~120 chars) to
    // avoid silently stopping; desktop can handle ~200.
    var maxLen = mobile ? 120 : 200;
    var chunks = [];
    var current = '';
    for (var i = 0; i < parts.length; i++) {
      if (current.length + parts[i].length > maxLen && current.length > 0) {
        chunks.push(current);
        current = parts[i];
      } else {
        current += parts[i];
      }
    }
    if (current) chunks.push(current);

    return chunks.length > 0 ? chunks : [text];
  }

  // --- Playback engine ---

  function speakBlock(index) {
    if (index >= blocks.length) {
      stopPlayback();
      return;
    }

    currentBlockIndex = index;
    const element = blocks[index];

    unwrapCurrentBlock();

    // Scroll the block into view
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Wrap all text nodes into per-word spans for highlighting
    const { originalHTML, wordMap } = wrapWordsInElement(element);
    currentOriginalHTML = originalHTML;
    currentWordMap = wordMap;
    currentBlockElement = element;
    element.classList.add('narrator-block-active');

    // Split into short chunks so mobile browsers don't silently stop
    const fullText = element.textContent;
    const chunks = splitTextIntoChunks(fullText);

    function speakChunk(chunkIndex, charOffset) {
      if (chunkIndex >= chunks.length) {
        clearChunkWatchdog();
        unwrapCurrentBlock();
        if (playing && !paused) {
          speakBlock(index + 1);
        }
        return;
      }

      var chunkText = chunks[chunkIndex];
      var utterance = new SpeechSynthesisUtterance(chunkText);
      var chunkDone = false;

      var voice = getPreferredVoice();
      if (voice) {
        utterance.voice = voice;
        saveVoice(voice.name);
      }
      utterance.rate = getSavedRate();
      utterance.pitch = 1;

      // Advance to next chunk (de-duplicated callback for onend/onerror/watchdog)
      function advanceChunk() {
        if (chunkDone) return;
        chunkDone = true;
        clearChunkWatchdog();
        if (restarting || !playing) return;
        // Small delay between chunks on mobile to let the engine settle
        var delay = mobile ? 150 : 0;
        setTimeout(function () {
          speakChunk(chunkIndex + 1, charOffset + chunkText.length);
        }, delay);
      }

      // Per-word highlighting via boundary events.
      // charOffset tracks where this chunk starts within the full block text
      // so we can map back to the correct word span.
      var currentCharOffset = charOffset;
      utterance.onboundary = function (event) {
        if (event.name !== 'word') return;
        if (!currentWordMap) return;

        currentWordMap.forEach(function (w) { w.span.classList.remove('narrator-word-active'); });

        var ci = currentCharOffset + event.charIndex;
        var match = currentWordMap.find(function (w) { return ci >= w.start && ci < w.end; });
        if (match) {
          match.span.classList.add('narrator-word-active');
        }
      };

      utterance.onend = advanceChunk;

      utterance.onerror = function (event) {
        if (event.error === 'canceled' || event.error === 'interrupted') return;
        console.log('[Narrator] Speech error:', event.error);
        advanceChunk();
      };

      clearChunkWatchdog();
      speechSynthesis.speak(utterance);

      // Watchdog: if onend never fires (mobile silent failure), force-advance.
      // Estimate duration: ~2.5 words/sec at rate 1. Use 3x as safety margin.
      var words = chunkText.split(/\s+/).length;
      var estimatedSec = words / (2.5 * (utterance.rate || 1));
      var timeoutMs = Math.max(estimatedSec * 3, 10) * 1000;
      chunkWatchdog = setTimeout(function () {
        chunkWatchdog = null;
        if (paused || restarting) return;
        console.log('[Narrator] Watchdog: speech appears stuck, advancing');
        speechSynthesis.cancel();
        restarting = true;
        setTimeout(function () {
          restarting = false;
          advanceChunk();
        }, 50);
      }, timeoutMs);
    }

    speakChunk(0, 0);
    updateFloatingUI();
  }

  function startPlayback() {
    speechSynthesis.cancel();
    blocks = extractReadableBlocks();
    if (blocks.length === 0) return;

    playing = true;
    paused = false;
    currentBlockIndex = 0;

    startKeepAlive();
    showFloating();
    updatePlayButton();
    speakBlock(0);
  }

  function pausePlayback() {
    if (!playing) return;
    speechSynthesis.pause();
    paused = true;
    stopKeepAlive();
    clearChunkWatchdog();
    updateFloatingUI();
    updatePlayButton();
  }

  function resumePlayback() {
    if (!playing || !paused) return;
    paused = false;

    // Chrome bug: speechSynthesis.resume() silently fails after a long
    // pause. Cancel and re-speak the current block instead.
    var blockToRestart = currentBlockIndex;
    restarting = true;
    speechSynthesis.cancel();
    unwrapCurrentBlock();
    startKeepAlive();
    updateFloatingUI();
    updatePlayButton();
    setTimeout(function () {
      restarting = false;
      if (playing) speakBlock(blockToRestart);
    }, 50);
  }

  function stopPlayback() {
    speechSynthesis.cancel();
    playing = false;
    paused = false;
    currentBlockIndex = -1;
    unwrapCurrentBlock();
    stopKeepAlive();
    clearChunkWatchdog();
    hideFloating();
    updatePlayButton();
  }

  function togglePlayPause() {
    if (!playing) {
      startPlayback();
    } else if (paused) {
      resumePlayback();
    } else {
      pausePlayback();
    }
  }

  // --- Speed control ---

  const RATES = [0.8, 1, 1.2, 1.5, 2];

  function cycleRate() {
    const current = getSavedRate();
    const idx = RATES.indexOf(current);
    const next = RATES[(idx + 1) % RATES.length];
    saveRate(next);
    updateFloatingUI();

    // Restart current block at the new speed
    if (playing) {
      const blockToRestart = currentBlockIndex;
      restarting = true;
      speechSynthesis.cancel();
      clearChunkWatchdog();
      unwrapCurrentBlock();
      setTimeout(() => {
        restarting = false;
        if (playing) speakBlock(blockToRestart);
      }, 50);
    }
  }

  // --- UI: Play button in the lesson header ---

  function createPlayButton() {
    const header = document.querySelector('.lesson-header');
    if (!header) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'narrator-play-wrapper';

    const btn = document.createElement('button');
    btn.className = 'btn btn-secondary narrator-play-btn';
    btn.setAttribute('aria-label', 'Listen to this lesson');
    btn.innerHTML =
      '<svg class="narrator-icon narrator-icon-play" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<polygon points="5 3 19 12 5 21 5 3"/>' +
      '</svg>' +
      '<svg class="narrator-icon narrator-icon-pause" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:none">' +
        '<line x1="6" y1="4" x2="6" y2="20"/><line x1="18" y1="4" x2="18" y2="20"/>' +
      '</svg>' +
      '<span class="narrator-play-label">Listen to this lesson</span>';

    btn.addEventListener('click', togglePlayPause);
    wrapper.appendChild(btn);
    header.appendChild(wrapper);
    playBtnEl = btn;
  }

  function updatePlayButton() {
    if (!playBtnEl) return;

    const playIcon = playBtnEl.querySelector('.narrator-icon-play');
    const pauseIcon = playBtnEl.querySelector('.narrator-icon-pause');
    const label = playBtnEl.querySelector('.narrator-play-label');

    if (playing && !paused) {
      playIcon.style.display = 'none';
      pauseIcon.style.display = '';
      label.textContent = 'Pause';
    } else if (playing && paused) {
      playIcon.style.display = '';
      pauseIcon.style.display = 'none';
      label.textContent = 'Resume';
    } else {
      playIcon.style.display = '';
      pauseIcon.style.display = 'none';
      label.textContent = 'Listen to this lesson';
    }
  }

  // --- UI: Floating controls (appear after play is pressed) ---

  function createFloatingControls() {
    const el = document.createElement('div');
    el.className = 'narrator-float';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Narrator controls');

    el.innerHTML =
      '<button class="narrator-float-btn narrator-float-pause" aria-label="Pause narration">' +
        '<svg class="narrator-icon narrator-fp-play" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:none">' +
          '<polygon points="5 3 19 12 5 21 5 3"/>' +
        '</svg>' +
        '<svg class="narrator-icon narrator-fp-pause" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<line x1="6" y1="4" x2="6" y2="20"/><line x1="18" y1="4" x2="18" y2="20"/>' +
        '</svg>' +
      '</button>' +
      '<button class="narrator-float-btn narrator-float-stop" aria-label="Stop narration">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<rect x="6" y="6" width="12" height="12" rx="1"/>' +
        '</svg>' +
      '</button>' +
      '<button class="narrator-float-btn narrator-float-rate" aria-label="Change playback speed">' +
        '<span class="narrator-rate-label">1x</span>' +
      '</button>' +
      '<span class="narrator-float-progress"></span>';

    el.querySelector('.narrator-float-pause').addEventListener('click', togglePlayPause);
    el.querySelector('.narrator-float-stop').addEventListener('click', stopPlayback);
    el.querySelector('.narrator-float-rate').addEventListener('click', cycleRate);

    document.body.appendChild(el);
    floatingEl = el;
  }

  function showFloating() {
    if (floatingEl) floatingEl.classList.add('visible');
  }

  function hideFloating() {
    if (floatingEl) floatingEl.classList.remove('visible');
  }

  function updateFloatingUI() {
    if (!floatingEl) return;

    // Toggle pause/play icon
    const fpPlay = floatingEl.querySelector('.narrator-fp-play');
    const fpPause = floatingEl.querySelector('.narrator-fp-pause');
    const pauseBtn = floatingEl.querySelector('.narrator-float-pause');

    if (paused) {
      fpPlay.style.display = '';
      fpPause.style.display = 'none';
      pauseBtn.setAttribute('aria-label', 'Resume narration');
    } else {
      fpPlay.style.display = 'none';
      fpPause.style.display = '';
      pauseBtn.setAttribute('aria-label', 'Pause narration');
    }

    // Update rate display
    const rateLabel = floatingEl.querySelector('.narrator-rate-label');
    rateLabel.textContent = getSavedRate() + 'x';

    // Update progress counter
    const progress = floatingEl.querySelector('.narrator-float-progress');
    if (blocks.length > 0) {
      progress.textContent = (currentBlockIndex + 1) + ' / ' + blocks.length;
    }
  }

  // --- Initialization ---

  function init() {
    if (!isSupported()) return;

    // Trigger voice list loading (some browsers load asynchronously)
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.addEventListener('voiceschanged', () => {});
    }
    speechSynthesis.getVoices();

    createPlayButton();
    createFloatingControls();

    // Stop narration if the user navigates away
    window.addEventListener('beforeunload', () => {
      if (playing) stopPlayback();
    });
  }

  return { init };
})();
