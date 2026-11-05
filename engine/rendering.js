/* rendering.js - shared helpers and the non-quiz views (overview, lesson, not found). */
(function (M) {
  "use strict";
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const typeset = () => { if (window.MathJax && window.MathJax.typesetPromise) window.MathJax.typesetPromise().catch(e => console.warn("MathJax:", e)); };
  const setHTML = html => { document.getElementById("view").innerHTML = html; typeset(); };
  /* Placeholders usable in lesson HTML: {{base}} = lesson folder, {{images}}, {{docs}}. */
  const expand = (html, base) => html.replaceAll("{{base}}", base).replaceAll("{{images}}", "common_images/").replaceAll("{{docs}}", "common_documents/");
  const link = (type, id, label) => `<a href="#" data-go="${type}" data-id="${esc(id)}">${label}</a>`;

  function download(name, text) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function home() {
    const c = M.course, P = M.Progress, lessons = M.Model.lessons();
    const score = P.totalScore(), passed = P.passed(), problems = M.Model.validate();
    const passNote = (passed === null ? "Pass mark: " : passed ? "Passed · pass mark: " : "Not yet passed · pass mark: ") + (c.passingScore || 0) + "%";
    setHTML(`
      <h1>${esc(c.title)}</h1><p class="lead">${esc(c.description || "")}</p>
      ${problems.length ? `<div class="callout warn"><strong>Course definition issues</strong><ul>${problems.map(p => `<li>${esc(p)}</li>`).join("")}</ul></div>` : ""}
      <div class="stat-grid">
        <div class="stat"><span class="meta">Course progress</span><strong>${P.percent()}%</strong><span class="meta">${P.completedCount()} of ${lessons.length} lessons completed</span></div>
        <div class="stat"><span class="meta">Overall score</span><strong>${score === null ? "—" : score + "%"}</strong><span class="meta">${passNote}</span></div>
        <div class="stat"><span class="meta">Modules</span><strong>${c.modules.length}</strong><span class="meta">${lessons.length} lessons</span></div>
      </div>
      <h2>Course contents</h2>
      ${c.modules.map(m => `<section class="card"><h3>${esc(m.title)}</h3>
        ${m.lessons.map(l => `<p>${link("lesson", l.id, (P.isLessonDone(l.id) ? "✓ " : "") + esc(l.title))} <span class="meta">· ${l.estimatedMinutes || "—"} min</span></p>`).join("")}
        ${m.assessment ? `<p>${link("assessment", m.assessment.id, "Module assessment: " + esc(m.assessment.title))}</p>` : ""}</section>`).join("")}
      ${c.finalAssessment ? `<section class="card"><h3>Course completion</h3><p>${link("assessment", c.finalAssessment.id, esc(c.finalAssessment.title))}</p></section>` : ""}
      <div class="actions"><button class="btn primary" data-go="lesson" data-id="${esc(lessons[0] ? lessons[0].id : "")}">Start learning</button><button class="btn" id="resumeBtn">Resume where I left off</button></div>
      <section class="card"><h3>Your progress data</h3>
        <p class="meta">Saved in this browser (${esc(M.Storage.backend)}). Export a copy to move it to another browser or device.</p>
        <div class="actions"><button class="btn" id="exportBtn">Export progress</button><button class="btn" id="importBtn">Import progress</button><button class="btn" id="resetBtn">Reset progress</button></div>
        <input type="file" id="importFile" accept="application/json" hidden>
      </section>`);
    document.getElementById("resumeBtn").onclick = () => {
      const l = P.lastLocation();
      if (l && l.type && l.type !== "home") M.Nav.go(l.type, l.id); else M.Nav.go("lesson", lessons[0] && lessons[0].id);
    };
    const file = document.getElementById("importFile");
    document.getElementById("exportBtn").onclick = () => download(c.id + "-progress.json", P.exportJSON());
    document.getElementById("importBtn").onclick = () => file.click();
    file.onchange = async () => { try { P.importJSON(await file.files[0].text()); home(); } catch (e) { alert(e.message); } };
    document.getElementById("resetBtn").onclick = () => { if (confirm("Delete all saved progress in this browser?")) { P.reset(); home(); } };
  }

  function lesson(id) {
    const l = M.Model.findLesson(id);
    if (!l) return notFound();
    const base = l.basePath || "", done = M.Progress.isLessonDone(id);
    setHTML(`
      <div class="meta">${esc(l.moduleTitle)} · ${l.estimatedMinutes || "—"} minutes</div>
      <h1>${esc(l.title)}</h1>
      <div class="card lesson-body">${expand(l.body || "<p>No lesson content has been added yet.</p>", base)}</div>
      ${(l.resources || []).length ? `<h2>Learning resources</h2><div class="resource-list">${l.resources.map(r => `
        <a class="resource" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer"><span><strong>${esc(r.title)}</strong><small>${esc(r.description || "")}</small></span><span aria-hidden="true">↗</span></a>`).join("")}</div>` : ""}
      ${(l.downloads || []).length ? `<h2>Downloadable materials</h2><div class="resource-list">${l.downloads.map(d => `
        <a class="resource" href="${esc(expand(d.file.startsWith("{{") ? d.file : "{{base}}" + d.file, base))}" download><span><strong>${esc(d.title)}</strong><small>${esc(d.description || "")}</small></span><span aria-hidden="true">⬇</span></a>`).join("")}</div>` : ""}
      ${(l.activities || []).length ? `<h2>Learning activities</h2>${l.activities.map(a => `<div class="card"><strong>${esc(a.title)}</strong><p class="meta">${esc(a.description || "")}</p><button class="btn" data-go="activity" data-id="${esc(a.id)}">Open activity</button></div>`).join("")}` : ""}
      <div class="actions"><button class="btn primary" id="completeLesson">${done ? "Completed ✓" : "Mark lesson as completed"}</button><button class="btn" data-go="home">Course overview</button></div>
      ${pager("lesson", id)}`);
    document.getElementById("completeLesson").onclick = () => { M.Progress.completeLesson(id); lesson(id); };
  }

  /* Previous/next buttons in course order. type: "lesson" | "activity" | "assessment". */
  const PREFIX = { lesson: "", activity: "Activity: ", assessment: "Assessment: " };
  function pager(type, id) {
    const seq = M.Model.sequence(), i = seq.findIndex(s => s.type === type && s.id === id);
    if (i < 0) return "";
    const btn = (s, back) => s ? `<button class="btn" data-go="${s.type}" data-id="${esc(s.id)}">${back ? "← " : ""}${PREFIX[s.type]}${esc(s.title)}${back ? "" : " →"}</button>` : "<span></span>";
    return `<div class="pager">${btn(seq[i - 1], true)}${btn(seq[i + 1], false)}</div>`;
  }

  function notFound() { setHTML('<p class="empty">This page does not exist in the course.</p><div class="actions"><button class="btn" data-go="home">Course overview</button></div>'); }

  M.Render = { esc, typeset, setHTML, home, lesson, notFound, pager };
})(window.MOOC = window.MOOC || {});
