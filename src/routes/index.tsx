import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { sileo } from "sileo";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import CreateTaskModal from "../components/kanban/CreateTaskModal";
import EditTaskModal from "../components/kanban/EditTaskModal";
// Components
import ProjectsBar from "../components/kanban/ProjectsBar";
import TaskCard from "../components/kanban/TaskCard";
// Types
import type { Project, Ritual, Task } from "../types/kanban";

export const Route = createFileRoute("/")({
	component: App,
});

const INITIAL_PROJECTS: Project[] = [
	{
		id: "proj-1",
		name: "Proyecto Principal",
		createdAt: new Date().toISOString(),
	},
	{
		id: "proj-2",
		name: "Estudios",
		createdAt: new Date().toISOString(),
	},
];

const INITIAL_TASKS: Task[] = [
	{
		id: "task-1",
		title: "Refining typography scale for BetterWork",
		description:
			"Pair Onest for headings and body. Double-check margins and scale contrast on mobile screens.",
		priority: "medium",
		column: "pendiente",
		projectId: "proj-1",
		createdAt: new Date().toISOString(),
	},
	{
		id: "task-2",
		title: "Implement local storage persistence",
		description:
			"Save Kanban board tasks, column orders, and deep work session history to local storage so details survive browser reloads.",
		priority: "high",
		column: "pendiente",
		projectId: "proj-1",
		createdAt: new Date(Date.now() - 3600000).toISOString(),
	},
	{
		id: "task-3",
		title: "Animate Focus Deck waveforms",
		description:
			"Write CSS keyframe animations for the audio equalizer bands. Synchronize movements with play and pause interactions.",
		priority: "high",
		column: "en-proceso",
		projectId: "proj-2",
		createdAt: new Date(Date.now() - 7200000).toISOString(),
	},
	{
		id: "task-4",
		title: "Configure routing with TanStack Start",
		description:
			"Initialize project structure, register root document wrappers, and set up file-based routes for / and /about pages.",
		priority: "low",
		column: "finalizado",
		projectId: "proj-1",
		createdAt: new Date(Date.now() - 86400000).toISOString(),
	},
	{
		id: "task-5",
		title: "Draft client review presentation slides",
		description:
			"Synthesize user feedback and prepare wireframe slide deck for the upcoming BetterWork progress meeting.",
		priority: "medium",
		column: "pendiente",
		projectId: "proj-2",
		createdAt: new Date().toISOString(),
	},
];

const COLUMNS = [
	{
		id: "pendiente",
		title: "Pendiente",
		subtitle: "Tareas por hacer",
		color: "border-purple-200 text-purple-700 bg-purple-500/5",
	},
	{
		id: "en-proceso",
		title: "En Proceso",
		subtitle: "Trabajo activo",
		color: "border-yellow-200 text-yellow-700 bg-yellow-500/5",
	},
	{
		id: "finalizado",
		title: "Finalizado",
		subtitle: "Completado con éxito",
		color: "border-emerald-200 text-emerald-700 bg-emerald-500/5",
	},
] as const;

