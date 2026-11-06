/* mathjax-loader.js - loads MathJax from engine/vendor/mathjax (offline copy) first, then from the CDN.
   If both fail, MOOC.mathFailed is set and the interface shows a notice. See DESIGN_GUIDELINES for installing the local copy. */
(function () {
  "use strict";
  const M = (window.MOOC = window.MOOC || {});
  window.MathJax = {
    tex: { inlineMath: [["\\(", "\\)"], ["$", "$"]], displayMath: [["\\[", "\\]"], ["$$", "$$"]] },
    options: { skipHtmlTags: ["script", "noscript", "style", "textarea", "pre", "code"] }
  };
  const sources = ["engine/vendor/mathjax/es5/tex-mml-chtml.js", "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"];
  let i = 0;
  function next() {
    if (i >= sources.length) { M.mathFailed = true; document.dispatchEvent(new Event("mooc:math-failed")); return; }
    const s = document.createElement("script");
    s.async = true; s.src = sources[i++]; s.onerror = next;
    document.head.appendChild(s);
  }
  next();
})();
