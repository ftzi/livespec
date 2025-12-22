# Livespec

Ensure project structure is configured and specs are valid, in sync with code, and have test coverage. Creates a sync report with actionable suggestions.

Full conventions are in @livespec/livespec.md — follow them for all spec-related work.

## Workflow

### 1. Structure Check (Fast)

Before syncing specs, verify the project structure is properly configured.

**Check the Projects table** in CLAUDE.md (or AGENTS.md):
- Find the table between `<!-- LIVESPEC:START -->` and `<!-- LIVESPEC:END -->`
- Verify each entry still matches the codebase
- Check for new projects not yet in the table

**Verify project.md files** for each project:
- Path: `livespec/projects/[project-name]/project.md`
- Check required sections exist: Overview, Domain Knowledge, Entry Points

**If structure is valid** → Skip to step 3 (Scope Selection)
**If issues found** → Continue to step 2 (Structure Setup)

### 2. Structure Setup (Only If Step 1 Found Issues)

Fix any structure issues before proceeding with spec sync.

#### 2.1 Detect Projects

Analyze the codebase to detect projects:
- Look for `package.json`, `apps/`, `packages/`, `src/`, API directories
- Identify distinct projects (monorepo packages, standalone apps, backend APIs)
- For each project, determine: name, type, codebase path

#### 2.2 Present Proposed Changes

Show the user what needs to be fixed:
- New projects detected (with proposed 3-char codes)
- Missing or outdated Projects table entries
- Missing project.md files
- **Wait for user approval** before making any changes

#### 2.3 Apply Fixes

After approval:
- Update the Projects table (preserve valid existing entries)
- Create missing project.md files with template
- Update existing project.md files with missing sections

#### 2.4 Prompt to Continue

After structure changes are applied:

> "Structure updated. Continue with full spec sync?"
> - **Yes** → Continue to step 3
> - **No** → Exit (user just wanted structure setup)

**Project Code Guidelines:**
- 3 characters, uppercase
- Derived from project name (e.g., "frontend" → FRO, "api" → API)
- Must be unique within the project

### 3. Scope Selection

For projects with many specs, a full sync may be impractical. Assess project size:

```bash
find livespec/projects -name "spec.md" | wc -l
```

**Prompt for scope if:**
- More than 3 projects configured
- More than 20 spec files total
- User explicitly requests a quick sync

**Scope options:**
- **Full sync** — All projects and specs (default for small/medium projects)
- **By project** — Sync only a specific project (e.g., `APP`, `API`)
- **By feature** — Sync only specific spec files or directories
- **Changed only** — Sync only specs related to recently modified files:
  ```bash
  git diff --name-only HEAD~10 -- 'livespec/projects/**/*.md'
  ```

Document the chosen scope in the report header.

### 4. Create Sync Plan File

**Before starting spec checks**, create the sync report file at `livespec/sync/YYYY-MM-DD-HHMMSS.md` with checkboxes for all tasks. This ensures continuity if context compacts mid-sync.

```markdown
# Livespec Sync (In Progress)

**Branch:** main | **Commit:** abc123def
**Started:** 2025-12-17T10:30:00Z

## Tasks
- [x] Structure check
- [ ] Find all specs
- [ ] Validate spec format
- [ ] Check test coverage
- [ ] Detect unspecified entry points
- [ ] Auto-promote completed plans
- [ ] Gather project insights
- [ ] Walk through suggestions with user

## Progress
(Updated as tasks complete)
```

Check off tasks as you complete them. If context compacts, read this file to resume.

### 5. Find All Specs

```bash
find livespec/projects -name "spec.md"
find livespec/plans/active -name "spec.md"
```

### 6. Circuit Breaker

Stop after 20 errors to avoid wasting time on fundamentally broken state. Report what was checked and suggest fixing critical issues first.

### 7. Validate Spec Format

For each spec file, verify:
- Has at least one `### Scenario:` with a spec ID like `[PRJ.feature.scenario]`
- Each scenario has WHEN/THEN structure
- `Testing:` declaration only needed for non-unit tests

