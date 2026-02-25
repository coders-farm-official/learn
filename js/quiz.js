/* ========================================
   Coders Farm — Quiz System
   Knowledge checks with feedback
   ======================================== */

const Quiz = (() => {
  const STORAGE_KEY = 'cf-quiz';

  function getResults() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveResult(quizId, isCorrect) {
    const results = getResults();
    results[quizId] = {
      correct: isCorrect,
      answeredAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  }

  function initAll() {
    document.querySelectorAll('.quiz').forEach(initQuiz);
  }

  function initQuiz(quizEl) {
    const quizId = quizEl.getAttribute('data-id');
    if (!quizId) return;

    const answerEl = quizEl.querySelector('.quiz-answer');
    const correctValue = answerEl ? answerEl.getAttribute('data-correct') : null;
    const isMulti = quizEl.querySelectorAll('input[type="checkbox"]').length > 0;

    // Check if already answered
    const results = getResults();
    if (results[quizId]) {
      showStoredResult(quizEl, quizId, results[quizId].correct);
      return;
    }

    // Create submit button if not exists
    let submitBtn = quizEl.querySelector('.quiz-submit .btn');
    if (!submitBtn) {
      const submitDiv = document.createElement('div');
      submitDiv.className = 'quiz-submit';
      submitBtn = document.createElement('button');
      submitBtn.className = 'btn btn-primary btn-sm';
      submitBtn.textContent = 'Check Answer';
      submitDiv.appendChild(submitBtn);
      // Insert before the answer div
      if (answerEl) {
        answerEl.parentNode.insertBefore(submitDiv, answerEl);
      } else {
        quizEl.appendChild(submitDiv);
      }
    }

    // Handle option selection styling
    const labels = quizEl.querySelectorAll('.quiz-options label');
    labels.forEach(label => {
      const input = label.querySelector('input');
      if (input) {
        input.addEventListener('change', () => {
          if (!isMulti) {
            labels.forEach(l => l.classList.remove('selected'));
          }
          label.classList.toggle('selected', input.checked);
        });
      }
    });

    submitBtn.addEventListener('click', () => {
      const selected = getSelectedValues(quizEl, isMulti);
      if (selected.length === 0) return;

      let isCorrect = false;
      if (correctValue) {
        const correctValues = correctValue.split(',').map(v => v.trim());
        if (isMulti) {
          isCorrect = correctValues.length === selected.length &&
            correctValues.every(v => selected.includes(v));
        } else {
          isCorrect = selected[0] === correctValues[0];
        }
      }

      saveResult(quizId, isCorrect);
      showResult(quizEl, isCorrect, correctValue);
      submitBtn.disabled = true;
      submitBtn.textContent = isCorrect ? 'Correct!' : 'Incorrect';

      // Disable inputs
      quizEl.querySelectorAll('input').forEach(input => {
        input.disabled = true;
      });
    });
  }

  function getSelectedValues(quizEl, isMulti) {
    const selector = isMulti ? 'input[type="checkbox"]:checked' : 'input[type="radio"]:checked';
    return Array.from(quizEl.querySelectorAll(selector)).map(input => input.value);
  }

  function showResult(quizEl, isCorrect, correctValue) {
    const answerEl = quizEl.querySelector('.quiz-answer');
    if (answerEl) {
      answerEl.classList.add('visible');
      answerEl.classList.add(isCorrect ? 'correct' : 'incorrect');

      if (!isCorrect) {
        answerEl.innerHTML = 'Not quite. ' + answerEl.innerHTML;
      }
    }

    // Style the labels
    const labels = quizEl.querySelectorAll('.quiz-options label');
    const correctValues = correctValue ? correctValue.split(',').map(v => v.trim()) : [];

    labels.forEach(label => {
      const input = label.querySelector('input');
      if (input) {
        label.classList.remove('selected');
        if (correctValues.includes(input.value)) {
          label.classList.add('correct');
        } else if (input.checked) {
          label.classList.add('incorrect');
        }
      }
    });
  }

  function showStoredResult(quizEl, quizId, wasCorrect) {
    const answerEl = quizEl.querySelector('.quiz-answer');
    const correctValue = answerEl ? answerEl.getAttribute('data-correct') : null;

    if (answerEl) {
      answerEl.classList.add('visible');
      answerEl.classList.add(wasCorrect ? 'correct' : 'incorrect');
      if (!wasCorrect) {
        answerEl.innerHTML = 'Not quite. ' + answerEl.innerHTML;
      }
    }

    // Disable inputs and show stored state
    quizEl.querySelectorAll('input').forEach(input => {
      input.disabled = true;
    });

    // Mark correct answers
    if (correctValue) {
      const correctValues = correctValue.split(',').map(v => v.trim());
      quizEl.querySelectorAll('.quiz-options label').forEach(label => {
        const input = label.querySelector('input');
        if (input && correctValues.includes(input.value)) {
          label.classList.add('correct');
        }
      });
    }

    // Update or create submit button
    let submitBtn = quizEl.querySelector('.quiz-submit .btn');
    if (!submitBtn) {
      const submitDiv = document.createElement('div');
      submitDiv.className = 'quiz-submit';
      submitBtn = document.createElement('button');
      submitBtn.className = 'btn btn-primary btn-sm';
      submitDiv.appendChild(submitBtn);
      if (answerEl) {
        answerEl.parentNode.insertBefore(submitDiv, answerEl);
      }
    }
    submitBtn.disabled = true;
    submitBtn.textContent = wasCorrect ? 'Correct!' : 'Incorrect';
  }

  return { initAll };
})();
