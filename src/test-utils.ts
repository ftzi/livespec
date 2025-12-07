import { existsSync, mkdirSync, rmSync } from "node:fs"
import { join } from "node:path"

export const TEST_DIR = join(import.meta.dirname, "../.test-output")

export function setupTestDir(): void {
	if (existsSync(TEST_DIR)) {
		rmSync(TEST_DIR, { recursive: true })
	}
	mkdirSync(TEST_DIR, { recursive: true })
}

export function cleanupTestDir(): void {
	if (existsSync(TEST_DIR)) {
		rmSync(TEST_DIR, { recursive: true })
	}
}
