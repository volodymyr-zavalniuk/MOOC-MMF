/* quiz.js - question types (registry) and the quiz/assessment view.
   A type is { render(q,i,ctx) -> html, grade(q,form) -> {correct}, answered?(q,form), reveal?(q,wrap) -> text, validate?(q) -> message }.
   Register more with MOOC.Quiz.registerType(name, def). */
(function (M) {
  "use strict";
  const t = M.t, esc = M.Render.esc;
  const drafts = {};   // unsent answers per quiz id: kept in memory only (never saved), so they survive navigation but not a reload
  const inputs = (root, q) => Array.from(root.querySelectorAll("input")).filter(el => el.name === String(q.id));
  const legend = (q, i) => `<legend><strong>${i + 1}. ${esc(q.prompt)}</strong></legend>`;
  const choices = (q, i, kind) => `<fieldset class="card">${legend(q, i)}${kind === "checkbox" ? `<p class="meta">${t("quiz.selectAll")}</p>` : ""}
    ${(q.options || []).map((o, k) => `<label class="quiz-option"><input type="${kind}" name="${esc(q.id)}" value="${k}"><span>${esc(o)}</span></label>`).join("")}</fieldset>`;
  const revealChoices = (q, wrap, want) => inputs(wrap, q).forEach(el => {
    const lab = el.closest("label"), good = want.includes(Number(el.value));
    lab.classList.toggle("is-correct", good); lab.classList.toggle("is-wrong", el.checked && !good);
  });

  const types = {
    single: {
      render: (q, i) => choices(q, i, "radio"),
      grade(q, form) { const s = inputs(form, q).find(el => el.checked); return { correct: !!s && Number(s.value) === q.answer }; },
      answered: (q, form) => inputs(form, q).some(el => el.checked),
      reveal(q, wrap) { revealChoices(q, wrap, [q.answer]); },
      validate: q => (q.options && q.options[q.answer] !== undefined ? "" : "answer must be the index of an option")
    },
    multiple: {
      render: (q, i) => choices(q, i, "checkbox"),
      grade(q, form) {
        const got = inputs(form, q).filter(el => el.checked).map(el => Number(el.value)).sort((a, b) => a - b);
        return { correct: JSON.stringify(got) === JSON.stringify([...q.answer].sort((a, b) => a - b)) };
      },
      answered: (q, form) => inputs(form, q).some(el => el.checked),
      reveal(q, wrap) { revealChoices(q, wrap, q.answer); },
      validate: q => (Array.isArray(q.answer) && q.answer.length && q.answer.every(a => q.options && q.options[a] !== undefined) ? "" : "answer must be an array of option indexes")
    },
    numeric: {
      render: (q, i) => `<fieldset class="card">${legend(q, i)}<input class="quiz-num" type="text" inputmode="decimal" name="${esc(q.id)}" autocomplete="off" aria-label="${esc(t("quiz.answerLabel"))}"> <span class="meta">${esc(q.unit || "")}</span></fieldset>`,
      grade(q, form) {
        const el = inputs(form, q)[0], v = parseFloat(String(el ? el.value : "").replace(",", "."));
        return { correct: Number.isFinite(v) && Math.abs(v - q.answer) <= (q.tolerance || 0) };
      },
      answered: (q, form) => { const el = inputs(form, q)[0]; return !!el && el.value.trim() !== ""; },
      reveal: q => t("quiz.correctAnswer", { value: q.answer + (q.unit ? " " + q.unit : "") }),
      validate: q => (typeof q.answer === "number" ? "" : "answer must be a number")
    }
  };

  const gradeOne = (q, form) => { const ty = types[q.type]; return ty ? { q, ...ty.grade(q, form), answered: ty.answered ? ty.answered(q, form) : true } : { q, correct: false, answered: true }; };
  function showFeedback(g, wrap) {
    const ty = types[g.q.type], extra = ty && ty.reveal ? ty.reveal(g.q, wrap) : "";
    wrap.querySelector(".q-feedback").innerHTML = `<div class="feedback ${g.correct ? "good" : "bad"}"><strong>${g.correct ? t("quiz.correct") : t("quiz.notQuite")}:</strong> ${esc(g.q.explanation || "")}${extra ? `<div class="meta">${esc(extra)}</div>` : ""}</div>`;
  }
  const clearFeedback = wrap => { wrap.querySelector(".q-feedback").innerHTML = ""; wrap.querySelectorAll("label").forEach(l => l.classList.remove("is-correct", "is-wrong")); };
  const wrapQ = (q, i, ctx) => {
    const ty = types[q.type];
    if (!ty) return `<div class="card">${t("quiz.unsupported", { type: esc(q.type) })}</div>`;
    return `<div class="q-wrap" data-q="${esc(q.id)}">${ty.render(q, i, ctx)}<div class="q-tools">${ctx.instant ? `<button class="btn" type="button" data-check>${t("quiz.check")}</button>` : ""}</div><div class="q-feedback" aria-live="polite"></div></div>`;
  };

  function render(item, kind) {
    const P = M.Progress, prev = P.result(item.id), ctx = { instant: kind === "activity" };
    M.Render.setHTML(`
      <div class="meta">${kind === "assessment" ? t("quiz.summative") : t("quiz.formative")}${item.weight ? " · " + t("quiz.weight", { n: item.weight }) : ""}</div>
      <h1>${esc(item.title)}</h1><p class="lead">${esc(item.description || "")}</p>
      ${ctx.instant ? `<p class="meta">${t("quiz.hint")}</p>` : ""}
      <form id="quizForm" novalidate>
        ${(item.questions || []).map((q, i) => wrapQ(q, i, ctx)).join("")}
        <div class="actions"><button class="btn primary" type="button" id="submitQuiz">${t("quiz.submit")}</button><button class="btn" type="button" id="resetQuiz">${t("quiz.clear")}</button></div>
      </form>
      <div id="quizResult"></div>
      ${prev ? `<p class="meta">${t("quiz.bestRecorded", { pct: prev.percentage, correct: prev.correct, total: prev.total, attempts: prev.attempts })}</p>` : ""}
      <div class="actions"><button class="btn" data-go="home">${t("nav.overview")}</button></div>
      ${M.Render.pager(kind, item.id)}`);
    const form = document.getElementById("quizForm"), submit = document.getElementById("submitQuiz"), out = document.getElementById("quizResult");
    const all = () => Array.from(form.querySelectorAll("input"));

    // restore answers typed before the learner navigated away
    (drafts[item.id] || []).forEach(([name, type, value]) => all().filter(el => el.name === name).forEach(el => {
      if (el.type === "radio" || el.type === "checkbox") el.checked = el.checked || (el.value === value && (type === "radio" || type === "checkbox"));
      else el.value = value;
    }));
    form.addEventListener("input", e => {
      drafts[item.id] = all().filter(el => (el.type === "radio" || el.type === "checkbox") ? el.checked : el.value !== "").map(el => [el.name, el.type, el.value]);
      const wrap = e.target.closest(".q-wrap");
      if (wrap && !form.classList.contains("graded")) clearFeedback(wrap);   // answer changed: old feedback is stale
    });
    form.addEventListener("click", e => {
      if (!e.target.closest("[data-check]")) return;
      const wrap = e.target.closest(".q-wrap"), q = item.questions.find(x => String(x.id) === wrap.dataset.q);
      showFeedback(gradeOne(q, form), wrap); M.Render.typeset();
    });

    submit.onclick = () => {
      try {
        const grades = (item.questions || []).map(q => gradeOne(q, form));
        const missing = grades.filter(g => !g.answered).length;
        if (missing && !confirm(t("quiz.unanswered", { n: missing }))) return;
        const correct = grades.filter(g => g.correct).length, r = P.recordQuiz(item.id, correct, grades.length);
        delete drafts[item.id];
        form.classList.add("graded"); submit.disabled = true; all().forEach(el => { el.disabled = true; });
        grades.forEach(g => showFeedback(g, form.querySelector(`.q-wrap[data-q="${CSS.escape(String(g.q.id))}"]`)));
        const overall = kind === "assessment" && item.contributesToTotal && P.totalScore() !== null ? `<p class="meta">${t("quiz.overall", { pct: P.totalScore() })}</p>` : "";
        out.innerHTML = `<div class="card"><h2>${t("quiz.result", { pct: r.latestPercentage })}</h2><p>${t("quiz.nCorrect", { correct, total: grades.length })}</p><p class="meta">${t("quiz.best", { pct: r.percentage })}</p>${overall}</div>
          <div class="actions"><button class="btn" id="tryAgain" type="button">${t("quiz.tryAgain")}</button></div>`;
        document.getElementById("tryAgain").onclick = () => render(item, kind);
        M.Render.typeset();
        out.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } catch (e) {
        console.error("Quiz grading failed", e);
        out.innerHTML = `<div class="feedback bad">${t("quiz.gradeFail", { msg: esc(e.message || e) })}</div>`;
      }
    };
    document.getElementById("resetQuiz").onclick = () => {
      delete drafts[item.id]; form.reset(); form.classList.remove("graded"); submit.disabled = false;
      all().forEach(el => { el.disabled = false; }); form.querySelectorAll(".q-wrap").forEach(clearFeedback); out.innerHTML = "";
    };
  }

  M.Quiz = { types, render, registerType: (name, def) => { types[name] = def; } };
})(window.MOOC = window.MOOC || {});
