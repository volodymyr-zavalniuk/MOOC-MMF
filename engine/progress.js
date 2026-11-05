/* progress.js - learner state: completed lessons, best quiz results, score, last location, export/import. */
(function (M) {
  "use strict";
  const VERSION = 2;
  const key = () => "mooc_progress_" + M.course.id.replace(/[^\w-]/g, "_");
  const empty = () => ({ version: VERSION, courseId: M.course.id, completedLessons: [], quizResults: {}, lastLocation: null, updatedAt: Date.now() });
  const valid = s => !!s && s.version === VERSION && s.courseId === M.course.id;
  const listeners = [];
  let state = null;

  const P = {
    load() { const s = M.Storage.read(key()); state = valid(s) ? s : empty(); },
    save() { state.updatedAt = Date.now(); const ok = M.Storage.write(key(), state); listeners.forEach(f => f()); return ok; },
    onChange(fn) { listeners.push(fn); },

    /* Progress = completed lessons (not quizzes). */
    isLessonDone: id => state.completedLessons.includes(id),
    completedCount: () => state.completedLessons.length,
    completeLesson(id) { if (!P.isLessonDone(id)) { state.completedLessons.push(id); P.save(); } },
    percent() { const n = M.Model.lessons().length; return n ? Math.round(state.completedLessons.length / n * 100) : 0; },

    /* Quizzes: keep the best result and the number of attempts. */
    result: id => state.quizResults[id] || null,
    recordQuiz(id, correct, total) {
      const pct = total ? Math.round(correct / total * 100) : 0, old = state.quizResults[id];
      const best = (!old || pct >= old.percentage) ? { percentage: pct, correct, total } : { percentage: old.percentage, correct: old.correct, total: old.total };
      state.quizResults[id] = { ...best, latestPercentage: pct, attempts: (old ? old.attempts : 0) + 1, completedAt: Date.now() };
      P.save();
      return state.quizResults[id];
    },

    /* Overall score = weighted average of best results of summative assessments. Null until one is attempted. */
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
      const s = JSON.parse(text);
      if (!valid(s)) throw new Error("This file does not contain progress for this course.");
      state = s; P.save();
    },
    reset() { M.Storage.remove(key()); state = empty(); P.save(); }
  };
  M.Progress = P;
})(window.MOOC = window.MOOC || {});
