import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useRef } from "react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import type { Project, Task } from "../types/kanban";
import {
	getCompletedDailysForToday,
	getTodayDateKey,
} from "../utils/dailyCompletion";

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
	const removeTaskMutation = useMutation(api.tasks.remove);
	const removeProjectMutation = useMutation(api.projects.remove);

	// Map Convex data to local types for backwards compatibility with child components
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

	const syncingDailysRef = useRef<Set<string>>(new Set());

	// Startup Daily synchronization in Convex
	useEffect(() => {
		if (!convexRituals || !convexTasks || !convexProjects) return;

		const today = getTodayDateKey();
		const completedToday = getCompletedDailysForToday();

		const syncMissingDailys = async () => {
			for (const temp of convexRituals as Doc<"rituals">[]) {
				const normalizedTitle = temp.title.trim().toLowerCase();
				if (completedToday.has(normalizedTitle)) {
					continue;
				}
				if (syncingDailysRef.current.has(normalizedTitle)) {
					continue;
				}

				const hasTask = (convexTasks as Doc<"tasks">[]).some(
					(t: Doc<"tasks">) =>
						t.isRitual && t.title.trim().toLowerCase() === normalizedTitle,
				);
				if (!hasTask) {
					const mainProj = convexProjects[0] as Doc<"projects"> | undefined;
					if (!mainProj) continue;

					syncingDailysRef.current.add(normalizedTitle);
					try {
						await createTaskMutation({
							title: temp.title,
							description: temp.description,
							priority: "medium",
							column: "pendiente",
							projectId: mainProj._id,
							isRitual: true,
						});
					} catch (e) {
						console.error("Error syncing daily:", e);
					} finally {
						syncingDailysRef.current.delete(normalizedTitle);
					}
				}
			}
		};

		syncMissingDailys();

		// Reset completed dailys left in "finalizado" back to "pendiente" if the day changed
		const lastSync = localStorage.getItem("kairos_last_sync_date");
		if (lastSync !== today) {
			const resetCompletedDailys = async () => {
				for (const t of (convexTasks || []) as Doc<"tasks">[]) {
					if (t.isRitual && t.column === "finalizado") {
						try {
							await updateColumnMutation({
								id: t._id,
								column: "pendiente",
							});
						} catch (e) {
							console.error("Error resetting daily task:", e);
						}
					}
				}
				localStorage.setItem("kairos_last_sync_date", today);
			};
			resetCompletedDailys();
		}
	}, [
		convexRituals,
		convexTasks,
		convexProjects,
		createTaskMutation,
		updateColumnMutation,
	]);

	return {
		projects,
		tasks,
		createProjectMutation,
		createTaskMutation,
		updateTaskMutation,
		updateColumnMutation,
		removeTaskMutation,
		removeProjectMutation,
		convexTasks,
	};
}
