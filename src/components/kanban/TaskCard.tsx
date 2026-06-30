import { ChevronLeft, ChevronRight, Clock, Edit, Trash2 } from "lucide-react";
import type { Project, Task } from "../../types/kanban";

interface TaskCardProps {
	task: Task;
	projectOfTask?: Project;
	currentProjectId: string;
	colId: string;
	onDragStart: () => void;
	onFocusClick: () => void;
	onMoveTask: (direction: "forward" | "backward") => void;
	onEditTask: () => void;
	onDeleteTask: () => void;
}

export default function TaskCard({
	task,
	projectOfTask,
	currentProjectId,
	colId,
	onDragStart,
	onFocusClick,
	onMoveTask,
	onEditTask,
	onDeleteTask,
}: TaskCardProps) {
	const isRitual = !!task.isRitual;

	return (
		/* biome-ignore lint/a11y/noStaticElementInteractions: draggable task card */
		<div
			draggable
			onDragStart={onDragStart}
			className={`relative rounded-2xl border p-5 flex flex-col justify-between transition-all duration-300 cursor-grab active:cursor-grabbing shadow-sm ${
				isRitual
					? "border-purple-500/30 bg-purple-950/15 hover:border-purple-400/50 hover:bg-purple-950/25 hover:shadow-[0_16px_32px_rgba(168,85,247,0.06)] text-purple-100/90"
					: "border-yellow-500/20 bg-yellow-950/20 hover:border-yellow-400/40 hover:bg-yellow-950/30 hover:shadow-[0_16px_32px_rgba(234,179,8,0.08)] text-yellow-100/90"
			}`}
		>
			{/* Tech-tape overlay */}
			<div
				className={`absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5.5 border-x shadow-sm backdrop-blur-[2px] z-10 ${
					isRitual
						? "bg-purple-500/20 border-purple-400/40"
						: "bg-yellow-400/10 border-yellow-400/30"
				}`}
			/>

			<div>
				{/* Note meta bar */}
				<div className="relative z-10 mb-3 flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
					<span
						className={`font-black ${isRitual ? "text-purple-400" : "text-yellow-400/70"}`}
					>
						{isRitual ? "Hábito Diario" : `Prioridad ${task.priority}`}
					</span>

					{isRitual ? (
						<span className="px-2 py-0.5 rounded border border-purple-500/40 bg-purple-500/20 text-purple-300 font-black animate-pulse">
							🔮 RITUAL
						</span>
					) : (
						task.priority === "high" && (
							<span className="px-2 py-0.5 rounded border border-red-500/20 bg-red-500/10 text-red-400 font-black">
								URGENTE
							</span>
						)
					)}
				</div>

				<h3
					className={`m-0 text-base font-black leading-snug ${
						isRitual ? "text-purple-300" : "text-yellow-400"
					}`}
				>
					{task.title}
				</h3>

				<p className="mt-2 mb-4 text-xs leading-relaxed opacity-85 font-medium text-slate-300">
					{task.description}
				</p>

				{/* Project Indicator (only for General Board view) */}
				{currentProjectId === "all" && projectOfTask && (
					<div
						className={`mt-2 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${
							isRitual ? "text-purple-400/75" : "text-yellow-500/70"
						}`}
					>
						<span>📁</span> <span>{projectOfTask.name}</span>
					</div>
				)}
			</div>

			{/* Note Footer Actions */}
			<div
				className={`border-t pt-3.5 flex items-center justify-end ${
					isRitual
						? "border-purple-500/10 text-purple-400/75"
						: "border-yellow-500/10 text-yellow-400/70"
				}`}
			>
				<div className="flex items-center gap-1">
					{colId !== "finalizado" && (
						<button
							type="button"
							onClick={onFocusClick}
							className={`rounded-lg border px-2 py-1 text-[10px] font-black flex items-center gap-0.5 transition ${
								isRitual
									? "border-purple-500/25 bg-purple-500/5 hover:bg-purple-500/15 text-purple-300 hover:text-purple-200"
									: "border-yellow-500/25 bg-yellow-500/5 hover:bg-yellow-400/10 px-2 py-1 text-[10px] font-black flex items-center gap-0.5 transition text-yellow-300 hover:text-yellow-200"
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
								className={`p-1 rounded-lg transition ${
									isRitual
										? "hover:bg-purple-500/15 text-purple-400 hover:text-purple-300"
										: "hover:bg-yellow-400/10 text-yellow-400/70 hover:text-yellow-300"
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
								className={`p-1 rounded-lg transition ${
									isRitual
										? "hover:bg-purple-500/15 text-purple-400 hover:text-purple-300"
										: "hover:bg-yellow-400/10 text-yellow-400/70 hover:text-yellow-300"
								}`}
								title="Mover adelante"
							>
								<ChevronRight className="h-3.5 w-3.5" />
							</button>
						)}
						<button
							type="button"
							onClick={onEditTask}
							className={`p-1 rounded-lg ml-0.5 transition ${
								isRitual
									? "hover:bg-purple-500/15 text-purple-400 hover:text-purple-300"
									: "hover:bg-yellow-400/10 text-yellow-400/70 hover:text-yellow-300"
							}`}
							title="Editar"
						>
							<Edit className="h-3.5 w-3.5" />
						</button>
						<button
							type="button"
							onClick={onDeleteTask}
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
}
