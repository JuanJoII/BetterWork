import {
	Check,
	CheckCircle,
	GripVertical,
	SlidersHorizontal,
	X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Project, Task } from "../../types/kanban";
import { getNoteToneKey, getNoteToneStyles } from "../../utils/noteTheme";
import {
	GENERAL_BOARD_LABEL,
	getProjectDisplayName,
	isDefaultGeneralProject,
} from "../../utils/projects";
import ProjectIcon from "../kanban/ProjectIcon";
import SearchBar from "../kanban/SearchBar";

export type FocusStatusFilter = "active" | "pendiente" | "en-proceso" | "all";

interface FocusTaskPanelProps {
	tasks: Task[];
	projects: Project[];
	activeTaskId: string;
	draggingTaskId: string | null;
	isLocked: boolean;
	searchQuery: string;
	onSearchChange: (value: string) => void;
	selectedProjectId: string;
	onProjectChange: (projectId: string) => void;
	statusFilter: FocusStatusFilter;
	onStatusFilterChange: (status: FocusStatusFilter) => void;
	onSelectTask: (taskId: string) => void;
	onDragStartTask: (taskId: string) => void;
	onDragEndTask: () => void;
}

const STATUS_OPTIONS: { id: FocusStatusFilter; label: string }[] = [
	{ id: "active", label: "Activas" },
	{ id: "pendiente", label: "Pendiente" },
	{ id: "en-proceso", label: "En Proceso" },
	{ id: "all", label: "Todas" },
];

const COLUMN_LABEL: Record<Task["column"], string> = {
	pendiente: "Pendiente",
	"en-proceso": "En Proceso",
	finalizado: "Finalizado",
};

