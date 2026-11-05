/* navigation.js - hash router (#/lesson/<id>), sidebar, progress bar, start-up. Loaded last. */
(function (M) {
  "use strict";
  const esc = M.Render.esc;
  let current = { type: "home", id: null };

  const routes = {
    home: () => { M.Render.home(); return "Course overview"; },
    lesson: id => { const l = M.Model.findLesson(id); M.Render.lesson(id); return l ? l.moduleTitle : "Lesson"; },
    activity: id => { const a = M.Model.findActivity(id); if (a) M.Quiz.render(a, "activity"); else M.Render.notFound(); return "Learning activity"; },
    assessment: id => { const a = M.Model.findAssessment(id); if (a) M.Quiz.render(a, "assessment"); else M.Render.notFound(); return "Assessment"; }
  };

  const hashFor = (type, id) => "#/" + type + (id ? "/" + encodeURIComponent(id) : "");
  function parse() {
    const p = location.hash.replace(/^#\/?/, "").split("/");
    return { type: p[0] || "home", id: p[1] ? decodeURIComponent(p[1]) : null };
  }
  function go(type, id) {
    const h = hashFor(type, id || null);
    if (location.hash === h) render(); else location.hash = h;
  }
  function render() {
    const r = parse();
    if (!routes[r.type]) { r.type = "home"; r.id = null; }
    current = r;
    document.getElementById("breadcrumb").textContent = routes[r.type](r.id);
    M.Progress.setLocation({ type: r.type, id: r.id });
    window.scrollTo({ top: 0 });
  }

  function navHTML() {
    const P = M.Progress, c = M.course;
    const btn = (cls, type, id, label) => `<button class="${cls}${current.type === type && current.id === id ? " active" : ""}" data-go="${type}"${id ? ` data-id="${esc(id)}"` : ""}>${label}</button>`;
    let html = btn("", "home", null, "Course overview");
    c.modules.forEach(m => {
      html += `<div class="module-title">${esc(m.title)}</div>`;
      m.lessons.forEach(l => {
        html += btn("", "lesson", l.id, (P.isLessonDone(l.id) ? "✓ " : "") + esc(l.title));
        (l.activities || []).forEach(a => { html += btn("sub", "activity", a.id, "↳ " + esc(a.title)); });
      });
      if (m.assessment) html += btn("", "assessment", m.assessment.id, "◆ " + esc(m.assessment.title));
    });
    if (c.finalAssessment) html += `<div class="module-title">Course completion</div>` + btn("", "assessment", c.finalAssessment.id, "◆ " + esc(c.finalAssessment.title));
    return html;
  }
  function updateChrome() {
    const p = M.Progress.percent(), s = M.Progress.totalScore(), nav = document.getElementById("navigation"), top = nav.scrollTop;
    document.getElementById("sideProgress").style.width = p + "%";
    document.getElementById("sideProgressText").textContent = p + "%";
    document.getElementById("scorePill").textContent = "Score: " + (s === null ? "—" : s + "%");
    nav.innerHTML = navHTML();
    nav.scrollTop = top;
  }

  function init() {
    if (!M.course) { document.getElementById("view").innerHTML = '<div class="callout warn">course/course.js did not load. Check the file path.</div>'; return; }
    M.Progress.load();
    document.getElementById("brand").textContent = M.course.brand || "Open Science";
    document.getElementById("sideCourseName").textContent = M.course.title;
    document.title = M.course.title;
    M.Progress.onChange(updateChrome);
    document.addEventListener("click", e => {
      const t = e.target.closest("[data-go]");
      if (!t) return;
      e.preventDefault();
      go(t.dataset.go, t.dataset.id);
    });
    window.addEventListener("hashchange", render);
    if (!location.hash) { const l = M.Progress.lastLocation(); if (l && l.type) history.replaceState(null, "", hashFor(l.type, l.id)); }
    render();
  }

  M.Nav = { go };
  init();
})(window.MOOC = window.MOOC || {});
