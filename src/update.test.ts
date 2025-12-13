import { afterEach, beforeEach, describe, expect, it } from "bun:test"
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { init, updateBaseFiles } from "./init"
import { cleanupTestDir, setupTestDir, TEST_DIR } from "./test-utils"

const __dirname = dirname(fileURLToPath(import.meta.url))

/** @spec [LIV.update] */
describe("updateBaseFiles", () => {
	beforeEach(setupTestDir)
	afterEach(cleanupTestDir)

	/** @spec [LIV.update.base-files.livespec-md] */
	it("updates livespec/livespec.md with latest template", () => {
		// Initialize first
		init({ cwd: TEST_DIR })

		// Modify livespec.md
		const livespecMdPath = join(TEST_DIR, "livespec/livespec.md")
		writeFileSync(livespecMdPath, "# Old content")

		// Update
		const result = updateBaseFiles({ cwd: TEST_DIR })

		const content = readFileSync(livespecMdPath, "utf-8")
		expect(content).toContain("## Philosophy")
		expect(content).not.toContain("# Old content")
		expect(result.updated).toContain(livespecMdPath)
	})

	/** @spec [LIV.update.base-files.version] */
	it("updates version comment to current package.json version", () => {
		init({ cwd: TEST_DIR })

		// Write old version
		const livespecMdPath = join(TEST_DIR, "livespec/livespec.md")
		writeFileSync(livespecMdPath, "<!-- livespec-version: 0.0.1 -->\n# Old")

		updateBaseFiles({ cwd: TEST_DIR })

		const content = readFileSync(livespecMdPath, "utf-8")
		const packageJson = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8"))
		expect(content).toContain(`<!-- livespec-version: ${packageJson.version} -->`)
		expect(content).not.toContain("0.0.1")
	})

	/** @spec [LIV.update.base-files.skip-unchanged] */
	it("skips files that are already up to date", () => {
		init({ cwd: TEST_DIR })

		// Don't modify anything
		const result = updateBaseFiles({ cwd: TEST_DIR })

		expect(result.skipped.length).toBeGreaterThan(0)
		expect(result.updated.length).toBe(0)
	})

	/** @spec [LIV.update.sections.claude] */
	it("updates root CLAUDE.md livespec section when injectClaudeMd is true", () => {
		init({ cwd: TEST_DIR })

		// Create CLAUDE.md with old livespec section
		const claudeMdPath = join(TEST_DIR, "CLAUDE.md")
		writeFileSync(
			claudeMdPath,
			`<!-- LIVESPEC:START -->
# Old section
<!-- LIVESPEC:END -->

# My instructions`,
		)

		const result = updateBaseFiles({ cwd: TEST_DIR, injectClaudeMd: true })

		const content = readFileSync(claudeMdPath, "utf-8")
		expect(content).toContain("# Livespec")
		expect(content).not.toContain("# Old section")
		expect(content).toContain("# My instructions")
		expect(result.updated).toContain(claudeMdPath)
	})

	/** @spec [LIV.update.sections.agents] */
	it("updates root AGENTS.md livespec section when injectAgentsMd is true", () => {
		init({ cwd: TEST_DIR })

		const agentsMdPath = join(TEST_DIR, "AGENTS.md")
		writeFileSync(
			agentsMdPath,
			`<!-- LIVESPEC:START -->
# Old section
<!-- LIVESPEC:END -->

# My agents`,
		)

		const result = updateBaseFiles({ cwd: TEST_DIR, injectAgentsMd: true })

		const content = readFileSync(agentsMdPath, "utf-8")
		expect(content).toContain("# Livespec")
		expect(content).not.toContain("# Old section")
		expect(content).toContain("# My agents")
		expect(result.updated).toContain(agentsMdPath)
	})

	/** @spec [LIV.update.sections.skip] */
	it("does not touch root CLAUDE.md when injectClaudeMd is false", () => {
		init({ cwd: TEST_DIR })

		const claudeMdPath = join(TEST_DIR, "CLAUDE.md")
		writeFileSync(claudeMdPath, "# Untouched")

		updateBaseFiles({ cwd: TEST_DIR, injectClaudeMd: false })

		const content = readFileSync(claudeMdPath, "utf-8")
		expect(content).toBe("# Untouched")
	})

	/** @spec [LIV.update.sections.skip] */
	it("does not touch root AGENTS.md when injectAgentsMd is false", () => {
		init({ cwd: TEST_DIR })

		const agentsMdPath = join(TEST_DIR, "AGENTS.md")
		writeFileSync(agentsMdPath, "# Untouched")

		updateBaseFiles({ cwd: TEST_DIR, injectAgentsMd: false })

		const content = readFileSync(agentsMdPath, "utf-8")
		expect(content).toBe("# Untouched")
	})

	/** @spec [LIV.update.base-files.create-missing] */
	it("creates missing livespec/livespec.md", () => {
		init({ cwd: TEST_DIR })

		// Delete livespec.md
		rmSync(join(TEST_DIR, "livespec/livespec.md"))

		const result = updateBaseFiles({ cwd: TEST_DIR })

		expect(existsSync(join(TEST_DIR, "livespec/livespec.md"))).toBe(true)
		expect(result.created).toContain(join(TEST_DIR, "livespec/livespec.md"))
	})

	it("preserves content outside livespec markers in root files", () => {
		init({ cwd: TEST_DIR })

		const claudeMdPath = join(TEST_DIR, "CLAUDE.md")
		writeFileSync(
			claudeMdPath,
			`<!-- LIVESPEC:START -->
# Livespec section
<!-- LIVESPEC:END -->

# Important custom section

This should be preserved.

## Another section`,
		)

		updateBaseFiles({ cwd: TEST_DIR, injectClaudeMd: true })

		const content = readFileSync(claudeMdPath, "utf-8")
		expect(content).toContain("# Important custom section")
		expect(content).toContain("This should be preserved.")
		expect(content).toContain("## Another section")
	})

	it("does not modify specs or plans directories", () => {
		init({ cwd: TEST_DIR, projectName: "test-app" })

		// Add custom spec
		const specPath = join(TEST_DIR, "livespec/projects/test-app/feature/spec.md")
		mkdirSync(join(TEST_DIR, "livespec/projects/test-app/feature"), {
			recursive: true,
		})
		writeFileSync(specPath, "# My custom spec")

		// Add custom plan
		const planPath = join(TEST_DIR, "livespec/plans/active/my-plan/plan.md")
		mkdirSync(join(TEST_DIR, "livespec/plans/active/my-plan"), {
			recursive: true,
		})
		writeFileSync(planPath, "# My custom plan")

		updateBaseFiles({ cwd: TEST_DIR })

		// Custom files should be untouched
		expect(readFileSync(specPath, "utf-8")).toBe("# My custom spec")
		expect(readFileSync(planPath, "utf-8")).toBe("# My custom plan")
	})
})
