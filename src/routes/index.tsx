import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	CheckCircle,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Clock,
	Edit,
	Plus,
	Sparkles,
	Trash2,
	X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/")({
	component: App,
});

// Definition of Project
interface Project {
	id: string;
	name: string;
	createdAt: string;
}

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

// Definition of Kanban Task
interface Task {
	id: string;
	title: string;
	description: string;
	priority: "low" | "medium" | "high";
	column: "pendiente" | "en-proceso" | "finalizado";
	projectId?: string;
	createdAt: string;
}

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

// Configurations complete

function App() {
	const navigate = useNavigate();

	// Projects State
	const [projects, setProjects] = useState<Project[]>(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("kairos_kanban_projects");
			if (saved) {
				try {
					return JSON.parse(saved) as Project[];
				} catch (e) {
					console.error(e);
				}
			}
		}
		return INITIAL_PROJECTS;
	});

	// Persistence of projects
	useEffect(() => {
		localStorage.setItem("kairos_kanban_projects", JSON.stringify(projects));
	}, [projects]);

	const [currentProjectId, setCurrentProjectId] = useState<string>("all");
	const [showProjectsDropdown, setShowProjectsDropdown] = useState(false);

	const handleCreateProject = () => {
		const name = prompt("Introduce el nombre del nuevo proyecto:");
		if (name?.trim()) {
			const newProj: Project = {
				id: `proj-${Date.now()}`,
				name: name.trim(),
				createdAt: new Date().toISOString(),
			};
			setProjects((prev) => [...prev, newProj]);
			setCurrentProjectId(newProj.id);
			setNewProjectId(newProj.id);
		}
	};

	// Tasks State
	const [tasks, setTasks] = useState<Task[]>(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("kairos_kanban_tasks");
			if (saved) {
				try {
					// Convert columns dynamically if they were in the 4-column system before
					/* biome-ignore lint/suspicious/noExplicitAny: parsing migration from old schema */
					const parsed = JSON.parse(saved) as any[];
					return parsed.map((task) => {
						let col = task.column;
						if (col === "spark" || col === "backlog") col = "pendiente";
						if (col === "flowing") col = "en-proceso";
						if (col === "shipped") col = "finalizado";
						return { ...task, column: col };
					});
				} catch (e) {
					console.error(e);
				}
			}
		}
		return INITIAL_TASKS;
	});

	// Persistence
	useEffect(() => {
		localStorage.setItem("kairos_kanban_tasks", JSON.stringify(tasks));
	}, [tasks]);

	// Filter Configurations
	const [searchQuery, setSearchQuery] = useState<string>("");

	// Modals Toggles
	const [showAddModal, setShowAddModal] = useState<boolean>(false);
	const [modalColumn, setModalColumn] = useState<Task["column"]>("pendiente");
	const [editingTask, setEditingTask] = useState<Task | null>(null);

	// Form Fields for Add
	const [newTitle, setNewTitle] = useState("");
	const [newDesc, setNewDesc] = useState("");
	const [newPriority, setNewPriority] = useState<Task["priority"]>("medium");
	const [newProjectId, setNewProjectId] = useState("proj-1");

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
				(!t.projectId && currentProjectId === "proj-1");
			return matchesSearch && matchesProject;
		});
	}, [tasks, searchQuery, currentProjectId]);

	// Handlers
	const moveTask = (id: string, direction: "forward" | "backward") => {
		const columnProgression: Task["column"][] = [
			"pendiente",
			"en-proceso",
			"finalizado",
		];
		setTasks((prev) =>
			prev.map((t) => {
				if (t.id === id) {
					const currentIndex = columnProgression.indexOf(t.column);
					const nextIndex = currentIndex + (direction === "forward" ? 1 : -1);
					if (nextIndex >= 0 && nextIndex < columnProgression.length) {
						return { ...t, column: columnProgression[nextIndex] };
					}
				}
				return t;
			}),
		);
	};

	const deleteTask = (id: string) => {
		if (confirm("¿Estás seguro de que deseas eliminar esta nota adhesiva?")) {
			setTasks((prev) => prev.filter((t) => t.id !== id));
		}
	};

	const handleAddCardSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newTitle.trim()) return;

		const newTask: Task = {
			id: `task-${Date.now()}`,
			title: newTitle.trim(),
			description: newDesc.trim(),
			priority: newPriority,
			column: modalColumn,
			projectId: currentProjectId === "all" ? newProjectId : currentProjectId,
			createdAt: new Date().toISOString(),
		};

		setTasks((prev) => [newTask, ...prev]);
		setNewTitle("");
		setNewDesc("");
		setNewPriority("medium");
		setShowAddModal(false);
	};

	const handleEditCardSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingTask || !editingTask.title.trim()) return;

		setTasks((prev) =>
			prev.map((t) => (t.id === editingTask.id ? { ...editingTask } : t)),
		);
		setEditingTask(null);
	};

	// HTML5 Drag & Drop
	const handleDragStart = (id: string) => {
		setDraggingTaskId(id);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
	};

	const handleDrop = (column: Task["column"]) => {
		if (!draggingTaskId) return;
		setTasks((prev) =>
			prev.map((t) => (t.id === draggingTaskId ? { ...t, column } : t)),
		);
		setDraggingTaskId(null);
	};

	// Navigate to Focus route
	const handleFocusClick = (id: string) => {
		localStorage.setItem("kairos_active_task_id", id);
		// If the task isn't in progress, automatically shift it to en-proceso
		setTasks((prev) =>
			prev.map((t) =>
				t.id === id && t.column === "pendiente"
					? { ...t, column: "en-proceso" as const }
					: t,
			),
		);
		navigate({ to: "/focus" });
	};

	return (
		<main className="page-wrap px-4 py-8 max-w-7xl">
			{/* Projects Tab-Capsules & Search Toolbar */}
			<section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				{/* Projects Tabs */}
				<div className="flex flex-wrap items-center gap-2 relative">
					<button
						type="button"
						onClick={() => {
							setCurrentProjectId("all");
							setShowProjectsDropdown(false);
						}}
						className={`rounded-full px-4 py-2 text-xs font-extrabold transition-all duration-200 active:scale-95 shadow-sm border cursor-pointer ${
							currentProjectId === "all"
								? "bg-yellow-300 border-yellow-400 text-slate-950"
								: "border-yellow-500/20 bg-yellow-500/5 text-yellow-100/90 hover:bg-yellow-400/10"
						}`}
					>
						Tablero General
					</button>

					{projects.slice(0, 3).map((proj) => (
						<button
							key={proj.id}
							type="button"
							onClick={() => {
								setCurrentProjectId(proj.id);
								setShowProjectsDropdown(false);
							}}
							className={`rounded-full px-4 py-2 text-xs font-extrabold transition-all duration-200 active:scale-95 shadow-sm border cursor-pointer ${
								currentProjectId === proj.id
									? "bg-yellow-300 border-yellow-400 text-slate-950"
									: "border-yellow-500/20 bg-yellow-500/5 text-yellow-100/90 hover:bg-yellow-400/10"
							}`}
						>
							{proj.name}
						</button>
					))}

					{/* Dropdown for remaining projects */}
					{projects.length > 3 && (
						<div className="relative">
							<button
								type="button"
								onClick={() => setShowProjectsDropdown(!showProjectsDropdown)}
								className={`rounded-full px-3.5 py-2 text-xs font-extrabold transition-all duration-200 active:scale-95 shadow-sm border cursor-pointer flex items-center gap-1.5 ${
									projects.slice(3).some((p) => p.id === currentProjectId)
										? "bg-yellow-300 border-yellow-400 text-slate-950"
										: "border-yellow-500/20 bg-yellow-500/5 text-yellow-100/90 hover:bg-yellow-400/10"
								}`}
							>
								<span>
									{projects.slice(3).some((p) => p.id === currentProjectId)
										? projects.find((p) => p.id === currentProjectId)?.name
										: "Más"}
								</span>
								<ChevronDown className="h-3 w-3" />
							</button>

							{showProjectsDropdown && (
								<div className="absolute left-0 mt-2 w-48 z-40 rounded-2xl border border-yellow-500/20 bg-slate-900 p-2.5 shadow-xl backdrop-blur-md">
									{projects.slice(3).map((proj) => (
										<button
											key={proj.id}
											type="button"
											onClick={() => {
												setCurrentProjectId(proj.id);
												setShowProjectsDropdown(false);
											}}
											className={`w-full text-left rounded-xl px-3 py-2 text-xs font-extrabold transition cursor-pointer ${
												currentProjectId === proj.id
													? "bg-yellow-300 text-slate-950"
													: "text-yellow-100/90 hover:bg-yellow-400/10"
											}`}
										>
											{proj.name}
										</button>
									))}
								</div>
							)}
						</div>
					)}

					{/* Add Project trigger */}
					{projects.length > 3 ? (
						<button
							type="button"
							onClick={handleCreateProject}
							title="Nuevo Proyecto"
							className="rounded-full p-2.5 text-xs font-extrabold border border-dashed border-yellow-500/35 bg-transparent text-yellow-400 hover:bg-yellow-400/10 transition cursor-pointer flex items-center justify-center"
						>
							<Plus className="h-4 w-4" />
						</button>
					) : (
						<button
							type="button"
							onClick={handleCreateProject}
							className="rounded-full px-3.5 py-2 text-xs font-extrabold border border-dashed border-yellow-500/35 bg-transparent text-yellow-400 hover:bg-yellow-400/10 transition cursor-pointer"
						>
							+ Nuevo Proyecto
						</button>
					)}
				</div>

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
							className="flex flex-col rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)]/30 backdrop-blur-sm p-5 shadow-sm dot-grid min-h-[600px] w-full"
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
								<span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--sea-ink-soft)]/10 text-xs font-black text-[var(--sea-ink-soft)]">
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
											/* biome-ignore lint/a11y/noStaticElementInteractions: draggable task card */
											<div
												key={task.id}
												draggable
												onDragStart={() => handleDragStart(task.id)}
												className="relative rounded-2xl border border-yellow-500/20 bg-yellow-950/20 p-5 flex flex-col justify-between transition-all duration-300 cursor-grab active:cursor-grabbing shadow-[0_8px_20px_rgba(234,179,8,0.02)] hover:shadow-[0_16px_32px_rgba(234,179,8,0.08)] hover:-translate-y-1 hover:border-yellow-400/40 hover:bg-yellow-950/30 text-yellow-100/90"
											>
												{/* Tech-tape overlay */}
												<div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5.5 bg-yellow-400/10 border-x border-yellow-400/30 shadow-sm backdrop-blur-[2px] z-10" />

												<div>
													{/* Note meta bar */}
													<div className="relative z-10 mb-3 flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
														<span className="opacity-75 text-yellow-400/70 font-black">
															Prioridad {task.priority}
														</span>

														{task.priority === "high" && (
															<span className="px-2 py-0.5 rounded border border-red-500/20 bg-red-500/10 text-red-400 font-black">
																URGENTE
															</span>
														)}
													</div>

													<h3 className="m-0 text-base font-black text-yellow-400 leading-snug">
														{task.title}
													</h3>

													<p className="mt-2 mb-4 text-xs leading-relaxed opacity-85 font-medium text-slate-300">
														{task.description}
													</p>

													{/* Project Indicator (only for General Board view) */}
													{currentProjectId === "all" && projectOfTask && (
														<div className="mt-2 text-[9px] font-black uppercase tracking-wider text-yellow-500/70 flex items-center gap-1">
															<span>📁</span> <span>{projectOfTask.name}</span>
														</div>
													)}
												</div>

												{/* Note Footer Actions */}
												<div className="border-t border-yellow-500/10 pt-3.5 flex items-center justify-end text-yellow-400/70">
													<div className="flex items-center gap-1">
														{col.id !== "finalizado" && (
															<button
																type="button"
																onClick={() => handleFocusClick(task.id)}
																className="rounded-lg border border-yellow-500/25 bg-yellow-500/5 hover:bg-yellow-400/10 px-2 py-1 text-[10px] font-black flex items-center gap-0.5 transition text-yellow-300 hover:text-yellow-200"
																title="Iniciar Deep Work"
															>
																<Clock className="h-3 w-3" />
																<span>Focus</span>
															</button>
														)}

														{/* Card shifts */}
														<div className="flex items-center">
															{col.id !== "pendiente" && (
																<button
																	type="button"
																	onClick={() => moveTask(task.id, "backward")}
																	className="p-1 rounded-lg hover:bg-yellow-400/10 text-yellow-400/70 hover:text-yellow-300 transition"
																	title="Mover atrás"
																>
																	<ChevronLeft className="h-3.5 w-3.5" />
																</button>
															)}
															{col.id !== "finalizado" && (
																<button
																	type="button"
																	onClick={() => moveTask(task.id, "forward")}
																	className="p-1 rounded-lg hover:bg-yellow-400/10 text-yellow-400/70 hover:text-yellow-300 transition"
																	title="Mover adelante"
																>
																	<ChevronRight className="h-3.5 w-3.5" />
																</button>
															)}
															<button
																type="button"
																onClick={() => setEditingTask(task)}
																className="p-1 rounded-lg hover:bg-yellow-400/10 text-yellow-400/70 hover:text-yellow-300 ml-0.5 transition"
																title="Editar"
															>
																<Edit className="h-3.5 w-3.5" />
															</button>
															<button
																type="button"
																onClick={() => deleteTask(task.id)}
																className="p-1 rounded-lg hover:bg-red-500/20 text-red-400/80 hover:text-red-400 ml-0.5 transition"
																title="Eliminar"
															>
																<Trash2 className="h-3.5 w-3.5" />
															</button>
														</div>
													</div>
												</div>
											</div>
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
			{showAddModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
					<div className="w-full max-w-md rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface-strong)] p-6 shadow-xl relative rise-in">
						<button
							type="button"
							onClick={() => setShowAddModal(false)}
							className="absolute right-4 top-4 rounded-full p-1.5 text-[var(--sea-ink-soft)] hover:bg-[var(--bg-base)]"
						>
							<X className="h-4.5 w-4.5" />
						</button>

						<h2 className="display-title mb-4 text-xl font-bold text-[var(--sea-ink)] flex items-center gap-1.5">
							<Sparkles className="h-5 w-5 text-[var(--palm)]" />
							<span>Crear Nota Adhesiva</span>
						</h2>

						<form onSubmit={handleAddCardSubmit} className="space-y-4">
							<div>
								<label
									htmlFor="add-title"
									className="block text-xs font-bold text-[var(--sea-ink-soft)] uppercase tracking-wider mb-1.5"
								>
									Título
								</label>
								<input
									id="add-title"
									type="text"
									required
									placeholder="Ej. Diseño de escala tipográfica"
									value={newTitle}
									onChange={(e) => setNewTitle(e.target.value)}
									className="demo-input text-sm font-semibold"
								/>
							</div>

							<div>
								<label
									htmlFor="add-desc"
									className="block text-xs font-bold text-[var(--sea-ink-soft)] uppercase tracking-wider mb-1.5"
								>
									Descripción
								</label>
								<textarea
									id="add-desc"
									placeholder="Ej. Tareas a realizar y recordatorios..."
									value={newDesc}
									onChange={(e) => setNewDesc(e.target.value)}
									className="demo-textarea text-xs"
								/>
							</div>

							<div>
								<label
									htmlFor="add-priority"
									className="block text-xs font-bold text-[var(--sea-ink-soft)] uppercase tracking-wider mb-1.5"
								>
									Prioridad
								</label>
								<select
									id="add-priority"
									value={newPriority}
									onChange={(e) =>
										setNewPriority(e.target.value as Task["priority"])
									}
									className="demo-select text-xs font-semibold"
								>
									<option value="low">Baja</option>
									<option value="medium">Media</option>
									<option value="high">Alta / Urgente</option>
								</select>
							</div>

							{currentProjectId === "all" && (
								<div>
									<label
										htmlFor="add-project"
										className="block text-xs font-bold text-[var(--sea-ink-soft)] uppercase tracking-wider mb-1.5"
									>
										Proyecto Destino
									</label>
									<select
										id="add-project"
										value={newProjectId}
										onChange={(e) => setNewProjectId(e.target.value)}
										className="demo-select text-xs font-semibold"
									>
										{projects.map((proj) => (
											<option key={proj.id} value={proj.id}>
												{proj.name}
											</option>
										))}
									</select>
								</div>
							)}

							<div className="pt-2 flex justify-end gap-2">
								<button
									type="button"
									onClick={() => setShowAddModal(false)}
									className="rounded-xl border border-[var(--line)] px-4 py-2 text-xs font-bold text-[var(--sea-ink-soft)] hover:bg-[var(--bg-base)]"
								>
									Cancelar
								</button>
								<button
									type="submit"
									className="rounded-xl bg-[var(--lagoon)] text-white px-5 py-2 text-xs font-extrabold hover:bg-[var(--lagoon-deep)] active:scale-95 transition shadow-md"
								>
									Guardar Nota
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* EDIT CARD MODAL */}
			{editingTask && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
					<div className="w-full max-w-md rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface-strong)] p-6 shadow-xl relative rise-in">
						<button
							type="button"
							onClick={() => setEditingTask(null)}
							className="absolute right-4 top-4 rounded-full p-1.5 text-[var(--sea-ink-soft)] hover:bg-[var(--bg-base)]"
						>
							<X className="h-4.5 w-4.5" />
						</button>

						<h2 className="display-title mb-4 text-xl font-bold text-[var(--sea-ink)] flex items-center gap-1.5">
							<Edit className="h-5 w-5 text-[var(--lagoon)]" />
							<span>Editar Nota Adhesiva</span>
						</h2>

						<form onSubmit={handleEditCardSubmit} className="space-y-4">
							<div>
								<label
									htmlFor="edit-title"
									className="block text-xs font-bold text-[var(--sea-ink-soft)] uppercase tracking-wider mb-1.5"
								>
									Título
								</label>
								<input
									id="edit-title"
									type="text"
									required
									placeholder="Task naming..."
									value={editingTask.title}
									onChange={(e) =>
										setEditingTask({ ...editingTask, title: e.target.value })
									}
									className="demo-input text-sm font-semibold"
								/>
							</div>

							<div>
								<label
									htmlFor="edit-desc"
									className="block text-xs font-bold text-[var(--sea-ink-soft)] uppercase tracking-wider mb-1.5"
								>
									Descripción
								</label>
								<textarea
									id="edit-desc"
									placeholder="Task breakdowns..."
									value={editingTask.description}
									onChange={(e) =>
										setEditingTask({
											...editingTask,
											description: e.target.value,
										})
									}
									className="demo-textarea text-xs"
								/>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div>
									<label
										htmlFor="edit-priority"
										className="block text-xs font-bold text-[var(--sea-ink-soft)] uppercase tracking-wider mb-1.5"
									>
										Prioridad
									</label>
									<select
										id="edit-priority"
										value={editingTask.priority}
										onChange={(e) =>
											setEditingTask({
												...editingTask,
												priority: e.target.value as Task["priority"],
											})
										}
										className="demo-select text-xs font-semibold"
									>
										<option value="low">Baja</option>
										<option value="medium">Media</option>
										<option value="high">Alta / Urgente</option>
									</select>
								</div>
								<div>
									<label
										htmlFor="edit-column"
										className="block text-xs font-bold text-[var(--sea-ink-soft)] uppercase tracking-wider mb-1.5"
									>
										Estado
									</label>
									<select
										id="edit-column"
										value={editingTask.column}
										onChange={(e) =>
											setEditingTask({
												...editingTask,
												column: e.target.value as Task["column"],
											})
										}
										className="demo-select text-xs font-semibold"
									>
										<option value="pendiente">Pendiente</option>
										<option value="en-proceso">En Proceso</option>
										<option value="finalizado">Finalizado</option>
									</select>
								</div>
							</div>

							<div>
								<label
									htmlFor="edit-project"
									className="block text-xs font-bold text-[var(--sea-ink-soft)] uppercase tracking-wider mb-1.5"
								>
									Proyecto
								</label>
								<select
									id="edit-project"
									value={editingTask.projectId || "proj-1"}
									onChange={(e) =>
										setEditingTask({
											...editingTask,
											projectId: e.target.value,
										})
									}
									className="demo-select text-xs font-semibold"
								>
									{projects.map((proj) => (
										<option key={proj.id} value={proj.id}>
											{proj.name}
										</option>
									))}
								</select>
							</div>

							<div className="pt-2 flex justify-end gap-2">
								<button
									type="button"
									onClick={() => setEditingTask(null)}
									className="rounded-xl border border-[var(--line)] px-4 py-2 text-xs font-bold text-[var(--sea-ink-soft)] hover:bg-[var(--bg-base)]"
								>
									Cancelar
								</button>
								<button
									type="submit"
									className="rounded-xl bg-[var(--lagoon)] text-white px-5 py-2 text-xs font-extrabold hover:bg-[var(--lagoon-deep)] active:scale-95 transition shadow-md"
								>
									Actualizar Nota
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</main>
	);
}
