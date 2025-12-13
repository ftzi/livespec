# Livespec Housekeeping

Verify specs are valid, in sync with code, and have test coverage. Automatically promote ready specs and archive completed plans.

## Workflow

### 1. Find All Specs

```bash
find livespec/projects -name "spec.md"
find livespec/plans/active -name "spec.md"
```

### 2. Validate Spec Format

For each spec file, verify:
- Has at least one `### Scenario:` with a spec ID like `[PRJ.feature.scenario]`
- Each scenario has `Testing:` declaration (unit, e2e, or integration)
- Each scenario has WHEN/THEN structure

Report any malformed specs.

### 3. Check Test Coverage

For each scenario ID found in specs:
1. Search test files for `@spec [PRJ.id]` annotations
2. Report:
   - Which scenarios have tests (found `@spec` annotation)
   - Which scenarios are missing tests

### 4. Auto-Promote and Archive Completed Plans

For each plan in `livespec/plans/active/`:
1. Read `plan.md` and check task checkboxes
2. If ALL tasks are checked `- [x]`:
   - Promote all specs from `plans/active/[plan]/specs/` to `livespec/projects/[project]/`
   - If target spec exists: merge scenarios (add new ones, update existing)
   - If target doesn't exist: move the file
   - Move entire plan folder to `livespec/plans/archived/YYYY-MM-DD-[plan-name]/`
   - Report promotions and archival

### 5. Report Summary

Output a summary:
```
## Housekeeping Report

### Spec Validity
- ✓ 12 specs valid
- ✗ 2 specs with issues (list them)

### Test Coverage
- ✓ 45/55 scenarios have tests
- Missing tests:
  - [PRJ.feature.scenario]
  - ...

### Completed Plans
- Promoted specs from "add-feature" → archived to 2025-12-13-add-feature/

### Actions Needed
- Add tests for 10 scenarios
- Fix 2 malformed specs
```
