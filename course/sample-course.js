/* course.js - the ONLY file an author needs to edit. Plain data, no engine code.
   Placeholders in lesson bodies: {{base}} (lesson folder), {{images}} (common_images/), {{docs}} (common_documents/).
   Question types: single {options, answer:index} | multiple {options, answer:[indexes]} | numeric {answer, tolerance, unit}.
   Remember to escape backslashes in LaTeX inside template strings: \\[ ... \\] and \\( ... \\). */
window.COURSE = {
  id: "intro-natural-sciences",     // used as the storage key; change it and learners start from zero
  brand: "Open Science",
  title: "Introduction to Natural Sciences",
  description: "An example course demonstrating the structure and capabilities of the learning engine.",
  passingScore: 60,
  modules: [
    {
      id: "foundations",
      title: "Scientific foundations",
      lessons: [
        {
          id: "measurement",
          title: "Measurement and physical quantities",
          estimatedMinutes: 15,
          basePath: "materials/module01/Lesson1.1/",
          body: `
            <p>Physics describes natural phenomena using measurable quantities. A physical quantity is expressed as a numerical value and a unit.</p>
            <div class="callout"><strong>Example:</strong> A distance of 12 metres is represented by a numerical value (12) and a unit (metre).</div>
            <h2>SI units</h2>
            <p>The International System of Units (SI) defines seven base units. Examples include metre (m), kilogram (kg), second (s), and ampere (A).</p>
            <h2>Derived quantities</h2>
            <p>Velocity is the ratio of displacement to elapsed time:</p>
            <p>\\[v=\\frac{\\Delta x}{\\Delta t}\\]</p>
            <p>If an object travels 100 metres in 20 seconds, its average speed is:</p>
            <p>\\[v=\\frac{100\\;\\mathrm{m}}{20\\;\\mathrm{s}}=5\\;\\mathrm{m/s}\\]</p>
            <p>Always include units when reporting a physical result.</p>`,
          resources: [
            { title: "SI Brochure (BIPM)", description: "Official reference for the International System of Units", url: "https://www.bipm.org/en/publications/si-brochure" },
            { title: "NIST Guide to SI", description: "A practical reference on SI units", url: "https://www.nist.gov/pml/owm/metric-si/si-units" }
          ],
          downloads: [
            { title: "SI base units cheat sheet", description: "Text file stored in this lesson's folder", file: "si-units-cheatsheet.txt" }
          ],
          activities: [
            { id: "measurement-check", type: "quiz", title: "Knowledge check", description: "A short formative check.", contributesToTotal: false,
              questions: [
                { id: "q1", type: "single", prompt: "Which SI base unit is used to measure time?", options: ["metre (m)", "second (s)", "kilogram (kg)", "newton (N)"], answer: 1, explanation: "The second (s) is the SI base unit of time." },
                { id: "q2", type: "numeric", prompt: "An object travels 60 m in 12 s. What is its average speed?", unit: "m/s", answer: 5, tolerance: 0.01, explanation: "Average speed is distance divided by time: 60/12 = 5 m/s." }
              ] }
          ]
        },
        {
          id: "energy",
          title: "Energy and work",
          estimatedMinutes: 20,
          basePath: "materials/module01/Lesson1.2/",
          body: `
            <p>Energy is a scalar physical quantity associated with the ability of a system to produce changes or perform work.</p>
            <h2>Kinetic energy</h2>
            <p>For an object of mass \\(m\\) moving at speed \\(v\\), kinetic energy is:</p>
            <p>\\[E_k=\\frac{1}{2}mv^2\\]</p>
            <h2>Gravitational potential energy</h2>
            <p>Near Earth's surface, the change in gravitational potential energy is:</p>
            <p>\\[\\Delta E_p=mg\\Delta h\\]</p>
            <p>Here, \\(g\\) is the gravitational acceleration and \\(\\Delta h\\) is the change in height.</p>`,
          resources: [
            { title: "OpenStax University Physics, Volume 1", description: "Open textbook covering mechanics and energy", url: "https://openstax.org/details/books/university-physics-volume-1" }
          ],
          activities: []
        }
      ],
      assessment: {
        id: "foundations-assessment", type: "quiz", title: "Scientific foundations assessment",
        description: "A larger assessment for this module.", contributesToTotal: true, weight: 25,
        questions: [
          { id: "fa1", type: "single", prompt: "What is the SI unit of force?", options: ["joule", "watt", "newton", "pascal"], answer: 2, explanation: "Force is measured in newtons (N)." },
          { id: "fa2", type: "single", prompt: "Which expression represents kinetic energy?", options: ["mv", "½mv²", "mgh", "F/A"], answer: 1, explanation: "Kinetic energy is one half of mass multiplied by speed squared." }
        ]
      }
    },
    {
      id: "waves",
      title: "Waves and oscillations",
      lessons: [
        {
          id: "wave-basics",
          title: "Introduction to waves",
          estimatedMinutes: 18,
          basePath: "materials/module02/Lesson2.1/",
          body: `
            <p>A wave is a disturbance that propagates through space and time, transferring energy and momentum.</p>
            <p>The relationship between wave speed, frequency and wavelength is:</p>
            <p>\\[v=f\\lambda\\]</p>
            <p>where \\(v\\) is wave speed, \\(f\\) is frequency and \\(\\lambda\\) is wavelength.</p>`,
          resources: [],
          activities: [
            { id: "wave-check", type: "quiz", title: "Wave quantities", description: "Formative check with a multiple-answer question.", contributesToTotal: false,
              questions: [
                { id: "w1", type: "multiple", prompt: "Which quantities describe a wave?", options: ["Frequency", "Wavelength", "Electric charge of the medium", "Amplitude"], answer: [0, 1, 3], explanation: "Frequency, wavelength and amplitude are wave properties." }
              ] }
          ]
        },
        {
          id: "oscillations",
          title: "Simple harmonic motion",
          estimatedMinutes: 15,
          basePath: "materials/module02/Lesson2.2/",
          body: `
            <p>A mass \\(m\\) on a spring with stiffness \\(k\\) oscillates with period:</p>
            <p>\\[T=2\\pi\\sqrt{\\frac{m}{k}}\\]</p>
            <p>The frequency is the inverse of the period: \\(f=1/T\\).</p>`,
          resources: [],
          activities: []
        }
      ],
      assessment: {
        id: "waves-assessment", type: "quiz", title: "Waves and oscillations assessment",
        description: "Module assessment.", contributesToTotal: true, weight: 25,
        questions: [
          { id: "wa1", type: "numeric", prompt: "A wave travels at 340 m/s with frequency 170 Hz. What is its wavelength?", unit: "m", answer: 2, tolerance: 0.01, explanation: "λ = v/f = 340/170 = 2 m." }
        ]
      }
    }
  ],
  finalAssessment: {
    id: "final-assessment", type: "quiz", title: "Final course assessment",
    description: "The final assessment contributes to the overall course score.", contributesToTotal: true, weight: 50,
    questions: [
      { id: "final1", type: "single", prompt: "A wave has frequency 10 Hz and wavelength 2 m. What is its speed?", options: ["5 m/s", "12 m/s", "20 m/s", "0.2 m/s"], answer: 2, explanation: "v = fλ = 10 × 2 = 20 m/s." }
    ]
  }
};
