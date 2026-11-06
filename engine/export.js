/* export.js - downloads (course as JSON or one printable HTML file) and the printable completion summary. */
(function (M) {
  "use strict";
  const t = M.t, esc = M.Render.esc;
  function download(name, text, type) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: type || "text/plain" }));
    a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  const courseJSON = () => download(M.course.id + ".json", JSON.stringify(M.course, null, 2), "application/json");

  /* One self-contained HTML file with all lessons and resource links (quizzes are not included). Images and downloads use relative paths. */
  function lessonBody(l) {
    const used = new Set(), plots = l.plots || [];
    const html = M.Render.expand(l.body || "", l.basePath || "").replace(/\{\{plot:([\w-]+)\}\}/g, (m, id) => { const p = plots.find(x => x.id === id); used.add(id); return p ? M.Plot.figure(p) : ""; });
    return html + plots.filter(p => !used.has(p.id)).map(M.Plot.figure).join("");
  }
  function buildCourseHTML() {
    const c = M.course;
    const modules = c.modules.map(m => `<section><h2>${esc(m.title)}</h2>${m.lessons.map(l => `<article><h3>${esc(l.title)}</h3>${lessonBody(l)}
      ${(l.resources || []).length ? `<h4>${t("lesson.resources")}</h4><ul>${l.resources.map(r => `<li><a href="${esc(r.url)}">${esc(r.title)}</a> – ${esc(r.description || "")}</li>`).join("")}</ul>` : ""}</article>`).join("")}</section>`).join("");
    return `<!DOCTYPE html><html lang="${M.Prefs.language()}"><head><meta charset="utf-8"><title>${esc(c.title)}</title>
<script>window.MathJax={tex:{inlineMath:[['\\\\(','\\\\)']],displayMath:[['\\\\[','\\\\]']]}};<\/script>
<script async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"><\/script>
<style>body{font:16px/1.6 Georgia,serif;max-width:820px;margin:2em auto;padding:0 1em}h2{border-bottom:1px solid #ccc;padding-bottom:.2em;margin-top:2em}article{margin:1.5em 0}.callout{border-left:4px solid #2457c5;background:#f0f4ff;padding:.5em 1em}${M.Plot.exportCSS}</style></head>
<body><h1>${esc(c.title)}</h1><p>${esc(c.description || "")}</p>${modules}</body></html>`;
  }
  const courseHTML = () => download(M.course.id + ".html", buildCourseHTML(), "text/html");

  /* Printable summary. The name field is never stored: it exists only on screen and on paper. */
  function summary() {
    const c = M.course, P = M.Progress, lessons = M.Model.lessons(), score = P.totalScore(), passed = P.passed();
    const row = (cells) => `<tr>${cells.map(x => `<td>${x}</td>`).join("")}</tr>`;
    const quizzes = [...M.Model.activities().map(a => ({ ...a, kind: "formative" })), ...M.Model.assessments().map(a => ({ ...a, kind: "summative" }))];
    M.Render.setHTML(`<h1>${t("summary.title")}</h1><p class="lead">${esc(c.title)}</p>
      <div class="card"><label class="name-field"><span class="meta">${t("summary.name")}</span><input id="learnerName" type="text" autocomplete="off" placeholder="${esc(t("summary.namePh"))}"></label>
        <p class="meta no-print">${t("summary.nameNote")}</p><p class="meta">${new Date().toLocaleDateString(M.Prefs.language())}</p></div>
      <div class="stat-grid">
        <div class="stat"><span class="meta">${t("home.progress")}</span><strong>${P.percent()}%</strong><span class="meta">${t("home.lessonsDone", { done: P.completedCount(), total: lessons.length })}</span></div>
        <div class="stat"><span class="meta">${t("home.score")}</span><strong>${score === null ? "—" : score + "%"}</strong><span class="meta">${passed === null ? "" : passed ? t("summary.passed") : t("summary.notPassed")}</span></div>
      </div>
      <h2>${t("summary.lessons")}</h2>
      <table class="table"><tbody>${lessons.map(l => row([esc(l.title), P.isLessonDone(l.id) ? "✓ " + t("summary.done") : t("summary.todo")])).join("")}</tbody></table>
      <h2>${t("summary.quizzes")}</h2>
      <table class="table"><tbody>${quizzes.map(q => { const r = P.result(q.id); return row([esc(q.title), t("summary." + q.kind), r ? r.percentage + "%" : "—", r ? t("summary.attempts", { n: r.attempts }) : ""]); }).join("")}</tbody></table>
      <div class="actions"><button class="btn primary" id="printBtn">${t("summary.print")}</button><button class="btn" data-go="home">${t("nav.overview")}</button></div>`);
    document.getElementById("printBtn").onclick = () => window.print();
  }

  M.Export = { download, courseJSON, courseHTML, buildCourseHTML, summary };
})(window.MOOC = window.MOOC || {});
