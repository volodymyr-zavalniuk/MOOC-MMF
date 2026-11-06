/* tests.js - run by opening tests.html. Uses the stub course; touches only the "test-course" storage key and the prefs key. */
(function () {
  const M = window.MOOC, stub = M.course, results = [];
  const test = (name, fn) => { try { fn(); results.push([name, true]); } catch (e) { results.push([name, false, e.message || String(e)]); } };
  const eq = (a, b, msg) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error((msg || "") + " expected " + JSON.stringify(b) + ", got " + JSON.stringify(a)); };
  const ok = (c, msg) => { if (!c) throw new Error(msg || "assertion failed"); };
  const throws = fn => { try { fn(); } catch (e) { return; } throw new Error("expected an error"); };
  const withForm = (html, fn) => { const f = document.createElement("form"); f.innerHTML = html; document.body.appendChild(f); try { fn(f); } finally { f.remove(); } };
  const q = (id) => stub.modules[0].lessons[0].activities[0].questions.find(x => x.id === id);
  const fresh = () => { M.Progress.reset(); M.Progress.load(); };

  test("sequence: lesson, activity, lesson, module test, lesson, final", () => {
    eq(M.Model.sequence().map(s => s.type + ":" + s.id), ["lesson:l1", "activity:a1", "lesson:l2", "assessment:s1", "lesson:l3", "assessment:f"]);
  });
  test("validate: clean course has no problems", () => eq(M.Model.validate(), []));
  test("validate: finds duplicates, bad answers, unknown types, bad weights", () => {
    const bad = JSON.parse(JSON.stringify(stub));
    bad.modules[0].lessons[1].id = "l1";
    bad.modules[0].lessons[0].activities[0].questions[0].answer = 9;
    bad.modules[0].lessons[0].activities[0].questions[1].type = "nope";
    bad.finalAssessment.weight = 10;
    M.course = bad;
    try { const p = M.Model.validate().join(" | "); ["Duplicate id", "index of an option", "Unknown question type", "weights add up"].forEach(s => ok(p.includes(s), "missing: " + s)); }
    finally { M.course = stub; }
  });
  test("grading: single", () => withForm(M.Quiz.types.single.render(q("q1"), 0), f => {
    f.querySelector('input[value="1"]').checked = true; ok(M.Quiz.types.single.grade(q("q1"), f).correct);
    f.querySelector('input[value="0"]').checked = true; ok(!M.Quiz.types.single.grade(q("q1"), f).correct);
  }));
  test("grading: multiple is all-or-nothing", () => withForm(M.Quiz.types.multiple.render(q("q2"), 1), f => {
    const set = v => f.querySelectorAll("input").forEach(el => { el.checked = v.includes(Number(el.value)); });
    set([0, 2]); ok(M.Quiz.types.multiple.grade(q("q2"), f).correct);
    set([0]); ok(!M.Quiz.types.multiple.grade(q("q2"), f).correct);
    set([0, 1, 2]); ok(!M.Quiz.types.multiple.grade(q("q2"), f).correct);
  }));
  test("grading: numeric accepts decimal comma and tolerance, rejects empty", () => withForm(M.Quiz.types.numeric.render(q("q3"), 2), f => {
    const el = f.querySelector("input"), g = () => M.Quiz.types.numeric.grade(q("q3"), f).correct;
    el.value = "2,005"; ok(g()); el.value = "2.5"; ok(!g()); el.value = ""; ok(!g()); ok(!M.Quiz.types.numeric.answered(q("q3"), f));
  }));
  test("score is null until a summative assessment is attempted", () => { fresh(); eq(M.Progress.totalScore(), null); M.Progress.recordQuiz("a1", 3, 3); eq(M.Progress.totalScore(), null); });
  test("score: weighted average of best results", () => {
    fresh(); M.Progress.recordQuiz("s1", 4, 5); M.Progress.recordQuiz("f", 1, 2);
    eq(M.Progress.totalScore(), 62); eq(M.Progress.passed(), true);
  });
  test("best result is kept and attempts are counted", () => {
    fresh(); M.Progress.recordQuiz("s1", 4, 5); const r = M.Progress.recordQuiz("s1", 1, 5);
    eq([r.percentage, r.latestPercentage, r.attempts, r.correct], [80, 20, 2, 4]);
  });
  test("progress counts lessons, not quizzes", () => { fresh(); M.Progress.recordQuiz("a1", 3, 3); eq(M.Progress.percent(), 0); M.Progress.completeLesson("l1"); eq(M.Progress.percent(), 33); eq(M.Progress.nextLesson().id, "l2"); });
  test("prune drops stale ids and an unknown last location", () => {
    fresh();
    M.Progress.importJSON(JSON.stringify({ version: 2, courseId: "test-course", completedLessons: ["l1", "ghost", "l1"], quizResults: { ghost: { percentage: 5 } }, lastLocation: { type: "lesson", id: "ghost" } }));
    eq(M.Progress.completedCount(), 1); eq(M.Progress.result("ghost"), null); eq(M.Progress.lastLocation(), null);
  });
  test("import rejects progress from another course", () => throws(() => M.Progress.importJSON(JSON.stringify({ version: 2, courseId: "other", completedLessons: [], quizResults: {} }))));
  test("migrate: chains steps, upgrades schema 1, returns null when impossible", () => {
    eq(M.Progress.migrate({ version: 1, courseId: "x", completedLessons: ["a"], completedActivities: [1] }).version, 2);
    eq(M.Progress.migrate({ version: 1 }, 3, { 1: () => ({ version: 2 }), 2: () => ({ version: 3 }) }).version, 3);
    eq(M.Progress.migrate({ version: 7 }), null); eq(M.Progress.migrate(null), null);
  });
  test("storage: write, read, remove", () => { M.Storage.write("test_key", { a: 1 }); eq(M.Storage.read("test_key"), { a: 1 }); M.Storage.remove("test_key"); eq(M.Storage.read("test_key"), null); });
  test("strings: English and Ukrainian define the same keys", () => {
    const a = Object.keys(M.Strings.en).sort(), b = Object.keys(M.Strings.uk).sort();
    eq(a.filter(k => !b.includes(k)), [], "missing in uk"); eq(b.filter(k => !a.includes(k)), [], "extra in uk");
  });
  test("strings: parameters, fallback and language switch", () => {
    eq(M.t("top.score", { value: "5%" }), "Score: 5%"); eq(M.t("no.such.key"), "no.such.key");
    M.Prefs.set("lang", "uk"); ok(M.t("nav.overview") !== M.Strings.en["nav.overview"]); M.Prefs.reset();
  });
  test("prefs: defaults and apply", () => { M.Prefs.reset(); eq(M.Prefs.get("fontScale"), 100); M.Prefs.set("fontScale", 120); eq(document.documentElement.style.getPropertyValue("--fs"), "1.2"); M.Prefs.reset(); });
  test("search: ranks title matches first and finds nothing for nonsense", () => {
    M.Search.reset(); const hits = M.Search.query("alpha"); eq(hits[0].id, "l1"); eq(M.Search.query("beta").map(h => h.id).sort(), ["l1", "l2"]); eq(M.Search.query("zzzz"), []);
  });
  test("export: course HTML contains lessons", () => { const h = M.Export.buildCourseHTML(); ok(h.includes("Alpha lesson") && h.includes("Only beta here")); });
  test("render: esc escapes HTML", () => eq(M.Render.esc('<a href="x">&</a>'), "&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;"));

  /* ---- interactive plots ---- */
  const ev = (src, env) => M.Plot.compile(src).fn(Object.assign(Object.create(null), env || {}));
  test("plot expressions: precedence and associativity", () => {
    eq(ev("-2^2"), -4); eq(ev("2^3^2"), 512); eq(ev("2*-3"), -6); eq(ev("1e-4*2"), 2e-4); eq(ev("10-4-3"), 3); eq(ev("2*(3+4)"), 14); eq(ev("x*2", { x: 3 }), 6);
  });
  test("plot expressions: functions, if, nan, sum, erf", () => {
    eq(ev("if(1<2, 5, 6)"), 5); eq(ev("if(2<=1, 5, 6)"), 6); ok(Number.isNaN(ev("0/0")) && Number.isNaN(ev("nan")));
    eq(ev("sum(k,1,4,k^2)"), 30); eq(ev("max(2,7)+sqrt(16)"), 11); ok(Math.abs(ev("erf(0.5)") - 0.5205) < 1e-3); ok(Math.abs(ev("sin(pi/2)") - 1) < 1e-12);
  });
  test("plot expressions: errors are reported, never executed", () => {
    ["foo(1)", "1+", "2 3", "(1", "alert(1)", "1 $ 2"].forEach(src => throws(() => M.Plot.compile(src)));
    eq(ev("constructor", {}) !== ev("constructor", {}), true);   // unknown names are NaN, not prototype members
  });
  test("plot expressions: free variables exclude sum index and constants", () => eq([...M.Plot.compile("a*x+sum(k,1,3,k)+pi").vars].sort(), ["a", "x"]));
  test("plot check: accepts a valid spec and flags problems", () => {
    eq(M.Plot.check(stub.modules[0].lessons[1].plots[0]), []);
    const bad = { id: "b", x: { min: 0, max: 1 }, params: [{ name: "x", min: 2, max: 1 }, { name: "pi", min: 0, max: 1 }], curves: [{ expr: "q*x" }, { expr: "1+" }], animate: "nope" };
    const p = M.Plot.check(bad).join(" | ");
    ["needs min < max", "bad parameter name", "unknown name “q”", "animate refers"].forEach(m => ok(p.includes(m), "missing: " + m));
  });
  test("validate: unknown plot reference in a lesson body", () => {
    const bad = JSON.parse(JSON.stringify(stub)); bad.modules[0].lessons[0].body += "{{plot:ghost}}";
    M.course = bad; try { ok(M.Model.validate().join(" ").includes('unknown plot "ghost"')); } finally { M.course = stub; }
  });
  test("plot: ticks and snapshot", () => {
    eq(M.Plot.ticks(0, 1, 5), [0, 0.2, 0.4, 0.6, 0.8, 1]); ok(M.Plot.snapshot(stub.modules[0].lessons[1].plots[0]).includes("<path"));
  });
  test("plot: moving a slider redraws; reset restores defaults", () => {
    const slot = document.createElement("div"); document.body.appendChild(slot);
    try {
      M.Plot.mount(slot, stub.modules[0].lessons[1].plots[0]);
      const d = () => slot.querySelector("path.pl-c0").getAttribute("d"), inp = slot.querySelector("[data-p]"), first = d();
      inp.value = 3; inp.dispatchEvent(new Event("input", { bubbles: true }));
      ok(d() !== first, "curve did not change"); eq(slot.querySelector("output").textContent, "3");
      slot.querySelector("[data-reset]").click(); eq(d(), first); eq(slot.querySelector("output").textContent, "2");
    } finally { slot.remove(); }
  });

  M.Progress.reset(); M.Prefs.reset();
  const failed = results.filter(r => !r[1]).length;
  document.getElementById("summary").textContent = failed ? failed + " of " + results.length + " tests failed" : "All " + results.length + " tests passed";
  document.getElementById("summary").className = failed ? "bad" : "good";
  document.getElementById("list").innerHTML = results.map(r => `<li class="${r[1] ? "good" : "bad"}">${r[1] ? "✓" : "✗"} ${r[0]}${r[1] ? "" : " — " + r[2]}</li>`).join("");
})();
