# Contributing Guide
## Cyber Focus Coach

This guide describes how to work on this project consistently.

---

## Philosophy

This is a learning project built with production discipline. Every change should:

1. Be understandable to future-you 6 months from now
2. Be documented before it's built
3. Be committed with a meaningful message
4. Leave the codebase better than you found it

---

## Git Workflow

### Branch Naming

```
feat/milestone-name     ← New feature
fix/bug-description     ← Bug fix
docs/what-was-updated   ← Documentation only
refactor/what-changed   ← Refactoring, no behavior change
chore/what-was-done     ← Build config, deps, tooling
```

### Commit Message Format (Conventional Commits)

```
type(scope): short description

[optional body]

[optional footer]
```

**Types:**
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation only
- `refactor` — Code change that doesn't fix a bug or add a feature
- `test` — Adding or modifying tests
- `chore` — Maintenance (deps, build config, etc.)
- `style` — Formatting, whitespace (no logic change)

**Scopes:**
- `db` — Database schema or queries
- `session` — Session lifecycle
- `focus` — Focus detection engine
- `ui` — Frontend components
- `api` — Backend routes
- `streak` — Streak computation
- `roadmap` — Topic management
- `logs` — Daily log system
- `docs` — Documentation

**Examples:**
```
feat(session): implement pause endpoint with focus event logging
fix(streak): correct off-by-one error when computing consecutive days
docs(db): add index documentation to DATABASE_SCHEMA.md
refactor(focus): extract confidence computation into pure function
```

---

## Documentation Updates

Every commit that changes behavior must update the relevant docs:

| Change type | Required docs update |
|-------------|---------------------|
| New feature | IMPLEMENTATION_PLAN.md, DEVELOPMENT_LOG.md, CHANGELOG.md |
| Bug fix | BUG_LOG.md, CHANGELOG.md |
| Architecture decision | DECISIONS.md |
| API change | API.md |
| Schema change | DATABASE_SCHEMA.md |
| Major bug causing rework | POSTMORTEMS.md |

---

## Code Standards

### TypeScript
- All new files in `.ts` or `.tsx`
- No `any` types unless absolutely necessary (and commented why)
- Prefer `interface` over `type` for object shapes
- All async functions must have error handling

### Files
- Keep files under 350 lines
- One responsibility per file
- If a file is doing too many things, split it

### Naming
- Components: `PascalCase` (`SessionPage.tsx`)
- Files: `camelCase` or `kebab-case` (be consistent within a directory)
- Constants: `UPPER_SNAKE_CASE`
- Functions: `camelCase`
- Types/Interfaces: `PascalCase`

---

## Before Committing

Run this checklist:

- [ ] Code compiles (`npm run typecheck`)
- [ ] Linting passes (`npm run lint`)
- [ ] Relevant docs updated
- [ ] Commit message follows Conventional Commits format
- [ ] DEVELOPMENT_LOG.md updated if it was a milestone