function App() {
	const navigate = useNavigate();
	// Convex queries and mutations
	const convexProjects = useQuery(api.projects.list);
	const convexTasks = useQuery(api.tasks.list);
	const convexRituals = useQuery(api.rituals.list);

	const createProjectMutation = useMutation(api.projects.create);
	const createTaskMutation = useMutation(api.tasks.create);
	const updateTaskMutation = useMutation(api.tasks.update);
	const updateColumnMutation = useMutation(api.tasks.updateColumn);
	const removeTaskMutation = useMutation(api.tasks.remove);

	const [currentProjectId, setCurrentProjectId] = useState<string>("all");

	// Map Convex data to local types for backwards compatibility with child components
	const projects = useMemo<Project[]>(() => {
		return (
			convexProjects?.map((p) => ({
				id: p._id,
				name: p.name,
				createdAt: p.createdAt,
			})) || []
		);
	}, [convexProjects]);

	const tasks = useMemo<Task[]>(() => {
		return (
			convexTasks?.map((t) => ({
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

	// Startup Daily Rituals synchronization in Convex
	useEffect(() => {
		if (!convexRituals || !convexTasks || !convexProjects) return;

		const syncMissingRituals = async () => {
			for (const temp of convexRituals) {
				const hasTask = convexTasks.some(
					(t) => t.isRitual && t.title === temp.title,
				);
				if (!hasTask) {
					try {
						// Find first project as fallback for ritual tasks
						const mainProj = convexProjects[0];
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
				for (const t of convexTasks) {
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

	// Filter Configurations
	const [searchQuery, setSearchQuery] = useState<string>("");

	// Modals Toggles
	const [showAddModal, setShowAddModal] = useState<boolean>(false);
	const [modalColumn, setModalColumn] = useState<Task["column"]>("pendiente");
	const [editingTask, setEditingTask] = useState<Task | null>(null);

	// Drag and Drop
	const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

	// Filter tasks computed
	const filteredTasks = useMemo(() => {
		return tasks.filter((t) => {
			const matchesSearch =
				t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				t.description.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesProject =
				currentProjectId === "all" ||
				t.projectId === currentProjectId ||
				(!t.projectId && projects[0] && currentProjectId === projects[0].id);
			return matchesSearch && matchesProject;
		});
	}, [tasks, searchQuery, currentProjectId, projects]);

	// Handlers
	const moveTask = async (id: string, direction: "forward" | "backward") => {
		const columnProgression: Task["column"][] = [
			"pendiente",
			"en-proceso",
			"finalizado",
		];
		const task = convexTasks?.find((t) => t._id === id);
		if (!task) return;

		const currentIndex = columnProgression.indexOf(task.column as Task["column"]);
		const nextIndex = currentIndex + (direction === "forward" ? 1 : -1);
		if (nextIndex >= 0 && nextIndex < columnProgression.length) {
			try {
				await updateColumnMutation({
					id: task._id,
					column: columnProgression[nextIndex],
				});
			} catch (e) {
				console.error(e);
			}
		}
	};

	const deleteTask = async (id: string) => {
		if (confirm("¿Estás seguro de que deseas eliminar esta nota adhesiva?")) {
			try {
				await removeTaskMutation({ id: id as Id<"tasks"> });
			} catch (e) {
				console.error(e);
			}
		}
	};

	const handleAddCardSubmit = async (
		title: string,
		description: string,
		priority: Task["priority"],
		projectId: string,
	) => {
		try {
			await createTaskMutation({
				title,
				description,
				priority,
				column: modalColumn,
				projectId: projectId as Id<"projects">,
			});

			sileo.success({
				title: "¡Nota Creada!",
				description: `Se ha añadido "${title}" a la columna de ${
					modalColumn === "pendiente"
						? "Pendiente"
						: modalColumn === "en-proceso"
							? "En Proceso"
							: "Finalizado"
				}.`,
				fill: "#130f26",
				styles: {
					title: "text-purple-200 font-extrabold",
					description: "text-purple-300/80 text-xs font-semibold mt-0.5",
				},
			});
			setShowAddModal(false);
		} catch (e) {
			console.error(e);
		}
	};

	const handleEditCardSubmit = async (updatedTask: Task) => {
		try {
			await updateTaskMutation({
				id: updatedTask.id as Id<"tasks">,
				title: updatedTask.title,
				description: updatedTask.description,
				priority: updatedTask.priority,
				column: updatedTask.column,
				projectId: updatedTask.projectId as Id<"projects">,
				isRitual: updatedTask.isRitual,
			});
			setEditingTask(null);
		} catch (e) {
			console.error(e);
		}
	};

	const handleCreateProject = () => {
		const toastId = sileo.action({
			title: "Nuevo Proyecto",
			fill: "#130f26",
			styles: {
				title: "text-purple-200 font-extrabold",
				button: "bg-purple-600 text-white hover:bg-purple-700 font-bold",
			},
			description: (
				<div className="flex flex-col gap-2 mt-2">
					<input
						type="text"
						id="toast-proj-name"
						placeholder="Nombre del proyecto..."
						className="w-full rounded-lg bg-slate-950/40 border border-yellow-500/20 px-3 py-1.5 text-xs text-yellow-100 placeholder-yellow-100/40 font-semibold focus:outline-none focus:border-yellow-400"
						onKeyDown={async (e) => {
							if (e.key === "Enter") {
								const val = (e.target as HTMLInputElement).value;
								if (val.trim()) {
									try {
										const newId = await createProjectMutation({
											name: val.trim(),
										});
										setCurrentProjectId(newId);
										sileo.dismiss(toastId);
										sileo.success({
											title: "Proyecto creado",
											description: `Se ha creado el proyecto "${val.trim()}"`,
											fill: "#130f26",
											styles: {
												title: "text-purple-200 font-extrabold",
												description: "text-purple-300/80 text-xs font-semibold mt-0.5",
											},
										});
									} catch (err) {
										console.error(err);
									}
								}
							}
						}}
					/>
					<div className="text-[9px] text-yellow-500/60 font-semibold">
						Escribe el nombre y presiona Enter
					</div>
				</div>
			),
			duration: null,
			button: {
				title: "Crear",
				onClick: async () => {
					const input = document.getElementById(
						"toast-proj-name",
					) as HTMLInputElement;
					if (input?.value.trim()) {
						const val = input.value.trim();
						try {
							const newId = await createProjectMutation({
								name: val,
							});
							setCurrentProjectId(newId);
							sileo.dismiss(toastId);
							sileo.success({
								title: "Proyecto creado",
								description: `Se ha creado el proyecto "${val}"`,
								fill: "#130f26",
								styles: {
									title: "text-purple-200 font-extrabold",
									description: "text-purple-300/80 text-xs font-semibold mt-0.5",
								},
							});
						} catch (err) {
							console.error(err);
						}
					}
				},
			},
		});
	};

	// HTML5 Drag & Drop
	const handleDragStart = (id: string) => {
		setDraggingTaskId(id);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
	};

	const handleDrop = async (column: Task["column"]) => {
		if (!draggingTaskId) return;
		try {
			await updateColumnMutation({
				id: draggingTaskId as Id<"tasks">,
				column,
			});
		} catch (e) {
			console.error(e);
		}
		setDraggingTaskId(null);
	};

	// Navigate to Focus route
	const handleFocusClick = async (id: string) => {
		localStorage.setItem("kairos_active_task_id", id);
		const task = convexTasks?.find((t) => t._id === id);
		if (task && task.column === "pendiente") {
			try {
				await updateColumnMutation({
					id: task._id,
					column: "en-proceso",
				});
			} catch (e) {
				console.error(e);
			}
		}
		navigate({ to: "/focus" });
	};

	return (
		<main className="page-wrap px-4 py-8 max-w-[92rem]">
			{/* Projects Tab-Capsules & Search Toolbar */}
			<section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<ProjectsBar
					projects={projects}
					currentProjectId={currentProjectId}
					setCurrentProjectId={setCurrentProjectId}
					handleCreateProject={handleCreateProject}
				/>

				{/* Search bar */}
				<div className="relative w-full max-w-xs">
					<input
						type="text"
						placeholder="Buscar notas..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="demo-input py-2 pl-3.5 pr-9 text-xs font-semibold w-full"
					/>
					{searchQuery && (
						<button
							type="button"
							onClick={() => setSearchQuery("")}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
						>
							<X className="h-3.5 w-3.5" />
						</button>
					)}
				</div>
			</section>

			{/* THREE-COLUMN KANBAN BOARD */}
			<section className="grid grid-cols-1 gap-6 md:grid-cols-3 w-full">
				{COLUMNS.map((col) => {
					const colTasks = filteredTasks.filter((t) => t.column === col.id);

					return (
						/* biome-ignore lint/a11y/noStaticElementInteractions: drag-and-drop columns container */
						<div
							key={col.id}
							onDragOver={handleDragOver}
							onDrop={() => handleDrop(col.id)}
							className="flex flex-col rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)]/75 backdrop-blur-sm p-5 shadow-sm dot-grid min-h-[600px] w-full"
						>
							{/* Column Header */}
							<div className="mb-4 flex items-center justify-between border-b border-[var(--line)] pb-4">
								<div>
									<h2 className="display-title m-0 text-lg font-black tracking-tight text-[var(--sea-ink)]">
										{col.title}
									</h2>
									<span className="text-xs font-bold text-[var(--sea-ink-soft)]">
										{col.subtitle}
									</span>
								</div>
								<span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400/20 text-xs font-black text-yellow-400 border border-yellow-400/35 shadow-[0_0_10px_rgba(234,179,8,0.15)]">
									{colTasks.length}
								</span>
							</div>

							{/* Top Add Card trigger */}
							<button
								type="button"
								onClick={() => {
									setModalColumn(col.id);
									setShowAddModal(true);
								}}
								className="mb-4 flex w-full items-center justify-center gap-1 rounded-2xl border border-dashed border-yellow-500/20 bg-yellow-500/5 py-2.5 text-xs font-extrabold text-yellow-400 hover:border-yellow-400 hover:bg-yellow-400/10 transition cursor-pointer"
							>
								<Plus className="h-4 w-4" />
								<span>Añadir Nota</span>
							</button>

							{/* Sticky Notes Stack */}
							<div className="flex flex-1 flex-col gap-5">
								{colTasks.length > 0 ? (
									colTasks.map((task) => {
										const projectOfTask = projects.find(
											(p) => p.id === task.projectId,
										);

										return (
											<TaskCard
												key={task.id}
												task={task}
												projectOfTask={projectOfTask}
												currentProjectId={currentProjectId}
												colId={col.id}
												onDragStart={() => handleDragStart(task.id)}
												onFocusClick={() => handleFocusClick(task.id)}
												onMoveTask={(dir) => moveTask(task.id, dir)}
												onEditTask={() => setEditingTask(task)}
												onDeleteTask={() => deleteTask(task.id)}
											/>
										);
									})
								) : (
									<div className="flex flex-1 flex-col items-center justify-center py-16 text-center text-[var(--sea-ink-soft)] border border-dashed border-[var(--line)] rounded-2xl opacity-60 bg-[var(--surface-strong)]/5">
										<CheckCircle className="h-7 w-7 opacity-30 mb-2" />
										<span className="text-xs font-bold">Columna vacía</span>
									</div>
								)}
							</div>
						</div>
					);
				})}
			</section>

			{/* CREATE CARD DRAW MODAL */}
			<CreateTaskModal
				isOpen={showAddModal}
				onClose={() => setShowAddModal(false)}
				projects={projects}
				currentProjectId={currentProjectId}
				onSubmit={handleAddCardSubmit}
			/>

			{/* EDIT CARD MODAL */}
			<EditTaskModal
				task={editingTask}
				onClose={() => setEditingTask(null)}
				projects={projects}
				onSubmit={handleEditCardSubmit}
			/>
		</main>
	);
}
