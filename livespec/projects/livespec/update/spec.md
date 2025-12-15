# Update [LIV.update]

The `updateBaseFiles` function updates livespec files to the latest templates. Used when livespec is already initialized and user wants to get the latest conventions/instructions.

## Design Decisions

### Content Comparison

Files are only written if their content differs from the template. This avoids unnecessary file modifications and git noise.

### Preserves User Content

For CLAUDE.md/AGENTS.md, only the section between markers is replaced. All other content is preserved.

### Tool Detection

Instead of prompting, update mode auto-detects which AI tools have command files installed and only updates those.

---

## Base File Updates [LIV.update.base-files]

### Scenario: Update livespec.md [LIV.update.base-files.livespec-md]

- WHEN livespec.md content differs from template
- THEN file is overwritten with latest template
- AND result.updated includes the file path

### Scenario: Update version in livespec.md [LIV.update.base-files.version]

- WHEN livespec.md is updated
- THEN version comment is updated to current package.json version
- AND format is `<!-- livespec-version: X.Y.Z -->`

### Scenario: Skip unchanged livespec.md [LIV.update.base-files.skip-unchanged]

- WHEN livespec.md content matches template exactly
- THEN file is not modified
- AND result.skipped includes the file path

### Scenario: Create missing livespec.md [LIV.update.base-files.create-missing]

- WHEN livespec.md does not exist
- THEN file is created from template
- AND result.created includes the file path

---

## Section Updates [LIV.update.sections]

### Scenario: Update CLAUDE.md section [LIV.update.sections.claude]

- WHEN injectClaudeMd: true
- AND CLAUDE.md has outdated livespec section
- THEN section is replaced with latest template
- AND content outside markers is preserved

### Scenario: Update AGENTS.md section [LIV.update.sections.agents]

- WHEN injectAgentsMd: true
- AND AGENTS.md has outdated livespec section
- THEN section is replaced with latest template

### Scenario: Skip when not requested [LIV.update.sections.skip]

- WHEN injectClaudeMd: false
- THEN CLAUDE.md is not modified
- AND it's not included in any result arrays

---

## Tool Command Updates [LIV.update.tools]

### Scenario: Update tool command file [LIV.update.tools.update]

- WHEN tools includes "claude"
- AND .claude/commands/livespec.md content differs from template
- THEN file is overwritten with latest template

### Scenario: Skip unchanged command [LIV.update.tools.skip]

- WHEN tools includes "claude"
- AND .claude/commands/livespec.md matches template
- THEN file is not modified
- AND result.skipped includes the file path

### Scenario: Create missing command file [LIV.update.tools.create]

- WHEN tools includes "claude"
- AND .claude/commands/livespec.md does not exist
- THEN file is created from template
- AND result.created includes the file path

---

## Tool Detection [LIV.update.detect-tools]

### Scenario: Detect installed Claude command [LIV.update.detect-tools.claude]

- WHEN `.claude/commands/livespec.md` exists
- THEN detectInstalledTools returns array containing "claude"

### Scenario: Detect multiple tools [LIV.update.detect-tools.multiple]

- WHEN `.claude/commands/livespec.md` exists
- AND `.cursor/prompts/livespec.md` exists
- THEN detectInstalledTools returns ["claude", "cursor"]

### Scenario: Detect no tools [LIV.update.detect-tools.none]

- WHEN no tool command files exist
- THEN detectInstalledTools returns empty array
