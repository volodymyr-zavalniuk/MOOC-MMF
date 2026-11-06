/* Small fixed course used only by tests.html. */
window.COURSE = {
  id: "test-course", title: "Test course", passingScore: 60,
  modules: [
    { id: "m1", title: "Module one",
      lessons: [
        { id: "l1", title: "Alpha lesson", body: "<p>The alpha particle and the beta ray.</p>", activities: [
          { id: "a1", type: "quiz", title: "Alpha check", contributesToTotal: false, questions: [
            { id: "q1", type: "single", prompt: "Pick B", options: ["A", "B"], answer: 1, explanation: "B" },
            { id: "q2", type: "multiple", prompt: "Pick A and C", options: ["A", "B", "C"], answer: [0, 2], explanation: "AC" },
            { id: "q3", type: "numeric", prompt: "Two", answer: 2, tolerance: 0.01, explanation: "2" } ] } ] },
        { id: "l2", title: "Beta lesson", body: "<p>Only beta here.</p>{{plot:p1}}", plots: [{ id: "p1", title: "Line", x: { label: "x", min: 0, max: 1 }, y: { min: 0, max: 4 }, params: [{ name: "a", label: "a", min: 1, max: 3, value: 2, step: 1 }], curves: [{ label: "ax", expr: "a*x" }] }] } ],
      assessment: { id: "s1", type: "quiz", title: "Module test", contributesToTotal: true, weight: 40, questions: [{ id: "x1", type: "single", prompt: "?", options: ["a"], answer: 0, explanation: "" }] } },
    { id: "m2", title: "Module two", lessons: [{ id: "l3", title: "Gamma lesson", body: "<p>Gamma.</p>" }] }
  ],
  finalAssessment: { id: "f", type: "quiz", title: "Final", contributesToTotal: true, weight: 60, questions: [{ id: "y1", type: "single", prompt: "?", options: ["a"], answer: 0, explanation: "" }] }
};
