<!-- livespec-version: {{VERSION}} -->

# Livespec Instructions

This project uses Livespec for living, synchronized, spec-driven development. This document is your complete guide on how to use it.

---

# Part 1: Reference

## 1. Philosophy

Livespec treats specifications as **living documentation** that evolves with code:

- **Specs are the source of truth** — code implements specs, not the other way around
- **Bidirectional sync** — when code drifts from specs, prompt the user to decide: fix code or update spec
- **Context-rich** — specs include the "why", not just the "what"
- **AI-native** — sync and maintenance done by AI, not scripts
- **Test-linked** — features are made of scenarios, each with automated tests to ensure correctness and prevent regressions
- **Cohesive grouping** — one spec file per capability, keeping related screens, modals, and logic together

This empowers creative iteration — you can explore freely knowing specs keep everything aligned.

## 2. Glossary

| Term | Definition |
|------|------------|
| **Spec** | A markdown file containing testable scenarios for a feature |
| **Scenario** | A single testable behavior with WHEN/THEN structure and spec ID |
| **Spec ID** | Unique identifier like `[PRJ.sidebar.tabs]` linking specs ↔ tests ↔ code |
| **Feature** | A cohesive capability including its screens, modals, and logic |
| **Plan** | A proposal for changes, lives in `plans/active/` until complete |
| **Sync** | Periodic check between specs, code, and tests |
| **Entry point** | A route or action where users begin interacting with a feature |

## 3. Project Codes

Each project has a 3-character code prefix for spec IDs. Examples:

| Code | Project | Path |
|------|---------|------|
| APP | Main App | `livespec/projects/app/` |
| API | Backend API | `livespec/projects/api/` |

## 4. Directory Structure

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

## 5. Spec File

### 5.1 Format

```markdown
# Feature Name [PRJ.feature]

Narrative explanation of what this feature is and why it exists.

## Entry Points

Optional section. Where users access this feature.

| Route / Trigger | Description |
|-----------------|-------------|
| /path/to/page | Main screen for this feature |
| Modal from [PRJ.other-feature] | Triggered by action in another feature |

## UI

Optional section. Layout structure, components, and available actions.

### Figma

Optional subsection. Link to Figma designs.

https://figma.com/file/...

## Design Decisions

Optional section. Rationale for non-obvious choices.

---

## Requirement Name [PRJ.feature.requirement]

Brief description of what this requirement ensures.

### Scenario: Specific behavior [PRJ.feature.requirement.behavior]
Testing: e2e

- WHEN precondition or action
- THEN expected outcome
- AND additional outcomes

### Scenario: Another behavior [PRJ.feature.requirement.other]

- WHEN different condition
- THEN different outcome
```

### 5.2 Splitting Large Specs

When a segment (e.g., `[PRJ.users.profile]`) grows too large:

1. Create a subdirectory: `users/profile/spec.md`
2. The ID prefix matches the path: `[PRJ.users.profile]`
3. Parent spec links to child or remains as overview

```
users/
├── spec.md                    # [PRJ.users] - overview + common scenarios
└── profile/
    └── spec.md                # [PRJ.users.profile] - detailed scenarios
```

### 5.3 Spec IDs

- Format: `[PRJ.path.to.item]` where PRJ is the 3-char project code
- Dot-separated: `[PRJ.sidebar.tabs]` (dashes allowed but shorter names preferred)
- Lowercase, descriptive names
- **NEVER** change existing IDs unless requested — changing IDs breaks test and code references

### 5.4 Testing Declaration

**Unit tests are the default.** Only declare `Testing:` when using a different type:

```markdown
### Scenario: Tab display on navigation [PRJ.sidebar.tabs-display]

Testing: e2e
```

Valid test types:

- `unit` — Unit tests (fast, isolated) — **DEFAULT, don't declare**
- `e2e` — End-to-end tests (browser, full flow)
- `integration` — Integration tests (API, database)
- `none` — No automated test — requires justification in the scenario

## 6. Test Discovery

Tests for specified behavior **MUST** reference specs via `@spec` JSDoc comments:

```typescript
/** @spec [PRJ.sidebar.tabs-display] */
it('shows all exports as tabs', () => { ... })
```

Internal implementation tests (helpers, utilities) don't need `@spec` references.

`Sync` uses these annotations to verify test coverage. **MUST** use `/** */` (or equivalent for used language) over `//` for spec references.

