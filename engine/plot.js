/* plot.js - interactive plots for lessons: a safe expression compiler, an SVG renderer and slider controls.
   A plot is plain data in lesson.plots (see DESIGN_GUIDELINES, "Interactive plots") and is placed with {{plot:id}} in the lesson body.
   Formulas are strings parsed here: course files never contain executable code. */
(function (M) {
  "use strict";
  const t = M.t, esc = M.Render.esc;
  const nul = o => Object.assign(Object.create(null), o);

  /* ---------- expression compiler ---------- */
  const erf = x => {   // Abramowitz-Stegun 7.1.26, error < 1.5e-7
    const a = Math.abs(x), k = 1 / (1 + 0.3275911 * a);
    return Math.sign(x) * (1 - (((((1.061405429 * k - 1.453152027) * k) + 1.421413741) * k - 0.284496736) * k + 0.254829592) * k * Math.exp(-a * a));
  };
  const FUNCS = nul({ sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2, exp: Math.exp, ln: Math.log, log10: Math.log10,
    sqrt: Math.sqrt, abs: Math.abs, min: Math.min, max: Math.max, pow: Math.pow, floor: Math.floor, ceil: Math.ceil, sign: Math.sign, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, erf, erfc: x => 1 - erf(x) });
  const CONST = nul({ pi: Math.PI, e: Math.E, nan: NaN });
  const RESERVED = new Set([...Object.keys(FUNCS), ...Object.keys(CONST), "if", "sum"]);
  const BP = { "<": 1, ">": 1, "<=": 1, ">=": 1, "==": 1, "!=": 1, "+": 2, "-": 2, "*": 3, "/": 3, "^": 5 };
  const OPS = { "<": (a, b) => +(a < b), ">": (a, b) => +(a > b), "<=": (a, b) => +(a <= b), ">=": (a, b) => +(a >= b), "==": (a, b) => +(a === b), "!=": (a, b) => +(a !== b),
    "+": (a, b) => a + b, "-": (a, b) => a - b, "*": (a, b) => a * b, "/": (a, b) => a / b, "^": Math.pow };

  /* compile(src) -> { fn(env) -> number, vars: Set of free names }. Throws Error with a readable message. */
  function compile(src) {
    src = String(src);
    const toks = [], re = /\s*(?:(\d+\.?\d*(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?)|([A-Za-z_]\w*)|(<=|>=|==|!=|[-+*\/^(),<>]))/y;
    for (let pos = 0; /\S/.test(src.slice(pos));) {
      re.lastIndex = pos;
      const m = re.exec(src);
      if (!m) throw new Error(`unexpected character near “${src.slice(pos).trim().slice(0, 8)}” in “${src}”`);
      toks.push(m[1] !== undefined ? { n: parseFloat(m[1]) } : m[2] !== undefined ? { id: m[2] } : { op: m[3] });
      pos = re.lastIndex;
    }
    let i = 0;
    const vars = new Set(), bound = new Set();
    const need = op => { const k = toks[i++]; if (!k || k.op !== op) throw new Error(`expected “${op}” in “${src}”`); };

    function expr(min) {
      let left = nud();
      while (toks[i] && toks[i].op in BP && BP[toks[i].op] > min) {
        const op = toks[i++].op, rhs = expr(op === "^" ? 4 : BP[op]), f = OPS[op], l = left;
        left = env => f(l(env), rhs(env));
      }
      return left;
    }
    function nud() {
      const k = toks[i++];
      if (!k) throw new Error(`unexpected end of “${src}”`);
      if (k.n !== undefined) return () => k.n;
      if (k.op === "(") { const e = expr(0); need(")"); return e; }
      if (k.op === "-") { const e = expr(4); return env => -e(env); }
      if (k.op === "+") return expr(4);
      if (!k.id) throw new Error(`unexpected “${k.op}” in “${src}”`);
      const name = k.id;
      if (toks[i] && toks[i].op === "(") { i++; return call(name); }
      if (name in CONST) { const c = CONST[name]; return () => c; }
      if (!bound.has(name)) vars.add(name);
      return env => (name in env ? env[name] : NaN);
    }
    function call(name) {
      if (name === "sum") {   // sum(k, from, to, body)
        const v = toks[i++];
        if (!v || !v.id) throw new Error(`sum needs a variable name in “${src}”`);
        need(","); const from = expr(0); need(","); const to = expr(0); need(",");
        const had = bound.has(v.id); bound.add(v.id);
        const body = expr(0); need(")");
        if (!had) bound.delete(v.id);
        return env => {
          const lo = Math.round(from(env)), hi = Math.min(Math.round(to(env)), lo + 2000), sub = Object.create(env);
          let s = 0;
          for (let k = lo; k <= hi; k++) { sub[v.id] = k; s += body(sub); }
          return s;
        };
      }
      const args = [];
      if (toks[i] && toks[i].op === ")") i++;
      else for (;;) {
        args.push(expr(0));
        const k = toks[i++];
        if (k && k.op === ")") break;
        if (!k || k.op !== ",") throw new Error(`expected “,” or “)” in “${src}”`);
      }
      if (name === "if") {
        if (args.length !== 3) throw new Error(`if needs 3 arguments in “${src}”`);
        return env => (args[0](env) ? args[1](env) : args[2](env));
      }
      const f = FUNCS[name];
      if (!f) throw new Error(`unknown function “${name}” in “${src}”`);
      if (args.length === 1) { const a = args[0]; return env => f(a(env)); }
      return env => f(...args.map(a => a(env)));
    }
    const fn = expr(0);
    if (i < toks.length) throw new Error(`unexpected “${toks[i].op || toks[i].id || toks[i].n}” in “${src}”`);
    return { fn, vars };
  }
  const cache = new Map();
  const compiled = src => { const key = String(src); let c = cache.get(key); if (!c) { c = compile(key); cache.set(key, c); } return c; };

  /* ---------- validation (messages are for authors, in English) ---------- */
  function check(spec) {
    const out = [], id = spec && spec.id;
    if (!id) return ["A plot has no id"];
    const w = m => out.push(`Plot “${id}”: ${m}`);
    const xv = (spec.x && spec.x.var) || "x", params = spec.params || [], defs = spec.defs || {};
    const pnames = new Set(params.map(p => p.name)), pOnly = new Set([...pnames, ...Object.keys(defs)]), known = new Set([xv, ...pOnly]);
    params.forEach(p => {
      if (!/^[A-Za-z_]\w*$/.test(p.name || "") || RESERVED.has(p.name) || p.name === xv) w(`bad parameter name “${p.name}”`);
      if (!(p.min < p.max)) w(`parameter “${p.name}” needs min < max`);
      if (p.value !== undefined && (p.value < p.min || p.value > p.max)) w(`parameter “${p.name}”: value is outside min..max`);
      if (p.scale === "log" && !(p.min > 0)) w(`log parameter “${p.name}” needs min > 0`);
    });
    const test = (src, allowed, what) => {
      try { compile(src).vars.forEach(v => { if (!allowed.has(v)) w(`${what}: unknown name “${v}”`); }); } catch (e) { w(`${what}: ${e.message}`); }
    };
    if (!spec.x || spec.x.min === undefined || spec.x.max === undefined) w("x needs min and max");
    [["x.min", spec.x && spec.x.min], ["x.max", spec.x && spec.x.max], ["y.min", spec.y && spec.y.min], ["y.max", spec.y && spec.y.max]]
      .forEach(([what, v]) => { if (typeof v === "string") test(v, pOnly, what); });
    Object.entries(defs).forEach(([k, v]) => test(v, pOnly, `def “${k}”`));
    if (!(spec.curves || []).length) w("no curves");
    (spec.curves || []).forEach((c, k) => test(c.expr, known, `curve ${k + 1}`));
    (spec.markers || []).forEach((m, k) => test(m.x, pOnly, `marker ${k + 1}`));
    if (spec.animate && !pnames.has(spec.animate)) w(`animate refers to unknown parameter “${spec.animate}”`);
    return out;
  }

  /* ---------- numbers, ticks, parameters ---------- */
  const fmt = v => {
    if (!Number.isFinite(v)) return "–";
    if (v === 0) return "0";
    const a = Math.abs(v);
    return a >= 1e5 || a < 1e-3 ? v.toExponential(1).replace(".0e", "e").replace("e+", "e") : String(+v.toPrecision(4));
  };
  function ticks(lo, hi, n) {
    const span = hi - lo;
    if (!(span > 0)) return [lo];
    const raw = span / n, mag = Math.pow(10, Math.floor(Math.log10(raw))), norm = raw / mag;
    const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag, out = [];
    for (let v = Math.ceil(lo / step - 1e-9) * step, k = 0; v <= hi + step * 1e-9 && k < 50; v += step, k++) out.push(+v.toPrecision(12));
    return out;
  }
  const defaults = spec => {
    const v = {};
    (spec.params || []).forEach(p => { v[p.name] = p.value !== undefined ? p.value : (p.scale === "log" ? Math.sqrt(p.min * p.max) : (p.min + p.max) / 2); });
    return v;
  };
  const isLog = p => p.scale === "log";
  const toInput = (p, v) => (isLog(p) ? Math.round(Math.log(v / p.min) / Math.log(p.max / p.min) * 1000) : v);
  const fromInput = (p, raw) => +(isLog(p) ? p.min * Math.pow(p.max / p.min, Number(raw) / 1000) : Number(raw)).toPrecision(10);
  const inputAttrs = p => (isLog(p) ? 'min="0" max="1000" step="1"' : `min="${p.min}" max="${p.max}" step="${p.step || (p.max - p.min) / 200}"`);

  /* ---------- evaluation and drawing ---------- */
  function evalPlot(spec, values) {
    const xv = (spec.x && spec.x.var) || "x", env = nul(values);
    Object.entries(spec.defs || {}).forEach(([k, src]) => { env[k] = compiled(src).fn(env); });
    const num = v => (v === undefined ? undefined : typeof v === "number" ? v : compiled(v).fn(env));
    const x0 = num(spec.x.min), x1 = num(spec.x.max), n = spec.samples || 400;
    if (!(x1 > x0)) throw new Error("x.max must be greater than x.min");
    const xs = Array.from({ length: n + 1 }, (_, k) => x0 + (x1 - x0) * k / n);
    const curves = (spec.curves || []).map(c => { const f = compiled(c.expr).fn; return { c, ys: xs.map(x => { env[xv] = x; return f(env); }) }; });
    const markers = (spec.markers || []).map(m => ({ label: m.label, x: compiled(m.x).fn(env) }));
    return { env, xv, x0, x1, xs, curves, markers, num };
  }

  const W = 640, H = 360, ML = 60, MR = 16, MT = 16, MB = 44, PW = W - ML - MR, PH = H - MT - MB;
  function build(spec, data, pinned, lock, uid) {
    const { xs, x0, x1, curves, markers, num } = data;
    let lo = Infinity, hi = -Infinity;
    [...curves.map(c => c.ys), ...pinned.map(p => p.ys)].forEach(ys => { for (const v of ys) if (Number.isFinite(v)) { if (v < lo) lo = v; if (v > hi) hi = v; } });
    if (!Number.isFinite(lo)) { lo = 0; hi = 1; }
    if (!(spec.y && spec.y.zero === false)) { if (lo > 0) lo = 0; if (hi < 0) hi = 0; }
    if (hi === lo) { hi += 1; lo -= 1; }
    const pad = (hi - lo) * 0.06; hi += pad; if (lo < 0) lo -= pad;
    const fixLo = spec.y && num(spec.y.min), fixHi = spec.y && num(spec.y.max);
    let y0 = fixLo !== undefined ? fixLo : lo, y1 = fixHi !== undefined ? fixHi : hi;
    if (lock && fixLo === undefined && fixHi === undefined) [y0, y1] = lock;
    if (!(y1 > y0)) y1 = y0 + 1;
    const sx = x => ML + (x - x0) / (x1 - x0) * PW, sy = y => MT + (1 - (y - y0) / (y1 - y0)) * PH;
    const path = (px, ys) => {
      let d = "", pen = false;
      for (let k = 0; k < px.length; k++) {
        const y = ys[k];
        if (!Number.isFinite(y)) { pen = false; continue; }
        d += (pen ? "L" : "M") + sx(px[k]).toFixed(1) + " " + Math.max(-1e4, Math.min(1e4, sy(y))).toFixed(1); pen = true;
      }
      return d;
    };
    const cls = (c, k) => `pl-curve pl-c${(c.color ?? k) % 6}${c.style === "dashed" ? " pl-dash" : ""}`;
    let s = `<defs><clipPath id="plc${uid}"><rect x="${ML}" y="${MT}" width="${PW}" height="${PH}"/></clipPath></defs>`;
    ticks(y0, y1, 6).forEach(v => { const y = sy(v).toFixed(1); s += `<line class="pl-grid" x1="${ML}" x2="${ML + PW}" y1="${y}" y2="${y}"/><text class="pl-tick" x="${ML - 6}" y="${+y + 4}" text-anchor="end">${fmt(v)}</text>`; });
    ticks(x0, x1, 7).forEach(v => { const x = sx(v).toFixed(1); s += `<line class="pl-grid" x1="${x}" x2="${x}" y1="${MT}" y2="${MT + PH}"/><text class="pl-tick" x="${x}" y="${MT + PH + 18}" text-anchor="middle">${fmt(v)}</text>`; });
    s += `<rect class="pl-frame" x="${ML}" y="${MT}" width="${PW}" height="${PH}"/><g clip-path="url(#plc${uid})">`;
    pinned.forEach(p => { s += `<path class="pl-curve pl-pin pl-c${p.k % 6}" d="${path(p.xs, p.ys)}"/>`; });
    const inRange = m => Number.isFinite(m.x) && m.x >= x0 && m.x <= x1;
    markers.filter(inRange).forEach(m => { s += `<line class="pl-marker" x1="${sx(m.x).toFixed(1)}" x2="${sx(m.x).toFixed(1)}" y1="${MT}" y2="${MT + PH}"/>`; });
    curves.forEach((c, k) => { s += `<path class="${cls(c.c, k)}" d="${path(xs, c.ys)}"/>`; });
    s += "</g>";
    markers.filter(inRange).forEach(m => { s += `<text class="pl-tick" x="${(sx(m.x) + 4).toFixed(1)}" y="${MT + 13}">${esc(m.label || "")}</text>`; });
    s += `<text class="pl-label" x="${ML + PW / 2}" y="${H - 6}" text-anchor="middle">${esc((spec.x && spec.x.label) || "x")}</text>`;
    s += `<text class="pl-label" transform="rotate(-90)" x="${-(MT + PH / 2)}" y="16" text-anchor="middle">${esc((spec.y && spec.y.label) || "")}</text>`;
    let ly = MT + 18;
    curves.forEach((c, k) => {
      if (!c.c.label) return;
      const xr = ML + PW - 8;
      s += `<line class="${cls(c.c, k)}" x1="${xr - 24}" x2="${xr}" y1="${ly - 4}" y2="${ly - 4}"/><text class="pl-legend" x="${xr - 30}" y="${ly}" text-anchor="end">${esc(c.c.label)}</text>`; ly += 18;
    });
    s += `<line class="pl-cursor" x1="0" x2="0" y1="${MT}" y2="${MT + PH}" style="display:none"/>`;
    return { svg: s, view: { x0, x1, y0, y1 } };
  }
  const plain = s => String(s || "").replace(/<[^>]*>/g, "");
  const wrap = (spec, inner) => `<svg class="plot-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(plain(spec.title))}">${inner}</svg>`;

  /* ---------- interactive plot ---------- */
  const memory = {};   // parameter values and pinned curves per plot id: kept while navigating, never saved
  let uidCounter = 0;

  function mount(slot, spec) {
    const problems = check(spec);
    if (problems.length) { slot.innerHTML = `<div class="callout warn">${esc(problems.join(" "))}</div>`; return; }
    const params = spec.params || [], uid = ++uidCounter;
    const st = memory[spec.id] || (memory[spec.id] = { values: defaults(spec), lock: null, pinned: [] });
    const auto = !(spec.y && (spec.y.min !== undefined || spec.y.max !== undefined));
    slot.innerHTML = `<figure class="plot"><figcaption><strong>${spec.title || ""}</strong>${spec.caption ? `<div class="meta">${spec.caption}</div>` : ""}</figcaption>
      <div class="plot-canvas"></div><div class="plot-readout meta" aria-hidden="true">&nbsp;</div>
      <div class="plot-controls no-print">
        ${params.map((p, k) => `<label class="plot-param"><span>${p.label || esc(p.name)}</span><input type="range" data-p="${k}" ${inputAttrs(p)} aria-label="${esc(plain(p.label || p.name))}"><output></output></label>`).join("")}
        <div class="plot-buttons">${spec.animate ? '<button class="btn" type="button" data-play></button>' : ""}<button class="btn" type="button" data-pin>${t("plot.pin")}</button><button class="btn" type="button" data-clear>${t("plot.clear")}</button><button class="btn" type="button" data-reset>${t("plot.reset")}</button>${auto ? `<label class="plot-lock"><input type="checkbox" data-lock> ${t("plot.lock")}</label>` : ""}</div>
        <div class="plot-pinned meta"></div>
      </div></figure>`;
    const $ = s => slot.querySelector(s), canvas = $(".plot-canvas"), readout = $(".plot-readout"), inputs = Array.from(slot.querySelectorAll("[data-p]"));
    let view = null, raf = null;

    const sync = () => inputs.forEach((inp, k) => { inp.value = toInput(params[k], st.values[params[k].name]); });
    function draw() {
      try {
        const data = evalPlot(spec, st.values), b = build(spec, data, st.pinned, st.lock, uid);
        canvas.innerHTML = wrap(spec, b.svg);
        view = { ...b.view, data };
        slot.querySelectorAll("output").forEach((o, k) => { o.textContent = fmt(st.values[params[k].name]); });
        const lk = $("[data-lock]"); if (lk) lk.checked = !!st.lock;
        $(".plot-pinned").textContent = st.pinned.length ? t("plot.pinned") + " " + st.pinned.map(p => p.desc).filter(Boolean).join(" | ") : "";
      } catch (e) { view = null; canvas.innerHTML = `<div class="callout warn">${esc(t("plot.error", { id: spec.id, msg: e.message }))}</div>`; }
    }
    function pin() {
      if (!view) return;
      const desc = params.map(p => (p.short || p.name) + "=" + fmt(st.values[p.name])).join(", ");
      let first = true;
      view.data.curves.forEach((c, k) => { if (c.c.style !== "dashed") { st.pinned.push({ xs: view.data.xs, ys: c.ys, k: c.c.color ?? k, desc: first ? desc : "" }); first = false; } });
      st.pinned = st.pinned.slice(-8); draw();
    }
    const setBtn = () => { const b = $("[data-play]"); if (b) b.textContent = raf ? "⏸ " + t("plot.pause") : "▶ " + t("plot.play"); };
    function stop() { if (raf) cancelAnimationFrame(raf); raf = null; setBtn(); }
    function play() {
      const k = params.findIndex(p => p.name === spec.animate), p = params[k], inp = inputs[k];
      const lo = Number(inp.min), span = Number(inp.max) - lo, dur = (spec.animateSeconds || 6) * 1000;
      let from = (Number(inp.value) - lo) / span; if (from >= 0.995) from = 0;
      const t0 = performance.now();
      const frame = now => {
        if (!slot.isConnected) { raf = null; return; }
        const pos = Math.min(1, from + (now - t0) / dur);
        inp.value = lo + pos * span; st.values[p.name] = fromInput(p, inp.value); draw();
        if (pos >= 1) { raf = null; setBtn(); } else raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame); setBtn();
    }
    function leave() { const cur = canvas.querySelector(".pl-cursor"); if (cur) cur.style.display = "none"; readout.innerHTML = "&nbsp;"; }

    slot.addEventListener("input", e => {
      const k = e.target.dataset && e.target.dataset.p;
      if (k === undefined) return;
      st.values[params[k].name] = fromInput(params[k], e.target.value); draw();
    });
    slot.addEventListener("change", e => { if (e.target.hasAttribute && e.target.hasAttribute("data-lock")) { st.lock = e.target.checked && view ? [view.y0, view.y1] : null; draw(); } });
    slot.addEventListener("click", e => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.hasAttribute("data-play")) { if (raf) stop(); else play(); }
      else if (b.hasAttribute("data-pin")) pin();
      else if (b.hasAttribute("data-clear")) { st.pinned = []; draw(); }
      else if (b.hasAttribute("data-reset")) { stop(); st.values = defaults(spec); st.pinned = []; st.lock = null; sync(); draw(); }
    });
    canvas.addEventListener("pointermove", e => {
      const svg = canvas.querySelector("svg");
      if (!svg || !view) return;
      const r = svg.getBoundingClientRect(), px = (e.clientX - r.left) / r.width * W;
      if (px < ML || px > ML + PW) return leave();
      const x = view.x0 + (px - ML) / PW * (view.x1 - view.x0), env = nul(view.data.env);
      env[view.data.xv] = x;
      const cur = svg.querySelector(".pl-cursor"); cur.setAttribute("x1", px); cur.setAttribute("x2", px); cur.style.display = "";
      readout.textContent = ((spec.x && spec.x.label) || view.data.xv) + " = " + fmt(x) + view.data.curves.map(c => (c.c.label ? " · " + c.c.label + " = " + fmt(compiled(c.c.expr).fn(env)) : "")).join("");
    });
    canvas.addEventListener("pointerleave", leave);
    sync(); draw(); setBtn();
  }

  /* ---------- static output for the exported HTML ---------- */
  function snapshot(spec) {
    try { return wrap(spec, build(spec, evalPlot(spec, defaults(spec)), [], null, "s" + (++uidCounter)).svg); } catch (e) { return ""; }
  }
  const figure = spec => `<figure class="plot"><figcaption><strong>${spec.title || ""}</strong>${spec.caption ? `<div>${spec.caption}</div>` : ""}</figcaption>${snapshot(spec)}<p><em>${esc(t("plot.staticNote"))}</em></p></figure>`;
  const exportCSS = ".plot{margin:1.5em 0}.plot-svg{width:100%;height:auto}.pl-grid{stroke:#ddd}.pl-frame{fill:none;stroke:#888}.pl-tick{fill:#555;font-size:13px}.pl-label,.pl-legend{fill:#111;font-size:14px}.pl-curve{fill:none;stroke-width:2.4}.pl-dash{stroke-dasharray:6 4}.pl-marker{stroke:#888;stroke-dasharray:3 3}.pl-cursor{display:none}.pl-c0{stroke:#2457c5}.pl-c1{stroke:#d9480f}.pl-c2{stroke:#2b8a3e}.pl-c3{stroke:#862e9c}.pl-c4{stroke:#c92a2a}.pl-c5{stroke:#0b7285}";

  M.Plot = { compile, compiled, check, mount, snapshot, figure, exportCSS, defaults, fmt, ticks };
})(window.MOOC = window.MOOC || {});
