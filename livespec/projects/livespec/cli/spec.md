# CLI [LIV.cli]

The livespec CLI initializes and updates livespec configuration in projects. It's invoked via `npx livespec` or `livespec` if installed globally.

## Entry Points

| Command               | Description                   |
| --------------------- | ----------------------------- |
| `npx livespec`        | Initialize or update livespec |
| `npx livespec -y`     | Skip prompts, use defaults    |
| `npx livespec --help` | Show help message             |

## Design Decisions

### Single Command Design

The CLI has one primary command that auto-detects whether to initialize or update based on existing state. This keeps usage simple — users just run `livespec` and it does the right thing.

### Interactive by Default

Fresh initialization prompts for configuration choices. The `-y` flag enables non-interactive mode for CI/scripts.

### Project Name from Directory

The default project name is derived from the current directory name, avoiding an extra prompt while still being sensible.

---

## Help [LIV.cli.help]

### Scenario: Show help with -h flag [LIV.cli.help.short-flag]

- WHEN user runs `livespec -h`
- THEN help text is displayed
- AND process exits without error

### Scenario: Show help with --help flag [LIV.cli.help.long-flag]

- WHEN user runs `livespec --help`
- THEN help text is displayed
- AND process exits without error

### Scenario: Help text content [LIV.cli.help.content]

- WHEN help is displayed
- THEN it shows usage: `npx livespec [options]`
- AND it shows `-y, --yes` option for skipping prompts
- AND it shows `-h, --help` option for help

---

## Fresh Initialization [LIV.cli.fresh-init]

Runs when `livespec/livespec.md` does not exist.

### Scenario: Detect fresh project [LIV.cli.fresh-init.detection]

- WHEN `livespec/` directory does not exist
- THEN CLI enters fresh initialization mode

### Scenario: Detect fresh with partial structure [LIV.cli.fresh-init.partial]

- WHEN `livespec/` directory exists
- AND `livespec/livespec.md` does not exist
- THEN CLI enters fresh initialization mode

### Scenario: Prompt for injection targets [LIV.cli.fresh-init.injection-prompt]

- WHEN CLAUDE.md exists in project root
- AND AGENTS.md exists in project root
- AND `-y` flag is not set
- THEN CLI prompts "Setup livespec in:" with multiselect
- AND both files are pre-selected by default

### Scenario: Only show existing files in injection prompt [LIV.cli.fresh-init.injection-existing-only]

- WHEN CLAUDE.md exists but AGENTS.md does not
- THEN injection prompt only shows CLAUDE.md option

### Scenario: Skip injection prompt when no files exist [LIV.cli.fresh-init.no-injection-files]

- WHEN neither CLAUDE.md nor AGENTS.md exist
- THEN injection prompt is skipped

### Scenario: Prompt for AI tools [LIV.cli.fresh-init.tools-prompt]

- WHEN `-y` flag is not set
- THEN CLI prompts "Setup /livespec command for:" with multiselect
- AND options include: Claude Code, GitHub Copilot, Cursor, Windsurf
- AND Claude Code is pre-selected by default

### Scenario: Skip prompts with -y flag [LIV.cli.fresh-init.skip-prompts]

- WHEN `-y` flag is set
- THEN no prompts are shown
- AND CLAUDE.md is injected if it exists
- AND AGENTS.md is injected if it exists
- AND Claude Code tool command is created

### Scenario: Cancel on escape [LIV.cli.fresh-init.cancel]

- WHEN user cancels any prompt (Ctrl+C or Escape)
- THEN CLI shows "Cancelled." message
- AND exits without making changes

### Scenario: Show next steps after init [LIV.cli.fresh-init.next-steps]

- WHEN initialization completes successfully
- THEN CLI shows "Next steps" note
- AND includes "Run /livespec-setup in [tool names] to configure projects"
- AND includes "Add specs in livespec/projects/"
- AND includes "Read livespec/livespec.md for the full workflow"

### Scenario: Show errors if any [LIV.cli.fresh-init.errors]

- WHEN initialization encounters errors (e.g., permission denied)
- THEN errors are displayed to user
- AND initialization continues for other files

---

## Update Mode [LIV.cli.update]

Runs when `livespec/livespec.md` already exists.

### Scenario: Detect initialized project [LIV.cli.update.detection]

- WHEN `livespec/` directory exists
- AND `livespec/livespec.md` exists
- THEN CLI enters update mode

### Scenario: Skip update when already up to date [LIV.cli.update.already-current]

- WHEN in update mode
- AND livespec.md version matches package.json version
- THEN CLI shows "Already up to date (vX.Y.Z)."
- AND exits without prompting

### Scenario: Show version in update prompt [LIV.cli.update.version-prompt]

- WHEN in update mode
- AND livespec.md version differs from package.json version
- AND `-y` flag is not set
- THEN CLI shows "Update available: vX.Y.Z → vX.Y.Z"
- AND prompts with options: "Update base files", "Cancel"

### Scenario: Handle missing version [LIV.cli.update.missing-version]

- WHEN in update mode
- AND livespec.md has no version comment
- THEN CLI shows "Version not found in livespec.md. Latest: vX.Y.Z"
- AND prompts for update

### Scenario: Prompt for update action [LIV.cli.update.prompt]

- WHEN in update mode
- AND `-y` flag is not set
- AND version differs or is missing
- THEN CLI prompts with options: "Update base files", "Cancel"

### Scenario: Cancel update [LIV.cli.update.cancel]

- WHEN user selects "Cancel"
- THEN CLI shows "Cancelled." message
- AND exits without making changes

### Scenario: Skip prompt with -y flag [LIV.cli.update.skip-prompt]

- WHEN in update mode
- AND `-y` flag is set
- THEN update proceeds without prompting

### Scenario: Detect installed tools [LIV.cli.update.detect-tools]

- WHEN update runs
- THEN CLI detects which AI tools have command files installed
- AND updates only those tools' command files

### Scenario: Detect injected sections [LIV.cli.update.detect-sections]

- WHEN update runs
- THEN CLI detects which files have livespec sections
- AND updates only those files' sections

### Scenario: Report update results [LIV.cli.update.results]

- WHEN update completes
- AND files were updated
- THEN CLI shows "Next step" note to run /livespec-setup
- AND CLI shows "Updated N files to vX.Y.Z."

### Scenario: Report no changes [LIV.cli.update.no-changes]

- WHEN update completes
- AND no files needed updating
- THEN CLI shows "All files unchanged."
