/* progress.js - learner state: completed lessons, best quiz results, score, last location, export/import.
   Saved data is migrated (MIGRATIONS) and cleaned of ids that no longer exist in the course (prune). */
(function (M) {
  "use strict";
  const t = M.t;
  const VERSION = 2;
  /* MIGRATIONS[n] converts a state of schema n into schema n+1. When the schema changes: bump VERSION and add an entry. */
  const MIGRATIONS = {
    1: s => ({ version: 2, courseId: s.courseId, completedLessons: s.completedLessons || [], quizResults: s.quizResults || {}, lastLocation: s.lastLocation || null, updatedAt: s.updatedAt || Date.now() })
  };
  function migrate(s, version = VERSION, table = MIGRATIONS) {
    if (!s || typeof s !== "object") return null;
    let cur = s, guard = 0;
    while (cur.version < version && table[cur.version] && guard++ < 50) cur = table[cur.version](cur);
    return cur.version === version ? cur : null;
  }
  const key = () => "mooc_progress_" + M.course.id.replace(/[^\w-]/g, "_");
  const empty = () => ({ version: VERSION, courseId: M.course.id, completedLessons: [], quizResults: {}, lastLocation: null, updatedAt: Date.now() });
  const accept = s => { const m = migrate(s); return m && m.courseId === M.course.id ? m : null; };
  const listeners = [];
  let state = empty();

  /* Drops ids of lessons/quizzes that were removed from the course, and a last location that no longer exists. */
  function prune() {
    const lessonIds = new Set(M.Model.lessons().map(l => l.id));
    const quizIds = new Set([...M.Model.activities(), ...M.Model.assessments()].map(q => q.id));
    const snap = () => JSON.stringify([state.completedLessons, Object.keys(state.quizResults), state.lastLocation]);
    const before = snap();
    state.completedLessons = [...new Set(state.completedLessons.filter(id => lessonIds.has(id)))];
    Object.keys(state.quizResults).forEach(id => { if (!quizIds.has(id)) delete state.quizResults[id]; });
    if (state.lastLocation && !M.Model.exists(state.lastLocation.type, state.lastLocation.id)) state.lastLocation = null;
    return snap() !== before;
  }

  const P = {
    persisted: true,
    migrate,
    load() {
      state = accept(M.Storage.read(key())) || empty();
      P.persisted = M.Storage.persistent;
      if (prune()) P.save();
    },
    save() {
      state.updatedAt = Date.now();
      const ok = M.Storage.write(key(), state);
      P.persisted = ok && M.Storage.persistent;
      listeners.forEach(f => f());
      return ok;
    },
    onChange(fn) { listeners.push(fn); },

    isLessonDone: id => state.completedLessons.includes(id),
    completedCount: () => state.completedLessons.length,
    completeLesson(id) { if (!P.isLessonDone(id)) { state.completedLessons.push(id); P.save(); } },
    percent() { const n = M.Model.lessons().length; return n ? Math.round(state.completedLessons.length / n * 100) : 0; },
    nextLesson: () => M.Model.lessons().find(l => !state.completedLessons.includes(l.id)) || null,

    result: id => state.quizResults[id] || null,
    recordQuiz(id, correct, total) {
      const pct = total ? Math.round(correct / total * 100) : 0, old = state.quizResults[id];
      const best = (!old || pct >= old.percentage) ? { percentage: pct, correct, total } : { percentage: old.percentage, correct: old.correct, total: old.total };
      state.quizResults[id] = { ...best, latestPercentage: pct, attempts: (old ? old.attempts : 0) + 1, completedAt: Date.now() };
      P.save();
      return state.quizResults[id];
    },
    /* Weighted average of the best results of summative assessments; null until one has been attempted. */
    totalScore() {
      const items = M.Model.assessments().filter(a => a.contributesToTotal);
      if (!items.some(a => state.quizResults[a.id])) return null;
      const possible = items.reduce((s, a) => s + (a.weight || 0), 0);
      const got = items.reduce((s, a) => s + (state.quizResults[a.id] ? state.quizResults[a.id].percentage * (a.weight || 0) : 0), 0);
      return possible ? Math.round(got / possible) : null;
    },
    passed() { const s = P.totalScore(); return s === null ? null : s >= (M.course.passingScore || 0); },

    lastLocation: () => state.lastLocation,
    setLocation(loc) { state.lastLocation = loc; P.save(); },

    exportJSON: () => JSON.stringify(state, null, 2),
    importJSON(text) {
      const s = accept(JSON.parse(text));
      if (!s) throw new Error(t("progress.badFile"));
      state = s; prune(); P.save();
    },
    reset() { M.Storage.remove(key()); state = empty(); P.save(); }
  };
  M.Progress = P;
})(window.MOOC = window.MOOC || {});
