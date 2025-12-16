The following LIVESPEC section is injected by the @templates/AGENTS-SECTION.md file. When updating this section, you **MUST** also update that file to keep them in sync.

<!-- LIVESPEC:START -->

# Livespec

This project uses **[Livespec](https://github.com/ftzi/livespec)** for living specification management.

## Understanding Keywords

This document uses keywords to indicate requirement severity:

- **MUST** — Mandatory. No exceptions. Violations cause issues.
- **NEVER** — Prohibited. Will cause problems or break functionality.

These represent hard-learned lessons and project-critical requirements.

**FIRST ACTION:** You **MUST** ALWAYS read @livespec/livespec.md before responding to ANY message. This file **MUST** always stay fully in context — after compaction or summarization, re-read it immediately to restore full conventions.

## Projects

**Keep this table updated** — when you add, rename, or remove projects, update this table immediately.

| Livespec Code | Project | Specs | Codebase |
| ------------- | ------- | ----- | -------- |
|               |         |       |          |

<!-- LIVESPEC:END -->



**Important:** If you discover any information in this file that is no longer accurate or has become outdated, please update it immediately to reflect the current state of the codebase.

**README Sync:** README.md MUST be kept in sync with the project. When changing features, workflows, or conventions, update README.md to reflect those changes.

**Workflow Rule:** Always run `bun ok` after finishing a task or when facing issues. This command runs type checking, linting, and tests across the entire codebase and must fully pass before considering a task complete.

**NEVER commit or push:** Do NOT run `git add`, `git commit`, or `git push`. The user handles all git operations manually.

## Project Overview

**Livespec** is a living specification management tool for AI-native development. It provides a CLI and framework for maintaining specifications that evolve with code.

IMPORTANT: **This project both develops Livespec itself and uses it to manage its own specifications.**

- **NPM Package:** `@ftzi/livespec` (npm)

## Common Commands

- `bun test` - Run unit tests
- `bun ok` - Run ts (typechecking), lint, and test (quick)

## Architecture

### Source Structure

```
src/
├── bin.ts              # CLI entry point
├── index.ts            # Main exports
├── init.ts             # Initialization logic
├── help.ts             # Help command
└── templates/          # Template files for scaffolding
```

### Key Files

- `src/bin.ts` - CLI entry point, parses commands via native `process.argv`
- `src/init.ts` - `livespec init` command implementation
- `src/help.ts` - Help text and usage information
- `templates/` - Template files copied during initialization

**Templates Rule:** When changing livespec conventions or rules (e.g., spec format, naming requirements), also update the corresponding files in `templates/` since these are scaffolded to new projects.

### Dependencies

- **Runtime:** `@clack/prompts` for interactive CLI prompts
- **Dev:** Biome (linting), TypeScript

## Code Quality Standards

**TypeScript Conventions:**

- **NEVER use `any` type** - Use `unknown` if type is truly unknown
- **NEVER use `interface`** - Always use `type` instead
- Prefer object parameters over multiple direct parameters

**Import Conventions:**

- **NEVER use barrel files** - Import directly from source files
- Exception: `src/index.ts` is the public API entry point

**Comments:**

- Do NOT add comments explaining what changes you just made
- Only add comments for complex logic that isn't self-evident

**Testing:**

- Test files should be co-located with source files (e.g., `init.ts` → `init.test.ts`)
- Run `bun test` to execute all unit tests

## Important Notes

- **Package Manager:** Always use `bun` instead of npm/yarn/pnpm
- **Type:** ESM module (`"type": "module"` in package.json)
