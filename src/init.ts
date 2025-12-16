import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { LIVESPEC_END_MARKER, LIVESPEC_START_MARKER } from "./consts"
import { AI_TOOLS, type AITool } from "./tools/config"

export type { AITool }

const __dirname = dirname(fileURLToPath(import.meta.url))

const VERSION_REGEX = /<!--\s*livespec-version:\s*([\d.]+)\s*-->/

function getVersion(): string {
	const packageJsonPath = join(__dirname, "..", "package.json")
	const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"))
	return packageJson.version
}

/**
 * Extract the livespec version from a livespec.md file.
 * Returns null if version not found.
 */
export function extractLivespecVersion(filePath: string): string | null {
	if (!existsSync(filePath)) return null
	const content = readFileSync(filePath, "utf-8")
	const match = content.match(VERSION_REGEX)
	return match?.[1] ?? null
}

/**
 * Check if livespec.md needs updating based on version comparison.
 */
export function needsUpdate(cwd: string = process.cwd()): {
	needsUpdate: boolean
	currentVersion: string | null
	latestVersion: string
} {
	const livespecMdPath = join(cwd, "livespec", "livespec.md")
	const currentVersion = extractLivespecVersion(livespecMdPath)
	const latestVersion = getVersion()

	return {
		needsUpdate: currentVersion !== latestVersion,
		currentVersion,
		latestVersion,
	}
}

export type InitOptions = {
	cwd?: string
	projectName?: string
	skipExisting?: boolean
	injectClaudeMd?: boolean
	injectAgentsMd?: boolean
	tools?: AITool[]
}

export type InitResult = {
	created: string[]
	skipped: string[]
	updated: string[]
	errors: string[]
}

type WriteFileOptions = {
	filePath: string
	content: string
	skipExisting: boolean
	result: InitResult
}

type InjectSectionOptions = {
	filePath: string
	skipExisting: boolean
	result: InitResult
}

type SetupToolCommandOptions = {
	cwd: string
	tool: AITool
	skipExisting: boolean
	result: InitResult
}

function getTemplatePath(templateName: string): string {
	return join(__dirname, "..", "templates", templateName)
}

function readTemplate(templateName: string): string {
	let content = readFileSync(getTemplatePath(templateName), "utf-8")
	content = content.replace("{{VERSION}}", getVersion())
	return content
}

/**
 * Initialize livespec in the given directory.
 */
export function init(options: InitOptions = {}): InitResult {
	const {
		cwd = process.cwd(),
		projectName = "my-project",
		skipExisting = true,
		injectClaudeMd = false,
		injectAgentsMd = false,
		tools = [],
	} = options

	const result: InitResult = {
		created: [],
		skipped: [],
		updated: [],
		errors: [],
	}

	const livespecDir = join(cwd, "livespec")
	const projectsDir = join(livespecDir, "projects")
	const projectDir = join(projectsDir, projectName)
	const plansDir = join(livespecDir, "plans")
	const activePlansDir = join(plansDir, "active")
	const archivedPlansDir = join(plansDir, "archived")

	// Create directories
	const directories = [livespecDir, projectsDir, projectDir, plansDir, activePlansDir, archivedPlansDir]

	for (const dir of directories) {
		if (!existsSync(dir)) {
			try {
				mkdirSync(dir, { recursive: true })
				result.created.push(dir)
			} catch (_error) {
				result.errors.push(`Failed to create directory: ${dir}`)
			}
		}
	}

	// Copy livespec.md template
	const livespecMdPath = join(livespecDir, "livespec.md")
	writeFileIfNotExists({ filePath: livespecMdPath, content: readTemplate("livespec.md"), skipExisting, result })

	// Copy project.md template
	const projectMdPath = join(projectDir, "project.md")
	writeFileIfNotExists({
		filePath: projectMdPath,
		content: readTemplate("project.md"),
		skipExisting,
		result,
	})

	// Optionally inject into root CLAUDE.md
	if (injectClaudeMd) {
		const claudeMdPath = join(cwd, "CLAUDE.md")
		injectLivespecSection({ filePath: claudeMdPath, skipExisting, result })
	}

	// Optionally inject into root AGENTS.md
	if (injectAgentsMd) {
		const rootAgentsMdPath = join(cwd, "AGENTS.md")
		injectLivespecSection({ filePath: rootAgentsMdPath, skipExisting, result })
	}

	// Setup AI tool commands
	for (const tool of tools) {
		setupToolCommand({ cwd, tool, skipExisting, result })
	}

	return result
}

