export type AITool = "claude" | "copilot" | "cursor" | "windsurf"

export type AIToolConfig = {
	id: AITool
	name: string
	commandDir: string
	commandFile: string
	syncCommandFile: string
	setupCommandFile: string
	commandExample: string
}

export const AI_TOOLS: Record<AITool, AIToolConfig> = {
	claude: {
		id: "claude",
		name: "Claude Code",
		commandDir: ".claude/commands",
		commandFile: "livespec.md",
		syncCommandFile: "livespec-sync.md",
		setupCommandFile: "livespec-setup.md",
		commandExample: "/livespec",
	},
	copilot: {
		id: "copilot",
		name: "GitHub Copilot",
		commandDir: ".github/prompts",
		commandFile: "livespec.prompt.md",
		syncCommandFile: "livespec-sync.prompt.md",
		setupCommandFile: "livespec-setup.prompt.md",
		commandExample: "/livespec",
	},
	cursor: {
		id: "cursor",
		name: "Cursor",
		commandDir: ".cursor/prompts",
		commandFile: "livespec.md",
		syncCommandFile: "livespec-sync.md",
		setupCommandFile: "livespec-setup.md",
		commandExample: "/livespec",
	},
	windsurf: {
		id: "windsurf",
		name: "Windsurf",
		commandDir: ".windsurf/workflows",
		commandFile: "livespec.md",
		syncCommandFile: "livespec-sync.md",
		setupCommandFile: "livespec-setup.md",
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
