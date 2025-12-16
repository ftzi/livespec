# Livespec Setup

Configure Livespec for this project by analyzing the codebase structure. This is used both for initial setup and also upgrading livespec to newer versions.

## Instructions

1. **Analyze the codebase** to detect projects:
   - Look for `package.json`, `apps/`, `packages/`, `src/`, API directories
   - Identify distinct projects (monorepo packages, standalone apps, backend APIs)
   - For each project, determine: name, type, codebase path

2. **Update the Projects table** in CLAUDE.md and/or AGENTS.md:
   - Find the table between `<!-- LIVESPEC:START -->` and `<!-- LIVESPEC:END -->`
   - Generate a 3-char code for each project (e.g., APP, API, WEB, CLI)
   - Populate: Livespec Code, Project name, Specs path, Codebase path
   - Preserve any existing entries that are still valid

3. **Check project.md files** for each project:
   - Path: `livespec/projects/[project-name]/project.md`
   - If missing: create with template (Overview, Domain Knowledge, Entry Points, UI Conventions)
   - If exists: check for missing sections and suggest additions

4. **Report what was done**:
   - List projects detected
   - Show changes made to CLAUDE.md
   - List project.md files created or updated

## Project Code Guidelines

- 3 characters, uppercase
- Derived from project name (e.g., "frontend" → FRO, "api" → API, "admin" → ADM)
- Must be unique within the project
