/* settings.js - the reader-preferences panel (font size, width, theme, language). Data lives in prefs.js. */
(function (M) {
  "use strict";
  const t = M.t, P = M.Prefs, esc = M.Render.esc;
  const panel = () => document.getElementById("settingsPanel"), btn = () => document.getElementById("settingsBtn");
  const sel = (id, label, opts, val) => `<label class="set-row"><span>${label}</span><select id="${id}">${opts.map(([v, l]) => `<option value="${v}"${v === val ? " selected" : ""}>${esc(l)}</option>`).join("")}</select></label>`;

  function fill() {
    panel().innerHTML = `<h3>${t("set.title")}</h3>
      <div class="set-row"><span>${t("set.fontSize")}</span><span><button class="btn" data-fs="-10" aria-label="${esc(t("set.fontDec"))}">A−</button> <strong>${P.get("fontScale")}%</strong> <button class="btn" data-fs="10" aria-label="${esc(t("set.fontInc"))}">A+</button></span></div>
      ${sel("setWidth", t("set.width"), [["narrow", t("set.narrow")], ["normal", t("set.normal")], ["wide", t("set.wide")]], P.get("width"))}
      ${sel("setTheme", t("set.theme"), [["auto", t("set.auto")], ["light", t("set.light")], ["dark", t("set.dark")]], P.get("theme"))}
      ${sel("setLang", t("set.language"), [["auto", t("set.auto")], ["en", "English"], ["uk", "Українська"]], P.get("lang"))}
      <div class="actions"><button class="btn" id="setReset">${t("set.reset")}</button><button class="btn" id="setClose">${t("set.close")}</button></div>`;
  }
  const isOpen = () => !panel().hidden;
  function close() { panel().hidden = true; btn().setAttribute("aria-expanded", "false"); }
  function toggle() { if (isOpen()) return close(); fill(); panel().hidden = false; btn().setAttribute("aria-expanded", "true"); }

  function init() {
    btn().addEventListener("click", toggle);
    document.addEventListener("click", e => { if (isOpen() && !panel().contains(e.target) && !btn().contains(e.target)) close(); });
    panel().addEventListener("click", e => {
      const fs = e.target.closest("[data-fs]");
      if (fs) { P.set("fontScale", Math.min(160, Math.max(80, P.get("fontScale") + Number(fs.dataset.fs)))); fill(); }
      if (e.target.id === "setClose") close();
      if (e.target.id === "setReset") { P.reset(); M.Nav.refresh(); fill(); }
    });
    panel().addEventListener("change", e => {
      const map = { setWidth: "width", setTheme: "theme", setLang: "lang" };
      if (!map[e.target.id]) return;
      P.set(map[e.target.id], e.target.value);
      if (e.target.id === "setLang") M.Nav.refresh();
      fill();
    });
  }
  M.Settings = { init, toggle, close, refresh: () => { if (isOpen()) fill(); } };
})(window.MOOC = window.MOOC || {});
