#!/usr/bin/env bun

import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import * as p from "@clack/prompts"
import { LIVESPEC_START_MARKER } from "./consts"
import { type AITool, detectInstalledTools, init, isInitialized, needsUpdate, updateBaseFiles } from "./init"
import { AI_TOOLS, ALL_TOOLS } from "./tools/config"

export function getDefaultProjectName(cwd: string = process.cwd()): string {
	return cwd.split("/").pop() || "my-project"
}

export function fileHasLivespecSection(filePath: string): boolean {
	if (!existsSync(filePath)) return false
	const content = readFileSync(filePath, "utf-8")
	return content.includes(LIVESPEC_START_MARKER)
}

export function detectExistingFiles(cwd: string = process.cwd()): { hasClaudeMd: boolean; hasAgentsMd: boolean } {
	return {
		hasClaudeMd: existsSync(join(cwd, "CLAUDE.md")),
		hasAgentsMd: existsSync(join(cwd, "AGENTS.md")),
	}
}

export function detectLivespecSections(cwd: string = process.cwd()): {
	claudeMdHasSection: boolean
	agentsMdHasSection: boolean
} {
	return {
		claudeMdHasSection: fileHasLivespecSection(join(cwd, "CLAUDE.md")),
		agentsMdHasSection: fileHasLivespecSection(join(cwd, "AGENTS.md")),
	}
}

export const HELP_TEXT = `
livespec - Living specification management for AI-native development

Usage:
  npx livespec [options]

Options:
  -y, --yes      Skip prompts and use defaults
  -f, --force    Force update even if versions match
  -h, --help     Show this help message
`

export function showHelp(): void {
	console.log(HELP_TEXT)
}

export async function handleUpdate(skipPrompts: boolean, force: boolean): Promise<void> {
	const versionInfo = needsUpdate()

	if (!(versionInfo.needsUpdate || force)) {
		p.outro(`Already up to date (v${versionInfo.latestVersion}).`)
		return
	}

	let versionMessage: string
	if (!versionInfo.needsUpdate) {
		versionMessage = `Force updating v${versionInfo.latestVersion}`
	} else if (versionInfo.currentVersion) {
		versionMessage = `Update available: v${versionInfo.currentVersion} → v${versionInfo.latestVersion}`
	} else {
		versionMessage = `Version not found in livespec.md. Latest: v${versionInfo.latestVersion}`
	}

	if (!skipPrompts && versionInfo.needsUpdate) {
		const action = await p.select({
			message: `${versionMessage}. What would you like to do?`,
			options: [
				{ value: "update", label: "Update base files" },
				{ value: "cancel", label: "Cancel" },
			],
		})

		if (p.isCancel(action) || action === "cancel") {
			p.cancel("Cancelled.")
			return
		}
	} else if (!versionInfo.needsUpdate) {
		p.log.info(versionMessage)
	}

	const { claudeMdHasSection, agentsMdHasSection } = detectLivespecSections()
	const installedTools = detectInstalledTools()
	const result = updateBaseFiles({
		injectClaudeMd: claudeMdHasSection,
		injectAgentsMd: agentsMdHasSection,
		tools: installedTools,
	})

	const updated = result.updated.length
	if (updated > 0) {
		p.outro(
			`Updated ${updated} files to v${versionInfo.latestVersion}.\n\nRun /livespec with your AI to update project configuration.`,
		)
	} else {
		p.outro("All files unchanged.")
	}
}

export async function promptForInjectionTargets(
	hasClaudeMd: boolean,
	hasAgentsMd: boolean,
): Promise<{ injectClaudeMd: boolean; injectAgentsMd: boolean } | null> {
	const options: Array<{ value: string; label: string }> = []
	if (hasClaudeMd) options.push({ value: "claude", label: "CLAUDE.md" })
	if (hasAgentsMd) options.push({ value: "agents", label: "AGENTS.md" })

	const selected = await p.multiselect({
		message: "Setup livespec in:",
		options,
		initialValues: options.map((o) => o.value),
		required: false,
	})

	if (p.isCancel(selected)) {
		p.cancel("Cancelled.")
		return null
	}

	return {
		injectClaudeMd: selected.includes("claude"),
		injectAgentsMd: selected.includes("agents"),
	}
}

export async function promptForTools(): Promise<AITool[] | null> {
	const toolOptions = ALL_TOOLS.map((id) => ({
		value: id,
		label: AI_TOOLS[id].name,
	}))

	const tools = await p.multiselect({
		message: "Setup /livespec command for:",
		options: toolOptions,
		initialValues: ["claude"] as AITool[],
		required: false,
	})

	if (p.isCancel(tools)) {
		p.cancel("Cancelled.")
		return null
	}

	return tools
}

export function showNextSteps(selectedTools: AITool[]): void {
	const toolNames = selectedTools.map((t) => AI_TOOLS[t].name).join(", ")

	const nextSteps =
		selectedTools.length > 0
			? `1. Run /livespec in ${toolNames} to configure projects
2. Add specs in livespec/projects/
3. Read livespec/livespec.md for the full workflow`
			: `1. Add specs in livespec/projects/
2. Read livespec/livespec.md for the full workflow`

	p.note(nextSteps, "Next steps")
}

export type FreshInitOptions = {
	skipPrompts: boolean
	hasClaudeMd: boolean
	hasAgentsMd: boolean
}

export async function handleFreshInit(options: FreshInitOptions): Promise<void> {
	const { skipPrompts, hasClaudeMd, hasAgentsMd } = options
	let injectClaudeMd = hasClaudeMd
	let injectAgentsMd = hasAgentsMd
	let selectedTools: AITool[] = []

	if (!skipPrompts && (hasClaudeMd || hasAgentsMd)) {
		const targets = await promptForInjectionTargets(hasClaudeMd, hasAgentsMd)
		if (!targets) return
		injectClaudeMd = targets.injectClaudeMd
		injectAgentsMd = targets.injectAgentsMd
	}

	if (skipPrompts) {
		selectedTools = ["claude"]
	} else {
		const tools = await promptForTools()
		if (!tools) return
		selectedTools = tools
	}

	const s = p.spinner()
	s.start("Creating livespec directory structure")

	const result = init({
		projectName: getDefaultProjectName(),
		skipExisting: true,
		injectClaudeMd,
		injectAgentsMd,
		tools: selectedTools,
	})

	s.stop("Created livespec directory structure")

	if (result.errors.length > 0) {
		p.log.error(`Errors:\n${result.errors.map((e) => `  - ${e}`).join("\n")}`)
	}

	showNextSteps(selectedTools)
	p.outro("Done!")
}

async function main(): Promise<void> {
	const args = process.argv.slice(2)
	const skipPrompts = args.includes("-y") || args.includes("--yes")
	const force = args.includes("-f") || args.includes("--force")

	if (args.includes("-h") || args.includes("--help")) {
		showHelp()
		return
	}

	p.intro("livespec")

	if (isInitialized()) {
		await handleUpdate(skipPrompts, force)
	} else {
		const { hasClaudeMd, hasAgentsMd } = detectExistingFiles()
		await handleFreshInit({ skipPrompts, hasClaudeMd, hasAgentsMd })
	}
}

main().catch((error) => {
	console.error(error)
	process.exit(1)
})
