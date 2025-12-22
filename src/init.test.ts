import { afterEach, beforeEach, describe, expect, it } from "bun:test"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { init, isInitialized } from "./init"
import { cleanupTestDir, setupTestDir, TEST_DIR } from "./test-utils"

const __dirname = dirname(fileURLToPath(import.meta.url))

describe("livespec init", () => {
	beforeEach(setupTestDir)
	afterEach(cleanupTestDir)

	/** @spec [LIV.init.directories] */
	describe("directory structure", () => {
		/** @spec [LIV.init.directories.livespec] */
		it("creates livespec directory", () => {
			init({ cwd: TEST_DIR })
			expect(existsSync(join(TEST_DIR, "livespec"))).toBe(true)
		})

		/** @spec [LIV.init.directories.projects] */
		it("creates projects directory", () => {
			init({ cwd: TEST_DIR })
			expect(existsSync(join(TEST_DIR, "livespec/projects"))).toBe(true)
		})

		/** @spec [LIV.init.directories.project] */
		it("creates project subdirectory with provided name", () => {
			init({ cwd: TEST_DIR, projectName: "my-app" })
			expect(existsSync(join(TEST_DIR, "livespec/projects/my-app"))).toBe(true)
		})

		/** @spec [LIV.init.directories.plans] */
		it("creates plans/active directory", () => {
			init({ cwd: TEST_DIR })
			expect(existsSync(join(TEST_DIR, "livespec/plans/active"))).toBe(true)
		})

		/** @spec [LIV.init.directories.plans] */
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

	/** @spec [LIV.init.templates] */
	describe("file creation", () => {
		/** @spec [LIV.init.templates.livespec-md] */
		it("creates livespec/livespec.md", () => {
			init({ cwd: TEST_DIR })
			expect(existsSync(join(TEST_DIR, "livespec/livespec.md"))).toBe(true)
		})

		/** @spec [LIV.init.templates.project-md] */
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
		/** @spec [LIV.init.templates.version] */
		it("contains version comment with package.json version", () => {
			init({ cwd: TEST_DIR })
			const content = readFileSync(join(TEST_DIR, "livespec/livespec.md"), "utf-8")

			// Read expected version from package.json
			const packageJson = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8"))
			const expectedVersion = packageJson.version

			expect(content).toContain(`<!-- livespec-version: ${expectedVersion} -->`)
		})

		it("contains philosophy section", () => {
			init({ cwd: TEST_DIR })
			const content = readFileSync(join(TEST_DIR, "livespec/livespec.md"), "utf-8")
			expect(content).toContain("## 1. Philosophy")
		})

		it("contains plan file format", () => {
			init({ cwd: TEST_DIR })
			const content = readFileSync(join(TEST_DIR, "livespec/livespec.md"), "utf-8")
			expect(content).toContain("## 8. Plan File Format")
		})

		it("contains spec file format", () => {
			init({ cwd: TEST_DIR })
			const content = readFileSync(join(TEST_DIR, "livespec/livespec.md"), "utf-8")
			expect(content).toContain("## 5. Spec File")
		})

		it("contains testing declaration info", () => {
			init({ cwd: TEST_DIR })
			const content = readFileSync(join(TEST_DIR, "livespec/livespec.md"), "utf-8")
			expect(content).toContain("Testing:")
			expect(content).toContain("unit")
			expect(content).toContain("e2e")
		})

		it("contains commands section", () => {
			init({ cwd: TEST_DIR })
			const content = readFileSync(join(TEST_DIR, "livespec/livespec.md"), "utf-8")
			expect(content).toContain("## 10. Commands")
			expect(content).toContain("/livespec")
		})
	})

	describe("skipExisting option", () => {
		/** @spec [LIV.init.templates.skip-livespec] */
		it("skips existing files when skipExisting is true", () => {
			init({ cwd: TEST_DIR, projectName: "first" })

			const livespecMdPath = join(TEST_DIR, "livespec/livespec.md")
			writeFileSync(livespecMdPath, "Custom content")

			const result = init({
				cwd: TEST_DIR,
				projectName: "second",
				skipExisting: true,
			})

			expect(readFileSync(livespecMdPath, "utf-8")).toBe("Custom content")
			expect(result.skipped).toContain(livespecMdPath)
		})

		/** @spec [LIV.init.templates.overwrite] */
		it("overwrites existing files when skipExisting is false", () => {
			init({ cwd: TEST_DIR })

			const livespecMdPath = join(TEST_DIR, "livespec/livespec.md")
			writeFileSync(livespecMdPath, "Custom content")

			const result = init({ cwd: TEST_DIR, skipExisting: false })

			expect(readFileSync(livespecMdPath, "utf-8")).not.toBe("Custom content")
			expect(result.updated).toContain(livespecMdPath)
		})
	})

	/** @spec [LIV.init.result] */
	describe("result tracking", () => {
		/** @spec [LIV.init.result.created] */
		it("tracks created directories and files", () => {
			const result = init({ cwd: TEST_DIR })

			expect(result.created.length).toBeGreaterThan(0)
			expect(result.created.some((f) => f.includes("livespec"))).toBe(true)
			expect(result.created.some((f) => f.includes("livespec.md"))).toBe(true)
			expect(result.created.some((f) => f.includes("project.md"))).toBe(true)
		})

		/** @spec [LIV.init.result.skipped] */
		it("tracks skipped files on second init", () => {
			init({ cwd: TEST_DIR })
			const result = init({ cwd: TEST_DIR, skipExisting: true })

			expect(result.skipped.length).toBeGreaterThan(0)
			expect(result.created.length).toBe(0)
		})

		/** @spec [LIV.init.result.updated] */
		it("tracks updated files when overwriting", () => {
			init({ cwd: TEST_DIR })
			const result = init({ cwd: TEST_DIR, skipExisting: false })

			expect(result.updated.length).toBeGreaterThan(0)
		})

		/** @spec [LIV.init.result.errors] */
		it("tracks errors array (empty on success)", () => {
			const result = init({ cwd: TEST_DIR })
			expect(result.errors).toEqual([])
		})
	})

	/** @spec [LIV.init.is-initialized] */
	describe("isInitialized", () => {
		/** @spec [LIV.init.is-initialized.empty] */
		it("returns false for empty directory", () => {
			expect(isInitialized(TEST_DIR)).toBe(false)
		})

		/** @spec [LIV.init.is-initialized.partial] */
		it("returns false for directory with only livespec folder", () => {
			mkdirSync(join(TEST_DIR, "livespec"))
			expect(isInitialized(TEST_DIR)).toBe(false)
		})

		/** @spec [LIV.init.is-initialized.partial] */
		it("returns false without livespec/livespec.md", () => {
			mkdirSync(join(TEST_DIR, "livespec"))
			writeFileSync(join(TEST_DIR, "livespec/project.md"), "# Project")
			expect(isInitialized(TEST_DIR)).toBe(false)
		})

		/** @spec [LIV.init.is-initialized.complete] */
		it("returns true after initialization", () => {
			init({ cwd: TEST_DIR })
			expect(isInitialized(TEST_DIR)).toBe(true)
		})

		/** @spec [LIV.init.is-initialized.minimal] */
		it("returns true with minimal livespec structure", () => {
			mkdirSync(join(TEST_DIR, "livespec"))
			writeFileSync(join(TEST_DIR, "livespec/livespec.md"), "# Livespec")
			expect(isInitialized(TEST_DIR)).toBe(true)
		})
	})

	describe("default values", () => {
		/** @spec [LIV.init.directories.default-name] */
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
