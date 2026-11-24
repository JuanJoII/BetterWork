export function getTodayDateKey(date: Date = new Date()): string {
	return date.toLocaleDateString("en-CA");
}
