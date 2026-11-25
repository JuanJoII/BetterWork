import {
	Check,
	ChevronLeft,
	ChevronRight,
	Clock,
	Edit,
	Trash2,
} from "lucide-react";
import type { Project, Task } from "../../types/kanban";
import { getNoteToneKey, getNoteToneStyles } from "../../utils/noteTheme";
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
	const toneKey = getNoteToneKey(task);
	const tone = getNoteToneStyles(task);

	return (
		/* biome-ignore lint/a11y/noStaticElementInteractions: draggable task card */
		<div
			data-task-card
			data-ritual={isRitual}
			data-note-tone={toneKey}
			draggable
			onDragStart={(e) => {
				e.dataTransfer?.setData("text/plain", task.id);
				if (e.dataTransfer) {
					e.dataTransfer.effectAllowed = "move";
				}
				onDragStart();
			}}
			onDragEnd={onDragEnd}
			className={`relative rounded-2xl border p-5 flex flex-col justify-between transition-[border-color,background-color,box-shadow] duration-200 cursor-grab active:cursor-grabbing shadow-sm ${tone.card} ${tone.cardHover}`}
		>
			{/* Tech-tape overlay */}
			<div
				className={`absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5.5 border-x shadow-sm backdrop-blur-[2px] z-10 ${tone.tape}`}
			/>

			<div>
				{/* Daily badge bar (regular notes communicate priority purely through color) */}
				{isRitual && (
					<div className="relative z-10 mb-3 flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
						<span className={`font-black ${tone.metaText}`}>Hábito Diario</span>
						<span className="px-2 py-0.5 rounded border border-purple-300 bg-purple-100 text-purple-800 dark:border-purple-500/40 dark:bg-purple-500/20 dark:text-purple-300 font-black animate-pulse">
							DAILY
						</span>
					</div>
				)}

				<h3 className={`m-0 text-base font-black leading-snug ${tone.title}`}>
					{task.title}
				</h3>

				<p className="mt-2 mb-4 text-xs leading-relaxed opacity-90 font-medium text-slate-700 dark:text-slate-300 dark:opacity-85">
					{task.description}
				</p>

				{/* Project Indicator (only for General Board view) */}
				{currentProjectId === "all" && projectOfTask && (
					<div
						className={`mt-2 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${tone.projectText}`}
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
				className={`border-t pt-3.5 flex items-center justify-end ${tone.divider} ${tone.metaText}`}
			>
				<div className="flex items-center gap-1">
					{colId !== "finalizado" && (
						<button
							type="button"
							onClick={onFocusClick}
							className={`rounded-lg border px-2 py-1 text-[10px] font-black flex items-center gap-0.5 transition cursor-pointer ${tone.focusButton}`}
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
								className={`p-1 rounded-lg transition cursor-pointer ${tone.iconButton}`}
								title="Mover atrás"
							>
								<ChevronLeft className="h-3.5 w-3.5" />
							</button>
						)}
						{colId !== "finalizado" && (
							<button
								type="button"
								onClick={() => onMoveTask("forward")}
								className={`p-1 rounded-lg transition cursor-pointer ${tone.iconButton}`}
								title="Mover adelante"
							>
								<ChevronRight className="h-3.5 w-3.5" />
							</button>
						)}
						<button
							type="button"
							onClick={onEditTask}
							className={`p-1 rounded-lg ml-0.5 transition cursor-pointer ${tone.iconButton}`}
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
