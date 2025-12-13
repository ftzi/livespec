# Initialization [LSP.init]

The `init` function creates the livespec directory structure and files. It's the core logic used by the CLI for fresh initialization.

## Design Decisions

### Template-Based
All created files come from templates in the `templates/` directory. This allows updating the templates and having `livespec update` propagate changes to existing projects.

### Skip Existing by Default
When `skipExisting: true` (the default), existing files are preserved. This prevents accidentally overwriting user customizations.

### Injection into Existing Files
CLAUDE.md and AGENTS.md injection only works on existing files — livespec won't create these files. This respects that these are user-owned files.

---

## Directory Structure [LSP.init.directories]

### Scenario: Create livespec directory [LSP.init.directories.livespec]
Testing: unit

- WHEN init runs in a directory without `livespec/`
- THEN `livespec/` directory is created
- AND result.created includes the directory path

### Scenario: Create projects directory [LSP.init.directories.projects]
Testing: unit

- WHEN init runs
- THEN `livespec/projects/` directory is created

### Scenario: Create project subdirectory [LSP.init.directories.project]
Testing: unit

- WHEN init runs with projectName "my-app"
- THEN `livespec/projects/my-app/` directory is created

### Scenario: Create plans directories [LSP.init.directories.plans]
Testing: unit

- WHEN init runs
- THEN `livespec/plans/` directory is created
- AND `livespec/plans/active/` directory is created
- AND `livespec/plans/archived/` directory is created

### Scenario: Default project name [LSP.init.directories.default-name]
Testing: unit

- WHEN init runs without projectName option
- THEN project subdirectory is named "my-project"

### Scenario: Handle directory creation errors [LSP.init.directories.errors]
Testing: unit

- WHEN directory creation fails (e.g., permission denied)
- THEN error is added to result.errors
- AND init continues with remaining operations

---

## Template Files [LSP.init.templates]

### Scenario: Create livespec.md [LSP.init.templates.livespec-md]
Testing: unit

- WHEN init runs
- THEN `livespec/livespec.md` is created from template
- AND file contains livespec instructions

### Scenario: Create project.md [LSP.init.templates.project-md]
Testing: unit

- WHEN init runs with projectName "my-app"
- THEN `livespec/projects/my-app/project.md` is created from template
- AND file contains project template content

### Scenario: Skip existing livespec.md [LSP.init.templates.skip-livespec]
Testing: unit

- WHEN init runs with skipExisting: true
- AND `livespec/livespec.md` already exists
- THEN file is not overwritten
- AND result.skipped includes the file path

### Scenario: Overwrite existing when skipExisting false [LSP.init.templates.overwrite]
Testing: unit

- WHEN init runs with skipExisting: false
- AND `livespec/livespec.md` already exists with custom content
- THEN file is overwritten with template
- AND result.updated includes the file path

---

## Section Injection [LSP.init.injection]

Injects livespec section into CLAUDE.md or AGENTS.md.

### Scenario: Prepend section to existing file [LSP.init.injection.prepend]
Testing: unit

- WHEN injectClaudeMd: true
- AND CLAUDE.md exists without livespec section
- THEN livespec section is prepended to file
- AND original content is preserved after the section
- AND result.updated includes the file path

### Scenario: Replace existing section [LSP.init.injection.replace]
Testing: unit

- WHEN injectClaudeMd: true
- AND CLAUDE.md contains `<!-- LIVESPEC:START -->` and `<!-- LIVESPEC:END -->`
- THEN content between markers is replaced with new section
- AND content outside markers is preserved

### Scenario: Skip injection when section exists and skipExisting [LSP.init.injection.skip]
Testing: unit

- WHEN injectClaudeMd: true
- AND skipExisting: true
- AND CLAUDE.md already contains livespec section
- THEN file is not modified
- AND result.skipped includes the file path

### Scenario: Skip injection when file doesn't exist [LSP.init.injection.no-file]
Testing: unit

- WHEN injectClaudeMd: true
- AND CLAUDE.md does not exist
- THEN no file is created
- AND result.skipped includes the file path

### Scenario: Inject into AGENTS.md [LSP.init.injection.agents]
Testing: unit

- WHEN injectAgentsMd: true
- AND AGENTS.md exists
- THEN livespec section is added to AGENTS.md

### Scenario: Section content [LSP.init.injection.content]
Testing: unit

- WHEN section is injected
- THEN it starts with `<!-- LIVESPEC:START -->`
- AND it ends with `<!-- LIVESPEC:END -->`
- AND it contains "# Livespec" heading
- AND it contains projects table
- AND it contains quick reference links

---

## AI Tool Commands [LSP.init.tools]

Creates `/livespec` command files for AI coding assistants.

### Scenario: Create Claude Code command [LSP.init.tools.claude]
Testing: unit

- WHEN tools includes "claude"
- THEN `.claude/commands/livespec.md` is created

### Scenario: Create GitHub Copilot command [LSP.init.tools.copilot]
Testing: unit

- WHEN tools includes "copilot"
- THEN `.github/prompts/livespec.prompt.md` is created

### Scenario: Create Cursor command [LSP.init.tools.cursor]
Testing: unit

- WHEN tools includes "cursor"
- THEN `.cursor/prompts/livespec.md` is created

### Scenario: Create Windsurf command [LSP.init.tools.windsurf]
Testing: unit

- WHEN tools includes "windsurf"
- THEN `.windsurf/workflows/livespec.md` is created

### Scenario: Create command directory [LSP.init.tools.directory]
Testing: unit

- WHEN tools includes "claude"
- AND `.claude/commands/` does not exist
- THEN directory is created
- AND result.created includes the directory path

### Scenario: Skip existing command file [LSP.init.tools.skip]
Testing: unit

- WHEN tools includes "claude"
- AND skipExisting: true
- AND `.claude/commands/livespec.md` already exists
- THEN file is not overwritten
- AND result.skipped includes the file path

---

## Result Tracking [LSP.init.result]

### Scenario: Track created items [LSP.init.result.created]
Testing: unit

- WHEN init creates new directories and files
- THEN result.created contains all created paths

### Scenario: Track skipped items [LSP.init.result.skipped]
Testing: unit

- WHEN init skips existing files
- THEN result.skipped contains all skipped paths

### Scenario: Track updated items [LSP.init.result.updated]
Testing: unit

- WHEN init overwrites existing files
- THEN result.updated contains all updated paths

### Scenario: Track errors [LSP.init.result.errors]
Testing: unit

- WHEN init encounters errors
- THEN result.errors contains error messages
- AND errors are human-readable

---

## isInitialized Check [LSP.init.is-initialized]

### Scenario: Empty directory [LSP.init.is-initialized.empty]
Testing: unit

- WHEN directory has no livespec folder
- THEN isInitialized returns false

### Scenario: Partial structure [LSP.init.is-initialized.partial]
Testing: unit

- WHEN `livespec/` exists
- AND `livespec/livespec.md` does not exist
- THEN isInitialized returns false

### Scenario: Complete structure [LSP.init.is-initialized.complete]
Testing: unit

- WHEN `livespec/` exists
- AND `livespec/livespec.md` exists
- THEN isInitialized returns true

### Scenario: Minimal structure [LSP.init.is-initialized.minimal]
Testing: unit

- WHEN only `livespec/livespec.md` exists (no other files)
- THEN isInitialized returns true
