/* rendering.js - shared helpers and the non-quiz views (overview, lesson, not found, pager). */
(function (M) {
  "use strict";
  const t = M.t;
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const typeset = () => { if (window.MathJax && window.MathJax.typesetPromise) window.MathJax.typesetPromise().catch(e => console.warn("MathJax:", e)); };
  const setHTML = html => { document.getElementById("view").innerHTML = html; typeset(); };
  /* Placeholders usable in lesson HTML: {{base}} = lesson folder, {{images}}, {{docs}}. */
  const expand = (html, base) => String(html).replaceAll("{{base}}", base).replaceAll("{{images}}", "common_images/").replaceAll("{{docs}}", "common_documents/");
  const link = (type, id, label) => `<a href="#" data-go="${type}" data-id="${esc(id)}">${label}</a>`;

  function home() {
    const c = M.course, P = M.Progress, lessons = M.Model.lessons(), mark = c.passingScore || 0;
    const score = P.totalScore(), passed = P.passed(), problems = M.Model.validate(), next = P.nextLesson(), last = P.lastLocation();
    const passNote = passed === null ? t("home.passMark", { mark }) : passed ? t("home.passed", { mark }) : t("home.notPassed", { mark });
    const primary = next
      ? `<button class="btn primary" data-go="lesson" data-id="${esc(next.id)}">${esc(P.completedCount() ? t("home.continue", { title: next.title }) : t("home.start"))}</button>`
      : `<button class="btn primary" data-go="summary">${t("home.allDone")}</button>`;
    const resume = last && last.type !== "home" ? `<button class="btn" data-go="${esc(last.type)}" data-id="${esc(last.id)}">${t("home.resume")}</button>` : "";
    setHTML(`
      <h1>${esc(c.title)}</h1><p class="lead">${esc(c.description || "")}</p>
      ${problems.length ? `<div class="callout warn"><strong>${t("home.issues")}</strong><ul>${problems.map(p => `<li>${esc(p)}</li>`).join("")}</ul></div>` : ""}
      <div class="stat-grid">
        <div class="stat"><span class="meta">${t("home.progress")}</span><strong>${P.percent()}%</strong><span class="meta">${t("home.lessonsDone", { done: P.completedCount(), total: lessons.length })}</span></div>
        <div class="stat"><span class="meta">${t("home.score")}</span><strong>${score === null ? "—" : score + "%"}</strong><span class="meta">${passNote}</span></div>
        <div class="stat"><span class="meta">${t("home.modules")}</span><strong>${c.modules.length}</strong><span class="meta">${t("home.nLessons", { n: lessons.length })}</span></div>
      </div>
      <div class="actions">${primary}${resume}<button class="btn" data-go="summary">${t("home.summary")}</button></div>
      <h2>${t("home.contents")}</h2>
      ${c.modules.map(m => `<section class="card"><h3>${esc(m.title)} <span class="meta">· ${m.lessons.filter(l => P.isLessonDone(l.id)).length}/${m.lessons.length}</span></h3>
        ${m.lessons.map(l => `<p>${link("lesson", l.id, (P.isLessonDone(l.id) ? "✓ " : "") + esc(l.title))} <span class="meta">· ${t("home.min", { n: l.estimatedMinutes || "—" })}</span></p>`).join("")}
        ${m.assessment ? `<p>${link("assessment", m.assessment.id, t("home.moduleAssessment") + " " + esc(m.assessment.title))}</p>` : ""}</section>`).join("")}
      ${c.finalAssessment ? `<section class="card"><h3>${t("nav.completion")}</h3><p>${link("assessment", c.finalAssessment.id, esc(c.finalAssessment.title))}</p></section>` : ""}
      <section class="card"><h3>${t("home.dataTitle")}</h3>
        <p class="meta">${t("home.dataNote", { backend: esc(M.Storage.backend) })}</p>
        <div class="actions"><button class="btn" id="exportBtn">${t("home.export")}</button><button class="btn" id="importBtn">${t("home.import")}</button><button class="btn" id="resetBtn">${t("home.reset")}</button></div>
        <input type="file" id="importFile" accept="application/json" hidden>
        <p class="meta" style="margin-top:18px">${t("home.exportCourse")}</p>
        <div class="actions" style="margin-top:8px"><button class="btn" id="courseJsonBtn">${t("home.courseJson")}</button><button class="btn" id="courseHtmlBtn">${t("home.courseHtml")}</button></div>
      </section>`);
    const file = document.getElementById("importFile");
    document.getElementById("exportBtn").onclick = () => M.Export.download(c.id + "-progress.json", P.exportJSON(), "application/json");
    document.getElementById("importBtn").onclick = () => file.click();
    file.onchange = async () => { try { P.importJSON(await file.files[0].text()); home(); } catch (e) { alert(e.message); } };
    document.getElementById("resetBtn").onclick = () => { if (confirm(t("home.confirmReset"))) { P.reset(); home(); } };
    document.getElementById("courseJsonBtn").onclick = () => M.Export.courseJSON();
    document.getElementById("courseHtmlBtn").onclick = () => M.Export.courseHTML();
  }

  function lesson(id) {
    const l = M.Model.findLesson(id);
    if (!l) return notFound();
    const base = l.basePath || "", done = M.Progress.isLessonDone(id), plots = l.plots || [], used = new Set();
    const slot = pid => `<div class="plot-slot" data-plot="${esc(pid)}"></div>`;
    const body = expand(l.body || "<p>" + t("lesson.empty") + "</p>", base).replace(/\{\{plot:([\w-]+)\}\}/g, (m, pid) => { used.add(pid); return slot(pid); });
    const extra = plots.filter(p => !used.has(p.id));
    setHTML(`
      <div class="meta">${esc(l.moduleTitle)} · ${t("lesson.minutes", { n: l.estimatedMinutes || "—" })}</div>
      <h1>${esc(l.title)}</h1>
      <div class="card lesson-body">${body}</div>
      ${extra.length ? `<h2>${t("plot.section")}</h2>${extra.map(p => slot(p.id)).join("")}` : ""}
      ${(l.resources || []).length ? `<h2>${t("lesson.resources")}</h2><div class="resource-list">${l.resources.map(r => `
        <a class="resource" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer"><span><strong>${esc(r.title)}</strong><small>${esc(r.description || "")}</small></span><span aria-hidden="true">↗</span></a>`).join("")}</div>` : ""}
      ${(l.downloads || []).length ? `<h2>${t("lesson.downloads")}</h2><div class="resource-list">${l.downloads.map(d => `
        <a class="resource" href="${esc(expand(d.file.startsWith("{{") ? d.file : "{{base}}" + d.file, base))}" download><span><strong>${esc(d.title)}</strong><small>${esc(d.description || "")}</small></span><span aria-hidden="true">⬇</span></a>`).join("")}</div>` : ""}
      ${(l.activities || []).length ? `<h2>${t("lesson.activities")}</h2>${l.activities.map(a => `<div class="card"><strong>${esc(a.title)}</strong><p class="meta">${esc(a.description || "")}</p><button class="btn" data-go="activity" data-id="${esc(a.id)}">${t("lesson.open")}</button></div>`).join("")}` : ""}
      <div class="actions"><button class="btn primary" id="completeLesson">${done ? t("lesson.completed") : t("lesson.markDone")}</button><button class="btn" id="completeNext">${t("lesson.markNext")}</button><button class="btn" data-go="home">${t("nav.overview")}</button></div>
      ${pager("lesson", id)}`);
    document.querySelectorAll(".plot-slot").forEach(s => { const spec = plots.find(p => p.id === s.dataset.plot); if (spec) M.Plot.mount(s, spec); });
    if (plots.length) typeset();
    document.getElementById("completeLesson").onclick = () => { M.Progress.completeLesson(id); lesson(id); };
    document.getElementById("completeNext").onclick = () => {
      M.Progress.completeLesson(id);
      const seq = M.Model.sequence(), i = seq.findIndex(s => s.type === "lesson" && s.id === id), n = seq[i + 1];
      M.Nav.go(n ? n.type : "home", n ? n.id : null);
    };
  }

  /* Previous/next buttons in course order. type: "lesson" | "activity" | "assessment". */
  const prefix = type => (type === "activity" ? t("pager.activity") : type === "assessment" ? t("pager.assessment") : "");
  function pager(type, id) {
    const seq = M.Model.sequence(), i = seq.findIndex(s => s.type === type && s.id === id);
    if (i < 0) return "";
    const btn = (s, back) => s ? `<button class="btn" data-go="${s.type}" data-id="${esc(s.id)}">${back ? "← " : ""}${prefix(s.type)}${esc(s.title)}${back ? "" : " →"}</button>` : "<span></span>";
    return `<div class="pager">${btn(seq[i - 1], true)}${btn(seq[i + 1], false)}</div>`;
  }

  function notFound() { setHTML(`<p class="empty">${t("notFound")}</p><div class="actions"><button class="btn" data-go="home">${t("nav.overview")}</button></div>`); }

  M.Render = { esc, typeset, setHTML, expand, home, lesson, notFound, pager };
})(window.MOOC = window.MOOC || {});
