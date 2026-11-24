import { beforeEach, describe, expect, it } from "vitest";
import {
	getCompletedDailysForToday,
	isDailyCompletedToday,
	markDailyCompletedToday,
	unmarkDailyCompletedToday,
} from "./dailyCompletion";

describe("dailyCompletion", () => {
	beforeEach(() => {
		window.localStorage.clear();
	});

	it("marks and unmarks a daily as completed for the current day", () => {
		const today = new Date("2026-11-23T10:00:00");

		expect(isDailyCompletedToday("Revisar correos", today)).toBe(false);

		markDailyCompletedToday("Revisar correos", today);
		expect(isDailyCompletedToday("Revisar correos", today)).toBe(true);
		expect(isDailyCompletedToday("  revisar correos  ", today)).toBe(true);

		unmarkDailyCompletedToday("Revisar correos", today);
		expect(isDailyCompletedToday("Revisar correos", today)).toBe(false);
	});

	it("resets completed dailys automatically when the calendar day changes", () => {
		const dayOne = new Date("2026-11-23T22:00:00");
		const dayTwo = new Date("2026-11-24T08:00:00");

		markDailyCompletedToday("Standup diario", dayOne);
		expect(isDailyCompletedToday("Standup diario", dayOne)).toBe(true);

		// Next day: automatically cleared and active again
		expect(isDailyCompletedToday("Standup diario", dayTwo)).toBe(false);
		expect(getCompletedDailysForToday(dayTwo).size).toBe(0);
	});
});
