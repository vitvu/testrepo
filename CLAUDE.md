# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

GPA Tracker: a client-side web app where university students enter courses (name, credits, 10-point score) and see cumulative GPA on the 4-point and 10-point scales plus an academic rank. No login and no backend: all data lives in `localStorage`. `PRD.md` is the source of truth for requirements (features F1–F5, validation rules, grade conversion table, rank thresholds) and tracks feature status in its section 4 table. Update that table when a feature is completed.

Stack: Vite + plain HTML/CSS/JavaScript (ES modules, no framework), Vitest for unit tests, deployed to Vercel.

All user-facing text (labels, validation errors, confirmations) is in **Vietnamese**.

## Workflow (Waterfall)

The project follows a waterfall model. Phases run strictly in order, and each one starts only after the previous one is done:

1. **Requirements**: `PRD.md`.
2. **Design**: business-flow flowcharts in Mermaid syntax (`flowchart TD`) in `DESIGN.md`, one per feature F1–F5. Each flowchart is derived from the PRD.
3. **Implementation + automated testing**: code written against `DESIGN.md`, with Vitest unit tests. `npm test` and `npm run build` must pass.
4. **User acceptance testing**: performed by the user, not Claude. Claude stops here, hands over, and waits for the user's results. Bugs found go back into phase 3.
5. **Deploy to Vercel**: only after the user signs off on UAT.

Tracking files:
- `PLAN.md`: the phase plan, with deliverables and exit criteria. Change it only when the plan itself changes.
- `STATUS.md`: current phase and progress, plus a log of technical decisions and of changes from the original PRD/plan. Update it whenever a phase or feature changes state, a technical decision is made, or the scope or requirements change. When a requirement changes, also update `PRD.md` and the affected `DESIGN.md` flowchart so the three stay consistent.

## Git branching

- Each feature (F1–F5) is built on its own branch created from `main` (use `/git-branch`, e.g. `feature/f1-add-subject`). Do not commit feature work directly to `main`.
- Merge the branch into `main` (use `/merge`) only when the feature is complete and error-free: `npm test` and `npm run build` both pass. If either fails, fix it on the branch first.
- After merging, update `STATUS.md` (and the PRD section 4 status table) to reflect the completed feature.

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

- `index.html` is the Vite entry and already contains the full static markup. It loads `/src/style.css` and `/src/main.js`. JS should bind to the existing element IDs rather than generate the layout:
  - Form: `#subject-form`, inputs `#subject-name`, `#subject-credits`, `#subject-score`, per-field error spans `#err-name`, `#err-credits`, `#err-score`, hidden `#edit-index` (holds the row index while editing), `#submit-btn` (label switches between "Thêm môn" and "Lưu"), `#cancel-edit-btn`, `#form-title`.
  - Summary: `#stat-total-subjects`, `#stat-total-credits`, `#stat-passed-credits`, `#stat-gpa4`, `#stat-gpa10`, `#stat-rank`, `#empty-hint` (all show "—" when empty).
  - Table: `#subjects-tbody` (rows rendered by JS), `#table-empty-msg`, `#clear-all-btn`.
- The score input is `type="text"` on purpose, because the PRD requires accepting both `8,5` and `8.5`. The form uses `novalidate`, so validation is done in JS.
- Keep the pure logic separate from the DOM code so it can be unit-tested with Vitest without a DOM. Pure logic means validation, score conversion (10-point → letter → 4-point), GPA/rank calculation, and storage parse/serialize.
- Persistence: localStorage key `"gpa-tracker:v1"`. Corrupt or unparseable data must fall back to an empty list without breaking the page.

## Project structure

- `index.html`: app markup / Vite entry
- `src/`: `main.js` (DOM wiring), `style.css`, pure logic modules (`validation.js`, ...) with colocated `*.test.js`
- `PRD.md`: requirements and feature status
- `DESIGN.md`: Mermaid business-flow flowcharts and design conventions D1–D8
- `PLAN.md` / `STATUS.md`: waterfall plan; current status, decisions and change log
- `.claude/commands/`: project slash commands (commit, push, pull, merge, git-branch, wrap-up, learn-by-mistake, new-project)
- `new-app/`: currently empty

`/wrap-up` expects this section to stay current (level 1–2 only), and `/learn-by-mistake` records errors in `common_errors.md`.
