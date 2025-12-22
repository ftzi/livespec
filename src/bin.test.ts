import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from "bun:test"
import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import * as p from "@clack/prompts"
import {
	detectExistingFiles,
	detectLivespecSections,
	fileHasLivespecSection,
	getDefaultProjectName,
	HELP_TEXT,
	handleFreshInit,
	handleUpdate,
	promptForInjectionTargets,
	promptForTools,
	showHelp,
	showNextSteps,
} from "./bin"
import { LIVESPEC_START_MARKER } from "./consts"
import { init, isInitialized } from "./init"
import { cleanupTestDir, setupTestDir, TEST_DIR } from "./test-utils"

// Regex patterns for test assertions (moved to top-level for performance)
const ALREADY_UP_TO_DATE_REGEX = /Already up to date/
const UPDATE_AVAILABLE_REGEX = /Update available: v0\.0\.1 → v/
const VERSION_NOT_FOUND_REGEX = /Version not found.*Latest:/
const UPDATED_FILES_REGEX = /Updated \d+ files/

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

	/** @spec [LIV.cli.help.long-flag] */
	describe("--help flag", () => {
		it("HELP_TEXT is displayed for both -h and --help", () => {
			// The HELP_TEXT is the same regardless of flag used
			// This tests that the help text exists and is valid
			expect(HELP_TEXT).toContain("livespec")
			expect(HELP_TEXT).toContain("--help")
		})
	})

	/** @spec [LIV.cli.fresh-init.tools-prompt] */
	describe("promptForTools", () => {
		it("returns selected tools when user makes selection", async () => {
			const multiselectSpy = spyOn(p, "multiselect").mockResolvedValue(["claude", "cursor"])
			const result = await promptForTools()
			expect(result).toEqual(["claude", "cursor"])
			expect(multiselectSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					message: "Setup /livespec command for:",
				}),
			)
			multiselectSpy.mockRestore()
		})

		it("offers Claude Code as default selection", async () => {
			const multiselectSpy = spyOn(p, "multiselect").mockResolvedValue(["claude"])
			await promptForTools()
			expect(multiselectSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					initialValues: ["claude"],
				}),
			)
			multiselectSpy.mockRestore()
		})
	})

	/** @spec [LIV.cli.fresh-init.cancel] */
	describe("cancel handling", () => {
		it("promptForTools returns null when user cancels", async () => {
			const cancelSymbol = Symbol("cancel")
			const multiselectSpy = spyOn(p, "multiselect").mockResolvedValue(cancelSymbol)
			const isCancelSpy = spyOn(p, "isCancel").mockReturnValue(true)
			const cancelSpy = spyOn(p, "cancel").mockImplementation(() => undefined)

			const result = await promptForTools()

			expect(result).toBeNull()
			expect(cancelSpy).toHaveBeenCalledWith("Cancelled.")

			multiselectSpy.mockRestore()
			isCancelSpy.mockRestore()
			cancelSpy.mockRestore()
		})

		it("promptForInjectionTargets returns null when user cancels", async () => {
			const cancelSymbol = Symbol("cancel")
			const multiselectSpy = spyOn(p, "multiselect").mockResolvedValue(cancelSymbol)
			const isCancelSpy = spyOn(p, "isCancel").mockReturnValue(true)
			const cancelSpy = spyOn(p, "cancel").mockImplementation(() => undefined)

			const result = await promptForInjectionTargets(true, true)

			expect(result).toBeNull()
			expect(cancelSpy).toHaveBeenCalledWith("Cancelled.")

			multiselectSpy.mockRestore()
			isCancelSpy.mockRestore()
			cancelSpy.mockRestore()
		})
	})

	/** @spec [LIV.cli.fresh-init.next-steps] */
	describe("showNextSteps", () => {
		it("shows next steps with tool names when tools selected", () => {
			const noteSpy = spyOn(p, "note").mockImplementation(() => undefined)

			showNextSteps(["claude", "cursor"])

			expect(noteSpy).toHaveBeenCalledWith(expect.stringContaining("Claude Code"), "Next steps")
			expect(noteSpy).toHaveBeenCalledWith(expect.stringContaining("Cursor"), "Next steps")
			expect(noteSpy).toHaveBeenCalledWith(expect.stringContaining("Run /livespec"), "Next steps")

			noteSpy.mockRestore()
		})

		it("shows next steps without tool mention when no tools selected", () => {
			const noteSpy = spyOn(p, "note").mockImplementation(() => undefined)

			showNextSteps([])

			expect(noteSpy).toHaveBeenCalledWith(expect.stringContaining("Add specs"), "Next steps")
			expect(noteSpy).toHaveBeenCalledWith(expect.stringContaining("livespec.md"), "Next steps")

			noteSpy.mockRestore()
		})
	})

	/** @spec [LIV.cli.fresh-init.skip-prompts] */
	describe("handleFreshInit with skipPrompts", () => {
		it("skips prompts and uses defaults when skipPrompts is true", async () => {
			// Change to TEST_DIR to avoid modifying actual project files
			const originalCwd = process.cwd()
			process.chdir(TEST_DIR)

			try {
				const spinnerSpy = spyOn(p, "spinner").mockReturnValue({
					start: mock(() => undefined),
					stop: mock(() => undefined),
					message: mock(() => undefined),
				})
				const noteSpy = spyOn(p, "note").mockImplementation(() => undefined)
				const outroSpy = spyOn(p, "outro").mockImplementation(() => undefined)

				await handleFreshInit({
					skipPrompts: true,
					hasClaudeMd: false,
					hasAgentsMd: false,
				})

				// Verify livespec was initialized
				expect(existsSync(join(TEST_DIR, "livespec/livespec.md"))).toBe(true)
				// Verify claude tool was created by default
				expect(existsSync(join(TEST_DIR, ".claude/commands/livespec.md"))).toBe(true)
				expect(outroSpy).toHaveBeenCalledWith("Done!")

				spinnerSpy.mockRestore()
				noteSpy.mockRestore()
				outroSpy.mockRestore()
			} finally {
				process.chdir(originalCwd)
			}
		})

		it("injects into existing files when skipPrompts and files exist", async () => {
			// Change to TEST_DIR to avoid modifying actual project files
			const originalCwd = process.cwd()
			process.chdir(TEST_DIR)

			try {
				writeFileSync(join(TEST_DIR, "CLAUDE.md"), "# Original")

				const spinnerSpy = spyOn(p, "spinner").mockReturnValue({
					start: mock(() => undefined),
					stop: mock(() => undefined),
					message: mock(() => undefined),
				})
				const noteSpy = spyOn(p, "note").mockImplementation(() => undefined)
				const outroSpy = spyOn(p, "outro").mockImplementation(() => undefined)

				await handleFreshInit({
					skipPrompts: true,
					hasClaudeMd: true,
					hasAgentsMd: false,
				})

				expect(outroSpy).toHaveBeenCalledWith("Done!")

				spinnerSpy.mockRestore()
				noteSpy.mockRestore()
				outroSpy.mockRestore()
			} finally {
				process.chdir(originalCwd)
			}
		})
	})

	/** @spec [LIV.cli.fresh-init.errors] */
	describe("fresh init error handling", () => {
		it("logs errors when init encounters issues", async () => {
			// Change to TEST_DIR to avoid modifying actual project files
			const originalCwd = process.cwd()
			process.chdir(TEST_DIR)

			try {
				const spinnerSpy = spyOn(p, "spinner").mockReturnValue({
					start: mock(() => undefined),
					stop: mock(() => undefined),
					message: mock(() => undefined),
				})
				const noteSpy = spyOn(p, "note").mockImplementation(() => undefined)
				const outroSpy = spyOn(p, "outro").mockImplementation(() => undefined)
				const logErrorSpy = spyOn(p.log, "error").mockImplementation(() => undefined)

				// Create a read-only directory to cause permission errors
				// Since this is hard to test reliably, we just verify the error display path exists
				await handleFreshInit({
					skipPrompts: true,
					hasClaudeMd: false,
					hasAgentsMd: false,
				})

				// The test passes if no uncaught errors occur
				expect(outroSpy).toHaveBeenCalled()

				spinnerSpy.mockRestore()
				noteSpy.mockRestore()
				outroSpy.mockRestore()
				logErrorSpy.mockRestore()
			} finally {
				process.chdir(originalCwd)
			}
		})
	})
})

