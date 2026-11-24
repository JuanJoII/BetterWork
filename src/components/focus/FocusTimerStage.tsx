import { Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	CheckCircle,
	Clock,
	Pause,
	Play,
	RotateCcw,
	SkipForward,
	Target,
	X,
} from "lucide-react";
import { useRef, useState } from "react";
import type { Project, Task } from "../../types/kanban";
import ProjectIcon from "../kanban/ProjectIcon";

interface FocusTimerStageProps {
	activeTask: Task | null;
	activeProject?: Project;
	isDraggingTask: boolean;
	timerDuration: number;
	secondsRemaining: number;
	timerRunning: boolean;
	completedSessions: number;
	onDropTask: (taskId: string) => void;
	onClearActiveTask: () => void;
	onMarkFinished: (task: Task) => void;
	onChangeDuration: (minutes: number) => void;
	onToggleRunning: () => void;
	onResetTimer: () => void;
	onSkipTimer: () => void;
}

const DURATION_PRESETS = [25, 45, 60] as const;

export default function FocusTimerStage({
	activeTask,
	activeProject,
	isDraggingTask,
	timerDuration,
	secondsRemaining,
	timerRunning,
	completedSessions,
	onDropTask,
	onClearActiveTask,
	onMarkFinished,
	onChangeDuration,
	onToggleRunning,
	onResetTimer,
	onSkipTimer,
}: FocusTimerStageProps) {
	const [isDragOver, setIsDragOver] = useState(false);
	const dragDepthRef = useRef(0);

	const formatTime = (secs: number) => {
		const mins = Math.floor(secs / 60);
		const rem = secs % 60;
		return `${mins.toString().padStart(2, "0")}:${rem.toString().padStart(2, "0")}`;
	};

	const circleRadius = 78;
	const circleCircumference = 2 * Math.PI * circleRadius;
	const progressPercentage = (secondsRemaining / (timerDuration * 60)) * 100;
	const strokeDashoffset =
		circleCircumference - (progressPercentage / 100) * circleCircumference;

	const handleDragEnter = (e: React.DragEvent<HTMLElement>) => {
		e.preventDefault();
		dragDepthRef.current += 1;
		setIsDragOver(true);
	};

	const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
	};

	const handleDragLeave = () => {
		dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
		if (dragDepthRef.current === 0) {
			setIsDragOver(false);
		}
	};

	const handleDrop = (e: React.DragEvent<HTMLElement>) => {
		e.preventDefault();
		dragDepthRef.current = 0;
		setIsDragOver(false);
		const droppedId = e.dataTransfer.getData("text/plain");
		onDropTask(droppedId);
	};

	const isDaily = !!activeTask?.isRitual;

	return (
		<section
			data-focus-panel
			aria-label="Zona de temporizador Focus"
			onDragEnter={handleDragEnter}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			className={`island-shell dot-grid relative flex flex-1 min-w-0 w-full flex-col justify-between overflow-hidden rounded-3xl border p-6 sm:p-8 lg:min-h-[calc(100vh-9.5rem)] transition-all duration-300 ${
				isDragOver
					? "border-yellow-400/90 shadow-[0_0_0_2px_rgba(250,204,21,0.35),0_0_45px_rgba(250,204,21,0.18)]"
					: isDraggingTask
						? "border-dashed border-yellow-400/55"
						: "border-[var(--line)]"
			}`}
		>
			{/* Subtle ambient glows */}
			<div className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(234,179,8,0.12),transparent_65%)]" />
			<div className="pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.16),transparent_65%)]" />

			{/* Interactive Drop Overlay when dragging over the timer stage */}
			{isDragOver && (
				<div className="pointer-events-none absolute inset-3 z-30 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-yellow-400/80 bg-slate-950/75 backdrop-blur-xs">
					<div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-yellow-400/50 bg-yellow-400/15 text-yellow-300 shadow-[0_0_30px_rgba(250,204,21,0.28)]">
						<Target className="h-7 w-7" />
					</div>
					<p className="display-title m-0 text-lg font-black text-yellow-300">
						Suelta la nota aquí
					</p>
					<span className="mt-1 text-xs font-semibold text-slate-300">
						Se cargará en el temporizador para iniciar Focus
					</span>
				</div>
			)}

			{/* Top Header Row */}
			<div className="relative z-10 mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
				<div className="flex items-center gap-2.5">
					<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-400/12 text-yellow-300 border border-yellow-400/25">
						<Clock className="h-5 w-5" />
					</div>
					<div>
						<span className="island-kicker block text-[10px]">
							Sesión Activa
						</span>
						<h1 className="display-title m-0 text-lg font-black text-[var(--sea-ink)]">
							Focus
						</h1>
					</div>
				</div>

				<Link
					to="/"
					className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-3.5 py-1.5 text-xs font-bold text-[var(--sea-ink-soft)] hover:border-yellow-400/45 hover:text-[var(--sea-ink)] transition no-underline"
				>
					<ArrowLeft className="h-3.5 w-3.5" />
					<span>Tablero</span>
				</Link>
			</div>

			{/* Center Content: Active Task Card + Timer */}
			<div className="relative z-10 flex flex-1 flex-col items-center justify-center py-2">
				{activeTask ? (
					<div className="flex w-full flex-col items-center text-center">
						{/* Active Sticky Note Card */}
						<div
							data-active-focus-card
							className={`relative mb-8 w-full max-w-md rounded-2xl border p-5 text-left shadow-sm transition-colors ${
								isDaily
									? "border-purple-500/35 bg-purple-950/25 text-purple-100/90"
									: "border-yellow-500/25 bg-yellow-950/25 text-yellow-100/90"
							}`}
						>
							{/* Tech-tape overlay */}
							<div
								className={`absolute -top-2.5 left-1/2 -translate-x-1/2 h-4.5 w-14 border-x shadow-sm backdrop-blur-[2px] ${
									isDaily
										? "bg-purple-500/20 border-purple-400/40"
										: "bg-yellow-400/10 border-yellow-400/30"
								}`}
							/>

							<div className="mb-2.5 flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-wider">
								<span
									className={isDaily ? "text-purple-400" : "text-yellow-400/80"}
								>
									{isDaily
										? "Hábito Diario"
										: `Prioridad ${activeTask.priority}`}
								</span>

								<div className="flex items-center gap-1.5">
									{isDaily ? (
										<span className="rounded border border-purple-500/40 bg-purple-500/20 px-2 py-0.5 text-purple-300 font-black">
											DAILY
										</span>
									) : (
										activeTask.priority === "high" && (
											<span className="rounded border border-red-500/25 bg-red-500/10 px-2 py-0.5 text-red-400 font-black">
												URGENTE
											</span>
										)
									)}
									<button
										type="button"
										onClick={onClearActiveTask}
										aria-label="Quitar tarea del temporizador"
										title="Cambiar tarea"
										className="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-slate-100 cursor-pointer"
									>
										<X className="h-3.5 w-3.5" />
									</button>
								</div>
							</div>

							<h2
								className={`m-0 text-base font-black leading-snug ${
									isDaily ? "text-purple-300" : "text-yellow-400"
								}`}
							>
								{activeTask.title}
							</h2>

							{activeTask.description && (
								<p className="mt-1.5 mb-0 text-xs leading-relaxed text-slate-300 opacity-85 font-medium">
									{activeTask.description}
								</p>
							)}

							<div className="mt-3.5 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
								{activeProject ? (
									<span
										className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${
											isDaily ? "text-purple-300/80" : "text-yellow-500/80"
										}`}
									>
										{activeProject.icon ? (
											<ProjectIcon
												icon={activeProject.icon}
												className="h-3 w-3"
												emojiClassName="text-xs leading-none"
											/>
										) : (
											<span aria-hidden="true">📁</span>
										)}
										<span>{activeProject.name}</span>
									</span>
								) : (
									<span />
								)}

								{activeTask.column === "finalizado" ? (
									<span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-400">
										<CheckCircle className="h-3.5 w-3.5" />
										Finalizada
									</span>
								) : (
									<button
										type="button"
										onClick={() => onMarkFinished(activeTask)}
										className="inline-flex items-center gap-1 rounded-full border border-emerald-400/35 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black text-emerald-300 transition hover:bg-emerald-500/20 cursor-pointer"
									>
										<CheckCircle className="h-3 w-3" />
										<span>Mover a Finalizado</span>
									</button>
								)}
							</div>
						</div>

						{/* Circular SVG Timer */}
						<div className="relative mb-8 flex items-center justify-center">
							<svg className="h-48 w-48 rotate-[-90deg]" role="presentation">
								<title>Progreso del Temporizador</title>
								<circle
									cx="96"
									cy="96"
									r={circleRadius}
									className="stroke-[var(--line)] fill-none"
									strokeWidth="6"
								/>
								<circle
									cx="96"
									cy="96"
									r={circleRadius}
									className="stroke-[#eab308] fill-none transition-all duration-300"
									strokeWidth="7"
									strokeDasharray={circleCircumference}
									strokeDashoffset={strokeDashoffset}
									strokeLinecap="round"
								/>
							</svg>
							<div className="absolute flex flex-col items-center">
								<span className="font-mono text-4xl font-black tracking-tight tabular-nums text-[var(--sea-ink)]">
									{formatTime(secondsRemaining)}
								</span>
								<span className="mt-1 text-[10px] font-black uppercase tracking-widest text-yellow-400/80">
									{timerRunning ? "En curso" : "Listo"}
								</span>
							</div>
						</div>

						{/* Timer Controls */}
						<div className="flex w-full flex-col items-center gap-5">
							{/* Duration presets */}
							<div className="flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--bg-base)]/80 p-1">
								{DURATION_PRESETS.map((mins) => (
									<button
										key={mins}
										type="button"
										onClick={() => onChangeDuration(mins)}
										disabled={timerRunning}
										className={`rounded-full px-4 py-1.5 text-xs font-extrabold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
											timerDuration === mins
												? "bg-yellow-300 text-slate-950 shadow-sm"
												: "text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
										}`}
									>
										{mins} min
									</button>
								))}
							</div>

							{/* Primary playback controls */}
							<div className="flex items-center gap-3">
								<button
									type="button"
									onClick={onToggleRunning}
									className={`flex h-12 min-w-36 items-center justify-center gap-2 rounded-full px-6 text-sm font-black transition-all active:scale-95 shadow-md cursor-pointer ${
										timerRunning
											? "bg-amber-500 text-slate-950 hover:bg-amber-400"
											: "bg-yellow-300 text-slate-950 hover:bg-yellow-200 shadow-yellow-500/20"
									}`}
								>
									{timerRunning ? (
										<Pause className="h-4.5 w-4.5" />
									) : (
										<Play className="h-4.5 w-4.5" />
									)}
									<span>{timerRunning ? "Pausar" : "Comenzar"}</span>
								</button>

								<button
									type="button"
									onClick={onResetTimer}
									className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-strong)] text-[var(--sea-ink-soft)] hover:border-yellow-400/40 hover:text-[var(--sea-ink)] transition-colors cursor-pointer"
									title="Reiniciar"
									aria-label="Reiniciar temporizador"
								>
									<RotateCcw className="h-4.5 w-4.5" />
								</button>

								<button
									type="button"
									onClick={onSkipTimer}
									className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-strong)] text-[var(--sea-ink-soft)] hover:border-yellow-400/40 hover:text-[var(--sea-ink)] transition-colors cursor-pointer"
									title="Finalizar sesión ahora"
									aria-label="Finalizar sesión ahora"
								>
									<SkipForward className="h-4.5 w-4.5" />
								</button>
							</div>
						</div>
					</div>
				) : (
					/* Empty Drop-Zone Invitation */
					<div className="flex w-full max-w-md flex-col items-center justify-center rounded-3xl border-2 border-dashed border-yellow-500/25 bg-slate-950/35 px-8 py-14 text-center">
						<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-400/30 bg-yellow-400/10 text-yellow-300">
							<Target className="h-7 w-7" />
						</div>
						<h2 className="display-title m-0 text-lg font-black text-[var(--sea-ink)]">
							Arrastra una tarea aquí
						</h2>
						<p className="mt-2 mb-0 text-xs leading-relaxed font-medium text-[var(--sea-ink-soft)]">
							Toma cualquier nota del panel izquierdo y suéltala en este espacio
							(o haz clic sobre ella) para iniciar tu cronómetro de Focus.
						</p>
					</div>
				)}
			</div>

			{/* Footer Stats */}
			<div className="relative z-10 mt-6 flex flex-wrap items-center justify-center gap-3 border-t border-[var(--line)] pt-4 text-xs font-bold text-[var(--sea-ink-soft)]">
				<span>Sesiones completadas: {completedSessions}</span>
				<span aria-hidden="true">•</span>
				<span>Tiempo enfocado: {completedSessions * timerDuration} min</span>
			</div>
		</section>
	);
}
