# Shindo Character Build Archive — Claude Rules

## Git workflow

- Never work directly on `main`.
- Continue on the current feature branch unless explicitly told otherwise.
- Never force-push, reset published history, or discard existing work.
- After completing a scoped task:
  1. Run lint, tests, build, and relevant smoke tests.
  2. Review `git diff` and exclude unrelated files.
  3. Create a clear commit.
  4. Push the current non-main branch automatically.
- Do not repeatedly ask for permission to run normal project commands, tests, Git commits, or pushes.
- Never merge into `main` without explicit user approval.
- Never deploy or publish the live site without explicit user approval.

## Safety and project integrity

- Preserve exactly 100 characters and five free builds.
- Preserve Free, Locked, Selected, and Owned separation.
- Never expose premium build data in public previews.
- Never store ownership decisions in localStorage.
- Never invent Shindo mechanics or mappings.
- Do not modify authentication, payments, or backend entitlement architecture unless explicitly requested.
- Preserve GitHub Pages compatibility and all existing routes.

## Validation

Before committing frontend work, run:

- `npm run lint`
- `npm test`
- `npm run build`
- `npm run test:smoke`

Report exact results, commit SHA, branch pushed, and any remaining issues.
