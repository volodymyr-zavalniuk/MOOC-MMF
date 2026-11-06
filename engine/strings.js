/* strings.js - ALL interface text. To add a language: copy the `en` block, translate it, register it in M.Strings,
   and add an <option> in settings.js. Missing keys fall back to English. Course content is not translated here. */
(function (M) {
  "use strict";
  const en = {
    "app.brand": "Open Science",
    "nav.overview": "Course overview", "nav.completion": "Course completion", "nav.summary": "Completion summary",
    "nav.toggle": "Show or hide the course menu", "nav.aria": "Course navigation",
    "pager.activity": "Activity: ", "pager.assessment": "Assessment: ",
    "side.progress": "Course progress", "side.foot": "Your progress is stored in this browser. No account is required.",
    "top.search": "Search the course", "top.settings": "Settings", "top.score": "Score: {value}",
    "crumb.search": "Search", "crumb.summary": "Summary",
    "err.title": "This page could not be displayed", "err.course": "course/course.js did not load. Check the file path and its syntax.",
    "warn.save.title": "Progress is not being saved.",
    "warn.save.memory": "This browser blocks local storage, so progress will be lost when you close the page. Use “Export progress” on the overview page to keep a copy.",
    "warn.save.failed": "The browser refused to store the data (storage may be full). Use “Export progress” on the overview page to keep a copy.",
    "warn.math": "Mathematical formulas could not be loaded and appear as plain LaTeX. Check your internet connection or install a local MathJax copy.",
    "debug.title": "Debug mode.", "debug.ok": "no course definition problems",
    "home.issues": "Course definition issues", "home.progress": "Course progress", "home.lessonsDone": "{done} of {total} lessons completed",
    "home.score": "Overall score", "home.passMark": "Pass mark: {mark}%", "home.passed": "Passed · pass mark: {mark}%", "home.notPassed": "Not yet passed · pass mark: {mark}%",
    "home.modules": "Modules", "home.nLessons": "{n} lessons", "home.contents": "Course contents", "home.min": "{n} min",
    "home.moduleAssessment": "Module assessment:", "home.continue": "Continue: {title}", "home.start": "Start learning",
    "home.allDone": "All lessons completed: open the summary", "home.resume": "Resume where I left off", "home.summary": "Completion summary",
    "home.dataTitle": "Your progress data", "home.dataNote": "Saved in this browser ({backend}). Export a copy to move it to another browser or device.",
    "home.export": "Export progress", "home.import": "Import progress", "home.reset": "Reset progress",
    "home.confirmReset": "Delete all saved progress in this browser?",
    "home.exportCourse": "Export the course content", "home.courseJson": "Course as JSON", "home.courseHtml": "Course as one printable HTML file",
    "notFound": "This page does not exist in the course.",
    "lesson.minutes": "{n} minutes", "lesson.empty": "No lesson content has been added yet.", "lesson.resources": "Learning resources",
    "lesson.downloads": "Downloadable materials", "lesson.activities": "Learning activities", "lesson.open": "Open activity",
    "lesson.markDone": "Mark lesson as completed", "lesson.completed": "Completed ✓", "lesson.markNext": "Mark completed and continue →",
    "progress.badFile": "This file does not contain progress for this course.",
    "quiz.summative": "Summative assessment", "quiz.formative": "Formative activity", "quiz.weight": "Weight: {n}%",
    "quiz.hint": "Use “Check answer” under a question for instant feedback.", "quiz.selectAll": "Select all that apply.",
    "quiz.submit": "Submit answers", "quiz.clear": "Clear answers", "quiz.check": "Check answer", "quiz.tryAgain": "Try again",
    "quiz.result": "Result: {pct}%", "quiz.nCorrect": "{correct} correct answer(s) out of {total}.", "quiz.best": "Best recorded result: {pct}%",
    "quiz.overall": "Overall course score: {pct}%", "quiz.bestRecorded": "Best recorded result: {pct}% ({correct}/{total}) · {attempts} attempt(s)",
    "quiz.correct": "Correct", "quiz.notQuite": "Not quite", "quiz.unanswered": "{n} question(s) have no answer. Submit anyway?",
    "quiz.unsupported": "Unsupported question type: {type}", "quiz.gradeFail": "The quiz could not be graded: {msg}",
    "quiz.correctAnswer": "Correct answer: {value}", "quiz.answerLabel": "Your answer",
    "search.title": "Search", "search.count": "{n} result(s) for “{q}”", "search.none": "Nothing found. Try other words.",
    "search.prompt": "Type a word in the search box above.", "search.type.lesson": "Lesson", "search.type.activity": "Activity", "search.type.assessment": "Assessment",
    "summary.title": "Completion summary", "summary.name": "Name (optional, printed only)", "summary.namePh": "Type your name before printing",
    "summary.nameNote": "The name is not saved anywhere and disappears when you leave this page.",
    "summary.passed": "Passed", "summary.notPassed": "Not yet passed", "summary.lessons": "Lessons", "summary.done": "completed", "summary.todo": "not completed",
    "summary.quizzes": "Activities and assessments", "summary.formative": "formative", "summary.summative": "summative", "summary.attempts": "attempts: {n}",
    "summary.print": "Print or save as PDF",
    "set.title": "Reading settings", "set.fontSize": "Text size", "set.fontDec": "Smaller text", "set.fontInc": "Larger text", "set.width": "Page width",
    "set.narrow": "Narrow", "set.normal": "Normal", "set.wide": "Wide", "set.theme": "Theme", "set.auto": "Automatic", "set.light": "Light", "set.dark": "Dark",
    "set.language": "Interface language", "set.reset": "Restore defaults", "set.close": "Close",
    "plot.play": "Play", "plot.pause": "Pause", "plot.pin": "Pin curve", "plot.clear": "Clear pinned", "plot.reset": "Reset",
    "plot.lock": "Lock vertical scale", "plot.pinned": "Pinned:", "plot.section": "Interactive plots",
    "plot.error": "Plot “{id}” could not be drawn: {msg}", "plot.staticNote": "Static snapshot with default parameters; the interactive version is in the online course."
  };
  const uk = {
    "app.brand": "Open Science",
    "nav.overview": "Огляд курсу", "nav.completion": "Завершення курсу", "nav.summary": "Підсумок проходження",
    "nav.toggle": "Показати або сховати меню курсу", "nav.aria": "Навігація курсом",
    "pager.activity": "Завдання: ", "pager.assessment": "Оцінювання: ",
    "side.progress": "Прогрес курсу", "side.foot": "Ваш прогрес зберігається в цьому браузері. Реєстрація не потрібна.",
    "top.search": "Пошук по курсу", "top.settings": "Налаштування", "top.score": "Результат: {value}",
    "crumb.search": "Пошук", "crumb.summary": "Підсумок",
    "err.title": "Не вдалося показати сторінку", "err.course": "Файл course/course.js не завантажився. Перевірте шлях до файлу та його синтаксис.",
    "warn.save.title": "Прогрес не зберігається.",
    "warn.save.memory": "Браузер блокує локальне сховище, тож прогрес буде втрачено після закриття сторінки. Скористайтеся «Експортувати прогрес» на сторінці огляду, щоб зберегти копію.",
    "warn.save.failed": "Браузер відмовився зберегти дані (можливо, сховище заповнене). Скористайтеся «Експортувати прогрес» на сторінці огляду, щоб зберегти копію.",
    "warn.math": "Не вдалося завантажити математичні формули, тому вони відображаються як текст LaTeX. Перевірте підключення до інтернету або встановіть локальну копію MathJax.",
    "debug.title": "Режим налагодження.", "debug.ok": "проблем в описі курсу не знайдено",
    "home.issues": "Проблеми в описі курсу", "home.progress": "Прогрес курсу", "home.lessonsDone": "Пройдено уроків: {done} з {total}",
    "home.score": "Загальний результат", "home.passMark": "Прохідний бал: {mark}%", "home.passed": "Складено · прохідний бал: {mark}%", "home.notPassed": "Ще не складено · прохідний бал: {mark}%",
    "home.modules": "Модулі", "home.nLessons": "Уроків: {n}", "home.contents": "Зміст курсу", "home.min": "{n} хв",
    "home.moduleAssessment": "Оцінювання модуля:", "home.continue": "Продовжити: {title}", "home.start": "Почати навчання",
    "home.allDone": "Усі уроки пройдено: відкрити підсумок", "home.resume": "Повернутися, де я зупинився", "home.summary": "Підсумок проходження",
    "home.dataTitle": "Дані про ваш прогрес", "home.dataNote": "Зберігаються в цьому браузері ({backend}). Експортуйте копію, щоб перенести її в інший браузер або на інший пристрій.",
    "home.export": "Експортувати прогрес", "home.import": "Імпортувати прогрес", "home.reset": "Скинути прогрес",
    "home.confirmReset": "Видалити весь збережений прогрес у цьому браузері?",
    "home.exportCourse": "Експорт змісту курсу", "home.courseJson": "Курс у форматі JSON", "home.courseHtml": "Курс в одному HTML-файлі для друку",
    "notFound": "Такої сторінки в курсі немає.",
    "lesson.minutes": "{n} хв", "lesson.empty": "Матеріал уроку ще не додано.", "lesson.resources": "Навчальні ресурси",
    "lesson.downloads": "Матеріали для завантаження", "lesson.activities": "Навчальні завдання", "lesson.open": "Відкрити завдання",
    "lesson.markDone": "Позначити урок пройденим", "lesson.completed": "Пройдено ✓", "lesson.markNext": "Позначити пройденим і далі →",
    "progress.badFile": "Цей файл не містить прогресу для цього курсу.",
    "quiz.summative": "Підсумкове оцінювання", "quiz.formative": "Тренувальне завдання", "quiz.weight": "Вага: {n}%",
    "quiz.hint": "Натисніть «Перевірити відповідь» під питанням, щоб одразу побачити результат.", "quiz.selectAll": "Оберіть усі правильні варіанти.",
    "quiz.submit": "Надіслати відповіді", "quiz.clear": "Очистити відповіді", "quiz.check": "Перевірити відповідь", "quiz.tryAgain": "Спробувати ще раз",
    "quiz.result": "Результат: {pct}%", "quiz.nCorrect": "Правильних відповідей: {correct} з {total}.", "quiz.best": "Найкращий результат: {pct}%",
    "quiz.overall": "Загальний результат курсу: {pct}%", "quiz.bestRecorded": "Найкращий результат: {pct}% ({correct}/{total}) · спроб: {attempts}",
    "quiz.correct": "Правильно", "quiz.notQuite": "Не зовсім", "quiz.unanswered": "Питань без відповіді: {n}. Усе одно надіслати?",
    "quiz.unsupported": "Непідтримуваний тип питання: {type}", "quiz.gradeFail": "Не вдалося оцінити відповіді: {msg}",
    "quiz.correctAnswer": "Правильна відповідь: {value}", "quiz.answerLabel": "Ваша відповідь",
    "search.title": "Пошук", "search.count": "Знайдено: {n} — «{q}»", "search.none": "Нічого не знайдено. Спробуйте інші слова.",
    "search.prompt": "Введіть слово в поле пошуку вгорі.", "search.type.lesson": "Урок", "search.type.activity": "Завдання", "search.type.assessment": "Оцінювання",
    "summary.title": "Підсумок проходження", "summary.name": "Ім’я (необов’язково, лише для друку)", "summary.namePh": "Введіть ім’я перед друком",
    "summary.nameNote": "Ім’я ніде не зберігається і зникає, щойно ви залишите цю сторінку.",
    "summary.passed": "Складено", "summary.notPassed": "Ще не складено", "summary.lessons": "Уроки", "summary.done": "пройдено", "summary.todo": "не пройдено",
    "summary.quizzes": "Завдання та оцінювання", "summary.formative": "тренувальне", "summary.summative": "підсумкове", "summary.attempts": "спроб: {n}",
    "summary.print": "Друк або збереження в PDF",
    "set.title": "Налаштування читання", "set.fontSize": "Розмір тексту", "set.fontDec": "Менший текст", "set.fontInc": "Більший текст", "set.width": "Ширина сторінки",
    "set.narrow": "Вузька", "set.normal": "Звичайна", "set.wide": "Широка", "set.theme": "Тема", "set.auto": "Автоматично", "set.light": "Світла", "set.dark": "Темна",
    "set.language": "Мова інтерфейсу", "set.reset": "Відновити типові", "set.close": "Закрити",
    "plot.play": "Відтворити", "plot.pause": "Пауза", "plot.pin": "Закріпити криву", "plot.clear": "Очистити закріплені", "plot.reset": "Скинути",
    "plot.lock": "Зафіксувати вертикальну шкалу", "plot.pinned": "Закріплено:", "plot.section": "Інтерактивні графіки",
    "plot.error": "Не вдалося намалювати графік «{id}»: {msg}", "plot.staticNote": "Статичний знімок із типовими параметрами; інтерактивна версія є в онлайн-курсі."
  };
  M.Strings = { en, uk };
  M.t = (key, params) => {
    const lang = M.Prefs ? M.Prefs.language() : "en";
    let s = (M.Strings[lang] && M.Strings[lang][key]) ?? M.Strings.en[key] ?? key;
    if (params) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in params ? params[k] : m));
    return s;
  };
  /* Fills static markup: data-i18n (text), data-i18n-title, data-i18n-placeholder, data-i18n-aria (aria-label). */
  M.applyStaticText = () => {
    const set = (attr, fn) => document.querySelectorAll("[" + attr + "]").forEach(el => fn(el, M.t(el.getAttribute(attr))));
    set("data-i18n", (el, v) => { el.textContent = v; });
    set("data-i18n-title", (el, v) => el.setAttribute("title", v));
    set("data-i18n-placeholder", (el, v) => el.setAttribute("placeholder", v));
    set("data-i18n-aria", (el, v) => el.setAttribute("aria-label", v));
  };
})(window.MOOC = window.MOOC || {});
