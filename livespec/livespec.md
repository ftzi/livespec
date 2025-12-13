<!-- livespec-version: 0.4.0 -->

# Livespec Instructions

Instructions for AI assistants using Livespec for living specification development.

## Philosophy

Livespec treats specifications as **living documentation** that evolves with code:

- **Specs are the target**, not the absolute truth — code can be updated first, specs reconciled later
- **Bidirectional sync** — specs drive code, code informs specs
- **Context-rich** — specs include the "why", not just the "what"
- **AI-native** — housekeeping and maintenance done by AI, not scripts
- **Test-linked** — every scenario declares its test type, tests reference specs
- **Feature-centric** — one spec per feature, containing screens + modals + logic

## Glossary

| Term             | Definition                                                               |
| ---------------- | ------------------------------------------------------------------------ |
| **Spec**         | A markdown file containing testable scenarios for a feature              |
| **Scenario**     | A single testable behavior with WHEN/THEN structure and spec ID          |
| **Spec ID**      | Unique identifier like `[PRJ.sidebar.tabs]` linking specs ↔ tests ↔ code |
| **Feature**      | A cohesive capability including its screens, modals, and logic           |
| **Plan**         | A proposal for changes, lives in `plans/active/` until complete          |
| **Housekeeping** | Periodic sync check between specs, code, and tests                       |
| **Entry point**  | A route or action where users begin interacting with a feature           |

## TL;DR Quick Checklist

- **MUST** create a plan before implementing any new feature
- Check relevant specs before making changes: `livespec/projects/[project]/`
- Spec IDs inline with headers: `## Feature Name [PRJ.feature.name]`
- Reference in code/tests: `/** @spec [PRJ.sidebar.tabs-display] */`
- Every scenario declares: `Testing: e2e` or `Testing: unit`
- Run housekeeping periodically to keep specs in sync
- **NEVER** expect manual testing — all scenarios must be automatically testable

## Before Any Task

Run this checklist before starting work:

- [ ] Read relevant specs in `livespec/projects/[project]/`
- [ ] Check active plans in `livespec/plans/active/` for conflicts
- [ ] Read `project.md` for conventions and domain context
- [ ] If unclear, ask 1-2 clarifying questions before scaffolding

## Project Codes

Each project has a 3-character code prefix for spec IDs.

<!-- Run /livespec to populate this table with your projects -->

| Code | Project | Path |
| ---- | ------- | ---- |
|      |         |      |

## Directory Structure

```
livespec/
├── livespec.md            # This file - AI instructions
├── projects/
│   └── [project-name]/
│       ├── project.md     # Project context, codebase location, domain knowledge
│       └── [feature]/
│           └── spec.md    # Specs with context + scenarios
├── plans/
│   ├── active/            # In-progress plans
│   │   └── [plan-name]/
│   │       ├── plan.md    # Proposal + tasks + design (combined)
│   │       └── specs/     # Draft specs (promote when done)
│   └── archived/          # Completed plans (historical record)
│       └── YYYY-MM-DD-[plan-name]/
```

### One Spec = One Feature

Each `[feature]/spec.md` contains **everything** about that feature:

- **Screens** it appears on (routes, entry points)
- **UI** layout and available actions
- **Modals** that belong to it
- **Logic** and behavior scenarios

Don't split by "screen vs concept" — keep all related behavior in one spec.

### Splitting Large Specs

When a segment (e.g., `[PRJ.orders.fulfillment]`) grows too large:

1. Create a subdirectory: `orders/fulfillment/spec.md`
2. The ID prefix matches the path: `[PRJ.orders.fulfillment]`
3. Parent spec links to child or remains as overview

```
orders/
├── spec.md                    # [PRJ.orders] - overview + common scenarios
└── fulfillment/
    └── spec.md                # [PRJ.orders.fulfillment] - detailed scenarios
```

**File path = ID prefix.** Moving files = changing IDs (intentionally painful to keep references stable).