function writeFileIfNotExists({ filePath, content, skipExisting, result }: WriteFileOptions): void {
	if (existsSync(filePath)) {
		if (skipExisting) {
			result.skipped.push(filePath)
		} else {
			try {
				writeFileSync(filePath, content, "utf-8")
				result.updated.push(filePath)
			} catch (_error) {
				result.errors.push(`Failed to write file: ${filePath}`)
			}
		}
	} else {
		try {
			writeFileSync(filePath, content, "utf-8")
			result.created.push(filePath)
		} catch (_error) {
			result.errors.push(`Failed to create file: ${filePath}`)
		}
	}
}

function injectLivespecSection({ filePath, skipExisting, result }: InjectSectionOptions): void {
	const livespecSection = readTemplate("AGENTS-SECTION.md")

	if (existsSync(filePath)) {
		if (skipExisting) {
			const content = readFileSync(filePath, "utf-8")
			if (content.includes(LIVESPEC_START_MARKER)) {
				result.skipped.push(filePath)
				return
			}
		}

		try {
			let content = readFileSync(filePath, "utf-8")

			if (content.includes(LIVESPEC_START_MARKER)) {
				// Replace existing section
				const startIndex = content.indexOf(LIVESPEC_START_MARKER)
				const endIndex = content.indexOf(LIVESPEC_END_MARKER)

				if (startIndex !== -1 && endIndex !== -1) {
					content =
						content.slice(0, startIndex) + livespecSection + content.slice(endIndex + LIVESPEC_END_MARKER.length)
					writeFileSync(filePath, content, "utf-8")
					result.updated.push(filePath)
				}
			} else {
				// Prepend livespec section
				content = `${livespecSection}\n\n${content}`
				writeFileSync(filePath, content, "utf-8")
				result.updated.push(filePath)
			}
		} catch (_error) {
			result.errors.push(`Failed to update: ${filePath}`)
		}
	} else {
		// File doesn't exist - don't create it, just skip
		// (we only inject into existing files)
		result.skipped.push(filePath)
	}
}

function setupToolCommand({ cwd, tool, skipExisting, result }: SetupToolCommandOptions): void {
	const config = AI_TOOLS[tool]
	const commandDir = join(cwd, config.commandDir)
	const commandPath = join(commandDir, config.commandFile)
	const syncCommandPath = join(commandDir, config.syncCommandFile)
	const setupCommandPath = join(commandDir, config.setupCommandFile)

	// Create command directory if it doesn't exist
	if (!existsSync(commandDir)) {
		try {
			mkdirSync(commandDir, { recursive: true })
			result.created.push(commandDir)
		} catch (_error) {
			result.errors.push(`Failed to create directory: ${commandDir}`)
			return
		}
	}

	// Write main command file
	const commandContent = readTemplate("commands/livespec.md")
	writeFileIfNotExists({ filePath: commandPath, content: commandContent, skipExisting, result })

	// Write sync command file
	const syncContent = readTemplate("commands/livespec-sync.md")
	writeFileIfNotExists({ filePath: syncCommandPath, content: syncContent, skipExisting, result })

	// Write setup command file
	const setupContent = readTemplate("commands/livespec-setup.md")
	writeFileIfNotExists({ filePath: setupCommandPath, content: setupContent, skipExisting, result })
}

