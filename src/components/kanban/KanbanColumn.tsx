import { CheckCircle, Plus } from "lucide-react";
import TaskCard from "./TaskCard";
import type { Project, Task } from "../../types/kanban";

interface ColumnConfig {
	readonly id: string;
	readonly title: string;
	readonly subtitle: string;
	readonly color: string;
}

interface KanbanColumnProps {
	column: ColumnConfig;
	tasks: Task[];
	projects: Project[];
	currentProjectId: string;
	onDragOver: (e: React.DragEvent) => void;
	onDrop: () => void;
	onAddCard: () => void;
	onDragStart: (id: string) => void;
	onFocusClick: (id: string) => void;
	onMoveTask: (id: string, direction: "forward" | "backward") => void;
	onEditTask: (task: Task) => void;
	onDeleteTask: (id: string) => void;
}

export default function KanbanColumn({
	column: col,
	tasks: colTasks,
	projects,
	currentProjectId,
	onDragOver,
	onDrop,
	onAddCard,
	onDragStart,
	onFocusClick,
	onMoveTask,
	onEditTask,
	onDeleteTask,
}: KanbanColumnProps) {
	return (
		/* biome-ignore lint/a11y/noStaticElementInteractions: drag-and-drop columns container */
		<div
			onDragOver={onDragOver}
			onDrop={onDrop}
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
				onClick={onAddCard}
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
								onDragStart={() => onDragStart(task.id)}
								onFocusClick={() => onFocusClick(task.id)}
								onMoveTask={(dir) => onMoveTask(task.id, dir)}
								onEditTask={() => onEditTask(task)}
								onDeleteTask={() => onDeleteTask(task.id)}
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
}
