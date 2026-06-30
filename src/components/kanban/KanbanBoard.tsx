import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { sileo } from "sileo";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { useKanbanData } from "../../hooks/useKanbanData";
import type { Task } from "../../types/kanban";
import CreateTaskModal from "./CreateTaskModal";
import EditTaskModal from "./EditTaskModal";
import KanbanColumn from "./KanbanColumn";
import ProjectsBar from "./ProjectsBar";
import SearchBar from "./SearchBar";

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

export default function KanbanBoard() {
	const navigate = useNavigate();
	const {
		projects,
		tasks,
		createProjectMutation,
		createTaskMutation,
		updateTaskMutation,
		updateColumnMutation,
		removeTaskMutation,
		convexTasks,
	} = useKanbanData();

	const [currentProjectId, setCurrentProjectId] = useState<string>("all");

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
		const task = (convexTasks as Doc<"tasks">[])?.find(
			(t: Doc<"tasks">) => t._id === id,
		);
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
		const toastKey = `delete-task-${id}`;
		sileo.error({
			id: toastKey,
			title: "¿Eliminar nota?",
			fill: "#260f1c",
			duration: 5000,
			description: "Esta acción es irreversible. Pulsa 'Eliminar' para confirmar, o cierra esta alerta para cancelar.",
			styles: {
				title: "text-red-200 font-extrabold",
				description: "text-red-300/80 text-xs font-semibold mt-0.5",
				button: "bg-red-600 text-white hover:bg-red-700 font-bold",
			},
			button: {
				title: "Eliminar",
				onClick: () => {
					sileo.dismiss(toastKey);
					removeTaskMutation({ id: id as Id<"tasks"> })
						.then(() => {
							sileo.success({
								title: "Nota eliminada",
								description: "La nota adhesiva se ha eliminado correctamente.",
								fill: "#130f26",
								styles: {
									title: "text-purple-200 font-extrabold",
									description: "text-purple-300/80 text-xs font-semibold mt-0.5",
								},
							});
						})
						.catch((e) => {
							console.error("Error deleting task:", e);
							sileo.error({
								title: "Error al eliminar",
								description: "No se pudo eliminar la nota. Intenta de nuevo.",
								fill: "#260f1c",
								styles: {
									title: "text-red-200 font-extrabold",
									description: "text-red-300/80 text-xs font-semibold mt-0.5",
								},
							});
						});
				},
			},
		} as any);
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
		const task = (convexTasks as Doc<"tasks">[])?.find(
			(t: Doc<"tasks">) => t._id === id,
		);
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

				<SearchBar value={searchQuery} onChange={setSearchQuery} />
			</section>

			{/* THREE-COLUMN KANBAN BOARD */}
			<section className="grid grid-cols-1 gap-6 md:grid-cols-3 w-full">
				{COLUMNS.map((col) => {
					const colTasks = filteredTasks.filter((t) => t.column === col.id);

					return (
						<KanbanColumn
							key={col.id}
							column={col}
							tasks={colTasks}
							projects={projects}
							currentProjectId={currentProjectId}
							onDragOver={handleDragOver}
							onDrop={() => handleDrop(col.id)}
							onAddCard={() => {
								setModalColumn(col.id);
								setShowAddModal(true);
							}}
							onDragStart={handleDragStart}
							onFocusClick={handleFocusClick}
							onMoveTask={moveTask}
							onEditTask={setEditingTask}
							onDeleteTask={deleteTask}
						/>
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
