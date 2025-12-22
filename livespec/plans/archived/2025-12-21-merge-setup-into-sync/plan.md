# Plan: Merge livespec-setup into livespec-sync

## Summary

Consolidate `/livespec-setup` and `/livespec-sync` into a single `/livespec-sync` command that handles both project structure validation and spec/test synchronization.

## Why

- **Simpler mental model**: One command to "ensure everything is aligned"
- **Setup IS sync**: Setting up projects is syncing the structure layer; checking specs is syncing the spec layer
- **Less maintenance**: Fewer command files, simpler config
- **Progressive checking**: Structure must be valid before spec checks make sense

## Design Decision: Workflow Pattern

### The Challenge

For large projects, full sync can be slow. Users need control over when to run expensive operations.

### Chosen Pattern: Progressive Sync with Smart Prompting

```
/livespec-sync workflow:

1. STRUCTURE CHECK (fast, always runs)
   ├─ Verify Projects table matches detected projects
   ├─ Verify project.md files exist with required sections
   ├─ If all good → go to step 3
   └─ If issues → go to step 2

2. STRUCTURE SETUP (only if step 1 found issues)
   ├─ Show detected issues
   ├─ Propose fixes (new projects, missing project.md, etc.)
   ├─ Get user approval
   ├─ Apply fixes
   └─ Prompt: "Structure updated. Continue with full sync?"
       ├─ Yes → go to step 3
       └─ No → exit (user just wanted setup)

3. SCOPE SELECTION
   ├─ Count specs/projects
   ├─ If large (>20 specs or >3 projects): prompt for scope
   │   ├─ Full sync (all projects)
   │   ├─ By project (specific project only)
   │   ├─ Changed only (git diff based)
   │   └─ Skip sync (just did structure check)
   └─ If small: proceed with full sync

4. SYNC EXECUTION
   └─ Validate specs, check coverage, detect entry points, auto-promote/archive

5. REPORT
   ├─ Create sync report (includes structure status + spec status)
   └─ Walk through suggestions with user
```

### Why This Pattern Works

1. **Fast happy path**: Structure OK → scope choice (or auto-full for small) → sync
2. **Smart prompting**: Only prompt after setup IF changes were made AND before expensive operation
3. **No friction for small projects**: Auto-proceeds without unnecessary prompts
4. **Respects user time**: Large projects get scope choice
5. **Natural break points**: After setup is a logical place to pause

### Alternative Considered: Always Prompt

Could always ask "Continue with sync?" after structure check, but this adds friction when structure is already fine. Rejected.

## What Changes

### Files to Modify

1. **`templates/commands/livespec-sync.md`**
   - Add structure check section from livespec-setup.md
   - Restructure workflow with the progressive pattern above

2. **`templates/commands/livespec-setup.md`**
   - DELETE this file

3. **`src/tools/config.ts`**
   - Remove `setupCommandFile` from AIToolConfig type
   - Remove `setupCommandFile` from each tool's config

4. **`src/init.ts`**
   - Remove setup command file creation from `setupToolCommand()`
   - Update to only create 2 files (livespec.md, livespec-sync.md)

5. **`src/init.ts` - `updateToolCommand()`**
   - Remove setup command file updating

6. **`livespec/projects/livespec/cli/spec.md`**
   - Update scenarios for 2 command files instead of 3

7. **`livespec/projects/livespec/init/spec.md`**
   - Update `[LIV.init.tools.claude-all]` and similar scenarios

8. **Tests**
   - Update tests that reference 3 command files

### Files to Delete

- `templates/commands/livespec-setup.md`
- `.claude/commands/livespec-setup.md` (local dev)

## Tasks

### Phase 1: Update Command Template

- [x] Merge setup content into `templates/commands/livespec-sync.md`
- [x] Implement the progressive workflow pattern
- [x] Delete `templates/commands/livespec-setup.md`

### Phase 2: Update Code

- [x] Remove `setupCommandFile` from `src/tools/config.ts`
- [x] Update `setupToolCommand()` in `src/init.ts` to create 2 files
- [x] Update `updateToolCommand()` in `src/init.ts` to update 2 files

### Phase 3: Update Specs

- [x] Update `cli/spec.md` — change references to livespec-sync
- [x] Update `init/spec.md` — update tool scenarios
- [x] Update `update/spec.md` — update tool scenarios

### Phase 4: Update Tests

- [x] Update `tools/tools.test.ts` — test for 2 files instead of 3
- [x] Run `bun ok` to verify

### Phase 5: Cleanup

- [x] Delete local `.claude/commands/livespec-setup.md`
- [x] Update `templates/livespec.md` — merge setup into sync docs
- [x] Update `src/bin.ts` — change next steps to reference sync

## Affected Specs

- `[LIV.init.tools.claude-all]` — MODIFIED (3 files → 2 files)
- `[LIV.init.tools.copilot]` — MODIFIED
- `[LIV.init.tools.cursor]` — MODIFIED
- `[LIV.init.tools.windsurf]` — MODIFIED
- `[LIV.update.tools.update-all]` — MODIFIED (3 files → 2 files)
