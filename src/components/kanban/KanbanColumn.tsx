import { CheckCircle, Clock, Plus, Zap } from "lucide-react";
import { useRef, useState } from "react";
import type { Project, Task } from "../../types/kanban";
import ShockwaveWrapper from "./ShockwaveWrapper";
import TaskCard from "./TaskCard";

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
	isDraggingFromOtherColumn: boolean;
	onDragOver: (e: React.DragEvent) => void;
	onDrop: () => void;
	onAddCard: () => void;
	onDragStart: (id: string) => void;
	onDragEnd: () => void;
	onFocusClick: (id: string) => void;
	onMoveTask: (id: string, direction: "forward" | "backward") => void;
	onEditTask: (task: Task) => void;
	onDeleteTask: (id: string, e: React.MouseEvent) => void;
	onCompleteTask: (id: string, e: React.MouseEvent) => void;
}

const COLUMN_OVERLAY_THEME = {
	pendiente: {
		Icon: Clock,
		containerRing:
			"border-purple-400/90 shadow-[0_0_0_2px_rgba(192,132,252,0.3),0_0_40px_rgba(192,132,252,0.18)]",
		draggingHint: "border-dashed border-purple-400/55",
		overlayBorder: "border-purple-400/80",
		badge:
			"border-purple-400/50 bg-purple-400/15 text-purple-300 shadow-[0_0_32px_rgba(192,132,252,0.32)]",
		title: "text-purple-300",
	},
	"en-proceso": {
		Icon: Zap,
		containerRing:
			"border-yellow-400/90 shadow-[0_0_0_2px_rgba(250,204,21,0.3),0_0_40px_rgba(250,204,21,0.18)]",
		draggingHint: "border-dashed border-yellow-400/55",
		overlayBorder: "border-yellow-400/80",
		badge:
			"border-yellow-400/50 bg-yellow-400/15 text-yellow-300 shadow-[0_0_32px_rgba(250,204,21,0.32)]",
		title: "text-yellow-300",
	},
	finalizado: {
		Icon: CheckCircle,
		containerRing:
			"border-emerald-400/90 shadow-[0_0_0_2px_rgba(52,211,153,0.3),0_0_40px_rgba(52,211,153,0.18)]",
		draggingHint: "border-dashed border-emerald-400/55",
		overlayBorder: "border-emerald-400/80",
		badge:
			"border-emerald-400/50 bg-emerald-400/15 text-emerald-300 shadow-[0_0_32px_rgba(52,211,153,0.32)]",
		title: "text-emerald-300",
	},
} as const;

export default function KanbanColumn({
	column: col,
	tasks: colTasks,
	projects,
	currentProjectId,
	isDraggingFromOtherColumn,
	onDragOver,
	onDrop,
	onAddCard,
	onDragStart,
	onDragEnd,
	onFocusClick,
	onMoveTask,
	onEditTask,
	onDeleteTask,
	onCompleteTask,
}: KanbanColumnProps) {
	const [isDragOver, setIsDragOver] = useState(false);
	const dragDepthRef = useRef(0);

	const showDropOverlay = isDragOver && isDraggingFromOtherColumn;
	const overlayTheme =
		COLUMN_OVERLAY_THEME[col.id as keyof typeof COLUMN_OVERLAY_THEME] ??
		COLUMN_OVERLAY_THEME["en-proceso"];
	const OverlayIcon = overlayTheme.Icon;

	const handleDragEnter = (e: React.DragEvent) => {
		if (!isDraggingFromOtherColumn) return;
		e.preventDefault();
		dragDepthRef.current += 1;
		setIsDragOver(true);
	};

	const handleColumnDragOver = (e: React.DragEvent) => {
		onDragOver(e);
		if (isDraggingFromOtherColumn && !isDragOver) {
			setIsDragOver(true);
		}
	};

	const handleDragLeave = () => {
		if (!isDraggingFromOtherColumn) {
			dragDepthRef.current = 0;
			setIsDragOver(false);
			return;
		}
		dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
		if (dragDepthRef.current === 0) {
			setIsDragOver(false);
		}
	};

	const handleColumnDrop = (e: React.DragEvent) => {
		e.preventDefault();
		dragDepthRef.current = 0;
		setIsDragOver(false);
		onDrop();
	};

	return (
		/* biome-ignore lint/a11y/noStaticElementInteractions: drag-and-drop columns container */
		<div
			data-kanban-column
			onDragEnter={handleDragEnter}
			onDragOver={handleColumnDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleColumnDrop}
			className={`relative overflow-hidden flex flex-col rounded-3xl border bg-[var(--surface-strong)]/75 backdrop-blur-sm p-5 shadow-sm dot-grid min-h-[520px] lg:min-h-[calc(100vh-9.5rem)] w-full transition-[border-color,box-shadow] duration-200 ${
				showDropOverlay
					? overlayTheme.containerRing
					: isDraggingFromOtherColumn
						? overlayTheme.draggingHint
						: "border-[var(--line)]"
			}`}
		>
			{/* Interactive Drop Overlay when dragging a task from another column */}
			{showDropOverlay && (
				<div
					className={`pointer-events-none absolute inset-3 z-30 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed ${overlayTheme.overlayBorder} bg-slate-950/70 px-4 text-center backdrop-blur-md`}
				>
					<div
						className={`mb-4 flex h-18 w-18 items-center justify-center rounded-full border ${overlayTheme.badge}`}
					>
						<OverlayIcon className="h-9 w-9" />
					</div>
					<p
						className={`display-title m-0 text-xl sm:text-2xl font-black tracking-tight ${overlayTheme.title}`}
					>
						Mover a {col.title}
					</p>
				</div>
			)}

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
						const projectOfTask = projects.find((p) => p.id === task.projectId);

						return (
							<ShockwaveWrapper key={task.id} id={task.id}>
								<TaskCard
									task={task}
									projectOfTask={projectOfTask}
									currentProjectId={currentProjectId}
									colId={col.id}
									onDragStart={() => onDragStart(task.id)}
									onDragEnd={onDragEnd}
									onFocusClick={() => onFocusClick(task.id)}
									onMoveTask={(dir) => onMoveTask(task.id, dir)}
									onEditTask={() => onEditTask(task)}
									onDeleteTask={(e) => onDeleteTask(task.id, e)}
									onCompleteTask={(e) => onCompleteTask(task.id, e)}
								/>
							</ShockwaveWrapper>
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
