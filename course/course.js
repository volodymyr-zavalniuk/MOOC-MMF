/* course.js - Foundations of Mathematical Physics. DRAFT: Module 1 only.
   Source text: V. M. Adamyan, M. Ya. Sushko, "Introduction to Mathematical Physics", 2nd ed., Odesa: Astroprint, 2025, Chapter 1.
   Authoring helpers below only shorten the data; the course itself is plain data. */
const single = (id, prompt, options, answer, explanation) => ({ id, type: "single", prompt, options, answer, explanation });
const multiple = (id, prompt, options, answer, explanation) => ({ id, type: "multiple", prompt, options, answer, explanation });
const numeric = (id, prompt, unit, answer, tolerance, explanation) => ({ id, type: "numeric", prompt, unit, answer, tolerance, explanation });
const quiz = (id, title, questions) => ({ id, type: "quiz", title, description: "Formative self-check. Results are recorded but do not affect the course score.", contributesToTotal: false, questions });
const book = (sec, pages) => `<div class="callout"><strong>Textbook:</strong> Adamyan &amp; Sushko, <em>Introduction to Mathematical Physics</em>, §${sec} (printed pp. ${pages}). Exercises and review questions are at the end of the section.</div>`;

window.COURSE = {
  id: "foundations-math-physics",
  brand: "Open Science",
  title: "Foundations of Mathematical Physics",
  description: "Partial differential equations of physics, built from physical principles: heat conduction, Green's functions, potentials and harmonic functions.",
  passingScore: 60,
  modules: [
    {
      id: "heat-conduction",
      title: "Module 1. Heat conduction in systems with distributed parameters",
      lessons: [
        {
          id: "heat-equation", title: "1.1 The heat equation", estimatedMinutes: 30, basePath: "materials/module01/Lesson1.1/",
          body: `${book("1.1", "10–15")}
            <p>The temperature of a non-uniformly heated body changes through <strong>conduction</strong>, convection and radiation. Conduction is energy transfer caused by atomic and molecular interactions and the motion of free electrons, without macroscopic transport of matter and without macroscopic work. Heat always flows from hotter to colder regions.</p>
            <p>On macroscopic scales the process is described by one scalar field \\(T(\\mathbf r,t)\\), continuous together with at least its first derivatives.</p>
            <h2>Heat balance</h2>
            <p>Take a region \\(V\\) with boundary \\(S\\) and outward normal \\(\\mathbf n\\). Let \\(c\\) be the specific heat, \\(\\rho\\) the density, \\(\\mathbf j\\) the heat flux density and \\(F\\) the power density of sources. The heat that changes the temperature is the heat entering through \\(S\\) plus the heat released inside:</p>
            <p>\\[\\int_V c\\rho\\,\\frac{\\partial T}{\\partial t}\\,dV=-\\oint_S \\mathbf j\\cdot\\mathbf n\\,dS+\\int_V F\\,dV\\]</p>
            <p>The Gauss–Ostrogradsky theorem replaces the surface integral by \\(\\int_V \\operatorname{div}\\mathbf j\\,dV\\). Because \\(V\\) is arbitrary, the integrands must be equal:</p>
            <p>\\[c\\rho\\,\\frac{\\partial T}{\\partial t}=-\\operatorname{div}\\mathbf j+F\\]</p>
            <h2>Fourier's law and the heat equation</h2>
            <p>\\[\\mathbf j=-k\\,\\nabla T,\\qquad k>0\\]</p>
            <p>The minus sign is the second law of thermodynamics: spontaneous heat flow goes from hot to cold. Substitution gives the heat equation</p>
            <p>\\[c\\rho\\,\\frac{\\partial T}{\\partial t}=\\operatorname{div}(k\\nabla T)+F(\\mathbf r,t)\\]</p>
            <h2>Special cases</h2>
            <ul>
              <li><strong>Linear equation.</strong> It is linear in \\(T\\) when \\(c,\\rho,k\\) do not depend on temperature (away from phase transitions, over modest temperature ranges) and \\(F\\) is independent of \\(T\\) or linear in it.</li>
              <li><strong>Homogeneous isotropic medium.</strong> \\[\\frac{\\partial T}{\\partial t}=a^2\\Delta T+f,\\qquad a^2=\\frac{k}{c\\rho},\\quad f=\\frac{F}{c\\rho}\\] where \\(a^2\\) is the thermal diffusivity.</li>
              <li><strong>No sources.</strong> \\(\\partial T/\\partial t=a^2\\Delta T\\) (the homogeneous equation).</li>
              <li><strong>Anisotropic medium.</strong> \\(j_i=-\\sum_l k_{il}\\,\\partial T/\\partial x_l\\), where the conductivity matrix \\((k_{il})\\) is non-negative definite (thermodynamics of irreversible processes).</li>
            </ul>
            <p><strong>Exercises:</strong> show that the linear equation keeps its form under \\(\\tilde T=\\alpha T+T_0\\) (textbook 1.1.1); derive the one- and two-dimensional equations (1.1.4).</p>`,
          resources: [{ title: "Heat equation (Wikipedia)", description: "Overview and further references", url: "https://en.wikipedia.org/wiki/Heat_equation" }],
          downloads: [{ title: "Textbook: Chapter 1 (Ukrainian)", description: "Main text of this module", file: "{{docs}}Adamyan_Sushko_MMF.pdf" }],
          activities: [quiz("heat-equation-check", "Check: heat equation", [
            single("a1", "What does the minus sign in Fourier's law express?", ["Conservation of energy", "The second law of thermodynamics", "Isotropy of the medium", "Linearity of the equation"], 1, "Spontaneous heat flow goes from hotter to colder regions, a consequence of the second law."),
            single("a2", "For a homogeneous isotropic medium, the thermal diffusivity is", ["\\(a^2=c\\rho/k\\)", "\\(a^2=k/(c\\rho)\\)", "\\(a^2=kc\\rho\\)", "\\(a^2=\\rho/(kc)\\)"], 1, "Dividing \\(c\\rho\\,\\partial_t T=k\\Delta T+F\\) by \\(c\\rho\\) gives \\(a^2=k/(c\\rho)\\).")
          ])]
        },
        {
          id: "cauchy-problem", title: "1.2 Boundary conditions, the Cauchy problem and uniqueness", estimatedMinutes: 40, basePath: "materials/module01/Lesson1.2/",
          body: `${book("1.2", "16–24")}
            <p>The heat equation and the initial temperature \\(T_0(\\mathbf r)\\) are not enough to determine \\(T\\): the body occupies a region \\(\\Omega\\) with boundary \\(S\\), and the physics on \\(S\\) matters.</p>
            <h2>Boundary conditions</h2>
            <ul>
              <li><strong>Dirichlet (first kind):</strong> the temperature is prescribed, \\(T|_S=\\tau(\\mathbf r,t)\\).</li>
              <li><strong>Neumann (second kind):</strong> the heat flux is prescribed, \\(-k\\,\\partial T/\\partial n|_S=\\gamma\\). For an adiabatic (insulated) surface, \\(\\partial T/\\partial n|_S=0\\).</li>
              <li><strong>Robin (third kind):</strong> Newton's law of cooling, \\(k\\,\\partial T/\\partial n+\\alpha T=\\mu\\) with \\(\\mu=\\alpha\\theta\\), where \\(\\theta\\) is the temperature of the environment and \\(\\alpha\\ge 0\\) the heat-exchange coefficient. Neumann is the case \\(\\alpha=0\\); Dirichlet is the limit of strong exchange.</li>
            </ul>
            <h2>Cauchy problem and classical solution</h2>
            <p>Find \\(T\\) that satisfies the equation for \\(t>0\\), a boundary condition on \\(S\\), and \\(T(\\mathbf r,0)=T_0(\\mathbf r)\\). A <em>classical</em> solution is continuous with continuous first derivatives on \\(\\{\\bar\\Omega,t\\ge 0\\}\\), with continuous second spatial derivatives for \\(t>0\\).</p>
            <h2>Maximum and minimum principle</h2>
            <p>If there are no sources in a bounded region on \\([0,t_1]\\), the temperature inside never exceeds the largest value taken at \\(t=0\\) or on \\(S\\), and never drops below the smallest such value:</p>
            <p>\\[T_{\\min}\\le T(\\mathbf r,t)\\le T_{\\max}\\]</p>
            <p>Physically, an interior point cannot become hotter than everything around it without external help, which would contradict the second law. The formal proof uses \\(V=T-\\beta(t'-t)\\) and the structure of the homogeneous equation at a maximum point.</p>
            <h2>Uniqueness</h2>
            <p><strong>Theorem 1.2.1.</strong> In a bounded domain with a Dirichlet condition, the Cauchy problem has at most one classical solution. <em>Idea:</em> the difference of two solutions solves the homogeneous problem with zero data; by the maximum and minimum principle it is zero.</p>
            <p><strong>Theorem 1.2.2.</strong> In \\(E^3\\) there is at most one classical solution that tends to zero as \\(|\\mathbf r|\\to\\infty\\), uniformly on every bounded time interval.</p>
            <p><strong>Energy method (Robin condition).</strong> For the homogeneous problem with zero data, set \\(J(t)=\\int_\\Omega c\\rho\\,T^2\\,d\\mathbf r\\ge 0\\). Then</p>
            <p>\\[J'(t)=-2\\int_\\Omega k\\,|\\nabla T|^2\\,d\\mathbf r-2\\oint_S \\alpha T^2\\,dS\\le 0\\]</p>
            <p>so \\(0\\le J(t)\\le J(0)=0\\), hence \\(T\\equiv 0\\).</p>`,
          resources: [{ title: "Robin boundary condition (Wikipedia)", description: "Boundary condition types", url: "https://en.wikipedia.org/wiki/Robin_boundary_condition" }],
          activities: [quiz("cauchy-check", "Check: boundary conditions and uniqueness", [
            single("b1", "Which condition describes a perfectly insulated surface?", ["\\(T|_S=0\\)", "\\(\\partial T/\\partial n|_S=0\\)", "\\(T|_S=\\theta\\)", "\\(\\partial T/\\partial t|_S=0\\)"], 1, "No heat crosses the surface, so the normal derivative (flux) vanishes: a Neumann condition."),
            single("b2", "In a bounded region without sources, the temperature at an interior point at \\(t>0\\)", ["can exceed all earlier and boundary values", "stays between the minimum and maximum of the initial and boundary values", "always equals the boundary value", "is always the mean of the initial values"], 1, "This is the maximum/minimum principle, a consequence of the second law.")
          ])]
        },
        {
          id: "invariance", title: "1.3 Invariance of the heat equation", estimatedMinutes: 25, basePath: "materials/module01/Lesson1.3/",
          body: `${book("1.3", "24–29")}
            <p>Changing units or the frame of reference can alter the form of the equation, change only its coefficients, or leave it unchanged.</p>
            <h2>A moving medium</h2>
            <p>Let the medium move with constant velocity \\(\\mathbf v\\). In the co-moving frame the temperature obeys \\(\\partial T/\\partial t=a^2\\Delta T\\) (Galilean relativity). A fixed thermometer at \\(\\mathbf r\\) reads the temperature of the particle that was at \\(\\mathbf r-\\mathbf v t\\) at the start, so \\(\\tilde T(\\mathbf r,t)=T(\\mathbf r-\\mathbf v t,t)\\), and in the fixed frame</p>
            <p>\\[\\frac{\\partial T}{\\partial t}+\\mathbf v\\cdot\\nabla T=a^2\\Delta T+f\\]</p>
            <p>The term \\(\\mathbf v\\cdot\\nabla T\\) is the transport of heat by the flow. With variable coefficients and sources: \\(c\\rho\\,(\\partial_t T+\\mathbf v\\cdot\\nabla T)=\\operatorname{div}(k\\nabla T)+F\\) (textbook problem 1.3.1).</p>
            <h2>Scaling</h2>
            <p>For \\(x'=\\lambda x,\\ y'=\\lambda y,\\ z'=\\lambda z,\\ t'=\\mu t\\) the derivatives become \\(\\partial_x=\\lambda\\partial_{x'}\\), \\(\\partial_t=\\mu\\partial_{t'}\\), and the equation keeps its form with</p>
            <p>\\[a'^2=a^2\\,\\frac{\\lambda^2}{\\mu}\\]</p>
            <p>It is therefore invariant exactly when \\(\\mu=\\lambda^2\\).</p>
            <h2>Symmetry transformations</h2>
            <p>The equation \\(\\partial_t u=a^2\\Delta u\\) is invariant under shifts of the origin of coordinates and time, rotations of the axes, and the scaling \\(x'=\\lambda x,\\ t'=\\lambda^2 t\\). Consequently, if \\(u(\\mathbf r,t)\\) is a solution, so is every function obtained from it by such a transformation, for example \\(u(\\lambda\\mathbf r,\\lambda^2 t)\\). The combination \\(r^2/(a^2t)\\) is scale-invariant, which anticipates the form of the fundamental solution in the next lesson.</p>`,
          resources: [], activities: [quiz("invariance-check", "Check: invariance", [
            single("c1", "Under which scaling does \\(\\partial_t u=a^2\\Delta u\\) keep the same \\(a^2\\)?", ["\\(x'=\\lambda x,\\ t'=\\lambda t\\)", "\\(x'=\\lambda x,\\ t'=\\lambda^2 t\\)", "\\(x'=\\lambda x,\\ t'=t/\\lambda\\)", "\\(x'=\\lambda^2 x,\\ t'=\\lambda t\\)"], 1, "\\(a'^2=a^2\\lambda^2/\\mu\\), so \\(\\mu=\\lambda^2\\) is required.")
          ])]
        },
        {
          id: "fundamental-solution", title: "1.4 The fundamental solution and the general solution", estimatedMinutes: 45, basePath: "materials/module01/Lesson1.4/",
          body: `${book("1.4", "29–37")}
            <p>We solve \\(\\partial_t u=a^2\\Delta u+f(\\mathbf r,t)\\) in \\(E^3\\) with \\(u(\\mathbf r,0)=T_0(\\mathbf r)\\).</p>
            <h2>The fundamental solution</h2>
            <p>\\[G(\\mathbf r,t)=\\frac{1}{(4\\pi a^2 t)^{3/2}}\\,\\exp\\!\\Big(-\\frac{r^2}{4a^2t}\\Big),\\quad t>0\\]</p>
            <p>It is positive, solves the homogeneous equation (exercise 1.4.1) and is normalised:</p>
            <p>\\[\\int_{E^3}G(\\mathbf r,t)\\,d\\mathbf r=1\\]</p>
            <p>The integral factorises into three one-dimensional Gaussian integrals, each given by the Poisson integral \\(\\int_{-\\infty}^{\\infty}e^{-x^2}dx=\\sqrt\\pi\\). By invariance under shifts, \\(G(\\mathbf r-\\mathbf r_0,t-t_0)\\) is also a solution; it is called the Green's function.</p>
            <h2>The initial condition is recovered</h2>
            <p><strong>Lemma 1.4.1.</strong> If \\(g\\) is bounded and continuous at \\(\\mathbf r_0\\), then</p>
            <p>\\[\\lim_{t\\downarrow t_0}\\int_{E^3}G(\\mathbf r_0-\\mathbf r',t-t_0)\\,g(\\mathbf r')\\,d\\mathbf r'=g(\\mathbf r_0)\\]</p>
            <p>As \\(t\\to t_0\\) the kernel concentrates at \\(\\mathbf r_0\\) while keeping unit integral. Split the integral at \\(|\\mathbf r'-\\mathbf r_0|=\\delta\\): the outer part tends to zero, the inner part tends to \\(g(\\mathbf r_0)\\).</p>
            <h2>The general solution</h2>
            <p>Green's formula \\(\\int(v\\Delta u-u\\Delta v)\\,d\\mathbf r=0\\) (Lemma 1.4.2, for suitably decaying functions), applied to \\(T\\) and \\(G\\) and integrated over time, gives for bounded \\(T_0\\) the unique bounded solution with bounded first and second derivatives:</p>
            <p>\\[T(\\mathbf r,t)=\\int_{E^3}G(\\mathbf r-\\mathbf r',t)\\,T_0(\\mathbf r')\\,d\\mathbf r'+\\int_0^t\\!d\\tau\\int_{E^3}G(\\mathbf r-\\mathbf r',t-\\tau)\\,f(\\mathbf r',\\tau)\\,d\\mathbf r'\\]</p>
            <p>The first term carries the initial temperature, the second the sources.</p>
            <p><strong>Exercise 1.4.6:</strong> find the solution for \\(T_0(\\mathbf r)=T_0e^{-\\alpha r^2}\\) using the semigroup property \\(\\int G(\\mathbf r-\\mathbf r',t)\\,G(\\mathbf r',t')\\,d\\mathbf r'=G(\\mathbf r,t+t')\\) (exercise 1.4.5).</p>`,
          resources: [{ title: "Fundamental solution (Wikipedia)", description: "Fundamental solutions and the heat kernel", url: "https://en.wikipedia.org/wiki/Fundamental_solution" }],
          activities: [quiz("fundamental-check", "Check: fundamental solution", [
            single("d1", "What is \\(\\int_{E^3}G(\\mathbf r,t)\\,d\\mathbf r\\) for every \\(t>0\\)?", ["0", "1", "\\(4\\pi a^2t\\)", "It depends on \\(t\\)"], 1, "\\(G\\) is a normalised Gaussian; the integral equals 1 at all times."),
            single("d2", "As \\(t\\downarrow 0\\), \\(G(\\mathbf r-\\mathbf r',t)\\) acts on a continuous bounded \\(g\\) like", ["multiplication by zero", "evaluation of \\(g\\) at \\(\\mathbf r\\)", "differentiation of \\(g\\)", "the mean of \\(g\\) over all space"], 1, "Lemma 1.4.1: the kernel becomes a delta function.")
          ])]
        },
        {
          id: "green-meaning", title: "1.5 Physical meaning of the Green's function", estimatedMinutes: 30, basePath: "materials/module01/Lesson1.5/",
          body: `${book("1.5", "37–42")}
            <p>For a homogeneous medium without sources, the solution is \\(T(\\mathbf r,t)=\\int G(\\mathbf r-\\mathbf r',t-t_0)\\,T_0(\\mathbf r')\\,d\\mathbf r'\\). The product \\(c\\rho\\,T_0(\\mathbf r')\\) is the initial energy density, so \\(G\\) weights the contribution of each point.</p>
            <h2>Response to a unit of heat</h2>
            <p>Suppose the medium is at zero temperature and an amount of heat \\(Q_0\\) is injected instantly into a tiny neighbourhood of \\(\\mathbf r_0\\) at time \\(t_0\\). Then</p>
            <p>\\[T(\\mathbf r,t)=\\frac{Q_0}{c\\rho}\\,G(\\mathbf r-\\mathbf r_0,\\,t-t_0)\\]</p>
            <p>The Green's function (with the factor \\(c\\rho\\) in the homogeneous case) is the temperature response to one unit of heat released at a point and at an instant. In other fields such functions are called propagators, influence functions or response functions. For inhomogeneous media a symmetric \\(G_0(\\mathbf r,\\mathbf r';t-t_0)\\) exists with the same meaning, and \\(T=\\int G_0\\,c\\rho\\,T_0\\,d\\mathbf r'\\).</p>
            <h2>Superposition</h2>
            <p>The equation is linear, so the response to several causes is the sum of the individual responses: \\(T=\\sum_i T_i\\). Heat injected at several points gives \\(T(\\mathbf r,t)=\\sum_i\\frac{Q_i}{c\\rho}G(\\mathbf r-\\mathbf r_i,t-t_0)\\), and in the limit of a continuous distribution the integral formulas of lesson 1.4.</p>
            <h2>Sources and Duhamel's principle</h2>
            <p>Sources of power density \\(F\\) release \\(F\\,dV\\,d\\tau\\) in a small volume during \\([\\tau,\\tau+d\\tau]\\). Each such pulse acts as an instantaneous initial condition \\(f(\\mathbf r,\\tau)\\). Hence</p>
            <p>\\[T(\\mathbf r,t)=\\int_0^t \\tilde T(\\mathbf r,t;\\tau)\\,d\\tau\\]</p>
            <p>where \\(\\tilde T(\\cdot,\\cdot;\\tau)\\) solves the <em>homogeneous</em> equation for \\(t>\\tau\\) with \\(\\tilde T(\\mathbf r,\\tau;\\tau)=f(\\mathbf r,\\tau)\\). This is the Duhamel integral for the heat equation.</p>
            <h2>Worked example (exercise 1.5.1)</h2>
            <p>At \\(t=0\\) the heat \\(Q_0\\) is released at the origin. At a fixed distance \\(r\\), \\(T\\propto t^{-3/2}e^{-r^2/(4a^2t)}\\). Setting the derivative to zero gives \\(-\\frac{3}{2t}+\\frac{r^2}{4a^2t^2}=0\\), so the maximum occurs at</p>
            <p>\\[t_*=\\frac{r^2}{6a^2},\\qquad T_{\\max}=\\frac{Q_0}{c\\rho}\\Big(\\frac{2\\pi e\\,r^2}{3}\\Big)^{-3/2}\\]</p>`,
          resources: [{ title: "Green's function (Wikipedia)", description: "Green's functions in physics", url: "https://en.wikipedia.org/wiki/Green%27s_function" }, { title: "Duhamel's principle (Wikipedia)", description: "Inhomogeneous equations from homogeneous ones", url: "https://en.wikipedia.org/wiki/Duhamel%27s_principle" }],
          activities: [quiz("green-check", "Check: Green's function", [
            numeric("e1", "Heat is released at a point at \\(t=0\\). With \\(a^2=10^{-4}\\ \\mathrm{m^2/s}\\), at what time does the temperature at distance \\(r=0.06\\) m peak?", "s", 6, 0.05, "\\(t_*=r^2/(6a^2)=0.0036/(6\\cdot10^{-4})=6\\) s.")
          ])]
        },
        {
          id: "steady-state", title: "1.6 Steady-state temperature and the Newtonian potential", estimatedMinutes: 30, basePath: "materials/module01/Lesson1.6/",
          body: `${book("1.6", "43–46")}
            <p>For an integrable initial temperature, the term \\(\\int G\\,T_0\\) is bounded by \\((4\\pi a^2t)^{-3/2}\\int|T_0|\\,d\\mathbf r\\to0\\). As \\(t\\to\\infty\\) only the sources matter.</p>
            <h2>Time-independent sources</h2>
            <p>If \\(F(\\mathbf r)\\) is integrable and does not depend on time, substituting \\(\\sigma=1/(4a^2(t-t'))\\) into the source term gives the limit</p>
            <p>\\[T_\\infty(\\mathbf r)=\\frac{1}{4\\pi k}\\int_{E^3}\\frac{F(\\mathbf r')}{|\\mathbf r-\\mathbf r'|}\\,d\\mathbf r'\\]</p>
            <p>This is the <strong>Newtonian (thermal) potential</strong>. It follows from \\(\\int_0^\\infty G(\\mathbf R,\\tau)\\,d\\tau=1/(4\\pi a^2R)\\) and \\(a^2c\\rho=k\\). The stationary solution satisfies the <strong>Poisson equation</strong></p>
            <p>\\[-k\\,\\Delta T=F\\]</p>
            <p>which also governs electrostatic and gravitational potentials. If \\(F=O(r^{-2-\\varepsilon})\\), the potential is twice differentiable and decays at least as \\(1/r\\); if \\(F\\) vanishes outside a bounded region, \\(T_\\infty\\approx P/(4\\pi k r)\\) at large \\(r\\), where \\(P\\) is the total power.</p>
            <h2>Worked example (exercise 1.6.1)</h2>
            <p>A uniform source \\(F=q\\) fills a ball of radius \\(R\\). Using spherical symmetry and continuity of \\(T\\) and \\(T'\\) at \\(r=R\\):</p>
            <p>\\[T=\\frac{q\\,(3R^2-r^2)}{6k}\\ (r<R),\\qquad T=\\frac{qR^3}{3k\\,r}\\ (r>R)\\]</p>`,
          resources: [{ title: "Newtonian potential (Wikipedia)", description: "Potentials and Poisson's equation", url: "https://en.wikipedia.org/wiki/Newtonian_potential" }],
          activities: [quiz("steady-check", "Check: steady state", [
            single("f1", "A point source of total power \\(P\\) heats an unbounded medium. The steady temperature at distance \\(r\\) is", ["\\(P/(4\\pi k r^2)\\)", "\\(P/(4\\pi k r)\\)", "\\(Pk/(4\\pi r)\\)", "\\(P/(k r)\\)"], 1, "The Newtonian potential of a point source: \\(T=P/(4\\pi k r)\\).")
          ])]
        },
        {
          id: "harmonic-functions", title: "1.7 Harmonic functions and the Poisson equation", estimatedMinutes: 45, basePath: "materials/module01/Lesson1.7/",
          body: `${book("1.7", "46–53")}
            <p>A function is <strong>harmonic</strong> in a region if it is twice continuously differentiable there and \\(\\Delta u=0\\) (Laplace equation).</p>
            <h2>Key results</h2>
            <ul>
              <li><strong>Lemma 1.7.1.</strong> If \\(\\Delta u=-f\\) and \\(f<0\\) at an interior point, \\(u\\) has no maximum there (at a maximum \\(\\partial^2u/\\partial x_i^2\\le0\\), so \\(\\Delta u\\le0\\)). The same holds with \\(f>0\\) for minima.</li>
              <li><strong>Maximum principle (Theorem 1.7.1).</strong> A harmonic function continuous on \\(\\bar\\Omega\\) takes inside \\(\\Omega\\) values between its minimum and maximum on \\(S\\). Proof: apply the lemma to \\(v=u+\\eta|\\mathbf r-\\mathbf r_0|^2\\) with small \\(\\eta>0\\).</li>
              <li><strong>Corollary 1.7.1.</strong> A function harmonic in all of \\(E^3\\) and tending to zero at infinity is identically zero. Hence the Poisson equation has <em>at most one</em> solution that decays at infinity, and the Newtonian potential is that solution.</li>
              <li><strong>Gauss's theorem.</strong> \\(\\oint_S\\partial u/\\partial n\\,dS=0\\) for \\(u\\) harmonic in the interior (Green's formula with \\(v\\equiv1\\)).</li>
              <li><strong>Mean value theorem.</strong> If \\(u\\) is harmonic in a region containing the ball \\(|\\mathbf r-\\mathbf r_0|\\le R\\), then \\[u(\\mathbf r_0)=\\frac{1}{4\\pi R^2}\\oint_{|\\mathbf r-\\mathbf r_0|=R}u\\,dS\\] Consequently an interior maximum or minimum can occur only if \\(u\\) is constant.</li>
            </ul>
            <h2>Earnshaw's theorem</h2>
            <p>The potential \\(\\varphi\\) of all other charges (or masses) is harmonic where there are no charges. A harmonic function has no strict interior minimum, so a point charge placed in the field of others cannot sit at a strict minimum of potential energy \\(q\\varphi\\): a static configuration of Coulomb (or Newtonian) point charges is never stable (exercise 1.7.3).</p>
            <h2>Newtonian potential solves Poisson</h2>
            <p><strong>Lemma 1.7.2.</strong> For every twice continuously differentiable function \\(\\psi\\) vanishing outside a bounded region, \\(\\psi(\\mathbf r)=-\\frac{1}{4\\pi}\\int\\frac{\\Delta'\\psi(\\mathbf r')}{|\\mathbf r-\\mathbf r'|}\\,d\\mathbf r'\\). Multiplying by \\(F\\), integrating and exchanging the order of integration shows that \\(T_\\infty\\) satisfies \\(k\\Delta T+F=0\\).</p>`,
          resources: [{ title: "Harmonic function (Wikipedia)", description: "Mean value property and maximum principle", url: "https://en.wikipedia.org/wiki/Harmonic_function" }, { title: "Earnshaw's theorem (Wikipedia)", description: "Instability of static charge configurations", url: "https://en.wikipedia.org/wiki/Earnshaw%27s_theorem" }],
          activities: [quiz("harmonic-check", "Check: harmonic functions", [
            single("g1", "If \\(u\\) is harmonic in a region containing a ball, the value of \\(u\\) at the centre equals", ["the maximum of \\(u\\) on the sphere", "the average of \\(u\\) over the sphere", "the integral of \\(u\\) over the ball", "zero"], 1, "This is the mean value theorem."),
            single("g2", "A function harmonic in all of \\(E^3\\) and tending to zero at infinity is", ["a Newtonian potential", "identically zero", "any constant", "not necessarily bounded"], 1, "By the maximum principle on large balls it must vanish.")
          ])]
        },
        {
          id: "forced-oscillations", title: "1.8 Forced thermal oscillations and the Helmholtz equation", estimatedMinutes: 45, basePath: "materials/module01/Lesson1.8/",
          body: `${book("1.8", "53–59")}
            <p>Let the sources oscillate harmonically: \\(F(\\mathbf r,t)=F_0(\\mathbf r)\\cos(\\omega t-\\varphi(\\mathbf r))=\\operatorname{Re}\\big[\\tilde F_0(\\mathbf r)e^{-i\\omega t}\\big]\\), \\(\\tilde F_0=F_0e^{i\\varphi}\\). After a transient, the temperature oscillates at the same frequency:</p>
            <p>\\[T(\\mathbf r,t)\\to\\operatorname{Re}\\big[A(\\mathbf r)\\,e^{-i\\omega t}\\big]=|A|\\cos(\\omega t-\\arg A)\\]</p>
            <h2>The Helmholtz equation</h2>
            <p>Substituting into \\(\\partial_t T=a^2\\Delta T+f\\) gives an equation for the complex amplitude:</p>
            <p>\\[-\\Delta A-\\frac{i\\omega}{a^2}A=\\frac{1}{k}\\tilde F_0\\]</p>
            <p>This is a case of the inhomogeneous Helmholtz equation \\(-\\Delta u-zu=f\\) with \\(z=i\\omega/a^2\\). For complex or negative \\(z\\) the unique solution (in the class of functions growing at most as a power of \\(r\\)) is</p>
            <p>\\[u(\\mathbf r)=\\int G_z(\\mathbf r-\\mathbf r')\\,f(\\mathbf r')\\,d\\mathbf r',\\qquad G_z(\\mathbf r)=\\frac{e^{i\\sqrt z\\,r}}{4\\pi r},\\ \\ \\operatorname{Im}\\sqrt z>0\\]</p>
            <p>The Helmholtz equation generalises Poisson's equation (\\(z=0\\)). Formally, \\(G_z\\) is the kernel of the operator inverse to \\(-\\Delta-z\\), and two such kernels are related by the Hilbert identity (exercise 1.8.2).</p>
            <h2>Spherical thermal wave</h2>
            <p>A point source of power \\(q\\,\\cos\\omega t\\) at the origin gives, with \\(\\kappa=\\sqrt{\\omega/(2a^2)}\\),</p>
            <p>\\[T(r,t)=\\frac{q\\,e^{-\\kappa r}}{4\\pi k\\,r}\\cos(\\omega t-\\kappa r)\\]</p>
            <p>The wave is attenuated over the length \\(1/\\kappa=a\\sqrt{2/\\omega}\\) and lags in phase by \\(\\kappa r\\). Slower oscillations penetrate deeper.</p>
            <p><strong>Exercises:</strong> 1.8.3 (spherical source with phase \\(\\pi/2\\)); 1.8.4 (a thin heated layer).</p>`,
          resources: [{ title: "Helmholtz equation (Wikipedia)", description: "Properties and Green's functions", url: "https://en.wikipedia.org/wiki/Helmholtz_equation" }],
          activities: [quiz("forced-check", "Check: thermal waves", [
            numeric("h1", "A point source oscillates with \\(\\omega=2\\ \\mathrm{s^{-1}}\\) in a medium with \\(a^2=10^{-4}\\ \\mathrm{m^2/s}\\). What is the attenuation length \\(1/\\kappa\\)?", "cm", 1, 0.02, "\\(1/\\kappa=\\sqrt{2a^2/\\omega}=\\sqrt{10^{-4}}=0.01\\) m = 1 cm.")
          ])]
        }
      ],
      /* weight 100 while this is the only module: rebalance when more modules and a final assessment are added */
      assessment: {
        id: "heat-conduction-assessment", type: "quiz", title: "Module 1 assessment",
        description: "Summative assessment covering lessons 1.1 to 1.8.", contributesToTotal: true, weight: 100,
        questions: [
          single("m1", "Which condition makes the heat equation linear?", ["\\(c,\\rho,k\\) independent of \\(T\\) and \\(F\\) independent of or linear in \\(T\\)", "\\(k\\) proportional to \\(T\\)", "\\(F\\) quadratic in \\(T\\)", "The medium must be moving"], 0, "Linearity requires the coefficients not to depend on \\(T\\) and the source term to be at most linear in \\(T\\)."),
          single("m2", "In a medium moving with velocity \\(\\mathbf v\\), the source-free equation is", ["\\(\\partial_t T=a^2\\Delta T\\)", "\\(\\partial_t T+\\mathbf v\\cdot\\nabla T=a^2\\Delta T\\)", "\\(\\partial_t T=a^2\\Delta T+T\\,\\mathbf v\\)", "\\(\\partial_t T=\\mathbf v\\cdot\\nabla T\\)"], 1, "Heat is transported with the flow in addition to being conducted."),
          numeric("m3", "Under \\(x'=\\lambda x,\\ t'=\\mu t\\) with \\(\\lambda=3\\) and \\(\\mu=18\\), by what factor is \\(a^2\\) multiplied?", "", 0.5, 0.001, "\\(a'^2/a^2=\\lambda^2/\\mu=9/18=0.5\\)."),
          single("m4", "Which statement about \\(G(\\mathbf r,t)=(4\\pi a^2t)^{-3/2}e^{-r^2/(4a^2t)}\\) is false?", ["It is positive", "It solves the homogeneous heat equation for \\(t>0\\)", "Its integral over \\(E^3\\) equals \\(t\\)", "It tends to a delta function as \\(t\\downarrow0\\)"], 2, "The integral is 1 for all \\(t>0\\)."),
          numeric("m5", "Heat is released at a point at \\(t=0\\). With \\(a^2=2.4\\cdot10^{-4}\\ \\mathrm{m^2/s}\\), when does the temperature at \\(r=0.12\\) m peak?", "s", 10, 0.1, "\\(t_*=r^2/(6a^2)=0.0144/0.00144=10\\) s."),
          single("m6", "For \\(-k\\Delta T=F\\) with \\(F\\) integrable and decaying fast enough, the solution that decays at infinity is", ["\\(\\displaystyle\\frac{1}{4\\pi k}\\int\\frac{F(\\mathbf r')}{|\\mathbf r-\\mathbf r'|}d\\mathbf r'\\)", "\\(\\displaystyle\\frac{k}{4\\pi}\\int F(\\mathbf r')|\\mathbf r-\\mathbf r'|\\,d\\mathbf r'\\)", "\\(\\displaystyle\\int G(\\mathbf r-\\mathbf r',t)F(\\mathbf r')\\,d\\mathbf r'\\)", "\\(\\displaystyle\\frac{F}{k}\\)"], 0, "This is the Newtonian potential."),
          multiple("m7", "Which statements about harmonic functions are true?", ["They satisfy \\(\\Delta u=0\\)", "The value at a centre equals the mean over any sphere in the region", "They can have a strict maximum inside the region", "Harmonic on \\(E^3\\) and vanishing at infinity implies identically zero"], [0, 1, 3], "Strict interior extrema are excluded by the maximum principle."),
          numeric("m8", "A harmonic source with \\(\\omega=2\\ \\mathrm{s^{-1}}\\) acts in a medium with \\(a^2=4\\cdot10^{-4}\\ \\mathrm{m^2/s}\\). Find the attenuation length of the thermal wave.", "cm", 2, 0.02, "\\(1/\\kappa=\\sqrt{2a^2/\\omega}=\\sqrt{4\\cdot10^{-4}}=0.02\\) m = 2 cm.")
        ]
      }
    }
  ],
  finalAssessment: null   // added when the remaining modules are written
};
