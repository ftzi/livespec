import { afterEach, beforeEach, describe, expect, it } from "bun:test"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { init } from "./init"
import { cleanupTestDir, setupTestDir, TEST_DIR } from "./test-utils"

/** @spec [LIV.init.injection] */
describe("root CLAUDE.md injection", () => {
	beforeEach(setupTestDir)
	afterEach(cleanupTestDir)

	/** @spec [LIV.init.injection.no-file] */
	it("skips CLAUDE.md if it does not exist", () => {
		const result = init({ cwd: TEST_DIR, injectClaudeMd: true })
		expect(existsSync(join(TEST_DIR, "CLAUDE.md"))).toBe(false)
		expect(result.skipped).toContain(join(TEST_DIR, "CLAUDE.md"))
	})

	/** @spec [LIV.init.injection.prepend] */
	it("injects livespec section into existing CLAUDE.md", () => {
		writeFileSync(join(TEST_DIR, "CLAUDE.md"), "# Existing content")
		init({ cwd: TEST_DIR, injectClaudeMd: true })

		const content = readFileSync(join(TEST_DIR, "CLAUDE.md"), "utf-8")
		expect(content).toContain("<!-- LIVESPEC:START -->")
		expect(content).toContain("<!-- LIVESPEC:END -->")
		expect(content).toContain("# Livespec")
		expect(content).toContain("# Existing content")
	})

	/** @spec [LIV.init.injection.prepend] */
	it("prepends livespec section to existing CLAUDE.md", () => {
		writeFileSync(join(TEST_DIR, "CLAUDE.md"), "# Original content\n\nSome text.")
		init({ cwd: TEST_DIR, injectClaudeMd: true })

		const content = readFileSync(join(TEST_DIR, "CLAUDE.md"), "utf-8")
		expect(content.startsWith("<!-- LIVESPEC:START -->")).toBe(true)
		expect(content).toContain("# Original content")
		expect(content).toContain("Some text.")
	})

	/** @spec [LIV.init.injection.replace] */
	it("replaces existing livespec section when skipExisting is false", () => {
		const existingContent = `<!-- LIVESPEC:START -->
# Old livespec content
<!-- LIVESPEC:END -->

# Rest of CLAUDE.md`
		writeFileSync(join(TEST_DIR, "CLAUDE.md"), existingContent)

		init({ cwd: TEST_DIR, injectClaudeMd: true, skipExisting: false })

		const content = readFileSync(join(TEST_DIR, "CLAUDE.md"), "utf-8")
		expect(content).not.toContain("Old livespec content")
		expect(content).toContain("# Livespec")
		expect(content).toContain("# Rest of CLAUDE.md")
	})

	/** @spec [LIV.init.injection.skip] */
	it("skips CLAUDE.md when section exists and skipExisting is true", () => {
		const existingContent = `<!-- LIVESPEC:START -->
# Old content
<!-- LIVESPEC:END -->`
		writeFileSync(join(TEST_DIR, "CLAUDE.md"), existingContent)

		const result = init({
			cwd: TEST_DIR,
			injectClaudeMd: true,
			skipExisting: true,
		})

		const content = readFileSync(join(TEST_DIR, "CLAUDE.md"), "utf-8")
		expect(content).toContain("Old content")
		expect(result.skipped).toContain(join(TEST_DIR, "CLAUDE.md"))
	})

	it("does not touch CLAUDE.md when injectClaudeMd is false", () => {
		writeFileSync(join(TEST_DIR, "CLAUDE.md"), "# Original")
		init({ cwd: TEST_DIR, injectClaudeMd: false })

		const content = readFileSync(join(TEST_DIR, "CLAUDE.md"), "utf-8")
		expect(content).toBe("# Original")
		expect(content).not.toContain("LIVESPEC")
	})
})

/** @spec [LIV.init.injection.agents] */
describe("root AGENTS.md injection", () => {
	beforeEach(setupTestDir)
	afterEach(cleanupTestDir)

	/** @spec [LIV.init.injection.no-file] */
	it("skips root AGENTS.md if it does not exist", () => {
		const result = init({ cwd: TEST_DIR, injectAgentsMd: true })
		expect(existsSync(join(TEST_DIR, "AGENTS.md"))).toBe(false)
		expect(result.skipped).toContain(join(TEST_DIR, "AGENTS.md"))
	})

	/** @spec [LIV.init.injection.agents] */
	it("injects livespec section into existing root AGENTS.md", () => {
		writeFileSync(join(TEST_DIR, "AGENTS.md"), "# My agents instructions")
		init({ cwd: TEST_DIR, injectAgentsMd: true })

		const content = readFileSync(join(TEST_DIR, "AGENTS.md"), "utf-8")
		expect(content).toContain("<!-- LIVESPEC:START -->")
		expect(content).toContain("<!-- LIVESPEC:END -->")
		expect(content).toContain("# Livespec")
		expect(content).toContain("# My agents instructions")
	})

	it("keeps livespec/livespec.md separate from root AGENTS.md", () => {
		writeFileSync(join(TEST_DIR, "AGENTS.md"), "# Root agents")
		init({ cwd: TEST_DIR, injectAgentsMd: true })

		// Root AGENTS.md has livespec section
		const rootContent = readFileSync(join(TEST_DIR, "AGENTS.md"), "utf-8")
		expect(rootContent).toContain("<!-- LIVESPEC:START -->")
		expect(rootContent).toContain("# Root agents")

		// livespec/livespec.md has full template (no markers, different content)
		const livespecContent = readFileSync(join(TEST_DIR, "livespec/livespec.md"), "utf-8")
		expect(livespecContent).toContain("## 1. Philosophy")
		expect(livespecContent).not.toContain("# Root agents")
	})

	/** @spec [LIV.init.injection.content] */
	it("can inject into both CLAUDE.md and AGENTS.md", () => {
		writeFileSync(join(TEST_DIR, "CLAUDE.md"), "# Claude instructions")
		writeFileSync(join(TEST_DIR, "AGENTS.md"), "# Agents instructions")

		const result = init({
			cwd: TEST_DIR,
			injectClaudeMd: true,
			injectAgentsMd: true,
		})

		const claudeContent = readFileSync(join(TEST_DIR, "CLAUDE.md"), "utf-8")
		const agentsContent = readFileSync(join(TEST_DIR, "AGENTS.md"), "utf-8")

		expect(claudeContent).toContain("<!-- LIVESPEC:START -->")
		expect(claudeContent).toContain("# Claude instructions")

		expect(agentsContent).toContain("<!-- LIVESPEC:START -->")
		expect(agentsContent).toContain("# Agents instructions")

		expect(result.updated).toContain(join(TEST_DIR, "CLAUDE.md"))
		expect(result.updated).toContain(join(TEST_DIR, "AGENTS.md"))
	})
})
