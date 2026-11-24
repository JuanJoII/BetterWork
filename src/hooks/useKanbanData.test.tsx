import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getTodayDateKey } from "../utils/date";
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

describe("useKanbanData server-backed daily sync", () => {
	const createProject = vi.fn();
	const createTask = vi.fn();
	const updateTask = vi.fn();
	const updateColumn = vi.fn();
	const completeTask = vi.fn();
	const undoCompleteTask = vi.fn();
	const removeTask = vi.fn();
	const removeProject = vi.fn();
	const syncDailys = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		syncDailys.mockResolvedValue({ created: 0, reset: 0 });

		let mutationIdx = 0;
		const mutations = [
			createProject,
			createTask,
			updateTask,
			updateColumn,
			completeTask,
			undoCompleteTask,
			removeTask,
			removeProject,
			syncDailys,
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

	it("does NOT trigger syncForDate when a daily was already completed today on the server", async () => {
		const today = getTodayDateKey();

		let queryIdx = 0;
		mockUseQuery.mockImplementation(() => {
			const results = [
				[
					{
						_id: "proj_1",
						name: "General",
						createdAt: "2026-11-20T00:00:00Z",
					},
				],
				[], // Task was moved to completedTasks by tasks.complete
				[
					{
						_id: "daily_1",
						title: "Revisar correos",
						description: "Inbox zero",
						lastCompletedDate: today,
						lastSyncedDate: today,
						createdAt: "2026-11-20T00:00:00Z",
					},
				],
			];
			return results[queryIdx++ % results.length];
		});

		const { unmount } = render(<TestHarness />);
		await waitFor(() => {
			expect(syncDailys).not.toHaveBeenCalled();
		});

		// Simulate refresh / route change
		unmount();
		render(<TestHarness />);
		await waitFor(() => {
			expect(syncDailys).not.toHaveBeenCalled();
		});
	});

	it("triggers syncForDate automatically when a new day starts", async () => {
		const today = getTodayDateKey();

		let queryIdx = 0;
		mockUseQuery.mockImplementation(() => {
			const results = [
				[
					{
						_id: "proj_1",
						name: "General",
						createdAt: "2026-11-20T00:00:00Z",
					},
				],
				[],
				[
					{
						_id: "daily_1",
						title: "Revisar correos",
						description: "Inbox zero",
						lastCompletedDate: "2020-01-01",
						lastSyncedDate: "2020-01-01",
						createdAt: "2026-11-20T00:00:00Z",
					},
				],
			];
			return results[queryIdx++ % results.length];
		});

		render(<TestHarness />);

		await waitFor(() => {
			expect(syncDailys).toHaveBeenCalledWith({ localDate: today });
		});
	});

	it("triggers syncForDate when a daily left in finalizado needs next-day reset", async () => {
		const today = getTodayDateKey();

		let queryIdx = 0;
		mockUseQuery.mockImplementation(() => {
			const results = [
				[
					{
						_id: "proj_1",
						name: "General",
						createdAt: "2026-11-20T00:00:00Z",
					},
				],
				[
					{
						_id: "task_1",
						title: "Revisar correos",
						description: "Inbox zero",
						priority: "medium",
						column: "finalizado",
						projectId: "proj_1",
						isRitual: true,
						ritualId: "daily_1",
						createdAt: "2026-11-20T00:00:00Z",
					},
				],
				[
					{
						_id: "daily_1",
						title: "Revisar correos",
						description: "Inbox zero",
						lastSyncedDate: "2020-01-01",
						createdAt: "2026-11-20T00:00:00Z",
					},
				],
			];
			return results[queryIdx++ % results.length];
		});

		render(<TestHarness />);

		await waitFor(() => {
			expect(syncDailys).toHaveBeenCalledWith({ localDate: today });
		});
	});
});
