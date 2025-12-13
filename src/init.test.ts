import { afterEach, beforeEach, describe, expect, it } from "bun:test"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { init, isInitialized } from "./init"
import { cleanupTestDir, setupTestDir, TEST_DIR } from "./test-utils"

describe("livespec init", () => {
	beforeEach(setupTestDir)
	afterEach(cleanupTestDir)

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
		it("creates livespec/livespec.md", () => {
			init({ cwd: TEST_DIR })
			expect(existsSync(join(TEST_DIR, "livespec/livespec.md"))).toBe(true)
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

	describe("livespec/livespec.md content", () => {
		it("contains philosophy section", () => {
			init({ cwd: TEST_DIR })
			const content = readFileSync(join(TEST_DIR, "livespec/livespec.md"), "utf-8")
			expect(content).toContain("## Philosophy")
		})

		it("contains decision tree", () => {
			init({ cwd: TEST_DIR })
			const content = readFileSync(join(TEST_DIR, "livespec/livespec.md"), "utf-8")
			expect(content).toContain("Decision Tree")
		})

		it("contains plan file format", () => {
			init({ cwd: TEST_DIR })
			const content = readFileSync(join(TEST_DIR, "livespec/livespec.md"), "utf-8")
			expect(content).toContain("## Plan File Format")
		})

		it("contains spec file format", () => {
			init({ cwd: TEST_DIR })
			const content = readFileSync(join(TEST_DIR, "livespec/livespec.md"), "utf-8")
			expect(content).toContain("## Spec File Format")
		})

		it("contains testing declaration info", () => {
			init({ cwd: TEST_DIR })
			const content = readFileSync(join(TEST_DIR, "livespec/livespec.md"), "utf-8")
			expect(content).toContain("Testing:")
			expect(content).toContain("unit")
			expect(content).toContain("e2e")
		})

		it("contains housekeeping section", () => {
			init({ cwd: TEST_DIR })
			const content = readFileSync(join(TEST_DIR, "livespec/livespec.md"), "utf-8")
			expect(content).toContain("Housekeeping")
		})

		it("contains livespec mode section", () => {
			init({ cwd: TEST_DIR })
			const content = readFileSync(join(TEST_DIR, "livespec/livespec.md"), "utf-8")
			expect(content).toContain("Livespec Mode")
		})
	})

	describe("skipExisting option", () => {
		it("skips existing files when skipExisting is true", () => {
			init({ cwd: TEST_DIR, projectName: "first" })

			const livespecMdPath = join(TEST_DIR, "livespec/livespec.md")
			writeFileSync(livespecMdPath, "Custom content")

			const result = init({ cwd: TEST_DIR, projectName: "second", skipExisting: true })

			expect(readFileSync(livespecMdPath, "utf-8")).toBe("Custom content")
			expect(result.skipped).toContain(livespecMdPath)
		})

		it("overwrites existing files when skipExisting is false", () => {
			init({ cwd: TEST_DIR })

			const livespecMdPath = join(TEST_DIR, "livespec/livespec.md")
			writeFileSync(livespecMdPath, "Custom content")

			const result = init({ cwd: TEST_DIR, skipExisting: false })

			expect(readFileSync(livespecMdPath, "utf-8")).not.toBe("Custom content")
			expect(result.updated).toContain(livespecMdPath)
		})
	})

	describe("result tracking", () => {
		it("tracks created directories and files", () => {
			const result = init({ cwd: TEST_DIR })

			expect(result.created.length).toBeGreaterThan(0)
			expect(result.created.some((f) => f.includes("livespec"))).toBe(true)
			expect(result.created.some((f) => f.includes("livespec.md"))).toBe(true)
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

		it("returns false without livespec/livespec.md", () => {
			mkdirSync(join(TEST_DIR, "livespec"))
			writeFileSync(join(TEST_DIR, "livespec/project.md"), "# Project")
			expect(isInitialized(TEST_DIR)).toBe(false)
		})

		it("returns true after initialization", () => {
			init({ cwd: TEST_DIR })
			expect(isInitialized(TEST_DIR)).toBe(true)
		})

		it("returns true with minimal livespec structure", () => {
			mkdirSync(join(TEST_DIR, "livespec"))
			writeFileSync(join(TEST_DIR, "livespec/livespec.md"), "# Livespec")
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
			const livespecMdPath = join(TEST_DIR, "livespec/livespec.md")
			writeFileSync(livespecMdPath, "Custom")

			init({ cwd: TEST_DIR }) // no skipExisting specified

			expect(readFileSync(livespecMdPath, "utf-8")).toBe("Custom")
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
