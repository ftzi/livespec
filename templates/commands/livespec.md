# Livespec: Project Setup & Management

You are helping the user manage their livespec configuration.

## When called without arguments

Scan the codebase and populate the livespec manifest:

1. **Read** `livespec/manifest.md` to see current projects
2. **Scan** the codebase to identify:
   - Package names (from package.json, Cargo.toml, go.mod, etc.)
   - Major directories that represent distinct projects/apps
   - Existing project folders in `livespec/projects/`
3. **Update** the manifest table with discovered projects:
   - Code: Short uppercase code (e.g., API, WEB, CLI)
   - Name: Human-readable project name
   - Path: Root path relative to repo (e.g., `packages/api`, `.`)
4. **Create** project folders in `livespec/projects/[code]/` for new projects
5. **Update** the projects table in CLAUDE.md/AGENTS.md if it exists

## When called with a request

Follow the full livespec workflow as described in `livespec/AGENTS.md`:

1. Determine if this needs a plan or can be done directly
2. If plan needed: create in `livespec/plans/active/`
3. Implement changes
4. Update relevant specs in `livespec/projects/`

## Output

After completing setup, show:
- Summary of projects found/added
- Any suggested next steps
