// Each question type implements: render(container, question, onSubmit) -> handle
// A handle exposes showFeedback(response, correct) so callers can reveal the
// right answer later (live mode) or immediately (practice mode), without the
// renderer needing to know which mode it's in.

function normalize(s) {
  return (s || "").trim().toLowerCase().replace(/\s+/g, " ");
}

// ---------- Multiple choice ----------

function renderMCQ(container, question, onSubmit) {
  const { options } = question.payload;
  container.innerHTML = `
    <div class="question-prompt">${question.prompt}</div>
    <div class="options-grid"></div>
  `;
  const grid = container.querySelector(".options-grid");
  const buttons = options.map((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.type = "button";
    btn.textContent = opt;
    btn.addEventListener("click", () => {
      buttons.forEach((b) => (b.disabled = true));
      btn.classList.add("selected");
      onSubmit({ index: i });
    });
    grid.appendChild(btn);
    return btn;
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

function renderGapFill(container, question, onSubmit) {
  const { sentence } = question.payload;
  const [before, after] = sentence.split("___");
  container.innerHTML = `
    <div class="question-prompt">${before ?? ""}<span class="muted">____</span>${after ?? ""}</div>
    <input class="gap-fill-input" type="text" placeholder="Type the missing word" autocomplete="off" />
    <div class="error-text" style="display:none"></div>
    <button class="btn" type="button" style="margin-top:12px">Submit</button>
  `;
  const input = container.querySelector("input");
  const error = container.querySelector(".error-text");
  const submitBtn = container.querySelector("button");

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

function renderWordBuilder(container, question, onSubmit) {
  const { scrambled } = question.payload;
  const letters = scrambled.split("");
  container.innerHTML = `
    <div class="question-prompt">${question.prompt}</div>
    <div class="answer-preview"></div>
    <div class="scramble-tiles"></div>
    <div class="error-text" style="display:none"></div>
    <button class="btn" type="button" style="margin-top:4px" disabled>Submit</button>
    <button class="btn" type="button" style="margin-left:8px">Clear</button>
  `;
  const preview = container.querySelector(".answer-preview");
  const tileRow = container.querySelector(".scramble-tiles");
  const error = container.querySelector(".error-text");
  const submitBtn = container.querySelector(".btn");
  const clearBtn = container.querySelectorAll("button")[1];

  let built = [];
  const tiles = letters.map((ch, i) => {
    if (ch === " ") return null;
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "tile";
    tile.textContent = ch;
    tile.addEventListener("click", () => {
      if (tile.classList.contains("used")) return;
      built.push({ ch, i });
      tile.classList.add("used");
      renderPreview();
    });
    tileRow.appendChild(tile);
    return tile;
  });

  function renderPreview() {
    preview.textContent = built.map((b) => b.ch).join("");
    submitBtn.disabled = built.length === 0;
  }

  clearBtn.addEventListener("click", () => {
    built = [];
    tiles.forEach((t) => t && t.classList.remove("used"));
    renderPreview();
  });

  function submit() {
    if (built.length === 0) {
      error.textContent = "Build an answer first.";
      error.style.display = "block";
      return;
    }
    error.style.display = "none";
    tiles.forEach((t) => t && (t.disabled = true));
    submitBtn.disabled = true;
    clearBtn.disabled = true;
    onSubmit({ text: built.map((b) => b.ch).join("") });
  }

  submitBtn.addEventListener("click", submit);

  return {
    showFeedback(response, correct) {
      tiles.forEach((t) => t && (t.disabled = true));
      submitBtn.disabled = true;
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
