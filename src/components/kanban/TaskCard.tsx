import {
	Check,
	ChevronLeft,
	ChevronRight,
	Clock,
	Edit,
	Trash2,
} from "lucide-react";
import type { Project, Task } from "../../types/kanban";
import { getProjectDisplayName } from "../../utils/projects";
import ProjectIcon from "./ProjectIcon";

interface TaskCardProps {
	task: Task;
	projectOfTask?: Project;
	currentProjectId: string;
	colId: string;
	onDragStart: () => void;
	onDragEnd?: () => void;
	onFocusClick: () => void;
	onMoveTask: (direction: "forward" | "backward") => void;
	onEditTask: () => void;
	onDeleteTask: (e: React.MouseEvent) => void;
	onCompleteTask: (e: React.MouseEvent) => void;
}

export default function TaskCard({
	task,
	projectOfTask,
	currentProjectId,
	colId,
	onDragStart,
	onDragEnd,
	onFocusClick,
	onMoveTask,
	onEditTask,
	onDeleteTask,
	onCompleteTask,
}: TaskCardProps) {
	const isRitual = !!task.isRitual;

	return (
		/* biome-ignore lint/a11y/noStaticElementInteractions: draggable task card */
		<div
			data-task-card
			data-ritual={isRitual}
			draggable
			onDragStart={(e) => {
				e.dataTransfer?.setData("text/plain", task.id);
				if (e.dataTransfer) {
					e.dataTransfer.effectAllowed = "move";
				}
				onDragStart();
			}}
			onDragEnd={onDragEnd}
			className={`relative rounded-2xl border p-5 flex flex-col justify-between transition-[border-color,background-color,box-shadow] duration-200 cursor-grab active:cursor-grabbing shadow-sm ${
				isRitual
					? "border-purple-300/80 bg-purple-50/95 hover:border-purple-400 hover:bg-purple-50 hover:shadow-[0_14px_28px_rgba(126,34,206,0.1)] text-purple-950 dark:border-purple-500/30 dark:bg-purple-950/15 dark:hover:border-purple-400/50 dark:hover:bg-purple-950/25 dark:hover:shadow-[0_16px_32px_rgba(168,85,247,0.06)] dark:text-purple-100/90"
					: "border-amber-300/80 bg-amber-50/95 hover:border-amber-400 hover:bg-amber-50 hover:shadow-[0_14px_28px_rgba(217,119,6,0.1)] text-amber-950 dark:border-yellow-500/20 dark:bg-yellow-950/20 dark:hover:border-yellow-400/40 dark:hover:bg-yellow-950/30 dark:hover:shadow-[0_16px_32px_rgba(234,179,8,0.08)] dark:text-yellow-100/90"
			}`}
		>
			{/* Tech-tape overlay */}
			<div
				className={`absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5.5 border-x shadow-sm backdrop-blur-[2px] z-10 ${
					isRitual
						? "bg-purple-300/45 border-purple-400/55 dark:bg-purple-500/20 dark:border-purple-400/40"
						: "bg-amber-300/45 border-amber-400/55 dark:bg-yellow-400/10 dark:border-yellow-400/30"
				}`}
			/>

			<div>
				{/* Note meta bar */}
				<div className="relative z-10 mb-3 flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
					<span
						className={`font-black ${
							isRitual
								? "text-purple-700 dark:text-purple-400"
								: "text-amber-700 dark:text-yellow-400/70"
						}`}
					>
						{isRitual ? "Hábito Diario" : `Prioridad ${task.priority}`}
					</span>

					{isRitual ? (
						<span className="px-2 py-0.5 rounded border border-purple-300 bg-purple-100 text-purple-800 dark:border-purple-500/40 dark:bg-purple-500/20 dark:text-purple-300 font-black animate-pulse">
							DAILY
						</span>
					) : (
						task.priority === "high" && (
							<span className="px-2 py-0.5 rounded border border-red-300 bg-red-100 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 font-black">
								URGENTE
							</span>
						)
					)}
				</div>

				<h3
					className={`m-0 text-base font-black leading-snug ${
						isRitual
							? "text-purple-900 dark:text-purple-300"
							: "text-amber-950 dark:text-yellow-400"
					}`}
				>
					{task.title}
				</h3>

				<p className="mt-2 mb-4 text-xs leading-relaxed opacity-90 font-medium text-slate-700 dark:text-slate-300 dark:opacity-85">
					{task.description}
				</p>

				{/* Project Indicator (only for General Board view) */}
				{currentProjectId === "all" && projectOfTask && (
					<div
						className={`mt-2 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${
							isRitual
								? "text-purple-700/80 dark:text-purple-400/75"
								: "text-amber-800/75 dark:text-yellow-500/70"
						}`}
					>
						{projectOfTask.icon ? (
							<ProjectIcon
								icon={projectOfTask.icon}
								className="h-3 w-3"
								emojiClassName="text-[11px] leading-none"
							/>
						) : (
							<span>📁</span>
						)}{" "}
						<span>{getProjectDisplayName(projectOfTask)}</span>
					</div>
				)}
			</div>

			{/* Note Footer Actions */}
			<div
				className={`border-t pt-3.5 flex items-center justify-end ${
					isRitual
						? "border-purple-300/60 text-purple-700 dark:border-purple-500/10 dark:text-purple-400/75"
						: "border-amber-300/60 text-amber-800 dark:border-yellow-500/10 dark:text-yellow-400/70"
				}`}
			>
				<div className="flex items-center gap-1">
					{colId !== "finalizado" && (
						<button
							type="button"
							onClick={onFocusClick}
							className={`rounded-lg border px-2 py-1 text-[10px] font-black flex items-center gap-0.5 transition cursor-pointer ${
								isRitual
									? "border-purple-300 bg-purple-100/80 hover:bg-purple-200/70 text-purple-800 dark:border-purple-500/25 dark:bg-purple-500/5 dark:hover:bg-purple-500/15 dark:text-purple-300 dark:hover:text-purple-200"
									: "border-amber-300 bg-amber-100/80 hover:bg-amber-200/70 text-amber-900 dark:border-yellow-500/25 dark:bg-yellow-500/5 dark:hover:bg-yellow-400/10 dark:text-yellow-300 dark:hover:text-yellow-200"
							}`}
							title="Iniciar Deep Work"
						>
							<Clock className="h-3 w-3" />
							<span>Focus</span>
						</button>
					)}

					{/* Card shifts */}
					<div className="flex items-center">
						{colId !== "pendiente" && (
							<button
								type="button"
								onClick={() => onMoveTask("backward")}
								className={`p-1 rounded-lg transition cursor-pointer ${
									isRitual
										? "hover:bg-purple-200/60 text-purple-700 hover:text-purple-900 dark:hover:bg-purple-500/15 dark:text-purple-400 dark:hover:text-purple-300"
										: "hover:bg-amber-200/60 text-amber-800 hover:text-amber-950 dark:hover:bg-yellow-400/10 dark:text-yellow-400/70 dark:hover:text-yellow-300"
								}`}
								title="Mover atrás"
							>
								<ChevronLeft className="h-3.5 w-3.5" />
							</button>
						)}
						{colId !== "finalizado" && (
							<button
								type="button"
								onClick={() => onMoveTask("forward")}
								className={`p-1 rounded-lg transition cursor-pointer ${
									isRitual
										? "hover:bg-purple-200/60 text-purple-700 hover:text-purple-900 dark:hover:bg-purple-500/15 dark:text-purple-400 dark:hover:text-purple-300"
										: "hover:bg-amber-200/60 text-amber-800 hover:text-amber-950 dark:hover:bg-yellow-400/10 dark:text-yellow-400/70 dark:hover:text-yellow-300"
								}`}
								title="Mover adelante"
							>
								<ChevronRight className="h-3.5 w-3.5" />
							</button>
						)}
						<button
							type="button"
							onClick={onEditTask}
							className={`p-1 rounded-lg ml-0.5 transition cursor-pointer ${
								isRitual
									? "hover:bg-purple-200/60 text-purple-700 hover:text-purple-900 dark:hover:bg-purple-500/15 dark:text-purple-400 dark:hover:text-purple-300"
									: "hover:bg-amber-200/60 text-amber-800 hover:text-amber-950 dark:hover:bg-yellow-400/10 dark:text-yellow-400/70 dark:hover:text-yellow-300"
							}`}
							title="Editar"
						>
							<Edit className="h-3.5 w-3.5" />
						</button>
						{colId === "finalizado" && (
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									onCompleteTask(e);
								}}
								className="p-1 rounded-lg hover:bg-emerald-500/15 text-emerald-600 hover:text-emerald-700 dark:hover:bg-green-500/20 dark:text-[#39fc23] ml-0.5 transition cursor-pointer"
								title="Completar Tarea"
							>
								<Check className="h-3.5 w-3.5" />
							</button>
						)}
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onDeleteTask(e);
							}}
							className="p-1 rounded-lg hover:bg-red-500/15 text-red-600/85 hover:text-red-700 dark:hover:bg-red-500/20 dark:text-red-400/80 dark:hover:text-red-400 ml-0.5 transition cursor-pointer"
							title="Eliminar"
						>
							<Trash2 className="h-3.5 w-3.5" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
