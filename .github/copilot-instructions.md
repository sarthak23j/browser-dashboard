# GitHub Copilot Instructions

Please follow the project guidelines defined in [AGENTS.md](../AGENTS.md).

Key highlights:
- **Local-Only by Default**: Keep all work, commits, and branches strictly local. Never push to remote (`origin`) or merge into `main` without explicit user instruction.
- Follow Conventional Commits and branch-based development.
- The project is client-side only (settings stored in `localStorage`). Do not reintroduce server-side databases or models.
- Always ensure `npm run build` passes before finishing tasks.
- Keep layout clean: the entire page scrolls, sticky headers use solid backgrounds without nested scrollbars.
