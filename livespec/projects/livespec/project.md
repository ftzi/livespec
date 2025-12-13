# Livespec CLI [LIV]

Living specification management tool for AI-native development. Provides a CLI and framework for maintaining specifications that evolve with code.

## Codebase

- **Location:** `src/`
- **Package:** `@ftzi/livespec`
- **CLI command:** `livespec`

## Domain Knowledge

- **Templates**: Files in `templates/` that are copied during initialization
- **Injection**: Adding livespec section to CLAUDE.md/AGENTS.md between markers
- **Markers**: `<!-- LIVESPEC:START -->` and `<!-- LIVESPEC:END -->` delimit the managed section
- **AI Tools**: Supported tools are Claude Code, GitHub Copilot, Cursor, Windsurf

## Entry Points

| Command               | Spec                              | Description                   |
| --------------------- | --------------------------------- | ----------------------------- |
| `npx livespec`        | [LIV.cli]                         | Initialize or update livespec |
| `npx livespec -y`     | [LIV.cli.fresh-init.skip-prompts] | Non-interactive mode          |
| `npx livespec --help` | [LIV.cli.help]                    | Show help                     |

## Specs

| Feature              | Spec                             |
| -------------------- | -------------------------------- |
| CLI behavior         | [cli/spec.md](cli/spec.md)       |
| Initialization logic | [init/spec.md](init/spec.md)     |
| Update logic         | [update/spec.md](update/spec.md) |

## Conventions

- Uses Bun as package manager and runtime
- Biome for linting and formatting
- TypeScript with strict conventions (no `any`, no `interface`)
- Test files co-located with source (e.g., `init.test.ts`)