## Spec File Format

Specs include **context** (narrative) and **scenarios** (testable behaviors):

```markdown
# Feature Name [PRJ.feature]

Narrative explanation of what this feature is and why it exists.

## Entry Points

| Route / Trigger                | Description                            |
| ------------------------------ | -------------------------------------- |
| /path/to/page                  | Main screen for this feature           |
| Modal from [PRJ.other-feature] | Triggered by action in another feature |

## UI

Brief description of layout, key components, available actions.
Not testable, but provides context for understanding scenarios.

## Design Decisions

Decision rationale — explain WHY certain choices were made.
This section is not testable but provides essential understanding.

---

## Requirement Name [PRJ.feature.requirement]

Brief description of what this requirement ensures.

### Scenario: Specific behavior [PRJ.feature.requirement.behavior]

Testing: e2e

- WHEN precondition or action
- THEN expected outcome
- AND additional outcomes

### Scenario: Another behavior [PRJ.feature.requirement.other]

Testing: unit

- WHEN different condition
- THEN different outcome
```

### Optional Sections

- **Entry Points** — Where users access this feature (routes, triggers)
- **UI** — Layout description, key components, actions
- **Design Decisions** — Rationale for non-obvious choices
- **Modals** — Modal dialogs owned by this feature

Include sections as needed. Small features may only need scenarios.

### Spec IDs

- Format: `[PRJ.path.to.item]` where PRJ is the 3-char project code
- Always wrapped in square brackets, dot after project code
- Hierarchical with dots: `[PRJ.sidebar.tabs-display]`
- Segments can have dashes, but project code is always separated by dot
- Lowercase, descriptive names
- Scenarios MUST have IDs for test linking

### Testing Declaration

Every scenario declares its expected test type on the line after the header:

```markdown
### Scenario: Tab display on navigation [PRJ.sidebar.tabs-display]

Testing: e2e
```

Valid test types:

- `unit` — Unit tests (fast, isolated)
- `e2e` — End-to-end tests (browser, full flow)
- `integration` — Integration tests (API, database)

## Test Discovery

Tests reference specs via `@spec` JSDoc comments:

```typescript
/** @spec [PRJ.sidebar.tabs-display] */
it('shows all exports as tabs', () => { ... })
```

Housekeeping discovers coverage by:

1. Finding all `[PRJ.id]` declarations in spec files
2. Searching test files for `@spec [PRJ.id]` annotations
3. Checking if test file type matches declared `Testing:` type
4. Reporting mismatches (expects e2e, found unit) or missing tests

Prefer `/** */` over `//` for spec references.

## Referencing Specs in Code

Use JSDoc comments for implementation code:

```typescript
/**
 * Handles tab overflow with horizontal scrolling.
 * @spec [PRJ.sidebar.tabs-overflow]
 */
function handleTabOverflow() { ... }
```

Code references are optional but help with traceability.
Use `file.ts:42` format when referencing specific code locations.

## Plan File Format

Plans combine proposal, tasks, and design into one file:

```markdown
# Plan: [Brief Description]

## Summary

1-2 sentences on what this plan achieves.

## Why

Problem or opportunity being addressed.

## What Changes

- Bullet list of changes
- Mark breaking changes with **BREAKING**

## Design Decisions (if needed)

### Decision: [What]

**Choice:** [Selected option]
**Alternatives considered:** [Other options and why not]
**Rationale:** [Why this choice]

## Tasks

### Phase 1: [Name]

- [ ] Task description
- [ ] Another task

### Phase 2: [Name]

- [ ] Dependent task

## Affected Specs

- `[PRJ.sidebar.tabs]` — ADDED/MODIFIED/REMOVED
```

### Plan Naming

- Use kebab-case: `add-msw-mocking`, `refactor-sidebar`
- Verb-led prefixes: `add-`, `update-`, `remove-`, `refactor-`, `fix-`
- Short and descriptive
- Ensure uniqueness within `plans/active/`

