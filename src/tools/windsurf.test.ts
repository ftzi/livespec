import { afterEach, beforeEach, describe, expect, it } from "bun:test"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { detectInstalledTools, init } from "../init"
import { cleanupTestDir, setupTestDir, TEST_DIR } from "../test-utils"

/** @spec [LIV.init.tools.windsurf] */
describe("Windsurf", () => {
	beforeEach(setupTestDir)
	afterEach(cleanupTestDir)

	/** @spec [LIV.init.tools.directory] */
	it("creates .windsurf/workflows directory", () => {
		init({ cwd: TEST_DIR, tools: ["windsurf"] })
		expect(existsSync(join(TEST_DIR, ".windsurf/workflows"))).toBe(true)
	})

	it("creates livespec.md command file", () => {
		init({ cwd: TEST_DIR, tools: ["windsurf"] })
		expect(existsSync(join(TEST_DIR, ".windsurf/workflows/livespec.md"))).toBe(true)
	})

	it("command file contains livespec instructions", () => {
		init({ cwd: TEST_DIR, tools: ["windsurf"] })
		const content = readFileSync(join(TEST_DIR, ".windsurf/workflows/livespec.md"), "utf-8")
		expect(content).toContain("Livespec")
		expect(content).toContain("livespec/livespec.md")
	})

	/** @spec [LIV.update.detect-tools] */
	it("detects installation", () => {
		mkdirSync(join(TEST_DIR, ".windsurf/workflows"), { recursive: true })
		writeFileSync(join(TEST_DIR, ".windsurf/workflows/livespec.md"), "# Command")

		const tools = detectInstalledTools(TEST_DIR)
		expect(tools).toContain("windsurf")
	})
})
