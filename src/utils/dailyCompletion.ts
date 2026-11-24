const COMPLETED_DAILYS_KEY = "kairos_completed_dailys";

interface CompletedDailysRecord {
	date: string;
	titles: string[];
}

export function getTodayDateKey(date: Date = new Date()): string {
	return date.toLocaleDateString("en-CA");
}

function normalizeTitle(title: string): string {
	return title.trim().toLowerCase();
}

export function getCompletedDailysForToday(
	date: Date = new Date(),
): Set<string> {
	if (typeof window === "undefined") {
		return new Set();
	}

	const today = getTodayDateKey(date);
	try {
		const raw = window.localStorage.getItem(COMPLETED_DAILYS_KEY);
		if (!raw) return new Set();

		const parsed = JSON.parse(raw) as Partial<CompletedDailysRecord>;
		if (parsed.date !== today || !Array.isArray(parsed.titles)) {
			window.localStorage.removeItem(COMPLETED_DAILYS_KEY);
			return new Set();
		}

		return new Set(parsed.titles.map(normalizeTitle));
	} catch {
		window.localStorage.removeItem(COMPLETED_DAILYS_KEY);
		return new Set();
	}
}

export function isDailyCompletedToday(
	title: string,
	date: Date = new Date(),
): boolean {
	return getCompletedDailysForToday(date).has(normalizeTitle(title));
}

export function markDailyCompletedToday(
	title: string,
	date: Date = new Date(),
): void {
	if (typeof window === "undefined") return;

	const today = getTodayDateKey(date);
	const current = getCompletedDailysForToday(date);
	current.add(normalizeTitle(title));

	const record: CompletedDailysRecord = {
		date: today,
		titles: Array.from(current),
	};
	window.localStorage.setItem(COMPLETED_DAILYS_KEY, JSON.stringify(record));
}

export function unmarkDailyCompletedToday(
	title: string,
	date: Date = new Date(),
): void {
	if (typeof window === "undefined") return;

	const today = getTodayDateKey(date);
	const current = getCompletedDailysForToday(date);
	current.delete(normalizeTitle(title));

	const record: CompletedDailysRecord = {
		date: today,
		titles: Array.from(current),
	};
	window.localStorage.setItem(COMPLETED_DAILYS_KEY, JSON.stringify(record));
}
