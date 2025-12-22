import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test"
import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import {
	detectExistingFiles,
	detectLivespecSections,
	fileHasLivespecSection,
	getDefaultProjectName,
	HELP_TEXT,
	showHelp,
} from "./bin"
import { LIVESPEC_START_MARKER } from "./consts"
import { isInitialized } from "./init"
import { cleanupTestDir, setupTestDir, TEST_DIR } from "./test-utils"

describe("livespec CLI", () => {
	beforeEach(setupTestDir)
	afterEach(cleanupTestDir)

	/** @spec [LIV.cli.help] */
	describe("help", () => {
		/** @spec [LIV.cli.help.short-flag] */
		it("showHelp outputs help text", () => {
			const consoleSpy = spyOn(console, "log").mockImplementation(() => undefined)
			showHelp()
			expect(consoleSpy).toHaveBeenCalledWith(HELP_TEXT)
			consoleSpy.mockRestore()
		})

		/** @spec [LIV.cli.help.content] */
		it("help text contains usage information", () => {
			expect(HELP_TEXT).toContain("npx livespec [options]")
		})

		/** @spec [LIV.cli.help.content] */
		it("help text contains -y, --yes option", () => {
			expect(HELP_TEXT).toContain("-y, --yes")
		})

		/** @spec [LIV.cli.help.content] */
		it("help text contains -h, --help option", () => {
			expect(HELP_TEXT).toContain("-h, --help")
		})
	})

	/** @spec [LIV.cli.fresh-init] */
	describe("fresh initialization detection", () => {
		/** @spec [LIV.cli.fresh-init.detection] */
		it("detectExistingFiles returns false for both when no files exist", () => {
			const result = detectExistingFiles(TEST_DIR)
			expect(result.hasClaudeMd).toBe(false)
			expect(result.hasAgentsMd).toBe(false)
		})

		/** @spec [LIV.cli.fresh-init.injection-existing-only] */
		it("detectExistingFiles returns true only for existing files", () => {
			writeFileSync(join(TEST_DIR, "CLAUDE.md"), "# Claude")
			const result = detectExistingFiles(TEST_DIR)
			expect(result.hasClaudeMd).toBe(true)
			expect(result.hasAgentsMd).toBe(false)
		})

		/** @spec [LIV.cli.fresh-init.injection-prompt] */
		it("detectExistingFiles returns true for both when both exist", () => {
			writeFileSync(join(TEST_DIR, "CLAUDE.md"), "# Claude")
			writeFileSync(join(TEST_DIR, "AGENTS.md"), "# Agents")
			const result = detectExistingFiles(TEST_DIR)
			expect(result.hasClaudeMd).toBe(true)
			expect(result.hasAgentsMd).toBe(true)
		})
	})

	/** @spec [LIV.cli.update] */
	describe("update mode detection", () => {
		/** @spec [LIV.cli.update.detect-sections] */
		it("detectLivespecSections returns false when files have no section", () => {
			writeFileSync(join(TEST_DIR, "CLAUDE.md"), "# Claude\nNo livespec section")
			writeFileSync(join(TEST_DIR, "AGENTS.md"), "# Agents\nNo livespec section")
			const result = detectLivespecSections(TEST_DIR)
			expect(result.claudeMdHasSection).toBe(false)
			expect(result.agentsMdHasSection).toBe(false)
		})

		/** @spec [LIV.cli.update.detect-sections] */
		it("detectLivespecSections returns true when files have livespec section", () => {
			writeFileSync(join(TEST_DIR, "CLAUDE.md"), `# Claude\n${LIVESPEC_START_MARKER}\nSection content`)
			writeFileSync(join(TEST_DIR, "AGENTS.md"), `# Agents\n${LIVESPEC_START_MARKER}\nSection content`)
			const result = detectLivespecSections(TEST_DIR)
			expect(result.claudeMdHasSection).toBe(true)
			expect(result.agentsMdHasSection).toBe(true)
		})

		/** @spec [LIV.cli.update.detect-sections] */
		it("detectLivespecSections returns false when files don't exist", () => {
			const result = detectLivespecSections(TEST_DIR)
			expect(result.claudeMdHasSection).toBe(false)
			expect(result.agentsMdHasSection).toBe(false)
		})

		/** @spec [LIV.cli.update.detect-sections] */
		it("fileHasLivespecSection returns false for non-existent file", () => {
			expect(fileHasLivespecSection(join(TEST_DIR, "nonexistent.md"))).toBe(false)
		})

		/** @spec [LIV.cli.update.detect-sections] */
		it("fileHasLivespecSection returns true when marker is present", () => {
			const filePath = join(TEST_DIR, "test.md")
			writeFileSync(filePath, `Content\n${LIVESPEC_START_MARKER}\nMore content`)
			expect(fileHasLivespecSection(filePath)).toBe(true)
		})
	})

	describe("getDefaultProjectName", () => {
		it("extracts directory name from path", () => {
			expect(getDefaultProjectName("/path/to/my-project")).toBe("my-project")
		})

		it("returns my-project for empty path", () => {
			expect(getDefaultProjectName("")).toBe("my-project")
		})

		it("handles single directory", () => {
			expect(getDefaultProjectName("/single")).toBe("single")
		})
	})

	/** @spec [LIV.cli.fresh-init] */
	describe("fresh init detection with isInitialized", () => {
		/** @spec [LIV.cli.fresh-init.detection] */
		it("isInitialized returns false when livespec/ does not exist", () => {
			expect(isInitialized(TEST_DIR)).toBe(false)
		})

		/** @spec [LIV.cli.fresh-init.partial] */
		it("isInitialized returns false when livespec/ exists but livespec.md does not", () => {
			mkdirSync(join(TEST_DIR, "livespec"))
			expect(isInitialized(TEST_DIR)).toBe(false)
		})

		/** @spec [LIV.cli.update.detection] */
		it("isInitialized returns true when livespec/livespec.md exists", () => {
			mkdirSync(join(TEST_DIR, "livespec"))
			writeFileSync(join(TEST_DIR, "livespec/livespec.md"), "# Livespec")
			expect(isInitialized(TEST_DIR)).toBe(true)
		})
	})

	/** @spec [LIV.cli.fresh-init.no-injection-files] */
	describe("no injection files scenario", () => {
		it("detectExistingFiles returns false for both when no CLAUDE.md or AGENTS.md", () => {
			const result = detectExistingFiles(TEST_DIR)
			expect(result.hasClaudeMd).toBe(false)
			expect(result.hasAgentsMd).toBe(false)
		})
	})
})