## When to Create Plans

**You MUST create a plan before implementing any non-trivial feature.** Do not ask "want me to add this?" — create the plan first, present it, then implement after approval.

### Decision Tree

**ALWAYS run this decision tree before starting implementation:**

```
New request?
├─ Bug fix restoring spec behavior? → Fix directly, no plan
├─ Typo/format/comment only? → Fix directly, no plan
├─ Test for existing spec? → Add test directly, no plan
├─ New feature or capability? → MUST create plan first
├─ Breaking change (API, behavior)? → MUST create plan first
├─ Architecture change? → MUST create plan first
├─ Cross-cutting (multiple specs)? → MUST create plan first
└─ Unclear scope? → MUST create plan first (safer)
```

**NEVER start implementing a new feature without a plan.** The plan ensures alignment before effort is spent.

### Skip Plans For

- Bug fixes (restore existing spec behavior)
- Typos, formatting, comments
- Small enhancements within existing specs
- Test additions for existing specs
- Dependency updates (non-breaking)
- Configuration changes

## Livespec Mode

When entering livespec mode (via `/livespec` or explicit request):

### If No Input (Status Check)

Show current livespec status:

1. List active plans: `ls livespec/plans/active/`
2. List projects and specs: `find livespec/projects -name "spec.md"`
3. Check for plans with incomplete tasks
4. Suggest next actions

### If Input Provided (Full Workflow)

Execute the complete workflow automatically:

1. **Analyze scope** — Use decision tree to determine if plan needed
2. **Create plan** (if needed) — Write plan.md, draft specs
3. **Get approval** — Present plan, STOP, wait for user approval
4. **Implement** — Work through tasks
5. **Update specs** — Promote draft specs, update existing specs
6. **Archive automatically** — Move completed plan to `archived/YYYY-MM-DD-[name]/`

The workflow is continuous — archiving happens automatically when all tasks complete.

---

## Three Workflows

### 1. Regular Development (Spec-Aware)

When making code changes, be a "mini-housekeeper":

1. **Before coding:** Check if relevant specs exist in `livespec/projects/[project]/`
2. **While coding:** If behavior changes, note that specs may need updating
3. **After coding:** Propose spec updates if behavior diverged

You don't need to update specs for every change, but stay aware.

### 2. Plan-Driven Development

For significant features or changes:

1. **Create plan:** `livespec/plans/active/[plan-name]/`

   - Write `plan.md` with summary, why, what, tasks
   - Create draft specs in `plans/active/[plan-name]/specs/`

2. **Get approval:** Do not start implementation until plan is reviewed

   - Share plan with user for approval
   - Clarify any ambiguities before proceeding

3. **Implement:** Work through tasks, mark progress with `- [x]`

4. **Update specs:** Promote draft specs to `projects/[project]/`, update existing specs

5. **Archive automatically:** When all tasks complete, move plan to `plans/archived/YYYY-MM-DD-[plan-name]/`

### 3. Housekeeping

Run `/livespec-sync` periodically to keep specs healthy.

**Housekeeping checks:**

1. **Spec validity** — All specs parse correctly, have required fields
2. **Test coverage** — Each scenario has test with matching type
3. **Auto-promote** — When plan tasks are all done, promote its specs to main
4. **Auto-archive** — Move completed plans (all tasks checked) to `archived/`

**Housekeeping outputs:**

- Report on spec validity and test coverage
- Automatically promote ready specs
- Automatically archive completed plans
- List actions needed (missing tests, malformed specs)

## Best Practices

### Simplicity First

- Default to <100 lines of new code
- Single-file implementations until proven insufficient
- Avoid frameworks/libraries without clear justification
- Choose boring, proven patterns

### Complexity Triggers

Only add complexity when you have:

- Performance data showing current solution is too slow
- Concrete scale requirements (>1000 users, >100MB data)
- Multiple proven use cases requiring abstraction

