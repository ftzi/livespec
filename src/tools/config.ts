export type AITool = "claude" | "copilot" | "cursor" | "windsurf" | "gemini"

export type AIToolConfig = {
	id: AITool
	name: string
	commandDir: string
	commandFile: string
	commandExample: string
}

export const AI_TOOLS: Record<AITool, AIToolConfig> = {
	claude: {
		id: "claude",
		name: "Claude Code",
		commandDir: ".claude/commands",
		commandFile: "livespec.md",
		commandExample: "/livespec",
	},
	copilot: {
		id: "copilot",
		name: "GitHub Copilot",
		commandDir: ".github/prompts",
		commandFile: "livespec.prompt.md",
		commandExample: "/livespec",
	},
	cursor: {
		id: "cursor",
		name: "Cursor",
		commandDir: ".cursor/prompts",
		commandFile: "livespec.md",
		commandExample: "/livespec",
	},
	windsurf: {
		id: "windsurf",
		name: "Windsurf",
		commandDir: ".windsurf/workflows",
		commandFile: "livespec.md",
		commandExample: "/livespec",
	},
	gemini: {
		id: "gemini",
		name: "Gemini CLI",
		commandDir: ".gemini/commands",
		commandFile: "livespec.toml",
		commandExample: "/livespec",
	},
}

export const ALL_TOOLS = Object.keys(AI_TOOLS) as AITool[]

export function getToolConfig(tool: AITool): AIToolConfig {
	return AI_TOOLS[tool]
}

export function getCommandPath(tool: AITool): string {
	const config = AI_TOOLS[tool]
	return `${config.commandDir}/${config.commandFile}`
}
