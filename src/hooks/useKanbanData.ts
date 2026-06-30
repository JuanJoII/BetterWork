import { useEffect, useMemo } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import type { Project, Task } from "../types/kanban";

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

	// Startup Daily Rituals synchronization in Convex
	useEffect(() => {
		if (!convexRituals || !convexTasks || !convexProjects) return;

		const syncMissingRituals = async () => {
			for (const temp of convexRituals as Doc<"rituals">[]) {
				const hasTask = (convexTasks as Doc<"tasks">[]).some(
					(t: Doc<"tasks">) => t.isRitual && t.title === temp.title,
				);
				if (!hasTask) {
					try {
						// Find first project as fallback for ritual tasks
						const mainProj = convexProjects[0] as Doc<"projects">;
						if (mainProj) {
							await createTaskMutation({
								title: temp.title,
								description: temp.description,
								priority: "medium",
								column: "pendiente",
								projectId: mainProj._id,
								isRitual: true,
							});
						}
					} catch (e) {
						console.error("Error syncing ritual:", e);
					}
				}
			}
		};

		syncMissingRituals();

		// Reset completed rituals back to "pendiente" if the day changed
		const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD format
		const lastSync = localStorage.getItem("kairos_last_sync_date");
		if (lastSync !== today) {
			const resetCompletedRituals = async () => {
				for (const t of (convexTasks || []) as Doc<"tasks">[]) {
					if (t.isRitual && t.column === "finalizado") {
						try {
							await updateColumnMutation({
								id: t._id,
								column: "pendiente",
							});
						} catch (e) {
							console.error("Error resetting ritual task:", e);
						}
					}
				}
				localStorage.setItem("kairos_last_sync_date", today);
			};
			resetCompletedRituals();
		}
	}, [convexRituals, convexTasks, convexProjects, createTaskMutation, updateColumnMutation]);

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
