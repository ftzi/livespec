import { afterEach, beforeEach, describe, expect, it } from "bun:test"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { detectInstalledTools, init, updateBaseFiles } from "../init"
import { cleanupTestDir, setupTestDir, TEST_DIR } from "../test-utils"

describe("multiple tools", () => {
	beforeEach(setupTestDir)
	afterEach(cleanupTestDir)

	it("creates command files for all selected tools", () => {
		init({ cwd: TEST_DIR, tools: ["claude", "copilot", "cursor", "windsurf"] })

		expect(existsSync(join(TEST_DIR, ".claude/commands/livespec.md"))).toBe(true)
		expect(existsSync(join(TEST_DIR, ".github/prompts/livespec.prompt.md"))).toBe(true)
		expect(existsSync(join(TEST_DIR, ".cursor/prompts/livespec.md"))).toBe(true)
		expect(existsSync(join(TEST_DIR, ".windsurf/workflows/livespec.md"))).toBe(true)
	})

	it("all command files have the same content", () => {
		init({ cwd: TEST_DIR, tools: ["claude", "copilot", "cursor", "windsurf"] })

		const claudeContent = readFileSync(join(TEST_DIR, ".claude/commands/livespec.md"), "utf-8")
		const copilotContent = readFileSync(join(TEST_DIR, ".github/prompts/livespec.prompt.md"), "utf-8")
		const cursorContent = readFileSync(join(TEST_DIR, ".cursor/prompts/livespec.md"), "utf-8")
		const windsurfContent = readFileSync(join(TEST_DIR, ".windsurf/workflows/livespec.md"), "utf-8")

		expect(claudeContent).toBe(copilotContent)
		expect(copilotContent).toBe(cursorContent)
		expect(cursorContent).toBe(windsurfContent)
	})

	it("tracks created directories and files", () => {
		const result = init({ cwd: TEST_DIR, tools: ["claude", "copilot"] })

		expect(result.created.some((f) => f.includes(".claude/commands"))).toBe(true)
		expect(result.created.some((f) => f.includes(".github/prompts"))).toBe(true)
		expect(result.created.some((f) => f.includes("livespec.md"))).toBe(true)
		expect(result.created.some((f) => f.includes("livespec.prompt.md"))).toBe(true)
	})

	it("detects multiple tools", () => {
		init({ cwd: TEST_DIR, tools: ["claude", "copilot", "windsurf"] })

		const tools = detectInstalledTools(TEST_DIR)
		expect(tools).toContain("claude")
		expect(tools).toContain("copilot")
		expect(tools).toContain("windsurf")
		expect(tools).not.toContain("cursor")
	})
})

describe("skipExisting for tools", () => {
	beforeEach(setupTestDir)
	afterEach(cleanupTestDir)

	it("skips existing command files when skipExisting is true", () => {
		init({ cwd: TEST_DIR, tools: ["claude"] })

		const commandPath = join(TEST_DIR, ".claude/commands/livespec.md")
		writeFileSync(commandPath, "# Custom command")

		const result = init({ cwd: TEST_DIR, tools: ["claude"], skipExisting: true })

		expect(readFileSync(commandPath, "utf-8")).toBe("# Custom command")
		expect(result.skipped).toContain(commandPath)
	})

	it("overwrites existing command files when skipExisting is false", () => {
		init({ cwd: TEST_DIR, tools: ["claude"] })

		const commandPath = join(TEST_DIR, ".claude/commands/livespec.md")
		writeFileSync(commandPath, "# Custom command")

		const result = init({ cwd: TEST_DIR, tools: ["claude"], skipExisting: false })

		expect(readFileSync(commandPath, "utf-8")).not.toBe("# Custom command")
		expect(result.updated).toContain(commandPath)
	})
})

describe("no tools", () => {
	beforeEach(setupTestDir)
	afterEach(cleanupTestDir)

	it("does not create any command directories when tools is empty", () => {
		init({ cwd: TEST_DIR, tools: [] })

		expect(existsSync(join(TEST_DIR, ".claude"))).toBe(false)
		expect(existsSync(join(TEST_DIR, ".github"))).toBe(false)
		expect(existsSync(join(TEST_DIR, ".cursor"))).toBe(false)
		expect(existsSync(join(TEST_DIR, ".windsurf"))).toBe(false)
	})

	it("does not create any command directories when tools is not specified", () => {
		init({ cwd: TEST_DIR })

		expect(existsSync(join(TEST_DIR, ".claude"))).toBe(false)
		expect(existsSync(join(TEST_DIR, ".github"))).toBe(false)
		expect(existsSync(join(TEST_DIR, ".cursor"))).toBe(false)
		expect(existsSync(join(TEST_DIR, ".windsurf"))).toBe(false)
	})
})

describe("detectInstalledTools", () => {
	beforeEach(setupTestDir)
	afterEach(cleanupTestDir)

	it("returns empty array when no tools installed", () => {
		const tools = detectInstalledTools(TEST_DIR)
		expect(tools).toEqual([])
	})
})

describe("updateBaseFiles with tools", () => {
	beforeEach(setupTestDir)
	afterEach(cleanupTestDir)

	it("updates tool command files with latest template", () => {
		init({ cwd: TEST_DIR, tools: ["claude"] })

		const commandPath = join(TEST_DIR, ".claude/commands/livespec.md")
		writeFileSync(commandPath, "# Old content")

		const result = updateBaseFiles({ cwd: TEST_DIR, tools: ["claude"] })

		const content = readFileSync(commandPath, "utf-8")
		expect(content).toContain("Livespec")
		expect(content).not.toContain("# Old content")
		expect(result.updated).toContain(commandPath)
	})

	it("skips tool command files that are up to date", () => {
		init({ cwd: TEST_DIR, tools: ["claude"] })

		const result = updateBaseFiles({ cwd: TEST_DIR, tools: ["claude"] })

		expect(result.skipped.some((f) => f.includes("livespec.md"))).toBe(true)
		expect(result.updated.every((f) => !f.includes(".claude"))).toBe(true)
	})

	it("does not touch tools not in the list", () => {
		init({ cwd: TEST_DIR, tools: ["claude", "copilot"] })

		const claudePath = join(TEST_DIR, ".claude/commands/livespec.md")
		const copilotPath = join(TEST_DIR, ".github/prompts/livespec.prompt.md")
		writeFileSync(claudePath, "# Modified claude")
		writeFileSync(copilotPath, "# Modified copilot")

		updateBaseFiles({ cwd: TEST_DIR, tools: ["claude"] })

		expect(readFileSync(claudePath, "utf-8")).toContain("Livespec")
		expect(readFileSync(copilotPath, "utf-8")).toBe("# Modified copilot")
	})
})
