// Each question type implements: render(container, question, onSubmit) -> handle
// A handle exposes showFeedback(response, correct) so callers can reveal the
// right answer later (live mode) or immediately (practice mode), without the
// renderer needing to know which mode it's in.

function normalize(s) {
  return (s || "").trim().toLowerCase().replace(/\s+/g, " ");
}

// Mobile browsers can leave a stray focus/tap-highlight on an element from
// the previous question if it isn't explicitly cleared before the DOM under
// it gets replaced. Call this at the top of every renderer.
function clearStickyFocus() {
  if (document.activeElement && document.activeElement.blur) {
    document.activeElement.blur();
  }
}

// ---------- Multiple choice ----------

function shuffledIndices(n) {
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

function renderMCQ(container, question, onSubmit) {
  clearStickyFocus();
  const { options } = question.payload;
  container.innerHTML = `
    <div class="question-prompt">${question.prompt}</div>
    <div class="task-instruction">Tap the correct answer.</div>
    <div class="options-grid"></div>
  `;
  const grid = container.querySelector(".options-grid");
  const buttons = new Array(options.length);

  shuffledIndices(options.length).forEach((originalIndex) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.type = "button";
    btn.textContent = options[originalIndex];
    btn.addEventListener("click", () => {
      buttons.forEach((b) => (b.disabled = true));
      btn.classList.add("selected");
      onSubmit({ index: originalIndex });
    });
    grid.appendChild(btn);
    buttons[originalIndex] = btn;
  });

  return {
    showFeedback(response, correct) {
      buttons.forEach((b) => (b.disabled = true));
      const correctIndex = question.payload.correctIndex;
      buttons[correctIndex].classList.add("correct");
      if (response && response.index !== correctIndex) {
        buttons[response.index].classList.add("incorrect");
      }
    },
  };
}

function gradeMCQ(question, response) {
  return !!response && response.index === question.payload.correctIndex;
}

// ---------- Gap fill ----------

function buildHint(answer) {
  return answer
    .split(" ")
    .map((word) => (word.length <= 1 ? word : word[0] + " " + Array(word.length - 1).fill("_").join(" ")))
    .join("&nbsp;&nbsp;&nbsp;&nbsp;");
}

function renderGapFill(container, question, onSubmit) {
  clearStickyFocus();
  const { sentence } = question.payload;
  const [before, after] = sentence.split("___");
  container.innerHTML = `
    <div class="question-prompt">${before ?? ""}<span class="muted">____</span>${after ?? ""}</div>
    <div class="muted" style="margin-bottom:12px;letter-spacing:2px">${buildHint(question.payload.answer)}</div>
    <div class="task-instruction">Type the whole word or phrase (including the first letter shown above), then press Submit.</div>
    <div class="input-row">
      <div class="input-wrap pulse-highlight">
        <input class="gap-fill-input" type="text" placeholder="Type here" autocomplete="off" />
      </div>
      <button class="btn" type="button" data-role="submit">Submit</button>
    </div>
    <div class="error-text" style="display:none"></div>
  `;
  const input = container.querySelector("input");
  const inputWrap = container.querySelector(".input-wrap");
  const error = container.querySelector(".error-text");
  const submitBtn = container.querySelector('[data-role="submit"]');

  function focusSubmitNext() {
    inputWrap.classList.remove("pulse-highlight");
    submitBtn.classList.add("pulse-highlight");
  }
  input.addEventListener("focus", focusSubmitNext, { once: true });

  function submit() {
    const value = input.value;
    if (!normalize(value)) {
      error.textContent = "Type an answer first.";
      error.style.display = "block";
      return;
    }
    error.style.display = "none";
    input.disabled = true;
    submitBtn.disabled = true;
    submitBtn.classList.remove("pulse-highlight");
    onSubmit({ text: value });
  }

  submitBtn.addEventListener("click", submit);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submit();
    error.style.display = "none";
  });

  return {
    showFeedback(response, correct) {
      input.disabled = true;
      submitBtn.disabled = true;
      inputWrap.classList.remove("pulse-highlight");
      submitBtn.classList.remove("pulse-highlight");
      const banner = document.createElement("div");
      banner.className = "feedback-banner " + (correct ? "correct" : "incorrect");
      banner.textContent = correct
        ? "Correct!"
        : `Not quite — the answer was "${question.payload.answer}".`;
      container.appendChild(banner);
    },
  };
}

function gradeGapFill(question, response) {
  if (!response) return false;
  const accepted = [question.payload.answer, ...(question.payload.altAnswers || [])].map(normalize);
  return accepted.includes(normalize(response.text));
}

// ---------- Word builder (unscramble) ----------

