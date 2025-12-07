#!/usr/bin/env bun

import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import * as p from "@clack/prompts"
import { type AITool, detectInstalledTools, init, isInitialized, updateBaseFiles } from "./init"
import { AI_TOOLS, ALL_TOOLS } from "./tools"

const LIVESPEC_MARKER = "<!-- LIVESPEC:START -->"

function getDefaultProjectName(): string {
	const cwd = process.cwd()
	return cwd.split("/").pop() || "my-project"
}

function fileHasLivespecSection(filePath: string): boolean {
	if (!existsSync(filePath)) return false
	const content = readFileSync(filePath, "utf-8")
	return content.includes(LIVESPEC_MARKER)
}

function detectExistingFiles(): { hasClaudeMd: boolean; hasAgentsMd: boolean } {
	const cwd = process.cwd()
	return {
		hasClaudeMd: existsSync(join(cwd, "CLAUDE.md")),
		hasAgentsMd: existsSync(join(cwd, "AGENTS.md")),
	}
}

function detectLivespecSections(): { claudeMdHasSection: boolean; agentsMdHasSection: boolean } {
	const cwd = process.cwd()
	return {
		claudeMdHasSection: fileHasLivespecSection(join(cwd, "CLAUDE.md")),
		agentsMdHasSection: fileHasLivespecSection(join(cwd, "AGENTS.md")),
	}
}

async function main(): Promise<void> {
	const args = process.argv.slice(2)
	const skipPrompts = args.includes("-y") || args.includes("--yes")

	if (args.includes("-h") || args.includes("--help")) {
		console.log(`
livespec - Living specification management for AI-native development

Usage:
  npx livespec [options]

Options:
  --yes, -y     Skip prompts and use defaults
  --help, -h    Show this help message
`)
		return
	}

	p.intro("livespec")

	const alreadyInitialized = isInitialized()
	const { hasClaudeMd, hasAgentsMd } = detectExistingFiles()

	// If already initialized, update base files
	if (alreadyInitialized) {
		if (!skipPrompts) {
			const action = await p.select({
				message: "Livespec is already initialized. What would you like to do?",
				options: [
					{ value: "update", label: "Update base files" },
					{ value: "cancel", label: "Cancel" },
				],
			})

			if (p.isCancel(action) || action === "cancel") {
				p.cancel("Cancelled.")
				return
			}
		}

		// Update mode - update root files that have the livespec section
		const { claudeMdHasSection, agentsMdHasSection } = detectLivespecSections()
		const installedTools = detectInstalledTools()
		const result = updateBaseFiles({
			injectClaudeMd: claudeMdHasSection,
			injectAgentsMd: agentsMdHasSection,
			tools: installedTools,
		})

		const updated = result.updated.length
		const unchanged = result.skipped.length
		p.outro(updated > 0 ? `Updated ${updated} files.` : `All ${unchanged} files unchanged.`)
		return
	}

	// Fresh init
	let injectClaudeMd = hasClaudeMd
	let injectAgentsMd = hasAgentsMd
	let selectedTools: AITool[] = []

	if (!skipPrompts && (hasClaudeMd || hasAgentsMd)) {
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
			return
		}

		injectClaudeMd = selected.includes("claude")
		injectAgentsMd = selected.includes("agents")
	}

	// Prompt for AI tools
	if (skipPrompts) {
		// Default to Claude Code when skipping prompts
		selectedTools = ["claude"]
	} else {
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
			return
		}

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

	// Build dynamic next steps based on selected tools
	const toolNames = selectedTools.map((t) => AI_TOOLS[t].name).join(", ")
	const firstTool = selectedTools[0]
	const commandExample = firstTool ? AI_TOOLS[firstTool].commandExample : "/livespec"

	const nextSteps =
		selectedTools.length > 0
			? `1. Run ${commandExample} in ${toolNames} to populate project details
2. Add specs in livespec/projects/
3. Read livespec/AGENTS.md for the full workflow`
			: `1. Add specs in livespec/projects/
2. Read livespec/AGENTS.md for the full workflow`

	p.note(nextSteps, "Next steps")

	p.outro("Done!")
}

main().catch((error) => {
	console.error(error)
	process.exit(1)
})
