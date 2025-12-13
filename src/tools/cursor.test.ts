import { afterEach, beforeEach, describe, expect, it } from "bun:test"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { detectInstalledTools, init } from "../init"
import { cleanupTestDir, setupTestDir, TEST_DIR } from "../test-utils"

describe("Cursor", () => {
	beforeEach(setupTestDir)
	afterEach(cleanupTestDir)

	it("creates .cursor/prompts directory", () => {
		init({ cwd: TEST_DIR, tools: ["cursor"] })
		expect(existsSync(join(TEST_DIR, ".cursor/prompts"))).toBe(true)
	})

	it("creates livespec.md command file", () => {
		init({ cwd: TEST_DIR, tools: ["cursor"] })
		expect(existsSync(join(TEST_DIR, ".cursor/prompts/livespec.md"))).toBe(true)
	})

	it("command file contains livespec instructions", () => {
		init({ cwd: TEST_DIR, tools: ["cursor"] })
		const content = readFileSync(join(TEST_DIR, ".cursor/prompts/livespec.md"), "utf-8")
		expect(content).toContain("Livespec")
		expect(content).toContain("livespec/livespec.md")
	})

	it("detects installation", () => {
		mkdirSync(join(TEST_DIR, ".cursor/prompts"), { recursive: true })
		writeFileSync(join(TEST_DIR, ".cursor/prompts/livespec.md"), "# Command")

		const tools = detectInstalledTools(TEST_DIR)
		expect(tools).toContain("cursor")
	})
})
