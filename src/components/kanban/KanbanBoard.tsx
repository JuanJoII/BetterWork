import { useGSAP } from "@gsap/react";
import { useNavigate } from "@tanstack/react-router";
import confetti from "canvas-confetti";
import gsap from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";
import { sileo } from "sileo";

gsap.registerPlugin(useGSAP);

import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { useKanbanData } from "../../hooks/useKanbanData";
import type { Task } from "../../types/kanban";
import { getTodayDateKey } from "../../utils/date";
import { getErrorToastTheme, getSuccessToastTheme } from "../../utils/toast";
import type { ModalAnchorRect } from "../ui/ModalShell";
import CreateTaskModal from "./CreateTaskModal";
import EditTaskModal from "./EditTaskModal";
import KanbanColumn from "./KanbanColumn";
import ProjectsSidebar from "./ProjectsSidebar";
import { dispatchShockwave } from "./ShockwaveWrapper";

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
		completeTaskMutation,
		undoCompleteTaskMutation,
		removeTaskMutation,
		removeProjectMutation,
		convexTasks,
	} = useKanbanData();

	const { contextSafe } = useGSAP({ scope: boardRef });

	const triggerShockwave = contextSafe(
		(originElement: HTMLElement, originId: string) => {
			const rect = originElement.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;
			dispatchShockwave(centerX, centerY, originId);
		},
	);

	const [currentProjectId, setCurrentProjectId] = useState<string>("all");
	const previousProjectIdRef = useRef<string>(currentProjectId);

	// Re-run top-to-bottom column reveal on mount and every project switch
	useGSAP(
		() => {
			const mm = gsap.matchMedia();

			mm.add("(prefers-reduced-motion: no-preference)", () => {
				gsap.fromTo(
					"[data-kanban-column]",
					{
						autoAlpha: 0,
						y: -18,
						clipPath: "inset(0% 0% 100% 0% round 1.5rem)",
					},
					{
						autoAlpha: 1,
						y: 0,
						clipPath: "inset(0% 0% 0% 0% round 1.5rem)",
						duration: 0.55,
						stagger: 0.08,
						ease: "power3.out",
						overwrite: "auto",
						clearProps: "clipPath,transform,opacity,visibility",
					},
				);
			});

			return () => mm.revert();
		},
		{
			scope: boardRef,
			dependencies: [currentProjectId],
			revertOnUpdate: true,
		},
	);

	// Always scroll back to the top of the page when switching projects
	useEffect(() => {
		if (previousProjectIdRef.current !== currentProjectId) {
			previousProjectIdRef.current = currentProjectId;
			if (typeof window !== "undefined") {
				window.scrollTo({ top: 0, behavior: "auto" });
			}
		}
	}, [currentProjectId]);

	// Filter Configurations
	const [searchQuery, setSearchQuery] = useState<string>("");

	// Modals Toggles
	const [showAddModal, setShowAddModal] = useState<boolean>(false);
	const [modalColumn, setModalColumn] = useState<Task["column"]>("pendiente");
	const [editingTask, setEditingTask] = useState<Task | null>(null);
	const [editingAnchorRect, setEditingAnchorRect] =
		useState<ModalAnchorRect | null>(null);

	const handleStartEditingTask = (task: Task, e: React.MouseEvent) => {
		const cardEl = (e.currentTarget as HTMLElement).closest(
			"[data-task-card]",
		) as HTMLElement | null;
		if (cardEl) {
			const rect = cardEl.getBoundingClientRect();
			setEditingAnchorRect({
				top: rect.top,
				left: rect.left,
				width: rect.width,
				height: rect.height,
			});
		} else {
			setEditingAnchorRect(null);
		}
		setEditingTask(task);
	};

	const handleCloseEditingTask = () => {
		setEditingTask(null);
		setEditingAnchorRect(null);
	};

	// Drag and Drop
	const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
	const draggingTask = useMemo(
		() => tasks.find((t) => t.id === draggingTaskId) ?? null,
		[tasks, draggingTaskId],
	);

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

	// Active task counts per project for the sidebar
	const taskCountByProject = useMemo(() => {
		const counts: Record<string, number> = {};
		const fallbackProjectId = projects[0]?.id;
		for (const task of tasks) {
			const targetId = task.projectId || fallbackProjectId;
			if (targetId) {
				counts[targetId] = (counts[targetId] ?? 0) + 1;
			}
		}
		return counts;
	}, [tasks, projects]);

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

		const currentIndex = columnProgression.indexOf(
			task.column as Task["column"],
		);
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
		const clickedCard = (e.target as HTMLElement).closest(
			"[data-task-card]",
		) as HTMLElement;

		sileo.error({
			id: toastKey,
			title: "¿Eliminar nota?",
			duration: 5000,
			description:
				"Esta acción es irreversible. Pulsa 'Eliminar' para confirmar, o cierra esta alerta para cancelar.",
			...getErrorToastTheme(),
			button: {
				title: "Eliminar",
				onClick: () => {
					sileo.dismiss(toastKey);

					const runDeletion = () => {
						removeTaskMutation({ id: id as Id<"tasks"> })
							.then(() => {
								sileo.success({
									title: "Nota eliminada",
									description:
										"La nota adhesiva se ha eliminado correctamente.",
									...getSuccessToastTheme(),
								});
							})
							.catch((err) => {
								console.error("Error deleting task:", err);
								sileo.error({
									title: "Error al eliminar",
									description: "No se pudo eliminar la nota. Intenta de nuevo.",
									...getErrorToastTheme(),
								});
							});
					};

					if (clickedCard) {
						gsap.to(clickedCard, {
							scale: 0.1,
							opacity: 0,
							duration: 0.16,
							ease: "power2.in",
							onComplete: runDeletion,
						});
						setTimeout(() => {
							triggerShockwave(clickedCard, id);
						}, 80);
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
		const isRitual = task.isRitual;

		const toastKey = `complete-task-${id}`;
		const clickedCard = (e.target as HTMLElement).closest(
			"[data-task-card]",
		) as HTMLElement;

		let undoRequested = false;
		let completionPromise: Promise<{
			completedTaskId: Id<"completedTasks">;
		} | null> | null = null;

		const restoreVisualCard = () => {
			if (clickedCard) {
				gsap.killTweensOf(clickedCard);
				gsap.set(clickedCard, { scale: 1, opacity: 1 });
			}
		};

		const runDbCompletion = () => {
			if (undoRequested) {
				restoreVisualCard();
				return;
			}

			completionPromise = completeTaskMutation({
				id: id as Id<"tasks">,
				localDate: getTodayDateKey(),
			}).catch((err) => {
				console.error("Error completing task:", err);
				restoreVisualCard();
				sileo.dismiss(toastKey);
				sileo.error({
					title: "Error al completar",
					description:
						"No se pudo marcar la tarea como realizada. Intenta de nuevo.",
					...getErrorToastTheme(),
				});
				return null;
			});
		};

		// 1. Show Sileo toast confirmation immediately
		sileo.success({
			id: toastKey,
			title: isRitual ? "¡Daily Completado!" : "¡Tarea Realizada!",
			description: isRitual
				? `Has completado "${title}" por hoy. Volverá a estar activo mañana.`
				: `Felicidades, has finalizado "${title}" con éxito.`,
			duration: 8000,
			...getSuccessToastTheme(),
			button: {
				title: "Deshacer",
				onClick: async () => {
					undoRequested = true;
					sileo.dismiss(toastKey);

					if (!completionPromise) {
						restoreVisualCard();
						return;
					}

					try {
						const result = await completionPromise;
						if (!result?.completedTaskId) return;

						await undoCompleteTaskMutation({
							completedTaskId: result.completedTaskId,
						});
						sileo.success({
							title: "Tarea restaurada",
							description: `Se ha vuelto a agregar "${title}".`,
							...getSuccessToastTheme(),
						});
					} catch (err) {
						console.error("Error undoing task completion:", err);
					}
				},
			},
		} as Parameters<typeof sileo.success>[0]);

		// 2. Trigger exit animation and shockwave halfway through after Sileo toast appears
		setTimeout(() => {
			if (undoRequested) {
				restoreVisualCard();
				return;
			}
			if (clickedCard) {
				gsap.to(clickedCard, {
					scale: 0.1,
					opacity: 0,
					duration: 0.16,
					ease: "power2.in",
					onComplete: runDbCompletion,
				});
				setTimeout(() => {
					if (undoRequested) return;
					triggerShockwave(clickedCard, id);

					// Launch confetti burst from completed card center in sync with shockwave
					const rect = clickedCard.getBoundingClientRect();
					const originX = (rect.left + rect.width / 2) / window.innerWidth;
					const originY = (rect.top + rect.height / 2) / window.innerHeight;

					confetti({
						particleCount: 45,
						spread: 70,
						origin: { x: originX, y: originY },
						colors: ["#39fc23", "#a78bfa", "#3b82f6", "#f59e0b", "#ec4899"],
						ticks: 180,
						gravity: 1.1,
						scalar: 0.85,
						disableForReducedMotion: true,
					});
				}, 80);
			} else {
				runDbCompletion();
			}
		}, 30);
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
				...getSuccessToastTheme(),
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
				ritualId: updatedTask.ritualId as Id<"rituals"> | undefined,
			});
			handleCloseEditingTask();
		} catch (e) {
			console.error(e);
		}
	};

	const handleCreateProject = async (name: string, icon?: string) => {
		const trimmed = name.trim();
		if (!trimmed) return;
		try {
			const newId = await createProjectMutation({
				name: trimmed,
				...(icon ? { icon } : {}),
			});
			setCurrentProjectId(newId);
			sileo.success({
				title: "Proyecto creado",
				description: `Se ha creado el proyecto "${trimmed}"`,
				...getSuccessToastTheme(),
			});
		} catch (err) {
			console.error(err);
			sileo.error({
				title: "Error al crear proyecto",
				description: "No se pudo crear el proyecto. Intenta de nuevo.",
				...getErrorToastTheme(),
			});
			throw err;
		}
	};

	const handleDeleteProject = (projectId: string, projectName: string) => {
		const toastKey = `delete-project-${projectId}`;
		sileo.error({
			id: toastKey,
			title: "¿Eliminar proyecto?",
			duration: 5000,
			description: `Se eliminará el proyecto "${projectName}" y TODAS sus notas asociadas de forma irreversible. Pulsa 'Confirmar' o cierra este aviso para cancelar.`,
			...getErrorToastTheme(),
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
								...getSuccessToastTheme(),
							});
						})
						.catch((e) => {
							console.error("Error deleting project:", e);
							sileo.error({
								title: "Error al eliminar",
								description:
									"No se pudo eliminar el proyecto. Intenta de nuevo.",
								...getErrorToastTheme(),
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

	const handleDragEnd = () => {
		setDraggingTaskId(null);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
	};

	const handleDrop = async (column: Task["column"]) => {
		if (!draggingTaskId) return;
		const dragged = tasks.find((t) => t.id === draggingTaskId);
		setDraggingTaskId(null);
		if (dragged && dragged.column === column) return;
		try {
			await updateColumnMutation({
				id: draggingTaskId as Id<"tasks">,
				column,
			});
		} catch (e) {
			console.error(e);
		}
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
		<main
			ref={boardRef}
			className="mx-auto w-[calc(100%-2rem)] max-w-[96rem] pt-12 pb-0 relative"
		>
			<div className="flex flex-col lg:flex-row gap-6 items-start">
				{/* LEFT SIDEBAR: SEARCH + PROJECTS */}
				<ProjectsSidebar
					projects={projects}
					currentProjectId={currentProjectId}
					setCurrentProjectId={setCurrentProjectId}
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					totalTaskCount={tasks.length}
					taskCountByProject={taskCountByProject}
					onCreateProject={handleCreateProject}
					handleDeleteProject={handleDeleteProject}
				/>

				{/* THREE-COLUMN KANBAN BOARD */}
				<section className="grid grid-cols-1 gap-5 md:grid-cols-3 flex-1 min-w-0 w-full">
					{COLUMNS.map((col) => {
						const colTasks = filteredTasks.filter((t) => t.column === col.id);

						return (
							<KanbanColumn
								key={col.id}
								column={col}
								tasks={colTasks}
								projects={projects}
								currentProjectId={currentProjectId}
								editingTaskId={editingTask?.id ?? null}
								isDraggingFromOtherColumn={
									draggingTask !== null && draggingTask.column !== col.id
								}
								onDragOver={handleDragOver}
								onDrop={() => handleDrop(col.id)}
								onAddCard={() => {
									setModalColumn(col.id);
									setShowAddModal(true);
								}}
								onDragStart={handleDragStart}
								onDragEnd={handleDragEnd}
								onFocusClick={handleFocusClick}
								onMoveTask={moveTask}
								onEditTask={handleStartEditingTask}
								onDeleteTask={deleteTask}
								onCompleteTask={completeTask}
							/>
						);
					})}
				</section>
			</div>

			{/* CREATE CARD DRAW MODAL */}
			<CreateTaskModal
				isOpen={showAddModal}
				onClose={() => setShowAddModal(false)}
				projects={projects}
				currentProjectId={currentProjectId}
				onSubmit={handleAddCardSubmit}
			/>

			{/* EDIT CARD MODAL (anchored in place over the card with full-screen blur behind) */}
			<EditTaskModal
				task={editingTask}
				anchorRect={editingAnchorRect}
				onClose={handleCloseEditingTask}
				projects={projects}
				onSubmit={handleEditCardSubmit}
			/>
		</main>
	);
}
