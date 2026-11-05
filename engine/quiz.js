/* quiz.js - question types (registry) and the quiz/assessment view.
   Add a type with MOOC.Quiz.registerType(name, { render(q, index) -> html, grade(q, form) -> {correct}, validate?(q) -> message }). */
(function (M) {
  "use strict";
  const esc = M.Render.esc;
  const inputs = (form, q) => Array.from(form.querySelectorAll("input")).filter(el => el.name === String(q.id));
  const legend = (q, i) => `<legend><strong>${i + 1}. ${esc(q.prompt)}</strong></legend>`;
  const choices = (q, i, kind) => `<fieldset class="card">${legend(q, i)}${kind === "checkbox" ? '<p class="meta">Select all that apply.</p>' : ""}
    ${(q.options || []).map((o, k) => `<label class="quiz-option"><input type="${kind}" name="${esc(q.id)}" value="${k}"><span>${esc(o)}</span></label>`).join("")}</fieldset>`;

  const types = {
    single: {
      render: (q, i) => choices(q, i, "radio"),
      grade(q, form) { const s = inputs(form, q).find(el => el.checked); return { correct: !!s && Number(s.value) === q.answer }; },
      validate: q => (q.options && q.options[q.answer] !== undefined ? "" : "answer must be the index of an option")
    },
    multiple: {
      render: (q, i) => choices(q, i, "checkbox"),
      grade(q, form) {
        const got = inputs(form, q).filter(el => el.checked).map(el => Number(el.value)).sort((a, b) => a - b);
        const want = [...q.answer].sort((a, b) => a - b);
        return { correct: JSON.stringify(got) === JSON.stringify(want) };
      },
      validate: q => (Array.isArray(q.answer) && q.answer.length ? "" : "answer must be an array of option indexes")
    },
    numeric: {
      render: (q, i) => `<fieldset class="card">${legend(q, i)}<input class="quiz-num" type="text" inputmode="decimal" name="${esc(q.id)}" autocomplete="off" aria-label="Your answer"> <span class="meta">${esc(q.unit || "")}</span></fieldset>`,
      grade(q, form) {
        const el = inputs(form, q)[0], v = parseFloat(String(el ? el.value : "").replace(",", "."));
        return { correct: Number.isFinite(v) && Math.abs(v - q.answer) <= (q.tolerance || 0) };
      },
      validate: q => (typeof q.answer === "number" ? "" : "answer must be a number")
    }
  };

  function render(item, kind) {
    const P = M.Progress, prev = P.result(item.id);
    M.Render.setHTML(`
      <div class="meta">${kind === "assessment" ? "Summative assessment" : "Formative activity"}${item.weight ? ` · Weight: ${item.weight}%` : ""}</div>
      <h1>${esc(item.title)}</h1><p class="lead">${esc(item.description || "")}</p>
      <form id="quizForm">
        ${(item.questions || []).map((q, i) => types[q.type] ? types[q.type].render(q, i) : `<div class="card">Unsupported question type: ${esc(q.type)}</div>`).join("")}
        <div class="actions"><button class="btn primary" type="button" id="submitQuiz">Submit answers</button><button class="btn" type="button" id="resetQuiz">Clear answers</button></div>
      </form>
      <div id="quizFeedback"></div>
      ${prev ? `<p class="meta">Best recorded result: ${prev.percentage}% (${prev.correct}/${prev.total}) · ${prev.attempts} attempt(s)</p>` : ""}
      <div class="actions"><button class="btn" data-go="home">Course overview</button></div>
      ${M.Render.pager(kind, item.id)}`);
    const form = document.getElementById("quizForm"), submit = document.getElementById("submitQuiz"), out = document.getElementById("quizFeedback");

    submit.onclick = () => {
      try {
        const grades = (item.questions || []).map(q => ({ q, ...(types[q.type] ? types[q.type].grade(q, form) : { correct: false }) }));
        const r = P.recordQuiz(item.id, grades.filter(g => g.correct).length, grades.length);
        submit.disabled = true;
        const overall = kind === "assessment" && item.contributesToTotal && P.totalScore() !== null ? `<p class="meta">Overall course score: ${P.totalScore()}%</p>` : "";
        out.innerHTML = `<div class="card"><h2>Result: ${r.latestPercentage}%</h2><p>${grades.filter(g => g.correct).length} correct answer(s) out of ${grades.length}.</p>
          <p class="meta">Best recorded result: ${r.percentage}%</p>${overall}
          ${grades.map((g, i) => `<div class="feedback ${g.correct ? "good" : "bad"}"><strong>${i + 1}. ${g.correct ? "Correct" : "Not quite"}:</strong> ${esc(g.q.explanation || "")}</div>`).join("")}</div>
          <div class="actions"><button class="btn" id="tryAgain" type="button">Try again</button></div>`;
        document.getElementById("tryAgain").onclick = () => render(item, kind);
        M.Render.typeset();
      } catch (e) {
        console.error("Quiz grading failed", e);
        out.innerHTML = `<div class="feedback bad">The quiz could not be graded: ${esc(e.message || e)}</div>`;
      }
    };
    document.getElementById("resetQuiz").onclick = () => { form.reset(); submit.disabled = false; out.innerHTML = ""; };
  }

  M.Quiz = { types, render, registerType: (name, def) => { types[name] = def; } };
})(window.MOOC = window.MOOC || {});
