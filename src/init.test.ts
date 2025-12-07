import { afterEach, beforeEach, describe, expect, it } from "bun:test"
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { init, isInitialized, updateBaseFiles } from "./init"

const TEST_DIR = join(import.meta.dirname, "../.test-output")

describe("livespec init", () => {
	beforeEach(() => {
		if (existsSync(TEST_DIR)) {
			rmSync(TEST_DIR, { recursive: true })
		}
		mkdirSync(TEST_DIR, { recursive: true })
	})

	afterEach(() => {
		if (existsSync(TEST_DIR)) {
			rmSync(TEST_DIR, { recursive: true })
		}
	})

	describe("directory structure", () => {
		it("creates livespec directory", () => {
			init({ cwd: TEST_DIR })
			expect(existsSync(join(TEST_DIR, "livespec"))).toBe(true)
		})

		it("creates projects directory", () => {
			init({ cwd: TEST_DIR })
			expect(existsSync(join(TEST_DIR, "livespec/projects"))).toBe(true)
		})

		it("creates project subdirectory with provided name", () => {
			init({ cwd: TEST_DIR, projectName: "my-app" })
			expect(existsSync(join(TEST_DIR, "livespec/projects/my-app"))).toBe(true)
		})

		it("creates plans/active directory", () => {
			init({ cwd: TEST_DIR })
			expect(existsSync(join(TEST_DIR, "livespec/plans/active"))).toBe(true)
		})

		it("creates plans/archived directory", () => {
			init({ cwd: TEST_DIR })
			expect(existsSync(join(TEST_DIR, "livespec/plans/archived"))).toBe(true)
		})

		it("creates all directories in single call", () => {
			const result = init({ cwd: TEST_DIR, projectName: "test-project" })

			expect(existsSync(join(TEST_DIR, "livespec"))).toBe(true)
			expect(existsSync(join(TEST_DIR, "livespec/projects"))).toBe(true)
			expect(existsSync(join(TEST_DIR, "livespec/projects/test-project"))).toBe(true)
			expect(existsSync(join(TEST_DIR, "livespec/plans"))).toBe(true)
			expect(existsSync(join(TEST_DIR, "livespec/plans/active"))).toBe(true)
			expect(existsSync(join(TEST_DIR, "livespec/plans/archived"))).toBe(true)
			expect(result.errors).toHaveLength(0)
		})
	})

	describe("file creation", () => {
		it("creates livespec/AGENTS.md", () => {
			init({ cwd: TEST_DIR })
			expect(existsSync(join(TEST_DIR, "livespec/AGENTS.md"))).toBe(true)
		})

		it("creates livespec/manifest.md", () => {
			init({ cwd: TEST_DIR })
			expect(existsSync(join(TEST_DIR, "livespec/manifest.md"))).toBe(true)
		})

		it("creates project.md from template", () => {
			init({ cwd: TEST_DIR, projectName: "my-app" })
			const projectMdPath = join(TEST_DIR, "livespec/projects/my-app/project.md")
			expect(existsSync(projectMdPath)).toBe(true)

			const content = readFileSync(projectMdPath, "utf-8")
			expect(content).toContain("# Project Name")
			expect(content).toContain("PRJ")
			expect(content).toContain("src/")
		})
	})

	describe("livespec/AGENTS.md content", () => {
		it("contains philosophy section", () => {
			init({ cwd: TEST_DIR })
			const content = readFileSync(join(TEST_DIR, "livespec/AGENTS.md"), "utf-8")
			expect(content).toContain("## Philosophy")
		})

		it("contains decision tree", () => {
			init({ cwd: TEST_DIR })
			const content = readFileSync(join(TEST_DIR, "livespec/AGENTS.md"), "utf-8")
			expect(content).toContain("Decision Tree")
		})

		it("contains plan file format", () => {
			init({ cwd: TEST_DIR })
			const content = readFileSync(join(TEST_DIR, "livespec/AGENTS.md"), "utf-8")
			expect(content).toContain("## Plan File Format")
		})

		it("contains spec file format", () => {
			init({ cwd: TEST_DIR })
			const content = readFileSync(join(TEST_DIR, "livespec/AGENTS.md"), "utf-8")
			expect(content).toContain("## Spec File Format")
		})

		it("contains testing declaration info", () => {
			init({ cwd: TEST_DIR })
			const content = readFileSync(join(TEST_DIR, "livespec/AGENTS.md"), "utf-8")
			expect(content).toContain("Testing:")
			expect(content).toContain("unit")
			expect(content).toContain("e2e")
		})

		it("contains housekeeping section", () => {
			init({ cwd: TEST_DIR })
			const content = readFileSync(join(TEST_DIR, "livespec/AGENTS.md"), "utf-8")
			expect(content).toContain("Housekeeping")
		})

		it("contains livespec mode section", () => {
			init({ cwd: TEST_DIR })
			const content = readFileSync(join(TEST_DIR, "livespec/AGENTS.md"), "utf-8")
			expect(content).toContain("Livespec Mode")
		})
	})

	describe("root CLAUDE.md injection", () => {
		it("skips CLAUDE.md if it does not exist", () => {
			const result = init({ cwd: TEST_DIR, injectClaudeMd: true })
			expect(existsSync(join(TEST_DIR, "CLAUDE.md"))).toBe(false)
			expect(result.skipped).toContain(join(TEST_DIR, "CLAUDE.md"))
		})

		it("injects livespec section into existing CLAUDE.md", () => {
			writeFileSync(join(TEST_DIR, "CLAUDE.md"), "# Existing content")
			init({ cwd: TEST_DIR, injectClaudeMd: true })

			const content = readFileSync(join(TEST_DIR, "CLAUDE.md"), "utf-8")
			expect(content).toContain("<!-- LIVESPEC:START -->")
			expect(content).toContain("<!-- LIVESPEC:END -->")
			expect(content).toContain("# Livespec")
			expect(content).toContain("# Existing content")
		})

		it("prepends livespec section to existing CLAUDE.md", () => {
			writeFileSync(join(TEST_DIR, "CLAUDE.md"), "# Original content\n\nSome text.")
			init({ cwd: TEST_DIR, injectClaudeMd: true })

			const content = readFileSync(join(TEST_DIR, "CLAUDE.md"), "utf-8")
			expect(content.startsWith("<!-- LIVESPEC:START -->")).toBe(true)
			expect(content).toContain("# Original content")
			expect(content).toContain("Some text.")
		})

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

		it("skips CLAUDE.md when section exists and skipExisting is true", () => {
			const existingContent = `<!-- LIVESPEC:START -->
# Old content
<!-- LIVESPEC:END -->`
			writeFileSync(join(TEST_DIR, "CLAUDE.md"), existingContent)

			const result = init({ cwd: TEST_DIR, injectClaudeMd: true, skipExisting: true })

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

	describe("root AGENTS.md injection", () => {
		it("skips root AGENTS.md if it does not exist", () => {
			const result = init({ cwd: TEST_DIR, injectAgentsMd: true })
			expect(existsSync(join(TEST_DIR, "AGENTS.md"))).toBe(false)
			expect(result.skipped).toContain(join(TEST_DIR, "AGENTS.md"))
		})

		it("injects livespec section into existing root AGENTS.md", () => {
			writeFileSync(join(TEST_DIR, "AGENTS.md"), "# My agents instructions")
			init({ cwd: TEST_DIR, injectAgentsMd: true })

			const content = readFileSync(join(TEST_DIR, "AGENTS.md"), "utf-8")
			expect(content).toContain("<!-- LIVESPEC:START -->")
			expect(content).toContain("<!-- LIVESPEC:END -->")
			expect(content).toContain("# Livespec")
			expect(content).toContain("# My agents instructions")
		})

		it("keeps livespec/AGENTS.md separate from root AGENTS.md", () => {
			writeFileSync(join(TEST_DIR, "AGENTS.md"), "# Root agents")
			init({ cwd: TEST_DIR, injectAgentsMd: true })

			// Root AGENTS.md has livespec section
			const rootContent = readFileSync(join(TEST_DIR, "AGENTS.md"), "utf-8")
			expect(rootContent).toContain("<!-- LIVESPEC:START -->")
			expect(rootContent).toContain("# Root agents")

			// livespec/AGENTS.md has full template (no markers, different content)
			const livespecContent = readFileSync(join(TEST_DIR, "livespec/AGENTS.md"), "utf-8")
			expect(livespecContent).toContain("## Philosophy")
			expect(livespecContent).not.toContain("# Root agents")
		})

		it("can inject into both CLAUDE.md and AGENTS.md", () => {
			writeFileSync(join(TEST_DIR, "CLAUDE.md"), "# Claude instructions")
			writeFileSync(join(TEST_DIR, "AGENTS.md"), "# Agents instructions")

			const result = init({ cwd: TEST_DIR, injectClaudeMd: true, injectAgentsMd: true })

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

	describe("skipExisting option", () => {
		it("skips existing files when skipExisting is true", () => {
			init({ cwd: TEST_DIR, projectName: "first" })

			const agentsMdPath = join(TEST_DIR, "livespec/AGENTS.md")
			writeFileSync(agentsMdPath, "Custom content")

			const result = init({ cwd: TEST_DIR, projectName: "second", skipExisting: true })

			expect(readFileSync(agentsMdPath, "utf-8")).toBe("Custom content")
			expect(result.skipped).toContain(agentsMdPath)
		})

		it("overwrites existing files when skipExisting is false", () => {
			init({ cwd: TEST_DIR })

			const agentsMdPath = join(TEST_DIR, "livespec/AGENTS.md")
			writeFileSync(agentsMdPath, "Custom content")

			const result = init({ cwd: TEST_DIR, skipExisting: false })

			expect(readFileSync(agentsMdPath, "utf-8")).not.toBe("Custom content")
			expect(result.updated).toContain(agentsMdPath)
		})
	})

	describe("result tracking", () => {
		it("tracks created directories and files", () => {
			const result = init({ cwd: TEST_DIR })

			expect(result.created.length).toBeGreaterThan(0)
			expect(result.created.some((f) => f.includes("livespec"))).toBe(true)
			expect(result.created.some((f) => f.includes("AGENTS.md"))).toBe(true)
			expect(result.created.some((f) => f.includes("manifest.md"))).toBe(true)
			expect(result.created.some((f) => f.includes("project.md"))).toBe(true)
		})

		it("tracks skipped files on second init", () => {
			init({ cwd: TEST_DIR })
			const result = init({ cwd: TEST_DIR, skipExisting: true })

			expect(result.skipped.length).toBeGreaterThan(0)
			expect(result.created.length).toBe(0)
		})

		it("tracks updated files when overwriting", () => {
			init({ cwd: TEST_DIR })
			const result = init({ cwd: TEST_DIR, skipExisting: false })

			expect(result.updated.length).toBeGreaterThan(0)
		})

		it("tracks errors array (empty on success)", () => {
			const result = init({ cwd: TEST_DIR })
			expect(result.errors).toEqual([])
		})
	})

	describe("isInitialized", () => {
		it("returns false for empty directory", () => {
			expect(isInitialized(TEST_DIR)).toBe(false)
		})

		it("returns false for directory with only livespec folder", () => {
			mkdirSync(join(TEST_DIR, "livespec"))
			expect(isInitialized(TEST_DIR)).toBe(false)
		})

		it("returns false without livespec/AGENTS.md", () => {
			mkdirSync(join(TEST_DIR, "livespec"))
			writeFileSync(join(TEST_DIR, "livespec/manifest.md"), "# Manifest")
			expect(isInitialized(TEST_DIR)).toBe(false)
		})

		it("returns true after initialization", () => {
			init({ cwd: TEST_DIR })
			expect(isInitialized(TEST_DIR)).toBe(true)
		})

		it("returns true with minimal livespec structure", () => {
			mkdirSync(join(TEST_DIR, "livespec"))
			writeFileSync(join(TEST_DIR, "livespec/AGENTS.md"), "# Agents")
			expect(isInitialized(TEST_DIR)).toBe(true)
		})
	})

	describe("default values", () => {
		it("uses 'my-project' as default project name", () => {
			init({ cwd: TEST_DIR })
			expect(existsSync(join(TEST_DIR, "livespec/projects/my-project"))).toBe(true)
		})

		it("defaults skipExisting to true", () => {
			init({ cwd: TEST_DIR })
			const agentsMdPath = join(TEST_DIR, "livespec/AGENTS.md")
			writeFileSync(agentsMdPath, "Custom")

			init({ cwd: TEST_DIR }) // no skipExisting specified

			expect(readFileSync(agentsMdPath, "utf-8")).toBe("Custom")
		})

		it("defaults injectClaudeMd to false", () => {
			writeFileSync(join(TEST_DIR, "CLAUDE.md"), "# Original")
			init({ cwd: TEST_DIR }) // no injectClaudeMd specified

			const content = readFileSync(join(TEST_DIR, "CLAUDE.md"), "utf-8")
			expect(content).toBe("# Original")
		})

		it("defaults injectAgentsMd to false", () => {
			writeFileSync(join(TEST_DIR, "AGENTS.md"), "# Original")
			init({ cwd: TEST_DIR }) // no injectAgentsMd specified

			const content = readFileSync(join(TEST_DIR, "AGENTS.md"), "utf-8")
			expect(content).toBe("# Original")
		})
	})
})

describe("updateBaseFiles", () => {
	beforeEach(() => {
		if (existsSync(TEST_DIR)) {
			rmSync(TEST_DIR, { recursive: true })
		}
		mkdirSync(TEST_DIR, { recursive: true })
	})

	afterEach(() => {
		if (existsSync(TEST_DIR)) {
			rmSync(TEST_DIR, { recursive: true })
		}
	})

	it("updates livespec/AGENTS.md with latest template", () => {
		// Initialize first
		init({ cwd: TEST_DIR })

		// Modify AGENTS.md
		const agentsMdPath = join(TEST_DIR, "livespec/AGENTS.md")
		writeFileSync(agentsMdPath, "# Old content")

		// Update
		const result = updateBaseFiles({ cwd: TEST_DIR })

		const content = readFileSync(agentsMdPath, "utf-8")
		expect(content).toContain("## Philosophy")
		expect(content).not.toContain("# Old content")
		expect(result.updated).toContain(agentsMdPath)
	})

	it("updates livespec/manifest.md with latest template", () => {
		init({ cwd: TEST_DIR })

		const manifestPath = join(TEST_DIR, "livespec/manifest.md")
		writeFileSync(manifestPath, "# Old manifest")

		const result = updateBaseFiles({ cwd: TEST_DIR })

		const content = readFileSync(manifestPath, "utf-8")
		expect(content).not.toContain("# Old manifest")
		expect(result.updated).toContain(manifestPath)
	})

	it("skips files that are already up to date", () => {
		init({ cwd: TEST_DIR })

		// Don't modify anything
		const result = updateBaseFiles({ cwd: TEST_DIR })

		expect(result.skipped.length).toBeGreaterThan(0)
		expect(result.updated.length).toBe(0)
	})

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

	it("does not touch root CLAUDE.md when injectClaudeMd is false", () => {
		init({ cwd: TEST_DIR })

		const claudeMdPath = join(TEST_DIR, "CLAUDE.md")
		writeFileSync(claudeMdPath, "# Untouched")

		updateBaseFiles({ cwd: TEST_DIR, injectClaudeMd: false })

		const content = readFileSync(claudeMdPath, "utf-8")
		expect(content).toBe("# Untouched")
	})

	it("does not touch root AGENTS.md when injectAgentsMd is false", () => {
		init({ cwd: TEST_DIR })

		const agentsMdPath = join(TEST_DIR, "AGENTS.md")
		writeFileSync(agentsMdPath, "# Untouched")

		updateBaseFiles({ cwd: TEST_DIR, injectAgentsMd: false })

		const content = readFileSync(agentsMdPath, "utf-8")
		expect(content).toBe("# Untouched")
	})

	it("creates missing livespec/AGENTS.md", () => {
		init({ cwd: TEST_DIR })

		// Delete AGENTS.md
		rmSync(join(TEST_DIR, "livespec/AGENTS.md"))

		const result = updateBaseFiles({ cwd: TEST_DIR })

		expect(existsSync(join(TEST_DIR, "livespec/AGENTS.md"))).toBe(true)
		expect(result.created).toContain(join(TEST_DIR, "livespec/AGENTS.md"))
	})

	it("creates missing livespec/manifest.md", () => {
		init({ cwd: TEST_DIR })

		rmSync(join(TEST_DIR, "livespec/manifest.md"))

		const result = updateBaseFiles({ cwd: TEST_DIR })

		expect(existsSync(join(TEST_DIR, "livespec/manifest.md"))).toBe(true)
		expect(result.created).toContain(join(TEST_DIR, "livespec/manifest.md"))
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
		mkdirSync(join(TEST_DIR, "livespec/projects/test-app/feature"), { recursive: true })
		writeFileSync(specPath, "# My custom spec")

		// Add custom plan
		const planPath = join(TEST_DIR, "livespec/plans/active/my-plan/plan.md")
		mkdirSync(join(TEST_DIR, "livespec/plans/active/my-plan"), { recursive: true })
		writeFileSync(planPath, "# My custom plan")

		updateBaseFiles({ cwd: TEST_DIR })

		// Custom files should be untouched
		expect(readFileSync(specPath, "utf-8")).toBe("# My custom spec")
		expect(readFileSync(planPath, "utf-8")).toBe("# My custom plan")
	})
})