## 7. Referencing Specs in Code

Use JSDoc comments for implementation code:

```typescript
/**
 * Handles tab overflow with horizontal scrolling.
 * @spec [PRJ.sidebar.tabs-overflow]
 */
function handleTabOverflow() { ... }
```

Code references are optional but help with traceability.

## 8. Plan File Format

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

### 8.1 Plan Naming

- Use kebab-case: `add-msw-mocking`, `refactor-sidebar`
- Verb-led prefixes: `add-`, `update-`, `remove-`, `refactor-`, `fix-`
- Short and descriptive
- Ensure uniqueness within `plans/active/`

## 9. Project File

Each project has a `project.md` with context and conventions:

```markdown
# Project Name

## Overview
What this project does, codebase location.

## Domain Knowledge
Key concepts, terminology, gotchas.

## Entry Points

| Route | Feature | Description |
|-------|---------|-------------|
| /home | [PRJ.home] | Authenticated landing |
| /checkout | [PRJ.checkout] | Purchase flow |

## UI Conventions
- Use X component for buttons
- Theme-aware colors only
```

## 10. Commands

**`/livespec`** — Project companion: shows status, offers suggestions, helps plan and implement features

**`/livespec-setup`** — Configure project structure:
- Analyzes codebase to detect projects
- Presents proposed structure for user approval before making changes
- Populates Projects table in CLAUDE.md/AGENTS.md
- Creates or updates `project.md` files with required sections
- Offers to generate initial specs for projects with existing code

**`/livespec-sync`** — Run periodically to keep specs healthy:
- **Checks:** Spec validity, test coverage, test type matches
- **Auto-actions:** Promote completed plan specs, archive completed plans
- **Reports:** Missing tests, malformed specs, actions needed

---

# Part 2: Workflows

## 1. Before Any Task

You **MUST** run this checklist before starting work:

- [ ] Read `project.md` for conventions and domain context
- [ ] Read relevant specs in `livespec/projects/[project]/`
- [ ] If unclear, ask clarifying questions before scaffolding

## 2. Development Workflows

Stay spec-aware during all development:

- **Before coding:** Check if relevant specs exist in `livespec/projects/[project]/`
- **While coding:** If behavior changes, note that specs may need updating
- **After coding:** Propose spec updates if behavior diverged

### 2.1 Plan Mode (Significant Features)

**You MUST create a plan before implementing any non-trivial feature.** Do not ask "want me to add this?" — create the plan first, present it, then implement after approval.

1. **Create plan:** `livespec/plans/active/[plan-name]/`
   - Write `plan.md` with summary, why, what, tasks
   - Create draft specs in `plans/active/[plan-name]/specs/`

2. **Get approval:** **NEVER** start implementation until plan is approved
   - Share plan with user for approval
   - Clarify any ambiguities before proceeding

3. **Implement:** Work through tasks, mark progress with `- [x]`

4. **Update specs:** Promote draft specs to `projects/[project]/`, update existing specs

5. **Archive:** When all tasks complete, move plan to `plans/archived/YYYY-MM-DD-[plan-name]/`

### 2.2 Skip Plans For

- Bug fixes (restore existing spec behavior)
- Typos, formatting, comments
- Small enhancements within existing specs
- Test additions for existing specs
- Dependency updates (non-breaking)
- Configuration changes

### 2.3 Specs Are Always Required

**Skipping a plan does NOT mean skipping specs.** Even for small changes, you **MUST**:

- **New behavior** → Add scenario to relevant spec
- **Changed behavior** → Update existing scenario
- **New tests** → Add `@spec` reference linking to scenario

The only exceptions are pure refactors (no behavior change) and documentation-only changes.

## 3. Error Recovery

### 3.1 Spec-Code Mismatch

When sync finds mismatches:
1. Determine which is correct (spec or code)
2. If spec is correct → fix code
3. If code is correct → update spec
4. Document the decision in the sync plan

### 3.2 Orphaned Behavior

Code behavior not documented in specs:
1. `Sync` creates draft spec proposal
2. Review if behavior is intentional
3. If intentional → promote draft to main specs
4. If unintentional → consider removing code

### 3.3 Missing or Wrong Test Type

Scenario declares `Testing: e2e` but:
- No test found → sync reports missing
- Test found in unit files → sync reports type mismatch

---

Remember: Specs are living. Code evolves. Keep them in sync.
