# Initialization [LIV.init]

The `init` function creates the livespec directory structure and files. It's the core logic used by the CLI for fresh initialization.

## Design Decisions

### Template-Based

All created files come from templates in the `templates/` directory. This allows updating the templates and having `livespec update` propagate changes to existing projects.

### Skip Existing by Default

When `skipExisting: true` (the default), existing files are preserved. This prevents accidentally overwriting user customizations.

### Create or Inject

CLAUDE.md and AGENTS.md are created if they don't exist, or the livespec section is injected into existing files. This ensures all projects have proper AI agent instructions.

---

## Directory Structure [LIV.init.directories]

### Scenario: Create livespec directory [LIV.init.directories.livespec]

- WHEN init runs in a directory without `livespec/`
- THEN `livespec/` directory is created
- AND result.created includes the directory path

### Scenario: Create projects directory [LIV.init.directories.projects]

- WHEN init runs
- THEN `livespec/projects/` directory is created

### Scenario: Create project subdirectory [LIV.init.directories.project]

- WHEN init runs with projectName "my-app"
- THEN `livespec/projects/my-app/` directory is created

### Scenario: Create plans directories [LIV.init.directories.plans]

- WHEN init runs
- THEN `livespec/plans/` directory is created
- AND `livespec/plans/active/` directory is created
- AND `livespec/plans/archived/` directory is created

### Scenario: Default project name [LIV.init.directories.default-name]

- WHEN init runs without projectName option
- THEN project subdirectory is named "my-project"

### Scenario: Handle directory creation errors [LIV.init.directories.errors]

- WHEN directory creation fails (e.g., permission denied)
- THEN error is added to result.errors
- AND init continues with remaining operations

---

## Template Files [LIV.init.templates]

### Scenario: Create livespec.md [LIV.init.templates.livespec-md]

- WHEN init runs
- THEN `livespec/livespec.md` is created from template
- AND file contains livespec instructions

### Scenario: Create project.md [LIV.init.templates.project-md]

- WHEN init runs with projectName "my-app"
- THEN `livespec/projects/my-app/project.md` is created from template
- AND file contains project template content

### Scenario: Inject version into livespec.md [LIV.init.templates.version]

- WHEN init runs
- THEN `livespec/livespec.md` contains version comment
- AND version matches package.json version
- AND format is `<!-- livespec-version: X.Y.Z -->`

### Scenario: Skip existing livespec.md [LIV.init.templates.skip-livespec]

- WHEN init runs with skipExisting: true
- AND `livespec/livespec.md` already exists
- THEN file is not overwritten
- AND result.skipped includes the file path

### Scenario: Overwrite existing when skipExisting false [LIV.init.templates.overwrite]

- WHEN init runs with skipExisting: false
- AND `livespec/livespec.md` already exists with custom content
- THEN file is overwritten with template
- AND result.updated includes the file path

---

## Section Injection [LIV.init.injection]

Injects livespec section into CLAUDE.md or AGENTS.md.

### Scenario: Prepend section to existing file [LIV.init.injection.prepend]

- WHEN injectClaudeMd: true
- AND CLAUDE.md exists without livespec section
- THEN livespec section is prepended to file
- AND original content is preserved after the section
- AND result.updated includes the file path

### Scenario: Replace existing section [LIV.init.injection.replace]

- WHEN injectClaudeMd: true
- AND CLAUDE.md contains `<!-- LIVESPEC:START -->` and `<!-- LIVESPEC:END -->`
- THEN content between markers is replaced with new section
- AND content outside markers is preserved

### Scenario: Skip injection when section exists and skipExisting [LIV.init.injection.skip]

- WHEN injectClaudeMd: true
- AND skipExisting: true
- AND CLAUDE.md already contains livespec section
- THEN file is not modified
- AND result.skipped includes the file path

### Scenario: Create file when doesn't exist [LIV.init.injection.create]

- WHEN injectClaudeMd: true
- AND CLAUDE.md does not exist
- THEN CLAUDE.md is created with livespec section
- AND result.created includes the file path

### Scenario: Inject into AGENTS.md [LIV.init.injection.agents]

- WHEN injectAgentsMd: true
- AND AGENTS.md exists
- THEN livespec section is added to AGENTS.md

### Scenario: Section content [LIV.init.injection.content]

- WHEN section is injected
- THEN it starts with `<!-- LIVESPEC:START -->`
- AND it ends with `<!-- LIVESPEC:END -->`
- AND it contains "# Livespec" heading
- AND it contains projects table
- AND it contains quick reference links

---

## AI Tool Commands [LIV.init.tools]

Creates the `/livespec` command file for AI coding assistants.

### Scenario: Create Claude Code command [LIV.init.tools.claude]

- WHEN tools includes "claude"
- THEN `.claude/commands/livespec.md` is created

### Scenario: Create GitHub Copilot command [LIV.init.tools.copilot]

- WHEN tools includes "copilot"
- THEN `.github/prompts/livespec.prompt.md` is created

### Scenario: Create Cursor command [LIV.init.tools.cursor]

- WHEN tools includes "cursor"
- THEN `.cursor/prompts/livespec.md` is created

### Scenario: Create Windsurf command [LIV.init.tools.windsurf]

- WHEN tools includes "windsurf"
- THEN `.windsurf/workflows/livespec.md` is created

### Scenario: Create Gemini CLI command [LIV.init.tools.gemini]

- WHEN tools includes "gemini"
- THEN `.gemini/commands/livespec.toml` is created
- AND file uses TOML format with prompt key

### Scenario: Create command directory [LIV.init.tools.directory]

- WHEN tools includes "claude"
- AND `.claude/commands/` does not exist
- THEN directory is created
- AND result.created includes the directory path

### Scenario: Skip existing command file [LIV.init.tools.skip]

- WHEN tools includes "claude"
- AND skipExisting: true
- AND `.claude/commands/livespec.md` already exists
- THEN file is not overwritten
- AND result.skipped includes the file path

---

## Result Tracking [LIV.init.result]

### Scenario: Track created items [LIV.init.result.created]

- WHEN init creates new directories and files
- THEN result.created contains all created paths

### Scenario: Track skipped items [LIV.init.result.skipped]

- WHEN init skips existing files
- THEN result.skipped contains all skipped paths

### Scenario: Track updated items [LIV.init.result.updated]

- WHEN init overwrites existing files
- THEN result.updated contains all updated paths

### Scenario: Track errors [LIV.init.result.errors]

- WHEN init encounters errors
- THEN result.errors contains error messages
- AND errors are human-readable

---

## isInitialized Check [LIV.init.is-initialized]

### Scenario: Empty directory [LIV.init.is-initialized.empty]

- WHEN directory has no livespec folder
- THEN isInitialized returns false

### Scenario: Partial structure [LIV.init.is-initialized.partial]

- WHEN `livespec/` exists
- AND `livespec/livespec.md` does not exist
- THEN isInitialized returns false

### Scenario: Complete structure [LIV.init.is-initialized.complete]

- WHEN `livespec/` exists
- AND `livespec/livespec.md` exists
- THEN isInitialized returns true

### Scenario: Minimal structure [LIV.init.is-initialized.minimal]

- WHEN only `livespec/livespec.md` exists (no other files)
- THEN isInitialized returns true
