/* search.js - in-browser search over lesson text, lesson/quiz titles and question prompts. The index is built on first use. */
(function (M) {
  "use strict";
  const t = M.t, esc = M.Render.esc;
  let index = null;
  const plain = html => (new DOMParser().parseFromString(String(html || "").replace(/\{\{[^}]*\}\}/g, ""), "text/html").body.textContent || "").replace(/\s+/g, " ").trim();
  const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  function build() {
    const prompts = q => (q.questions || []).map(x => x.prompt).join(" ");
    const rows = [
      ...M.Model.lessons().map(l => ({ type: "lesson", id: l.id, title: l.title, where: l.moduleTitle, text: plain(l.body) + " " + (l.plots || []).map(p => plain(p.title + " " + (p.caption || ""))).join(" ") })),
      ...M.Model.activities().map(a => ({ type: "activity", id: a.id, title: a.title, where: "", text: prompts(a) })),
      ...M.Model.assessments().map(a => ({ type: "assessment", id: a.id, title: a.title, where: a.moduleTitle, text: prompts(a) }))
    ];
    index = rows.map(r => ({ ...r, ltitle: r.title.toLowerCase(), ltext: r.text.toLowerCase() }));
  }

  function query(q) {
    if (!index) build();
    const tokens = String(q || "").toLowerCase().split(/\s+/).filter(Boolean);
    if (!tokens.length) return [];
    return index.map(r => {
      if (!tokens.every(k => r.ltitle.includes(k) || r.ltext.includes(k))) return null;
      const score = tokens.reduce((s, k) => s + (r.ltitle.includes(k) ? 5 : 0) + Math.min(10, r.ltext.split(k).length - 1), 0);
      const pos = Math.max(0, r.ltext.indexOf(tokens.find(k => r.ltext.includes(k)) || ""));
      return { ...r, score, snippet: r.text.slice(Math.max(0, pos - 60), pos + 120) };
    }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 30);
  }

  function render(q) {
    const tokens = String(q || "").toLowerCase().split(/\s+/).filter(Boolean), hits = query(q);
    const mark = s => (tokens.length ? esc(s).replace(new RegExp("(" + tokens.map(reEsc).join("|") + ")", "gi"), "<mark>$1</mark>") : esc(s));
    M.Render.setHTML(`<h1>${t("search.title")}</h1>
      <p class="lead">${tokens.length ? t("search.count", { n: hits.length, q: esc(q) }) : t("search.prompt")}</p>
      ${tokens.length && !hits.length ? `<p class="empty">${t("search.none")}</p>` : ""}
      <div class="resource-list">${hits.map(h => `<a class="resource" href="#" data-go="${h.type}" data-id="${esc(h.id)}"><span class="hit"><strong>${mark(h.title)}</strong>
        <small>${t("search.type." + h.type)}${h.where ? " · " + esc(h.where) : ""}</small>${h.snippet ? `<span class="snippet">…${mark(h.snippet)}…</span>` : ""}</span></a>`).join("")}</div>`);
  }

  M.Search = { query, render, reset: () => { index = null; } };
})(window.MOOC = window.MOOC || {});
