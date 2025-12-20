# Livespec Sync

Verify specs are valid, in sync with code, and have test coverage. Creates a sync report with actionable suggestions.

## Workflow

### 0. Assess Scope (Large Projects)

For projects with many specs, a full sync may be impractical. Assess project size first:

```bash
# Count projects and specs
find livespec/projects -name "spec.md" | wc -l
```

**Prompt the user to choose scope if:**
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

### 1. Find All Specs

```bash
find livespec/projects -name "spec.md"
find livespec/plans/active -name "spec.md"
```

### 2. Circuit Breaker

Stop after 20 errors to avoid wasting time on fundamentally broken state. Report what was checked and suggest fixing critical issues first.

### 3. Validate Spec Format

For each spec file, verify:
- Has at least one `### Scenario:` with a spec ID like `[PRJ.feature.scenario]`
- Each scenario has WHEN/THEN structure
- `Testing:` declaration only needed for non-unit tests

Report any malformed specs as ❌ errors.

### 4. Check Test Coverage

For each scenario ID found in specs:
1. Search test files for `@spec [PRJ.id]` annotations
2. Verify test content aligns with the scenario's WHEN/THEN conditions
3. Categorize:
   - ❌ **Error:** Missing tests, spec-code drift, broken specs
   - ⚠️ **Warning:** Empty specs, orphan tests, stale tests

### 5. Auto-Promote and Archive Completed Plans

For each plan in `livespec/plans/active/`:
1. Read `plan.md` and check task checkboxes
2. If ALL tasks are checked `- [x]`:
   - Promote specs from `plans/active/[plan]/specs/` to `livespec/projects/[project]/`
   - Move plan folder to `livespec/plans/archived/YYYY-MM-DD-[plan-name]/`

### 6. Project Insights

While analyzing, note general project suggestions:
- Deprecated dependencies
- Architectural improvements
- Performance opportunities
- Security considerations

### 7. Create Sync Report

Create report at `livespec/sync/YYYY-MM-DD-HHMMSS.md`. Keep last 10 reports, delete older ones.

**Report format:**

```markdown
# Livespec Sync

**Branch:** main | **Commit:** abc123def
**Timestamp:** 2025-12-17T10:30:00Z
**Last sync:** 3 days ago

✅ Coverage: 95% (950/1000) | 2 errors | 5 warnings

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

### 8. Walk Through Suggestions

After creating the report, go through each suggestion with the user one by one to decide what action to take.