### Spec Writing

- **Context first** — Start with narrative explanation before formal scenarios
- **One feature per spec file** — Split only when a segment grows too large
- **Every scenario needs:** ID, Testing type, WHEN/THEN
- **No manual testing** — If it can't be automated, rethink the requirement
- **Include entry points** — List routes/triggers so readers know where the feature lives

### ID Naming

- Use 3-char project prefix with dot: `PRJ.`
- Hierarchical with dots: `[PRJ.sidebar.tabs-overflow]`
- IDs match file paths: `orders/fulfillment/spec.md` → `[PRJ.orders.fulfillment]`
- Keep IDs stable — changing IDs breaks references
- Scenarios need unique IDs for test matching

### Keeping Specs Alive

- Specs are living documents — update them when behavior changes
- Don't let specs become stale documentation
- Regular housekeeping prevents drift
- When in doubt, check the spec before coding

### What Belongs Where

| Content                            | Location                                 |
| ---------------------------------- | ---------------------------------------- |
| Testable behavior                  | `[feature]/spec.md` scenarios            |
| Entry points for a feature         | `[feature]/spec.md` Entry Points section |
| All entry points overview          | `project.md`                             |
| UI conventions ("use X component") | `project.md`                             |
| Domain knowledge, gotchas          | `project.md`                             |
| Permission groups                  | `project.md`                             |
| Component library docs             | Storybook, **not** livespec              |

## Tool Selection Guide

| Task                   | Tool                 | Why                      |
| ---------------------- | -------------------- | ------------------------ |
| Find files by pattern  | Glob                 | Fast pattern matching    |
| Search code content    | Grep                 | Optimized regex search   |
| Read specific files    | Read                 | Direct file access       |
| Explore unknown scope  | Task (Explore agent) | Multi-step investigation |
| Complex implementation | Task (Plan agent)    | Architectural planning   |

## Error Recovery

### Spec-Code Mismatch

When housekeeping finds mismatches:

1. Determine which is correct (spec or code)
2. If spec is correct → fix code
3. If code is correct → update spec
4. Document the decision in the housekeeping plan

### Orphaned Behavior

Code behavior not documented in specs:

1. Housekeeping creates draft spec proposal
2. Review if behavior is intentional
3. If intentional → promote draft to main specs
4. If unintentional → consider removing code

### Missing or Wrong Test Type

Scenario declares `Testing: e2e` but:

- No test found → housekeeping reports missing
- Test found in unit files → housekeeping reports type mismatch

## Quick Reference

### File Purposes

- `project.md` — Project context, codebase location, entry points overview
- `spec.md` — Feature specs (context + scenarios)
- `plan.md` — Change proposals (why + tasks + design)

### project.md Structure

```markdown
# Project Name

## Overview

What this project does, codebase location.

## Domain Knowledge

Key concepts, terminology, gotchas.

## Entry Points

| Route     | Feature        | Description           |
| --------- | -------------- | --------------------- |
| /home     | [PRJ.home]     | Authenticated landing |
| /checkout | [PRJ.checkout] | Purchase flow         |

## UI Conventions

- Use X component for buttons
- Theme-aware colors only

## Permission Groups (if applicable)

| Group | Permissions  | Enables    |
| ----- | ------------ | ---------- |
| Buyer | OrdersCreate | Purchasing |
| Admin | UsersManage  | Management |
```

Entry points table serves as a "table of contents" for navigating specs.

### Scenario Format

```markdown
### Scenario: Descriptive name [PRJ.feature.scenario]

Testing: e2e

- WHEN condition
- THEN outcome
```

### Commands

- `/livespec` — Project companion: shows status, offers suggestions, helps plan and implement features
- `/livespec-sync` — Validate specs, check test coverage, auto-promote and archive completed plans

Remember: Specs are living. Code evolves. Keep them in sync.
