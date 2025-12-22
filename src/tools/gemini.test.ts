import { afterEach, beforeEach, describe, expect, it } from "bun:test"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { detectInstalledTools, init } from "../init"
import { cleanupTestDir, setupTestDir, TEST_DIR } from "../test-utils"

/** @spec [LIV.init.tools.gemini] */
describe("Gemini CLI", () => {
	beforeEach(setupTestDir)
	afterEach(cleanupTestDir)

	it("creates .gemini/commands directory", () => {
		init({ cwd: TEST_DIR, tools: ["gemini"] })
		expect(existsSync(join(TEST_DIR, ".gemini/commands"))).toBe(true)
	})

	it("creates livespec.toml command file", () => {
		init({ cwd: TEST_DIR, tools: ["gemini"] })
		expect(existsSync(join(TEST_DIR, ".gemini/commands/livespec.toml"))).toBe(true)
	})

	it("command file uses TOML format with prompt key", () => {
		init({ cwd: TEST_DIR, tools: ["gemini"] })
		const content = readFileSync(join(TEST_DIR, ".gemini/commands/livespec.toml"), "utf-8")
		expect(content).toStartWith('prompt = """')
		expect(content).toContain("Livespec")
		expect(content).toContain("livespec/livespec.md")
	})

	/** @spec [LIV.update.detect-tools.gemini] */
	it("detects installation", () => {
		mkdirSync(join(TEST_DIR, ".gemini/commands"), { recursive: true })
		writeFileSync(join(TEST_DIR, ".gemini/commands/livespec.toml"), 'prompt = "test"')

		const tools = detectInstalledTools(TEST_DIR)
		expect(tools).toContain("gemini")
	})
})