/**
 * Check if livespec is already initialized in a directory.
 */
export function isInitialized(cwd: string = process.cwd()): boolean {
	const livespecDir = join(cwd, "livespec")
	const livespecMdPath = join(livespecDir, "livespec.md")
	return existsSync(livespecDir) && existsSync(livespecMdPath)
}

export type UpdateBaseFilesOptions = {
	cwd?: string
	injectClaudeMd?: boolean
	injectAgentsMd?: boolean
	tools?: AITool[]
}

/**
 * Detect which AI tools have livespec commands installed.
 */
export function detectInstalledTools(cwd: string = process.cwd()): AITool[] {
	const installed: AITool[] = []
	for (const [id, config] of Object.entries(AI_TOOLS)) {
		const commandPath = join(cwd, config.commandDir, config.commandFile)
		if (existsSync(commandPath)) {
			installed.push(id as AITool)
		}
	}
	return installed
}

/**
 * Update base files (livespec.md) and optionally update root CLAUDE.md/AGENTS.md sections.
 */
export function updateBaseFiles(options: UpdateBaseFilesOptions = {}): InitResult {
	const { cwd = process.cwd(), injectClaudeMd = false, injectAgentsMd = false, tools = [] } = options

	const result: InitResult = {
		created: [],
		skipped: [],
		updated: [],
		errors: [],
	}

	const livespecDir = join(cwd, "livespec")

	// Update livespec/livespec.md
	const livespecMdPath = join(livespecDir, "livespec.md")
	updateFileIfChanged({ filePath: livespecMdPath, newContent: readTemplate("livespec.md"), result })

	// Update root CLAUDE.md section
	if (injectClaudeMd) {
		const claudeMdPath = join(cwd, "CLAUDE.md")
		injectLivespecSection({ filePath: claudeMdPath, skipExisting: false, result })
	}

	// Update root AGENTS.md section
	if (injectAgentsMd) {
		const rootAgentsMdPath = join(cwd, "AGENTS.md")
		injectLivespecSection({ filePath: rootAgentsMdPath, skipExisting: false, result })
	}

	// Update AI tool commands
	for (const tool of tools) {
		updateToolCommand({ cwd, tool, result })
	}

	return result
}

function updateToolCommand({ cwd, tool, result }: { cwd: string; tool: AITool; result: InitResult }): void {
	const config = AI_TOOLS[tool]

	// Update main command
	const commandPath = join(cwd, config.commandDir, config.commandFile)
	const commandContent = readTemplate("commands/livespec.md")
	updateFileIfChanged({ filePath: commandPath, newContent: commandContent, result })

	// Update sync command
	const syncPath = join(cwd, config.commandDir, config.syncCommandFile)
	const syncContent = readTemplate("commands/livespec-sync.md")
	updateFileIfChanged({ filePath: syncPath, newContent: syncContent, result })

	// Update setup command
	const setupPath = join(cwd, config.commandDir, config.setupCommandFile)
	const setupContent = readTemplate("commands/livespec-setup.md")
	updateFileIfChanged({ filePath: setupPath, newContent: setupContent, result })
}

type UpdateFileOptions = {
	filePath: string
	newContent: string
	result: InitResult
}

function updateFileIfChanged({ filePath, newContent, result }: UpdateFileOptions): void {
	if (!existsSync(filePath)) {
		try {
			writeFileSync(filePath, newContent, "utf-8")
			result.created.push(filePath)
		} catch (_error) {
			result.errors.push(`Failed to create file: ${filePath}`)
		}
		return
	}

	const currentContent = readFileSync(filePath, "utf-8")
	if (currentContent === newContent) {
		result.skipped.push(filePath)
		return
	}

	try {
		writeFileSync(filePath, newContent, "utf-8")
		result.updated.push(filePath)
	} catch (_error) {
		result.errors.push(`Failed to update file: ${filePath}`)
	}
}
