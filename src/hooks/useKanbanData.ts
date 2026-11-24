import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useRef } from "react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import type { Project, Task } from "../types/kanban";
import { getTodayDateKey } from "../utils/date";

function normalizeTitle(title: string): string {
	return title.trim().toLowerCase();
}

export function useKanbanData() {
	const { isLoading, isAuthenticated } = useConvexAuth();

	// Convex queries and mutations
	const convexProjects = useQuery(api.projects.list);
	const convexTasks = useQuery(api.tasks.list);
	const convexRituals = useQuery(api.rituals.list);

	const createProjectMutation = useMutation(api.projects.create);
	const createTaskMutation = useMutation(api.tasks.create);
	const updateTaskMutation = useMutation(api.tasks.update);
	const updateColumnMutation = useMutation(api.tasks.updateColumn);
	const completeTaskMutation = useMutation(api.tasks.complete);
	const undoCompleteTaskMutation = useMutation(api.tasks.undoComplete);
	const removeTaskMutation = useMutation(api.tasks.remove);
	const removeProjectMutation = useMutation(api.projects.remove);
	const syncDailysMutation = useMutation(api.rituals.syncForDate);

	// Map Convex data to local types for child components
	const projects = useMemo<Project[]>(() => {
		return (
			convexProjects?.map((p: Doc<"projects">) => ({
				id: p._id,
				name: p.name,
				createdAt: p.createdAt,
			})) || []
		);
	}, [convexProjects]);

	const tasks = useMemo<Task[]>(() => {
		return (
			convexTasks?.map((t: Doc<"tasks">) => ({
				id: t._id,
				title: t.title,
				description: t.description,
				priority: t.priority as Task["priority"],
				column: t.column as Task["column"],
				projectId: t.projectId,
				isRitual: t.isRitual,
				ritualId: t.ritualId,
				createdAt: t.createdAt,
			})) || []
		);
	}, [convexTasks]);

	// Auto-create default project for new users
	useEffect(() => {
		if (
			!isLoading &&
			isAuthenticated &&
			convexProjects !== undefined &&
			convexProjects.length === 0
		) {
			const createDefaultProject = async () => {
				try {
					await createProjectMutation({ name: "General" });
				} catch (e) {
					console.error("Error creating default project:", e);
				}
			};
			createDefaultProject();
		}
	}, [isLoading, isAuthenticated, convexProjects, createProjectMutation]);

	const inFlightSyncKeyRef = useRef<string | null>(null);

	// Server-authoritative daily synchronization in Convex
	useEffect(() => {
		if (
			isLoading ||
			!isAuthenticated ||
			!convexRituals ||
			!convexTasks ||
			!convexProjects ||
			convexProjects.length === 0 ||
			convexRituals.length === 0
		) {
			return;
		}

		const today = getTodayDateKey();
		const needsSync = (convexRituals as Doc<"rituals">[]).some((ritual) => {
			if (ritual.lastCompletedDate === today) {
				return false;
			}

			const targetTitle = normalizeTitle(ritual.title);
			const matchingTasks = (convexTasks as Doc<"tasks">[]).filter(
				(t) =>
					t.ritualId === ritual._id ||
					(t.isRitual &&
						!t.ritualId &&
						normalizeTitle(t.title) === targetTitle),
			);

			if (matchingTasks.length === 0) {
				return true;
			}

			const isNewDay = ritual.lastSyncedDate !== today;
			if (isNewDay && matchingTasks.some((t) => t.column === "finalizado")) {
				return true;
			}

			return false;
		});

		if (!needsSync) {
			return;
		}

		const syncKey = `${today}:${convexRituals.length}:${convexTasks.length}`;
		if (inFlightSyncKeyRef.current === syncKey) {
			return;
		}

		inFlightSyncKeyRef.current = syncKey;
		syncDailysMutation({ localDate: today })
			.catch((e) => {
				console.error("Error syncing dailys:", e);
			})
			.finally(() => {
				if (inFlightSyncKeyRef.current === syncKey) {
					inFlightSyncKeyRef.current = null;
				}
			});
	}, [
		isLoading,
		isAuthenticated,
		convexRituals,
		convexTasks,
		convexProjects,
		syncDailysMutation,
	]);

	return {
		projects,
		tasks,
		createProjectMutation,
		createTaskMutation,
		updateTaskMutation,
		updateColumnMutation,
		completeTaskMutation,
		undoCompleteTaskMutation,
		removeTaskMutation,
		removeProjectMutation,
		convexTasks,
	};
}
