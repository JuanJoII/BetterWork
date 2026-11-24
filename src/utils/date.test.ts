import { describe, expect, it } from "vitest";
import {
	COMPLETED_TASKS_RETENTION_DAYS,
	COMPLETED_TASKS_RETENTION_MS,
} from "../../convex/completedTasks";
import { getTodayDateKey } from "./date";

describe("date and completedTasks retention", () => {
	it("formats local date as YYYY-MM-DD", () => {
		const sample = new Date(2026, 10, 23, 14, 30, 0);
		expect(getTodayDateKey(sample)).toBe("2026-11-23");
	});

	it("configures completedTasks retention strictly to 15 days", () => {
		expect(COMPLETED_TASKS_RETENTION_DAYS).toBe(15);
		expect(COMPLETED_TASKS_RETENTION_MS).toBe(15 * 24 * 60 * 60 * 1000);
	});
});
