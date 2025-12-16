# Livespec Setup

Configure Livespec for this project by analyzing the codebase structure. This is used both for initial setup and also upgrading livespec to newer versions.

## Instructions

1. **Analyze the codebase** to detect projects:
   - Look for `package.json`, `apps/`, `packages/`, `src/`, API directories
   - Identify distinct projects (monorepo packages, standalone apps, backend APIs)
   - For each project, determine: name, type, codebase path

2. **Present proposed structure** to the user for approval:
   - Show the detected projects with their proposed 3-char codes
   - Show the proposed Projects table entries
   - Show which `project.md` files will be created or updated
   - **Wait for user approval** before making any changes

3. **Update the Projects table** in CLAUDE.md and/or AGENTS.md:
   - Find the table between `<!-- LIVESPEC:START -->` and `<!-- LIVESPEC:END -->`
   - Generate a 3-char code for each project (e.g., APP, API, WEB, CLI)
   - Populate: Livespec Code, Project name, Specs path, Codebase path
   - Preserve any existing entries that are still valid

4. **Check project.md files** for each project:
   - Path: `livespec/projects/[project-name]/project.md`
   - If missing: create with template (Overview, Domain Knowledge, Entry Points, UI Conventions)
   - If exists: check for missing sections and suggest additions

5. **Offer to generate initial specs** for projects with existing code:
   - Check if `livespec/projects/[project-name]/` has any spec.md files
   - If no specs exist and the project has existing code, **ask the user** if they want to generate initial specs
   - If yes: analyze the codebase to identify key features and generate spec files with scenarios
   - Focus on main features, entry points, and core functionality
   - Generated specs should be reviewed by the user as they document current behavior (which may include bugs)

6. **Report what was done**:
   - List projects detected
   - Show changes made to CLAUDE.md
   - List project.md files created or updated
   - List any spec files generated (if user opted in)

## Project Code Guidelines

- 3 characters, uppercase
- Derived from project name (e.g., "frontend" → FRO, "api" → API, "admin" → ADM)
- Must be unique within the project
