import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { markDailyCompletedToday } from "../utils/dailyCompletion";
import { useKanbanData } from "./useKanbanData";

const { mockUseQuery, mockUseMutation } = vi.hoisted(() => ({
	mockUseQuery: vi.fn(),
	mockUseMutation: vi.fn(),
}));

vi.mock("convex/react", () => ({
	useConvexAuth: () => ({ isLoading: false, isAuthenticated: true }),
	useQuery: (...args: unknown[]) => mockUseQuery(...args),
	useMutation: (...args: unknown[]) => mockUseMutation(...args),
}));

function TestHarness() {
	useKanbanData();
	return null;
}

describe("useKanbanData daily sync", () => {
	const createProject = vi.fn();
	const createTask = vi.fn();
	const updateTask = vi.fn();
	const updateColumn = vi.fn();
	const removeTask = vi.fn();
	const removeProject = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		window.localStorage.clear();

		let mutationIdx = 0;
		const mutations = [
			createProject,
			createTask,
			updateTask,
			updateColumn,
			removeTask,
			removeProject,
		];
		mockUseMutation.mockImplementation(() => {
			const fn = mutations[mutationIdx % mutations.length];
			mutationIdx += 1;
			return fn;
		});
	});

	afterEach(() => {
		cleanup();
	});

	it("does NOT recreate a daily on refresh/route change when it was already completed today", async () => {
		markDailyCompletedToday("Revisar correos");

		let queryIdx = 0;
		mockUseQuery.mockImplementation(() => {
			const results = [
				[{ _id: "proj_1", name: "General", createdAt: "2026-11-20T00:00:00Z" }],
				[], // Task was removed when completed via green tick
				[
					{
						_id: "daily_1",
						title: "Revisar correos",
						description: "Inbox zero",
						createdAt: "2026-11-20T00:00:00Z",
					},
				],
			];
			return results[queryIdx++ % results.length];
		});

		const { unmount } = render(<TestHarness />);
		await waitFor(() => {
			expect(createTask).not.toHaveBeenCalled();
		});

		// Simulate route change / remount
		unmount();
		render(<TestHarness />);
		await waitFor(() => {
			expect(createTask).not.toHaveBeenCalled();
		});
	});

	it("recreates a daily automatically on a new day", async () => {
		// Simulate completion stored from yesterday
		window.localStorage.setItem(
			"kairos_completed_dailys",
			JSON.stringify({ date: "2020-01-01", titles: ["revisar correos"] }),
		);

		let queryIdx = 0;
		mockUseQuery.mockImplementation(() => {
			const results = [
				[{ _id: "proj_1", name: "General", createdAt: "2026-11-20T00:00:00Z" }],
				[],
				[
					{
						_id: "daily_1",
						title: "Revisar correos",
						description: "Inbox zero",
						createdAt: "2026-11-20T00:00:00Z",
					},
				],
			];
			return results[queryIdx++ % results.length];
		});

		render(<TestHarness />);

		await waitFor(() => {
			expect(createTask).toHaveBeenCalledWith({
				title: "Revisar correos",
				description: "Inbox zero",
				priority: "medium",
				column: "pendiente",
				projectId: "proj_1",
				isRitual: true,
			});
		});
	});
});
