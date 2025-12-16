# Plan: Add /livespec-setup Command

## Summary

Add a `/livespec-setup` slash command that automatically detects projects in the codebase and configures Livespec files (CLAUDE.md Projects table, project.md files).

## Why

Currently, users must manually populate the Projects table in CLAUDE.md and create project.md files. This is tedious and error-prone. An AI-native setup command can analyze the codebase and configure everything automatically.

## What Changes

- Add `/livespec-setup` slash command
- Command analyzes codebase to detect projects
- Populates/updates Projects table in CLAUDE.md or AGENTS.md
- Creates or updates `project.md` files with required sections

## Tasks

### Phase 1: Command Setup

- [x] Create `templates/commands/livespec-setup.md` slash command file
- [x] Define command prompt that instructs AI to:
  - Analyze codebase structure (look for package.json, src/, apps/, packages/, etc.)
  - Detect distinct projects (monorepo packages, standalone apps, APIs)
  - Suggest 3-char project codes based on project names

### Phase 2: CLAUDE.md Updates

- [x] Find CLAUDE.md or AGENTS.md in project root
- [x] Locate the Projects table (between LIVESPEC markers)
- [x] Populate table with detected projects:
  - Livespec Code (3-char)
  - Project name
  - Specs path (`livespec/projects/[name]/`)
  - Codebase path

### Phase 3: project.md Files

- [x] For each detected project, check if `livespec/projects/[name]/project.md` exists
- [x] If missing, create with template structure (Overview, Domain Knowledge, Entry Points, UI Conventions)
- [x] If exists, check for missing required sections and suggest additions

## Affected Specs

- `[LIV.commands]` — ADDED (new command spec)
