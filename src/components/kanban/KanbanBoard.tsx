import { useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { sileo } from "sileo";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { useKanbanData } from "../../hooks/useKanbanData";
import type { Task } from "../../types/kanban";
import { dispatchShockwave } from "./ShockwaveWrapper";
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
		subtitle: "Listas para archivar",
		color: "border-green-200 text-green-700 bg-green-500/5",
	},
] as const;

export default function KanbanBoard() {
	const navigate = useNavigate();
	const boardRef = useRef<HTMLDivElement>(null);
	const {
		projects,
		tasks,
		createProjectMutation,
		createTaskMutation,
		updateTaskMutation,
		updateColumnMutation,
		removeTaskMutation,
		removeProjectMutation,
		convexTasks,
	} = useKanbanData();

	const { contextSafe } = useGSAP({ scope: boardRef });



	const triggerShockwave = contextSafe((originElement: HTMLElement, originId: string) => {
		const rect = originElement.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;
		dispatchShockwave(centerX, centerY, originId);
	});

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

	const deleteTask = async (id: string, e: React.MouseEvent) => {
		const toastKey = `delete-task-${id}`;
		const clickedCard = (e.target as HTMLElement).closest("[data-task-card]") as HTMLElement;

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
					
					const runDeletion = () => {
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
							.catch((err) => {
								console.error("Error deleting task:", err);
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
					};

					if (clickedCard) {
						triggerShockwave(clickedCard, id);
						gsap.to(clickedCard, {
							scale: 0.3,
							opacity: 0,
							duration: 0.25,
							ease: "back.in(1.7)",
							onComplete: runDeletion,
						});
					} else {
						runDeletion();
					}
				},
			},
		} as any);
	};

	const completeTask = async (id: string, e: React.MouseEvent) => {
		const task = (convexTasks as Doc<"tasks">[])?.find((t) => t._id === id);
		if (!task) return;
		const title = task.title;
		const description = task.description;
		const priority = task.priority;
		const column = task.column;
		const projectId = task.projectId;
		const isRitual = task.isRitual;

		const toastKey = `complete-task-${id}`;
		const clickedCard = (e.target as HTMLElement).closest("[data-task-card]") as HTMLElement;

		const runCompletion = async () => {
			try {
				await removeTaskMutation({ id: id as Id<"tasks"> });
				sileo.success({
					id: toastKey,
					title: "¡Tarea Realizada!",
					description: `Felicidades, has finalizado "${title}" con éxito.`,
					fill: "#130f26",
					duration: 8000,
					styles: {
						title: "text-purple-200 font-extrabold",
						description: "text-purple-300/80 text-xs font-semibold mt-0.5",
						button: "bg-purple-600 text-white hover:bg-purple-700 font-bold",
					},
					button: {
						title: "Deshacer",
						onClick: async () => {
							sileo.dismiss(toastKey);
							try {
								await createTaskMutation({
									title,
									description,
									priority: priority as any,
									column,
									projectId,
									isRitual,
								});
								sileo.success({
									title: "Tarea restaurada",
									description: `Se ha vuelto a agregar "${title}".`,
									fill: "#130f26",
									styles: {
										title: "text-purple-200 font-extrabold",
										description: "text-purple-300/80 text-xs font-semibold mt-0.5",
									},
								});
							} catch (err) {
								console.error("Error undoing task completion:", err);
							}
						},
					},
				} as any);
			} catch (err) {
				console.error("Error completing task:", err);
				sileo.error({
					title: "Error al completar",
					description: "No se pudo marcar la tarea como realizada. Intenta de nuevo.",
					fill: "#260f1c",
					styles: {
						title: "text-red-200 font-extrabold",
						description: "text-red-300/80 text-xs font-semibold mt-0.5",
					},
				});
			}
		};

		if (clickedCard) {
			triggerShockwave(clickedCard, id);
			gsap.to(clickedCard, {
				scale: 0.3,
				opacity: 0,
				duration: 0.25,
				ease: "back.in(1.7)",
				onComplete: runCompletion,
			});
		} else {
			runCompletion();
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

	const handleDeleteProject = (projectId: string, projectName: string) => {
		const toastKey = `delete-project-${projectId}`;
		sileo.error({
			id: toastKey,
			title: "¿Eliminar proyecto?",
			fill: "#260f1c",
			duration: 5000,
			description: `Se eliminará el proyecto "${projectName}" y TODAS sus notas asociadas de forma irreversible. Pulsa 'Confirmar' o cierra este aviso para cancelar.`,
			styles: {
				title: "text-red-200 font-extrabold",
				description: "text-red-300/80 text-xs font-semibold mt-0.5",
				button: "bg-red-600 text-white hover:bg-red-700 font-bold",
			},
			button: {
				title: "Confirmar",
				onClick: () => {
					sileo.dismiss(toastKey);
					removeProjectMutation({ id: projectId as Id<"projects"> })
						.then(() => {
							if (currentProjectId === projectId) {
								setCurrentProjectId("all");
							}
							sileo.success({
								title: "Proyecto eliminado",
								description: `Se ha eliminado el proyecto "${projectName}" y sus tareas.`,
								fill: "#130f26",
								styles: {
									title: "text-purple-200 font-extrabold",
									description: "text-purple-300/80 text-xs font-semibold mt-0.5",
								},
							});
						})
						.catch((e) => {
							console.error("Error deleting project:", e);
							sileo.error({
								title: "Error al eliminar",
								description: "No se pudo eliminar el proyecto. Intenta de nuevo.",
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
		<main ref={boardRef} className="page-wrap px-4 py-8 max-w-[92rem] relative">
			{/* Projects Tab-Capsules & Search Toolbar */}
			<section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<ProjectsBar
					projects={projects}
					currentProjectId={currentProjectId}
					setCurrentProjectId={setCurrentProjectId}
					handleCreateProject={handleCreateProject}
					handleDeleteProject={handleDeleteProject}
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
							onCompleteTask={completeTask}
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
