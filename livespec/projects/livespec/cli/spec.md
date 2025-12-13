# CLI [LSP.cli]

The livespec CLI initializes and updates livespec configuration in projects. It's invoked via `npx livespec` or `livespec` if installed globally.

## Entry Points

| Command | Description |
|---------|-------------|
| `npx livespec` | Initialize or update livespec |
| `npx livespec -y` | Skip prompts, use defaults |
| `npx livespec --help` | Show help message |

## Design Decisions

### Single Command Design
The CLI has one primary command that auto-detects whether to initialize or update based on existing state. This keeps usage simple — users just run `livespec` and it does the right thing.

### Interactive by Default
Fresh initialization prompts for configuration choices. The `-y` flag enables non-interactive mode for CI/scripts.

### Project Name from Directory
The default project name is derived from the current directory name, avoiding an extra prompt while still being sensible.

---

## Help [LSP.cli.help]

### Scenario: Show help with -h flag [LSP.cli.help.short-flag]
Testing: unit

- WHEN user runs `livespec -h`
- THEN help text is displayed
- AND process exits without error

### Scenario: Show help with --help flag [LSP.cli.help.long-flag]
Testing: unit

- WHEN user runs `livespec --help`
- THEN help text is displayed
- AND process exits without error

### Scenario: Help text content [LSP.cli.help.content]
Testing: unit

- WHEN help is displayed
- THEN it shows usage: `npx livespec [options]`
- AND it shows `-y, --yes` option for skipping prompts
- AND it shows `-h, --help` option for help

---

## Fresh Initialization [LSP.cli.fresh-init]

Runs when `livespec/livespec.md` does not exist.

### Scenario: Detect fresh project [LSP.cli.fresh-init.detection]
Testing: unit

- WHEN `livespec/` directory does not exist
- THEN CLI enters fresh initialization mode

### Scenario: Detect fresh with partial structure [LSP.cli.fresh-init.partial]
Testing: unit

- WHEN `livespec/` directory exists
- AND `livespec/livespec.md` does not exist
- THEN CLI enters fresh initialization mode

### Scenario: Prompt for injection targets [LSP.cli.fresh-init.injection-prompt]
Testing: unit

- WHEN CLAUDE.md exists in project root
- AND AGENTS.md exists in project root
- AND `-y` flag is not set
- THEN CLI prompts "Setup livespec in:" with multiselect
- AND both files are pre-selected by default

### Scenario: Only show existing files in injection prompt [LSP.cli.fresh-init.injection-existing-only]
Testing: unit

- WHEN CLAUDE.md exists but AGENTS.md does not
- THEN injection prompt only shows CLAUDE.md option

### Scenario: Skip injection prompt when no files exist [LSP.cli.fresh-init.no-injection-files]
Testing: unit

- WHEN neither CLAUDE.md nor AGENTS.md exist
- THEN injection prompt is skipped

### Scenario: Prompt for AI tools [LSP.cli.fresh-init.tools-prompt]
Testing: unit

- WHEN `-y` flag is not set
- THEN CLI prompts "Setup /livespec command for:" with multiselect
- AND options include: Claude Code, GitHub Copilot, Cursor, Windsurf
- AND Claude Code is pre-selected by default

### Scenario: Skip prompts with -y flag [LSP.cli.fresh-init.skip-prompts]
Testing: unit

- WHEN `-y` flag is set
- THEN no prompts are shown
- AND CLAUDE.md is injected if it exists
- AND AGENTS.md is injected if it exists
- AND Claude Code tool command is created

### Scenario: Cancel on escape [LSP.cli.fresh-init.cancel]
Testing: unit

- WHEN user cancels any prompt (Ctrl+C or Escape)
- THEN CLI shows "Cancelled." message
- AND exits without making changes

### Scenario: Show next steps after init [LSP.cli.fresh-init.next-steps]
Testing: unit

- WHEN initialization completes successfully
- THEN CLI shows "Next steps" note
- AND includes command example for selected tools
- AND includes "Add specs in livespec/projects/"
- AND includes "Read livespec/livespec.md for the full workflow"

### Scenario: Show errors if any [LSP.cli.fresh-init.errors]
Testing: unit

- WHEN initialization encounters errors (e.g., permission denied)
- THEN errors are displayed to user
- AND initialization continues for other files

---

## Update Mode [LSP.cli.update]

Runs when `livespec/livespec.md` already exists.

### Scenario: Detect initialized project [LSP.cli.update.detection]
Testing: unit

- WHEN `livespec/` directory exists
- AND `livespec/livespec.md` exists
- THEN CLI enters update mode

### Scenario: Prompt for update action [LSP.cli.update.prompt]
Testing: unit

- WHEN in update mode
- AND `-y` flag is not set
- THEN CLI prompts "Livespec is already initialized. What would you like to do?"
- AND options are: "Update base files", "Cancel"

### Scenario: Cancel update [LSP.cli.update.cancel]
Testing: unit

- WHEN user selects "Cancel"
- THEN CLI shows "Cancelled." message
- AND exits without making changes

### Scenario: Skip prompt with -y flag [LSP.cli.update.skip-prompt]
Testing: unit

- WHEN in update mode
- AND `-y` flag is set
- THEN update proceeds without prompting

### Scenario: Detect installed tools [LSP.cli.update.detect-tools]
Testing: unit

- WHEN update runs
- THEN CLI detects which AI tools have command files installed
- AND updates only those tools' command files

### Scenario: Detect injected sections [LSP.cli.update.detect-sections]
Testing: unit

- WHEN update runs
- THEN CLI detects which files have livespec sections
- AND updates only those files' sections

### Scenario: Report update results [LSP.cli.update.results]
Testing: unit

- WHEN update completes
- AND files were updated
- THEN CLI shows "Updated N files."

### Scenario: Report no changes [LSP.cli.update.no-changes]
Testing: unit

- WHEN update completes
- AND no files needed updating
- THEN CLI shows "All N files unchanged."
