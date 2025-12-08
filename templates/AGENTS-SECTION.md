<!-- LIVESPEC:START -->
# Livespec

This project uses **Livespec** for living specification management. Specs are living documentation that evolves with code.

## Projects

<!-- Run /livespec to populate this table with your projects -->

| Code | Project | Specs | Codebase |
|------|---------|-------|----------|
| | | | |

## Before Any Task

- [ ] Check relevant specs in `livespec/projects/[project]/`
- [ ] Check active plans in `livespec/plans/active/` for conflicts
- [ ] If modifying behavior, note which specs may need updating

## Decision Tree: Plan or Direct Fix?

```
├─ Bug fix restoring spec behavior? → Fix directly
├─ Typo/format/comment only? → Fix directly
├─ Small enhancement within existing spec? → Fix directly, update spec
├─ New feature or capability? → Create plan
├─ Breaking change (API, behavior)? → Create plan
├─ Cross-cutting (multiple specs)? → Create plan
└─ Unclear scope? → Create plan (safer)
```

## Livespec Workflow

When creating significant features (plan needed):

1. **Create plan** in `livespec/plans/active/[name]/plan.md`
2. **Get approval** — Present plan, STOP, wait for user approval
3. **Implement** — Work through tasks
4. **Update specs** — Add/modify specs in `livespec/projects/[project]/`
5. **Archive automatically** — Move to `livespec/plans/archived/YYYY-MM-DD-[name]/`

## Plan Format

```markdown
# Plan: [Brief Description]

## Summary
1-2 sentences on what this plan achieves.

## Why
Problem or opportunity being addressed.

## What Changes
- Bullet list of changes
- Mark breaking changes with **BREAKING**

## Tasks
- [ ] Task 1
- [ ] Task 2

## Affected Specs
- `[PRJ.feature]` — ADDED/MODIFIED/REMOVED
```

Plan naming: kebab-case, verb-led (`add-`, `update-`, `refactor-`, `fix-`)

## Spec Format

```markdown
# Feature Name [PRJ.feature]

Narrative explanation of what this feature is and why it exists.

---

## Requirement Name [PRJ.feature.requirement]

### Scenario: Behavior description [PRJ.feature.requirement.scenario]
Testing: e2e

- WHEN precondition
- THEN expected outcome
```

- **Spec IDs**: `[PRJ.path.to.item]` — always in brackets, hierarchical with dots
- **Testing declaration**: Every scenario needs `Testing: unit|e2e|integration`
- **Reference in code**: `/** @spec [PRJ.sidebar.tabs] */`

## Directory Structure

```
livespec/
├── AGENTS.md           # Detailed conventions (read when writing specs)
├── manifest.md         # Projects registry
├── projects/[project]/ # Specs organized by feature
├── plans/active/       # In-progress plans
└── plans/archived/     # Completed plans
```

## Quick Commands

- "Run housekeeping" — Check spec health, find gaps
- "Continue [plan]" — Resume an active plan
- `/livespec [request]` — Full workflow with planning

<!-- LIVESPEC:END -->
