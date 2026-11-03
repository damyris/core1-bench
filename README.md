# Cert Bench

Quick, ADHD-friendly practice for CompTIA A+ Core 1 (220-1201), A+ Core 2 (220-1202), and Linux+ (XK0-006). Pick the exam with the tabs at the top of the home screen.

- `index.html` is the app: layout, styles, and logic.
- `bank.js` is the A+ Core 1 question bank. `core2.js` is A+ Core 2 and `linux.js` is Linux+. Each new-course file also holds its domains and its "drills" (fact pairs that become rapid-fire questions).
- `sprint.js` holds the sprint setup logic (question filters, domain mix, timer). Its tests are in `tests/`; run them with `node --test tests/`.
- Add or edit questions in those files, or use the in-app editor (in-app edits are saved in your browser; use **Back up / restore** to move them between devices).

**Sprint setup** (the drawer under the start button on each course home, also in Settings) shapes a sprint: a time limit per question or per sprint, strict (time's up counts as a miss or ends the sprint) or gentle (a red overtime nudge, never blocks), which question types to include, and the domain mix (exam weighting, even, or your own). The defaults are untimed, all types, exam weighting, so the app behaves as before until you change something.

Progress is saved in the browser you study in. XP, streak, and the daily goal are shared across courses; mastery and weak spots are per course. The site is plain HTML with no build step: edit a file, commit, push, and GitHub Pages updates within a minute or two.

Independent study tool. Not affiliated with or endorsed by CompTIA.
