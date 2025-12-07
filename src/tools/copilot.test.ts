import { afterEach, beforeEach, describe, expect, it } from "bun:test"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { detectInstalledTools, init } from "../init"
import { cleanupTestDir, setupTestDir, TEST_DIR } from "../test-utils"

describe("GitHub Copilot", () => {
	beforeEach(setupTestDir)
	afterEach(cleanupTestDir)

	it("creates .github/prompts directory", () => {
		init({ cwd: TEST_DIR, tools: ["copilot"] })
		expect(existsSync(join(TEST_DIR, ".github/prompts"))).toBe(true)
	})

	it("creates livespec.prompt.md command file", () => {
		init({ cwd: TEST_DIR, tools: ["copilot"] })
		expect(existsSync(join(TEST_DIR, ".github/prompts/livespec.prompt.md"))).toBe(true)
	})

	it("command file contains livespec instructions", () => {
		init({ cwd: TEST_DIR, tools: ["copilot"] })
		const content = readFileSync(join(TEST_DIR, ".github/prompts/livespec.prompt.md"), "utf-8")
		expect(content).toContain("Livespec")
		expect(content).toContain("manifest.md")
	})

	it("detects installation", () => {
		mkdirSync(join(TEST_DIR, ".github/prompts"), { recursive: true })
		writeFileSync(join(TEST_DIR, ".github/prompts/livespec.prompt.md"), "# Command")

		const tools = detectInstalledTools(TEST_DIR)
		expect(tools).toContain("copilot")
	})
})