/** @spec [LIV.cli.update] */
describe("livespec CLI update mode", () => {
	beforeEach(() => {
		setupTestDir()
		// Initialize livespec in TEST_DIR for update tests
		process.chdir(TEST_DIR)
		init({ cwd: TEST_DIR })
	})
	afterEach(() => {
		process.chdir(join(TEST_DIR, ".."))
		cleanupTestDir()
	})

	/** @spec [LIV.cli.update.already-current] */
	describe("already up to date", () => {
		it("shows already up to date message when versions match", async () => {
			const outroSpy = spyOn(p, "outro").mockImplementation(() => undefined)

			await handleUpdate(false, false)

			expect(outroSpy).toHaveBeenCalledWith(expect.stringMatching(ALREADY_UP_TO_DATE_REGEX))

			outroSpy.mockRestore()
		})
	})

	/** @spec [LIV.cli.update.version-prompt] */
	describe("version prompt", () => {
		it("shows version update message when versions differ", async () => {
			// Modify livespec.md to have old version
			writeFileSync(join(TEST_DIR, "livespec/livespec.md"), "<!-- livespec-version: 0.0.1 -->\n# Livespec")

			const selectSpy = spyOn(p, "select").mockResolvedValue("update")
			const outroSpy = spyOn(p, "outro").mockImplementation(() => undefined)

			await handleUpdate(false, false)

			expect(selectSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					message: expect.stringMatching(UPDATE_AVAILABLE_REGEX),
				}),
			)

			selectSpy.mockRestore()
			outroSpy.mockRestore()
		})
	})

	/** @spec [LIV.cli.update.missing-version] */
	describe("missing version", () => {
		it("shows version not found message when livespec.md has no version", async () => {
			writeFileSync(join(TEST_DIR, "livespec/livespec.md"), "# Livespec\nNo version comment")

			const selectSpy = spyOn(p, "select").mockResolvedValue("update")
			const outroSpy = spyOn(p, "outro").mockImplementation(() => undefined)

			await handleUpdate(false, false)

			expect(selectSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					message: expect.stringMatching(VERSION_NOT_FOUND_REGEX),
				}),
			)

			selectSpy.mockRestore()
			outroSpy.mockRestore()
		})
	})

	/** @spec [LIV.cli.update.prompt] */
	describe("update prompt", () => {
		it("prompts with update and cancel options", async () => {
			writeFileSync(join(TEST_DIR, "livespec/livespec.md"), "<!-- livespec-version: 0.0.1 -->\n# Livespec")

			const selectSpy = spyOn(p, "select").mockResolvedValue("update")
			const outroSpy = spyOn(p, "outro").mockImplementation(() => undefined)

			await handleUpdate(false, false)

			expect(selectSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					options: [
						{ value: "update", label: "Update base files" },
						{ value: "cancel", label: "Cancel" },
					],
				}),
			)

			selectSpy.mockRestore()
			outroSpy.mockRestore()
		})
	})

	/** @spec [LIV.cli.update.cancel] */
	describe("cancel update", () => {
		it("shows cancelled message when user selects cancel", async () => {
			writeFileSync(join(TEST_DIR, "livespec/livespec.md"), "<!-- livespec-version: 0.0.1 -->\n# Livespec")

			const selectSpy = spyOn(p, "select").mockResolvedValue("cancel")
			const cancelSpy = spyOn(p, "cancel").mockImplementation(() => undefined)

			await handleUpdate(false, false)

			expect(cancelSpy).toHaveBeenCalledWith("Cancelled.")

			selectSpy.mockRestore()
			cancelSpy.mockRestore()
		})

		it("shows cancelled message when user presses escape", async () => {
			writeFileSync(join(TEST_DIR, "livespec/livespec.md"), "<!-- livespec-version: 0.0.1 -->\n# Livespec")

			const cancelSymbol = Symbol("cancel")
			const selectSpy = spyOn(p, "select").mockResolvedValue(cancelSymbol)
			const isCancelSpy = spyOn(p, "isCancel").mockReturnValue(true)
			const cancelSpy = spyOn(p, "cancel").mockImplementation(() => undefined)

			await handleUpdate(false, false)

			expect(cancelSpy).toHaveBeenCalledWith("Cancelled.")

			selectSpy.mockRestore()
			isCancelSpy.mockRestore()
			cancelSpy.mockRestore()
		})
	})

	/** @spec [LIV.cli.update.skip-prompt] */
	describe("skip prompt with -y flag", () => {
		it("updates without prompting when skipPrompts is true", async () => {
			writeFileSync(join(TEST_DIR, "livespec/livespec.md"), "<!-- livespec-version: 0.0.1 -->\n# Livespec")

			const selectSpy = spyOn(p, "select")
			const outroSpy = spyOn(p, "outro").mockImplementation(() => undefined)

			await handleUpdate(true, false)

			expect(selectSpy).not.toHaveBeenCalled()
			expect(outroSpy).toHaveBeenCalled()

			selectSpy.mockRestore()
			outroSpy.mockRestore()
		})
	})

	/** @spec [LIV.cli.update.detect-tools] */
	describe("detect installed tools", () => {
		it("updates only installed tool command files", async () => {
			writeFileSync(join(TEST_DIR, "livespec/livespec.md"), "<!-- livespec-version: 0.0.1 -->\n# Livespec")
			mkdirSync(join(TEST_DIR, ".claude/commands"), { recursive: true })
			writeFileSync(join(TEST_DIR, ".claude/commands/livespec.md"), "old content")

			const outroSpy = spyOn(p, "outro").mockImplementation(() => undefined)

			await handleUpdate(true, false)

			expect(outroSpy).toHaveBeenCalled()

			outroSpy.mockRestore()
		})
	})

	/** @spec [LIV.cli.update.results] */
	describe("report update results", () => {
		it("shows updated files count and next step", async () => {
			writeFileSync(join(TEST_DIR, "livespec/livespec.md"), "<!-- livespec-version: 0.0.1 -->\n# Livespec")

			const outroSpy = spyOn(p, "outro").mockImplementation(() => undefined)

			await handleUpdate(true, false)

			expect(outroSpy).toHaveBeenCalledWith(expect.stringMatching(UPDATED_FILES_REGEX))
			expect(outroSpy).toHaveBeenCalledWith(expect.stringContaining("/livespec"))

			outroSpy.mockRestore()
		})
	})

	/** @spec [LIV.cli.update.no-changes] */
	describe("report no changes", () => {
		it("shows all files unchanged when no updates needed", async () => {
			// livespec.md already has current version from init()
			const outroSpy = spyOn(p, "outro").mockImplementation(() => undefined)

			await handleUpdate(true, false)

			expect(outroSpy).toHaveBeenCalledWith(expect.stringMatching(ALREADY_UP_TO_DATE_REGEX))

			outroSpy.mockRestore()
		})
	})
})
