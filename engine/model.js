/* model.js - read-only helpers over the course definition (window.COURSE) plus validation. */
(function (M) {
  "use strict";
  M.course = window.COURSE;
  const C = () => M.course;
  const lessons = () => C().modules.flatMap(m => m.lessons.map(l => ({ ...l, moduleId: m.id, moduleTitle: m.title })));
  const assessments = () => [
    ...C().modules.filter(m => m.assessment).map(m => ({ ...m.assessment, moduleId: m.id, moduleTitle: m.title })),
    ...(C().finalAssessment ? [{ ...C().finalAssessment, moduleId: "final", moduleTitle: "Final assessment" }] : [])
  ];
  const activities = () => lessons().flatMap(l => (l.activities || []).map(a => ({ ...a, lessonId: l.id, moduleId: l.moduleId })));
  const byId = (list, id) => list.find(x => x.id === id) || null;

  /* Returns a list of human-readable problems in the course definition (shown on the overview page). */
  function validate() {
    const problems = [], seen = new Set();
    const unique = (id, what) => {
      if (!id) problems.push(`A ${what} has no id`);
      else if (seen.has(id)) problems.push(`Duplicate id "${id}" (${what})`);
      seen.add(id);
    };
    const checkQuiz = quiz => {
      const ids = new Set();
      (quiz.questions || []).forEach(q => {
        if (ids.has(q.id)) problems.push(`Duplicate question id "${q.id}" in "${quiz.id}"`);
        ids.add(q.id);
        const t = M.Quiz.types[q.type];
        if (!t) problems.push(`Unknown question type "${q.type}" in question "${q.id}"`);
        else if (t.validate) { const msg = t.validate(q); if (msg) problems.push(`Question "${q.id}": ${msg}`); }
      });
    };
    C().modules.forEach(m => {
      unique(m.id, "module");
      m.lessons.forEach(l => {
        unique(l.id, "lesson");
        (l.activities || []).forEach(a => { unique(a.id, "activity"); checkQuiz(a); });
      });
      if (m.assessment) { unique(m.assessment.id, "assessment"); checkQuiz(m.assessment); }
    });
    if (C().finalAssessment) { unique(C().finalAssessment.id, "final assessment"); checkQuiz(C().finalAssessment); }
    const w = assessments().filter(a => a.contributesToTotal).reduce((s, a) => s + (a.weight || 0), 0);
    if (w && w !== 100) problems.push(`Summative weights add up to ${w}, not 100 (the score is still normalised).`);
    return problems;
  }

  /* Linear course order used by the previous/next buttons:
     lesson, its activities, ..., module assessment, ..., final assessment. */
  function sequence() {
    const s = [];
    C().modules.forEach(m => {
      m.lessons.forEach(l => {
        s.push({ type: "lesson", id: l.id, title: l.title });
        (l.activities || []).forEach(a => s.push({ type: "activity", id: a.id, title: a.title }));
      });
      if (m.assessment) s.push({ type: "assessment", id: m.assessment.id, title: m.assessment.title });
    });
    if (C().finalAssessment) s.push({ type: "assessment", id: C().finalAssessment.id, title: C().finalAssessment.title });
    return s;
  }

  M.Model = {
    lessons, assessments, activities, validate, sequence,
    findLesson: id => byId(lessons(), id),
    findActivity: id => byId(activities(), id),
    findAssessment: id => byId(assessments(), id)
  };
})(window.MOOC = window.MOOC || {});
