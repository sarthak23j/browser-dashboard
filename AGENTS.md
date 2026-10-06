# AI Agent Guidelines & Coding Practices

This document provides guidelines and conventions for AI assistants (Antigravity, GitHub Copilot, Claude, OpenAI Codex, etc.) working on the `browser-dashboard` codebase.

---

## 1. Git & Workflow Standards

- **Local-Only by Default**:
  - All changes, branch updates, and commits must remain **strictly local**.
  - **Never push to remote (`origin`) or merge into `main`** unless the user explicitly requests/instructs to merge or push.
  - Wait for explicit user confirmation before executing any `git push` or branch merge into `main`.
- **Branching Workflow**:
  - Do **not** commit directly to `main` for non-trivial changes or multi-step tasks.
  - Create descriptive feature or fix branches:
    - `feat/<feature-name>` for new features
    - `fix/<issue-name>` for bug fixes
    - `style/<description>` for styling and UI adjustments
    - `chore/<task-name>` for maintenance, cleanup, or dependencies
    - `docs/<description>` for documentation updates
  - Test and verify changes locally on the branch first.
  - Only when explicitly instructed by the user: merge into `main` (fast-forward or squash merge), push to remote, and clean up the feature branch.
- **Commit Messages**:
  - Follow [Conventional Commits](https://www.conventionalcommits.org/):
    - `feat: ...`, `fix: ...`, `style: ...`, `refactor: ...`, `chore: ...`, `docs: ...`
  - Write concise, imperative commit messages (e.g., `feat: add export button tooltip`).
- **Pre-Commit Verification**:
  - Always run `npm run build` to verify there are no bundling or syntax errors before committing.
  - Never commit untracked secrets, `.env`, `.db` files, or compiler caches (`__pycache__`, `.pyc`).

---

## 2. Architecture & Tech Stack

- **Frontend**:
  - React (JSX) with Vite and `@rolldown/plugin-babel` (React Compiler preset).
  - Bundled with `vite-plugin-singlefile` into a single self-contained `dist/index.html`.
- **Backend**:
  - Minimal FastAPI server (`backend/main.py`) strictly used to serve `dist/index.html`.
  - **No server-side database**: do not introduce SQLite, SQLAlchemy, or server APIs for user settings unless explicitly requested.
- **Persistence Model**:
  - All user settings (bang shortcuts, user greeting name, light/dark mode, accent colors) are stored exclusively in the browser's `localStorage` via helper services in `src/services/`.
- **Styling**:
  - Pure CSS using design tokens and CSS variables defined in `src/globalStyles.css`.
  - Do not introduce heavy utility libraries (e.g. Tailwind, Bootstrap) to keep the single-file distribution lightweight.

---

## 3. Layout & UX Principles

- **Scroll Architecture**:
  - The entire page/app scrolls; avoid nested scroll containers (`overflow-y: auto`) inside panels.
  - Use `position: sticky` for top header bars (greeting, search input, settings action bar) with solid backgrounds (`var(--bg-primary)`).
  - Ensure parent containers do **not** use `overflow-x: hidden` (use `overflow-x: clip` on `body` instead) to prevent breaking `position: sticky`.
- **Responsive Design**:
  - Design mobile-first or verify responsive behavior down to small viewports ($\le 480\text{px}$).
  - Account for dynamic viewport height units (`100dvh` / `min-height: 100dvh`).

---

## 4. Code Quality & Maintenance

- **Dead Code Elimination**:
  - Delete unused components, dead routes, obsolete files, and orphaned folders immediately upon replacement.
  - Keep documentation (`README.md`, comments) in sync with structural changes.
- **Documentation Integrity**:
  - Preserve helpful code comments and docstrings.
  - Link referenced files cleanly when communicating.
- **Shell & Tooling Note**:
  - On Windows PowerShell, chain sequential terminal commands with `;` rather than `&&`.