function shuffleLetters(str) {
  const letters = str.split("");
  let attempts = 0;
  let shuffled = letters;
  do {
    shuffled = [...letters];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    attempts++;
  } while (shuffled.join("") === letters.join("") && letters.length > 1 && attempts < 10);
  return shuffled;
}

function renderWordBuilder(container, question, onSubmit) {
  clearStickyFocus();
  const letters = shuffleLetters(question.payload.answer.replace(/\s+/g, ""));
  container.innerHTML = `
    <div class="question-prompt">${question.prompt}</div>
    <div class="task-instruction">Tap the letters in order to spell the answer. Tap a letter you've already placed to remove just that one, or use Clear to start over.</div>
    <div class="answer-preview"></div>
    <div class="scramble-tiles"></div>
    <div class="error-text" style="display:none"></div>
    <button class="btn" type="button" data-role="submit" style="margin-top:4px" disabled>Submit</button>
    <button class="btn btn-outline" type="button" data-role="clear" style="margin-left:8px">Clear</button>
  `;
  const preview = container.querySelector(".answer-preview");
  const tileRow = container.querySelector(".scramble-tiles");
  const error = container.querySelector(".error-text");
  const submitBtn = container.querySelector('[data-role="submit"]');
  const clearBtn = container.querySelector('[data-role="clear"]');

  let built = []; // { ch, tile }
  const tiles = letters.map((ch) => {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "tile";
    tile.textContent = ch;
    tile.addEventListener("click", () => {
      if (tile.classList.contains("used")) return;
      built.push({ ch, tile });
      tile.classList.add("used");
      renderPreview();
    });
    tileRow.appendChild(tile);
    return tile;
  });

  function renderPreview() {
    preview.innerHTML = "";
    built.forEach((entry, idx) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "tile placed";
      chip.textContent = entry.ch;
      chip.title = "Tap to remove";
      chip.addEventListener("click", () => {
        entry.tile.classList.remove("used");
        built.splice(idx, 1);
        renderPreview();
      });
      preview.appendChild(chip);
    });
    submitBtn.disabled = built.length === 0;
    if (built.length > 0) {
      submitBtn.classList.add("pulse-highlight");
    } else {
      submitBtn.classList.remove("pulse-highlight");
    }
  }
  renderPreview();

  clearBtn.addEventListener("click", () => {
    built = [];
    tiles.forEach((t) => t.classList.remove("used"));
    renderPreview();
  });

  function submit() {
    if (built.length === 0) {
      error.textContent = "Build an answer first.";
      error.style.display = "block";
      return;
    }
    error.style.display = "none";
    tiles.forEach((t) => (t.disabled = true));
    submitBtn.disabled = true;
    submitBtn.classList.remove("pulse-highlight");
    clearBtn.disabled = true;
    onSubmit({ text: built.map((b) => b.ch).join("") });
  }

  submitBtn.addEventListener("click", submit);

  return {
    showFeedback(response, correct) {
      tiles.forEach((t) => (t.disabled = true));
      submitBtn.disabled = true;
      submitBtn.classList.remove("pulse-highlight");
      clearBtn.disabled = true;
      const banner = document.createElement("div");
      banner.className = "feedback-banner " + (correct ? "correct" : "incorrect");
      banner.textContent = correct
        ? "Correct!"
        : `Not quite — the answer was "${question.payload.answer}".`;
      container.appendChild(banner);
    },
  };
}

function gradeWordBuilder(question, response) {
  if (!response) return false;
  return normalize(response.text).replace(/\s+/g, "") ===
    normalize(question.payload.answer).replace(/\s+/g, "");
}

// ---------- Dispatcher ----------

const TYPES = {
  mcq: { render: renderMCQ, grade: gradeMCQ },
  gap_fill: { render: renderGapFill, grade: gradeGapFill },
  word_builder: { render: renderWordBuilder, grade: gradeWordBuilder },
};

export function renderQuestion(container, question, onSubmit) {
  const type = TYPES[question.type];
  if (!type) {
    container.innerHTML = `<p>Unknown question type: ${question.type}</p>`;
    return { showFeedback() {} };
  }
  return type.render(container, question, onSubmit);
}

export function gradeResponse(question, response) {
  const type = TYPES[question.type];
  return type ? type.grade(question, response) : false;
}

export function formatResponse(question, response) {
  if (!response) return "(no answer)";
  if (question.type === "mcq") {
    const opt = question.payload.options[response.index];
    return opt != null ? opt : "(no answer)";
  }
  return response.text || "(no answer)";
}

export function correctAnswerText(question) {
  if (question.type === "mcq") return question.payload.options[question.payload.correctIndex];
  return question.payload.answer;
}
