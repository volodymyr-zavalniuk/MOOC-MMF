/* prefs.js - reader preferences (panel visibility, font size, width, theme, language).
   Stored separately from progress, under one key for all courses, so "Reset progress" never touches them. */
(function (M) {
  "use strict";
  const KEY = "mooc_prefs";
  const DEFAULTS = { sidebar: true, fontScale: 100, width: "normal", theme: "auto", lang: "auto" };
  const WIDTHS = { narrow: "720px", normal: "920px", wide: "1200px" };
  const root = document.documentElement;
  let prefs = { ...DEFAULTS };
  const P = {
    defaults: DEFAULTS,
    load() { prefs = { ...DEFAULTS, ...(M.Storage.read(KEY) || {}) }; P.apply(); },
    get: k => prefs[k],
    set(k, v) { prefs[k] = v; M.Storage.write(KEY, prefs); P.apply(); },
    reset() { prefs = { ...DEFAULTS }; M.Storage.remove(KEY); P.apply(); },
    language() {
      if (prefs.lang !== "auto") return prefs.lang;
      return (navigator.language || "en").toLowerCase().startsWith("uk") ? "uk" : "en";
    },
    apply() {
      root.style.setProperty("--fs", prefs.fontScale / 100);
      root.style.setProperty("--content-w", WIDTHS[prefs.width] || WIDTHS.normal);
      root.dataset.theme = prefs.theme;
      root.classList.toggle("nav-collapsed", !prefs.sidebar);
      root.lang = P.language();
    }
  };
  M.Prefs = P;
})(window.MOOC = window.MOOC || {});
