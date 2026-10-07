# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

GPA Tracker: a client-side web app where university students enter courses (name, credits, 10-point score) and see cumulative GPA on the 4-point and 10-point scales plus an academic rank. No login and no backend: all data lives in `localStorage`. `PRD.md` is the source of truth for requirements (features F1–F5, validation rules, grade conversion table, rank thresholds) and tracks feature status in its section 4 table. Update that table when a feature is completed.

Stack: Vite + plain HTML/CSS/JavaScript (ES modules, no framework), Vitest for unit tests, deployed to Vercel.

All user-facing text (labels, validation errors, confirmations) is in **Vietnamese**.

## Commands

```bash
npm install                       # first time (no node_modules yet)
npm run dev                       # Vite dev server
npm run build                     # production build to dist/
npm run preview                   # serve the built dist/
npm test                          # vitest run (all tests once)
npm run test:watch                # vitest in watch mode
npm run test:coverage             # coverage via @vitest/coverage-v8
npx vitest run path/to/file.test.js     # single test file
npx vitest run -t "test name"           # tests matching a name
```

## Architecture

- `index.html` is the Vite entry and already contains the full static markup. It loads `/src/style.css` and `/src/main.js`, **neither of which exists yet**. JS should bind to the existing element IDs rather than generate the layout:
  - Form: `#subject-form`, inputs `#subject-name`, `#subject-credits`, `#subject-score`, per-field error spans `#err-name`, `#err-credits`, `#err-score`, hidden `#edit-index` (holds the row index while editing), `#submit-btn` (label switches between "Thêm môn" and "Lưu"), `#cancel-edit-btn`, `#form-title`.
  - Summary: `#stat-total-subjects`, `#stat-total-credits`, `#stat-passed-credits`, `#stat-gpa4`, `#stat-gpa10`, `#stat-rank`, `#empty-hint` (all show "—" when empty).
  - Table: `#subjects-tbody` (rows rendered by JS), `#table-empty-msg`, `#clear-all-btn`.
- The score input is `type="text"` on purpose, because the PRD requires accepting both `8,5` and `8.5`. The form uses `novalidate`, so validation is done in JS.
- Keep the pure logic separate from the DOM code so it can be unit-tested with Vitest without a DOM. Pure logic means validation, score conversion (10-point → letter → 4-point), GPA/rank calculation, and storage parse/serialize.
- Persistence: localStorage key `"gpa-tracker:v1"`. Corrupt or unparseable data must fall back to an empty list without breaking the page.

## Project structure

- `index.html`: app markup / Vite entry
- `src/`: (to be created) `main.js`, `style.css`, logic modules and tests
- `PRD.md`: requirements and feature status
- `.claude/commands/`: project slash commands (commit, push, pull, merge, git-branch, wrap-up, learn-by-mistake, new-project)
- `new-app/`: currently empty

`/wrap-up` expects this section to stay current (level 1–2 only), and `/learn-by-mistake` records errors in `common_errors.md`.