export default function FocusTaskPanel({
	tasks,
	projects,
	activeTaskId,
	draggingTaskId,
	isLocked,
	searchQuery,
	onSearchChange,
	selectedProjectId,
	onProjectChange,
	statusFilter,
	onStatusFilterChange,
	onSelectTask,
	onDragStartTask,
	onDragEndTask,
}: FocusTaskPanelProps) {
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const filterContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isFilterOpen) return;

		const handlePointerDown = (event: MouseEvent) => {
			if (
				filterContainerRef.current &&
				!filterContainerRef.current.contains(event.target as Node)
			) {
				setIsFilterOpen(false);
			}
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setIsFilterOpen(false);
			}
		};

		document.addEventListener("mousedown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("mousedown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isFilterOpen]);

	const activeFilterCount =
		(selectedProjectId !== "all" ? 1 : 0) + (statusFilter !== "active" ? 1 : 0);

	const selectedProject =
		selectedProjectId === "all"
			? null
			: (projects.find((p) => p.id === selectedProjectId) ?? null);

	const clearFilters = () => {
		onProjectChange("all");
		onStatusFilterChange("active");
	};

	return (
		<aside
			data-focus-panel
			aria-label="Panel de tareas para Focus"
			className="flex flex-col rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)]/75 backdrop-blur-sm p-5 shadow-sm dot-grid w-full lg:w-80 xl:w-96 shrink-0 lg:sticky lg:top-28 lg:h-[calc(100vh-9.5rem)] z-20"
		>
			{/* Panel Header (matches KanbanColumn header) */}
			<div className="mb-4 flex items-center justify-between border-b border-[var(--line)] pb-4">
				<div>
					<h2 className="display-title m-0 text-lg font-black tracking-tight text-[var(--sea-ink)]">
						Tareas
					</h2>
					<span
						className={`text-xs font-bold ${
							isLocked
								? "text-amber-700 dark:text-amber-300/85"
								: "text-[var(--sea-ink-soft)]"
						}`}
					>
						{isLocked
							? "Pausa el reloj para cambiar de tarea"
							: "Arrastra una nota al temporizador"}
					</span>
				</div>
				<span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-400/20 px-1.5 text-xs font-black text-amber-800 border border-amber-500/35 dark:bg-yellow-400/20 dark:text-yellow-400 dark:border-yellow-400/35 shadow-[0_0_10px_rgba(234,179,8,0.15)]">
					{tasks.length}
				</span>
			</div>

			{/* SearchBar + Filters Button */}
			<div className="mb-3 flex items-center gap-2">
				<div className="flex-1 min-w-0">
					<SearchBar
						value={searchQuery}
						onChange={onSearchChange}
						placeholder="Buscar tareas..."
					/>
				</div>

				<div className="relative shrink-0" ref={filterContainerRef}>
					<button
						type="button"
						onClick={() => setIsFilterOpen((prev) => !prev)}
						aria-label="Filtrar tareas"
						aria-expanded={isFilterOpen}
						title="Filtrar por proyecto o estado"
						className={`relative flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-extrabold transition cursor-pointer ${
							isFilterOpen || activeFilterCount > 0
								? "border-amber-500/75 bg-amber-400/20 text-amber-800 shadow-[0_0_14px_rgba(245,158,11,0.16)] dark:border-yellow-400/75 dark:bg-yellow-400/15 dark:text-yellow-300 dark:shadow-[0_0_16px_rgba(250,204,21,0.18)]"
								: "border-amber-500/30 bg-white/85 text-[var(--sea-ink-soft)] hover:border-amber-500/60 hover:text-amber-800 dark:border-yellow-500/20 dark:bg-slate-900/75 dark:hover:border-yellow-400/40 dark:hover:text-yellow-200"
						}`}
					>
						<SlidersHorizontal className="h-3.5 w-3.5" />
						<span className="hidden sm:inline">Filtros</span>
						{activeFilterCount > 0 && (
							<span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 dark:bg-yellow-300 px-1 text-[10px] font-black text-slate-950 leading-none">
								{activeFilterCount}
							</span>
						)}
					</button>

					{/* Filters Popover */}
					{isFilterOpen && (
						<div
							role="dialog"
							aria-label="Filtros de tareas"
							className="absolute right-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-amber-400/45 bg-white/95 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.14),0_0_24px_rgba(245,158,11,0.08)] dark:border-yellow-400/35 dark:bg-slate-950/95 dark:shadow-[0_18px_40px_rgba(0,0,0,0.65),0_0_24px_rgba(250,204,21,0.12)] backdrop-blur-md rise-in"
						>
							<div className="mb-3 flex items-center justify-between gap-2">
								<h3 className="display-title m-0 text-sm font-black text-amber-700 dark:text-yellow-300">
									Filtrar tareas
								</h3>
								<div className="flex items-center gap-1.5">
									{activeFilterCount > 0 && (
										<button
											type="button"
											onClick={clearFilters}
											className="text-[10px] font-extrabold text-amber-700 hover:text-amber-900 dark:text-yellow-300/80 dark:hover:text-yellow-200 cursor-pointer"
										>
											Limpiar
										</button>
									)}
									<button
										type="button"
										onClick={() => setIsFilterOpen(false)}
										aria-label="Cerrar filtros"
										className="rounded-lg p-1 text-[var(--sea-ink-soft)] hover:bg-slate-900/5 dark:hover:bg-white/5 hover:text-[var(--sea-ink)] cursor-pointer"
									>
										<X className="h-3.5 w-3.5" />
									</button>
								</div>
							</div>

							{/* Project filter list */}
							<div className="mb-3.5">
								<span className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-[var(--sea-ink-soft)]">
									Proyecto
								</span>
								<div className="flex max-h-40 flex-col gap-1 overflow-y-auto kanban-scroll pr-0.5">
									<button
										type="button"
										onClick={() => onProjectChange("all")}
										className={`flex w-full items-center justify-between rounded-xl border px-2.5 py-1.5 text-left text-xs font-bold transition cursor-pointer ${
											selectedProjectId === "all"
												? "border-amber-400/75 bg-amber-400/20 text-amber-900 dark:border-yellow-400/60 dark:bg-yellow-300/15 dark:text-yellow-300"
												: "border-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-yellow-100"
										}`}
									>
										<span>{GENERAL_BOARD_LABEL}</span>
										{selectedProjectId === "all" && (
											<Check className="h-3.5 w-3.5 shrink-0" />
										)}
									</button>

									{projects
										.filter((proj) => !isDefaultGeneralProject(proj))
										.map((proj) => {
											const isSelected = selectedProjectId === proj.id;
											return (
												<button
													key={proj.id}
													type="button"
													onClick={() => onProjectChange(proj.id)}
													className={`flex w-full items-center justify-between gap-2 rounded-xl border px-2.5 py-1.5 text-left text-xs font-bold transition cursor-pointer ${
														isSelected
															? "border-amber-400/75 bg-amber-400/20 text-amber-900 dark:border-yellow-400/60 dark:bg-yellow-300/15 dark:text-yellow-300"
															: "border-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-yellow-100"
													}`}
												>
													<span className="flex min-w-0 items-center gap-2">
														{proj.icon ? (
															<ProjectIcon
																icon={proj.icon}
																className="h-3.5 w-3.5"
																emojiClassName="text-xs leading-none"
															/>
														) : (
															<span aria-hidden="true" className="text-xs">
																📁
															</span>
														)}
														<span className="truncate">{proj.name}</span>
													</span>
													{isSelected && (
														<Check className="h-3.5 w-3.5 shrink-0" />
													)}
												</button>
											);
										})}
								</div>
							</div>

							{/* Status filter pills */}
							<div>
								<span className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-[var(--sea-ink-soft)]">
									Estado
								</span>
								<div className="grid grid-cols-2 gap-1.5">
									{STATUS_OPTIONS.map((opt) => {
										const isSelected = statusFilter === opt.id;
										return (
											<button
												key={opt.id}
												type="button"
												onClick={() => onStatusFilterChange(opt.id)}
												className={`rounded-full border px-2.5 py-1 text-[11px] font-extrabold transition cursor-pointer ${
													isSelected
														? "border-amber-500 bg-amber-400 text-slate-950 dark:border-yellow-400 dark:bg-yellow-300"
														: "border-amber-500/25 bg-slate-100/80 text-slate-700 hover:border-amber-500/55 hover:text-slate-950 dark:border-yellow-500/20 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-yellow-400/40 dark:hover:text-yellow-100"
												}`}
											>
												{opt.label}
											</button>
										);
									})}
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Active Filter Chips */}
			{activeFilterCount > 0 && (
				<div className="mb-3 flex flex-wrap items-center gap-1.5">
					{selectedProject && (
						<button
							type="button"
							onClick={() => onProjectChange("all")}
							className="inline-flex items-center gap-1 rounded-full border border-amber-500/45 bg-amber-400/18 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-900 hover:bg-amber-400/25 dark:border-yellow-400/40 dark:bg-yellow-400/10 dark:text-yellow-200 dark:hover:bg-yellow-400/20 cursor-pointer"
						>
							{selectedProject.icon && (
								<ProjectIcon
									icon={selectedProject.icon}
									className="h-3 w-3"
									emojiClassName="text-[11px] leading-none"
								/>
							)}
							<span className="max-w-[8rem] truncate">
								{selectedProject.name}
							</span>
							<X className="h-3 w-3" />
						</button>
					)}
					{statusFilter !== "active" && (
						<button
							type="button"
							onClick={() => onStatusFilterChange("active")}
							className="inline-flex items-center gap-1 rounded-full border border-purple-400/50 bg-purple-100 px-2.5 py-0.5 text-[10px] font-extrabold text-purple-800 hover:bg-purple-200/70 dark:border-purple-400/40 dark:bg-purple-500/15 dark:text-purple-200 dark:hover:bg-purple-500/25 cursor-pointer"
						>
							<span>
								{STATUS_OPTIONS.find((s) => s.id === statusFilter)?.label}
							</span>
							<X className="h-3 w-3" />
						</button>
					)}
				</div>
			)}

			{/* Draggable Kanban-style Task Cards */}
			<div className="flex flex-1 min-h-0 flex-col gap-6 overflow-y-auto kanban-scroll px-1 pt-3 pb-6">
				{tasks.length > 0 ? (
					tasks.map((task) => {
						const isDaily = !!task.isRitual;
						const isActive = task.id === activeTaskId;
						const isDragging = task.id === draggingTaskId;
						const projectOfTask = projects.find((p) => p.id === task.projectId);
						const toneKey = getNoteToneKey(task);
						const tone = getNoteToneStyles(task);

						return (
							/* biome-ignore lint/a11y/useSemanticElements: draggable sticky-note card supporting both HTML5 DnD and click selection */
							<div
								key={task.id}
								role="button"
								data-note-tone={toneKey}
								tabIndex={isLocked ? -1 : 0}
								draggable={!isLocked}
								aria-disabled={isLocked}
								title={
									isLocked ? "Pausa el reloj para cambiar de tarea" : undefined
								}
								onDragStart={(e) => {
									if (isLocked) {
										e.preventDefault();
										return;
									}
									e.dataTransfer.setData("text/plain", task.id);
									e.dataTransfer.effectAllowed = "move";
									onDragStartTask(task.id);
								}}
								onDragEnd={onDragEndTask}
								onClick={() => {
									if (!isLocked) onSelectTask(task.id);
								}}
								onKeyDown={(e) => {
									if (isLocked) return;
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										onSelectTask(task.id);
									}
								}}
								aria-pressed={isActive}
								className={`group relative rounded-2xl border p-4 text-left transition-[border-color,background-color,box-shadow,opacity] duration-200 select-none ${
									isLocked
										? "cursor-not-allowed"
										: "cursor-grab active:cursor-grabbing"
								} ${tone.card} ${
									!isLocked ? tone.cardHover : !isActive ? "opacity-60" : ""
								} ${isActive ? tone.activeBottomShadow : ""} ${
									isDragging ? "opacity-45 scale-[0.98]" : ""
								}`}
							>
								{/* Tech-tape overlay (Kanban visual signature) */}
								<div
									className={`absolute -top-2.5 left-1/2 -translate-x-1/2 h-4 w-12 border-x shadow-sm backdrop-blur-[2px] ${tone.tape}`}
								/>

								{/* Top meta row (grip + EN FOCUS / DAILY only — regular priority conveyed by color) */}
								<div className="mb-2 flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-wider">
									<span className={`flex items-center gap-1 ${tone.metaText}`}>
										<GripVertical
											className={`h-3.5 w-3.5 transition-opacity ${
												isLocked
													? "opacity-20"
													: "opacity-55 group-hover:opacity-100"
											}`}
										/>
										{isDaily && <span>Hábito Diario</span>}
									</span>

									<div className="flex items-center gap-1">
										{isActive && (
											<span className="rounded border border-emerald-500/45 bg-emerald-100 px-1.5 py-0.5 text-[9px] font-black text-emerald-800 dark:border-emerald-400/45 dark:bg-emerald-500/15 dark:text-emerald-300">
												EN FOCUS
											</span>
										)}
										{isDaily && (
											<span className="rounded border border-purple-300 bg-purple-100 px-1.5 py-0.5 text-[9px] font-black text-purple-800 dark:border-purple-500/40 dark:bg-purple-500/20 dark:text-purple-300">
												DAILY
											</span>
										)}
									</div>
								</div>

								<h3
									className={`m-0 text-sm font-black leading-snug ${tone.title}`}
								>
									{task.title}
								</h3>

								{task.description && (
									<p className="mt-1.5 mb-2.5 line-clamp-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300/85 font-medium">
										{task.description}
									</p>
								)}

								{/* Footer: Project + Status */}
								<div
									className={`mt-2 flex items-center justify-between gap-2 border-t pt-2.5 text-[10px] font-extrabold ${tone.divider}`}
								>
									{projectOfTask ? (
										<span
											className={`flex min-w-0 items-center gap-1 uppercase tracking-wider ${tone.projectText}`}
										>
											{projectOfTask.icon ? (
												<ProjectIcon
													icon={projectOfTask.icon}
													className="h-3 w-3"
													emojiClassName="text-[11px] leading-none"
												/>
											) : (
												<span aria-hidden="true">📁</span>
											)}
											<span className="truncate">
												{getProjectDisplayName(projectOfTask)}
											</span>
										</span>
									) : (
										<span />
									)}

									<span
										className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
											task.column === "en-proceso"
												? "bg-amber-200/80 text-amber-900 border border-amber-400/50 dark:bg-yellow-400/15 dark:text-yellow-300 dark:border-yellow-400/25"
												: task.column === "finalizado"
													? "bg-emerald-100 text-emerald-800 border border-emerald-400/45 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/25"
													: "bg-slate-200/85 text-slate-700 border border-slate-300/80 dark:bg-slate-800/80 dark:text-slate-300 dark:border-white/10"
										}`}
									>
										{COLUMN_LABEL[task.column]}
									</span>
								</div>
							</div>
						);
					})
				) : (
					<div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface-strong)]/5 px-4 py-14 text-center text-[var(--sea-ink-soft)] opacity-75">
						<CheckCircle className="mb-2 h-7 w-7 opacity-35" />
						<span className="text-xs font-bold">
							No se encontraron tareas con estos filtros
						</span>
						{(activeFilterCount > 0 || searchQuery) && (
							<button
								type="button"
								onClick={() => {
									onSearchChange("");
									clearFilters();
								}}
								className="mt-3 rounded-full border border-amber-500/45 bg-amber-400/15 px-3 py-1 text-[11px] font-extrabold text-amber-900 hover:bg-amber-400/25 dark:border-yellow-400/35 dark:bg-yellow-400/10 dark:text-yellow-300 dark:hover:bg-yellow-400/20 cursor-pointer"
							>
								Restablecer búsqueda y filtros
							</button>
						)}
					</div>
				)}
			</div>
		</aside>
	);
}
