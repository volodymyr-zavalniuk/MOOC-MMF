/* navigation.js - hash router, breadcrumb, sidebar, top bar, keyboard, banners, start-up. Loaded last. */
(function (M) {
  "use strict";
  const t = M.t, esc = M.Render.esc, $ = id => document.getElementById(id), root = document.documentElement;
  const debug = /[?&]debug\b/.test(location.search);
  const open = new Set();   // modules expanded in the sidebar
  let current = { type: "home", id: null };

  const homeCrumb = () => ({ label: t("nav.overview"), go: ["home"] });
  const routes = {
    home: () => { M.Render.home(); return [{ label: t("nav.overview") }]; },
    lesson: id => { const l = M.Model.findLesson(id); M.Render.lesson(id); return l ? [homeCrumb(), { label: l.moduleTitle }, { label: l.title }] : [homeCrumb()]; },
    activity: id => {
      const a = M.Model.findActivity(id), l = a && M.Model.findLesson(a.lessonId);
      if (a) M.Quiz.render(a, "activity"); else M.Render.notFound();
      return a ? [homeCrumb(), { label: l.moduleTitle }, { label: l.title, go: ["lesson", l.id] }, { label: a.title }] : [homeCrumb()];
    },
    assessment: id => {
      const a = M.Model.findAssessment(id);
      if (a) M.Quiz.render(a, "assessment"); else M.Render.notFound();
      return a ? [homeCrumb(), { label: a.moduleTitle }, { label: a.title }] : [homeCrumb()];
    },
    search: q => { M.Search.render(q || ""); return [homeCrumb(), { label: t("crumb.search") }]; },
    summary: () => { M.Export.summary(); return [homeCrumb(), { label: t("crumb.summary") }]; }
  };

  const hashFor = (type, id) => "#/" + type + (id ? "/" + encodeURIComponent(id) : "");
  function parse() {
    const p = location.hash.replace(/^#\/?/, "").split("/");
    let id = null; try { id = p[1] ? decodeURIComponent(p[1]) : null; } catch (e) { id = p[1]; }
    return { type: p[0] || "home", id };
  }
  function go(type, id) { const h = hashFor(type, id || null); if (location.hash === h) render(); else location.hash = h; }

  function crumbHTML(items) {
    return items.map((c, i) => c.go
      ? `<a href="#" data-go="${c.go[0]}" data-id="${esc(c.go[1] || "")}">${esc(c.label)}</a>`
      : `<span${i === items.length - 1 ? ' aria-current="page"' : ""}>${esc(c.label)}</span>`).join('<span class="sep">›</span>');
  }

  function render() {
    const r = parse();
    if (!routes[r.type]) { r.type = "home"; r.id = null; }
    current = r;
    let crumb, failed = false;
    try { crumb = routes[r.type](r.id); }
    catch (e) {
      failed = true; console.error(e);
      M.Render.setHTML(`<div class="callout warn"><strong>${t("err.title")}</strong><p>${esc(e.message || e)}</p></div><div class="actions"><button class="btn" data-go="home">${t("nav.overview")}</button></div>`);
      crumb = [homeCrumb()];
    }
    $("breadcrumb").innerHTML = crumbHTML(crumb);
    const mod = r.type === "lesson" ? M.Model.findLesson(r.id) : r.type === "activity" ? M.Model.findActivity(r.id) : r.type === "assessment" ? M.Model.findAssessment(r.id) : null;
    if (mod) open.add(mod.moduleId);
    if (!failed && ["home", "lesson", "activity", "assessment"].includes(r.type) && (r.type === "home" || mod)) M.Progress.setLocation({ type: r.type, id: r.id });
    else updateChrome();
    closeDrawer();
    window.scrollTo({ top: 0 });
  }

  function navHTML() {
    const P = M.Progress, c = M.course;
    const cue = id => { const r = P.result(id); return r ? `<span class="cue">✓ ${r.percentage}%</span>` : ""; };
    const item = (cls, type, id, label, cueHTML) => `<button class="${cls}${current.type === type && current.id === id ? " active" : ""}" data-go="${type}"${id ? ` data-id="${esc(id)}"` : ""}><span>${label}</span>${cueHTML || ""}</button>`;
    let html = item("", "home", null, t("nav.overview"));
    c.modules.forEach(m => {
      const done = m.lessons.filter(l => P.isLessonDone(l.id)).length, isOpen = open.has(m.id);
      html += `<button class="module-head" data-toggle="${esc(m.id)}" aria-expanded="${isOpen}"><span>${isOpen ? "▾" : "▸"} ${esc(m.title)}</span><span class="cue">${done}/${m.lessons.length}</span></button>`;
      if (!isOpen) return;
      m.lessons.forEach(l => {
        html += item("", "lesson", l.id, (P.isLessonDone(l.id) ? "✓ " : "") + esc(l.title));
        (l.activities || []).forEach(a => { html += item("sub", "activity", a.id, "↳ " + esc(a.title), cue(a.id)); });
      });
      if (m.assessment) html += item("", "assessment", m.assessment.id, "◆ " + esc(m.assessment.title), cue(m.assessment.id));
    });
    if (c.finalAssessment) html += `<div class="module-title">${t("nav.completion")}</div>` + item("", "assessment", c.finalAssessment.id, "◆ " + esc(c.finalAssessment.title), cue(c.finalAssessment.id));
    return html + item("", "summary", null, "★ " + t("nav.summary"));
  }

  function banners() {
    const out = [], warn = (title, text) => out.push(`<div class="callout warn banner"><strong>${title}</strong> ${text}</div>`);
    if (!M.Progress.persisted) warn(t("warn.save.title"), M.Storage.persistent ? t("warn.save.failed") : t("warn.save.memory"));
    if (M.mathFailed) warn("", t("warn.math"));
    if (debug) {
      const p = M.Model.validate();
      warn(t("debug.title"), `storage: ${esc(M.Storage.backend)} · ${p.length ? "<ul>" + p.map(x => `<li>${esc(x)}</li>`).join("") + "</ul>" : t("debug.ok")}`);
    }
    $("banners").innerHTML = out.join("");
  }

  function updateChrome() {
    const p = M.Progress.percent(), s = M.Progress.totalScore(), nav = $("navigation"), top = nav.scrollTop;
    $("sideProgress").style.width = p + "%";
    $("sideProgressText").textContent = p + "%";
    $("scorePill").textContent = t("top.score", { value: s === null ? "—" : s + "%" });
    nav.innerHTML = navHTML();
    nav.scrollTop = top;
    const a = nav.querySelector(".active");   // keep the current item visible
    if (a) {
      if (a.offsetTop < nav.scrollTop) nav.scrollTop = a.offsetTop - 8;
      else if (a.offsetTop + a.offsetHeight > nav.scrollTop + nav.clientHeight) nav.scrollTop = a.offsetTop + a.offsetHeight - nav.clientHeight + 8;
    }
    banners();
  }

  const mobile = () => window.matchMedia("(max-width: 800px)").matches;
  function closeDrawer() { root.classList.remove("nav-open"); $("backdrop").hidden = true; $("navToggle").setAttribute("aria-expanded", mobile() ? "false" : String(M.Prefs.get("sidebar"))); }
  function toggleNav() {
    if (mobile()) { const o = !root.classList.contains("nav-open"); root.classList.toggle("nav-open", o); $("backdrop").hidden = !o; $("navToggle").setAttribute("aria-expanded", String(o)); }
    else { M.Prefs.set("sidebar", !M.Prefs.get("sidebar")); $("navToggle").setAttribute("aria-expanded", String(M.Prefs.get("sidebar"))); }
  }

  function refresh() {   // after a language change
    M.applyStaticText();
    $("sideCourseName").textContent = M.course.title;
    M.Settings.refresh();
    render();
  }

  function init() {
    if (!M.course) { $("view").innerHTML = `<div class="callout warn">${t("err.course")}</div>`; return; }
    M.Prefs.load(); M.Progress.load(); M.applyStaticText();
    $("brand").textContent = M.course.brand || t("app.brand");
    $("sideCourseName").textContent = M.course.title;
    document.title = M.course.title;
    M.Progress.onChange(updateChrome);
    M.Settings.init();
    document.addEventListener("mooc:math-failed", banners);

    document.addEventListener("click", e => {
      const tg = e.target.closest("[data-toggle]");
      if (tg) { const id = tg.dataset.toggle; open.has(id) ? open.delete(id) : open.add(id); updateChrome(); return; }
      const g = e.target.closest("[data-go]");
      if (!g) return;
      e.preventDefault();
      go(g.dataset.go, g.dataset.id);
    });
    $("navToggle").addEventListener("click", toggleNav);
    $("backdrop").addEventListener("click", closeDrawer);
    $("searchForm").addEventListener("submit", e => { e.preventDefault(); const q = $("searchInput").value.trim(); if (q) go("search", q); });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") { M.Settings.close(); closeDrawer(); return; }
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.target.closest && e.target.closest("input, textarea, select, [contenteditable]")) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const seq = M.Model.sequence(), i = seq.findIndex(s => s.type === current.type && s.id === current.id), n = seq[i + (e.key === "ArrowRight" ? 1 : -1)];
      if (i >= 0 && n) { e.preventDefault(); go(n.type, n.id); }
    });
    window.addEventListener("hashchange", render);
    if (!location.hash) { const l = M.Progress.lastLocation(); if (l && l.type) history.replaceState(null, "", hashFor(l.type, l.id)); }
    closeDrawer();
    render();
  }

  M.Nav = { go, refresh };
  init();
})(window.MOOC = window.MOOC || {});