Report any malformed specs as ❌ errors.

### 8. Check Test Coverage

For each scenario ID found in specs:
1. Search test files for `@spec [PRJ.id]` annotations
2. Verify test content aligns with the scenario's WHEN/THEN conditions
3. Categorize:
   - ❌ **Error:** Missing tests, spec-code drift, broken specs
   - ⚠️ **Warning:** Empty specs, orphan tests, stale tests

**IMPORTANT — Unit tests are always preferred:**
- Unit tests are extremely fast and should be the default for all scenarios
- Interactive code (prompts, CLI) can be unit tested by mocking the prompt library
- `Testing: none` **MUST** be avoided — find a way to test the behavior
- Only use `Testing: e2e` when the scenario genuinely requires browser/full-stack testing
- When suggesting missing tests, always suggest unit tests first

### 9. Detect Unspecified Entry Points

Check that user-facing features have corresponding specs:

1. **Check `project.md` entry points** — verify each listed entry point links to an existing spec
2. **Scan for major components** not referenced in any spec:
   - Routes/pages without spec coverage
   - API endpoints not documented in specs
   - CLI commands without specs
3. **Report missing as warnings:**
   - ⚠️ **Unspecified:** Entry point `/settings` listed in project.md has no spec
   - ⚠️ **Unspecified:** Route `/api/export` has no corresponding spec

Focus on user-facing entry points, not internal implementation details.

### 10. Auto-Promote and Archive Completed Plans

For each plan in `livespec/plans/active/`:
1. Read `plan.md` and check task checkboxes
2. If ALL tasks are checked `- [x]`:
   - Promote specs from `plans/active/[plan]/specs/` to `livespec/projects/[project]/`
   - Move plan folder to `livespec/plans/archived/YYYY-MM-DD-[plan-name]/`

### 11. Project Insights

While analyzing, note general project suggestions:
- Deprecated dependencies
- Architectural improvements
- Performance opportunities
- Security considerations

### 12. Offer Initial Spec Generation

For projects with existing code but no specs:
- Check if `livespec/projects/[project-name]/` has any spec.md files
- If no specs exist, add a suggestion to the report:
  > 💡 **Suggestion:** Project [PRJ] has no specs. Consider generating initial specs to document existing behavior.
- Do NOT auto-generate — this is a user decision made after reviewing the report

### 13. Finalize Sync Report

Update the sync report file with final results. Remove "(In Progress)" from title.

**Report format:**

```markdown
# Livespec Sync

**Branch:** main | **Commit:** abc123def
**Timestamp:** 2025-12-17T10:30:00Z
**Scope:** Full sync

✅ Coverage: 95% (950/1000) | 2 errors | 5 warnings

## Structure
✅ Projects table up to date
✅ All project.md files valid

## Suggestions
- [ ] Fix drift in [APP.auth.session] - update spec or code?
- [ ] Generate test for [APP.sidebar.overflow]

## ❌ Errors (2)
- [ ] **Drift:** [APP.auth.session](livespec/projects/app/auth/spec.md)
  - Spec: 24h expiry | Code: 48h ([src/auth/session.ts:42](src/auth/session.ts))
- [ ] **Missing Test:** [APP.sidebar.overflow](livespec/projects/app/sidebar/spec.md)

## ⚠️ Warnings
- [ ] [APP.old-feature](livespec/projects/app/old/spec.md) - Spec has no scenarios

## 💡 Project Insights
- Auth module uses deprecated bcrypt v2, consider upgrading
- Multiple components fetch user data separately - consider shared hook
- No error boundary in checkout flow
```

**If circuit breaker triggered:**

```markdown
# Livespec Sync

**Branch:** main | **Commit:** abc123def
**Timestamp:** 2025-12-17T10:30:00Z

❌ **Sync stopped early:** 20 errors reached. Fix critical issues before running full sync.

Checked: 150/1000 scenarios

## ❌ Errors (20)
- [ ] ...
```

### 14. Walk Through Suggestions

After creating the report, go through each suggestion with the user one by one to decide what action to take.
