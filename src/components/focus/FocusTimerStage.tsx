import {
	Check,
	CheckCircle,
	Hourglass,
	Pause,
	Play,
	Plus,
	RotateCcw,
	Target,
	Timer,
	X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Project, Task } from "../../types/kanban";
import GradientText from "../GradientText";
import ProjectIcon from "../kanban/ProjectIcon";
import LiquidGlassBackground from "./LiquidGlassBackground";

export type FocusClockMode = "timer" | "stopwatch";

interface FocusTimerStageProps {
	activeTask: Task | null;
	activeProject?: Project;
	isDraggingTask: boolean;
	clockMode: FocusClockMode;
	timerDuration: number;
	secondsRemaining: number;
	elapsedSeconds: number;
	timerRunning: boolean;
	completedSessions: number;
	totalFocusedSeconds: number;
	onDropTask: (taskId: string) => void;
	onClearActiveTask: () => void;
	onMarkFinished: (task: Task) => void;
	onChangeClockMode: (mode: FocusClockMode) => void;
	onChangeDuration: (minutes: number) => void;
	onToggleRunning: () => void;
	onResetTimer: () => void;
	onFinishSession: () => void;
}

const DURATION_PRESETS = [25, 45, 60] as const;

function formatClock(secs: number): string {
	const safeSecs = Math.max(0, Math.floor(secs));
	const hours = Math.floor(safeSecs / 3600);
	const mins = Math.floor((safeSecs % 3600) / 60);
	const rem = safeSecs % 60;
	if (hours > 0) {
		return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${rem.toString().padStart(2, "0")}`;
	}
	return `${mins.toString().padStart(2, "0")}:${rem.toString().padStart(2, "0")}`;
}

function formatFocusedTotal(totalSeconds: number): string {
	const safeSecs = Math.max(0, Math.floor(totalSeconds));
	if (safeSecs === 0) return "0 min";
	if (safeSecs < 60) return `${safeSecs} s`;
	const hours = Math.floor(safeSecs / 3600);
	const mins = Math.floor((safeSecs % 3600) / 60);
	const rem = safeSecs % 60;
	if (hours > 0) {
		return mins > 0 ? `${hours} h ${mins} min` : `${hours} h`;
	}
	return rem > 0 ? `${mins} min ${rem} s` : `${mins} min`;
}

export default function FocusTimerStage({
	activeTask,
	activeProject,
	isDraggingTask,
	clockMode,
	timerDuration,
	secondsRemaining,
	elapsedSeconds,
	timerRunning,
	completedSessions,
	totalFocusedSeconds,
	onDropTask,
	onClearActiveTask,
	onMarkFinished,
	onChangeClockMode,
	onChangeDuration,
	onToggleRunning,
	onResetTimer,
	onFinishSession,
}: FocusTimerStageProps) {
	const [isDragOver, setIsDragOver] = useState(false);
	const [isCustomOpen, setIsCustomOpen] = useState(false);
	const [customMinutesInput, setCustomMinutesInput] = useState("");
	const dragDepthRef = useRef(0);
	const customInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isCustomOpen && !timerRunning) {
			customInputRef.current?.focus();
		}
	}, [isCustomOpen, timerRunning]);

	const isStopwatch = clockMode === "stopwatch";
	const displayedSeconds = isStopwatch ? elapsedSeconds : secondsRemaining;
	const hasHours = displayedSeconds >= 3600;
	const hasProgress = isStopwatch
		? elapsedSeconds > 0
		: secondsRemaining < timerDuration * 60;
	const isCustomDurationActive = !DURATION_PRESETS.includes(
		timerDuration as (typeof DURATION_PRESETS)[number],
	);
	const showDragOver = isDragOver && !timerRunning;
	const showDraggingHint = isDraggingTask && !timerRunning;
	const showCustomEditor = isCustomOpen && !timerRunning;

	const circleRadius = 78;
	const circleCircumference = 2 * Math.PI * circleRadius;
	const progressRatio = isStopwatch
		? elapsedSeconds === 0
			? 0
			: (elapsedSeconds % 60) / 60 || 1
		: secondsRemaining / (timerDuration * 60);
	const strokeDashoffset =
		circleCircumference - progressRatio * circleCircumference;
	const skipRingTransition = isStopwatch && elapsedSeconds % 60 === 1;

	const handleDragEnter = (e: React.DragEvent<HTMLElement>) => {
		if (timerRunning) return;
		e.preventDefault();
		dragDepthRef.current += 1;
		setIsDragOver(true);
	};

	const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
		if (timerRunning) return;
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
	};

	const handleDragLeave = () => {
		if (timerRunning) {
			dragDepthRef.current = 0;
			setIsDragOver(false);
			return;
		}
		dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
		if (dragDepthRef.current === 0) {
			setIsDragOver(false);
		}
	};

	const handleDrop = (e: React.DragEvent<HTMLElement>) => {
		dragDepthRef.current = 0;
		setIsDragOver(false);
		if (timerRunning) return;
		e.preventDefault();
		const droppedId = e.dataTransfer.getData("text/plain");
		onDropTask(droppedId);
	};

	const handleOpenCustomDuration = () => {
		if (timerRunning) return;
		setCustomMinutesInput(isCustomDurationActive ? String(timerDuration) : "");
		setIsCustomOpen(true);
	};

	const handleCustomDurationSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const parsed = Number.parseInt(customMinutesInput.trim(), 10);
		if (Number.isNaN(parsed) || parsed < 1) return;
		onChangeDuration(Math.min(180, parsed));
		setIsCustomOpen(false);
	};

	const isDaily = !!activeTask?.isRitual;
	const headerTitle = activeTask
		? `Focus en ${activeTask.title}`
		: "Focus en ...";

	const statusLabel = timerRunning
		? isStopwatch
			? "Cronometrando"
			: "En curso"
		: hasProgress
			? "En pausa"
			: "Listo";

	const primaryButtonLabel = timerRunning
		? "Pausar"
		: hasProgress
			? "Reanudar"
			: "Comenzar";

	return (
		<section
			data-focus-panel
			aria-label="Zona de temporizador Focus"
			onDragEnter={handleDragEnter}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			className={`relative flex flex-1 min-w-0 w-full flex-col justify-between overflow-hidden rounded-3xl border bg-slate-950/30 p-6 sm:p-8 lg:min-h-[calc(100vh-9.5rem)] backdrop-blur-2xl backdrop-saturate-150 transition-[border-color,box-shadow] duration-300 ${
				showDragOver
					? "border-yellow-400/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.28),0_0_0_2px_rgba(250,204,21,0.35),0_0_50px_rgba(250,204,21,0.22)]"
					: showDraggingHint
						? "border-dashed border-yellow-400/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_24px_60px_rgba(2,6,23,0.5)]"
						: "border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),inset_0_-1px_1px_rgba(192,132,252,0.12),0_24px_60px_rgba(2,6,23,0.55)]"
			}`}
		>
			<LiquidGlassBackground />

			{/* Interactive Drop Overlay when dragging over the timer stage */}
			{showDragOver && (
				<div className="pointer-events-none absolute inset-3 z-30 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-yellow-400/80 bg-slate-950/70 backdrop-blur-md">
					<div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-yellow-400/50 bg-yellow-400/15 text-yellow-300 shadow-[0_0_36px_rgba(250,204,21,0.32)]">
						<Target className="h-10 w-10" />
					</div>
					<p className="display-title m-0 text-2xl sm:text-3xl font-black tracking-tight text-yellow-300">
						Suelta la nota aquí
					</p>
				</div>
			)}

			{/* Minimal GradientText Header */}
			<header className="relative z-10 mb-6 flex items-center justify-center border-b border-white/10 pb-5 text-center">
				<GradientText
					colors={["#fde047", "#c084fc", "#ec4899", "#facc15"]}
					animationSpeed={7}
					showBorder={false}
					className="text-2xl sm:text-3xl font-black tracking-tight leading-tight max-w-full cursor-default backdrop-blur-none"
				>
					<h1 className="m-0 font-serif font-black px-2">{headerTitle}</h1>
				</GradientText>
			</header>

			{/* Center Content: Active Task Card + Mode Switcher + Clock */}
			<div className="relative z-10 flex flex-1 flex-col items-center justify-center py-2">
				{activeTask ? (
					<div className="flex w-full flex-col items-center text-center">
						{/* Active Sticky Note Card */}
						<div
							data-active-focus-card
							className={`relative mb-6 w-full max-w-md rounded-2xl border p-5 text-left shadow-sm backdrop-blur-md transition-colors ${
								isDaily
									? "border-purple-500/35 bg-purple-950/30 text-purple-100/90"
									: "border-yellow-500/25 bg-yellow-950/30 text-yellow-100/90"
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
										disabled={timerRunning}
										aria-label="Quitar tarea del temporizador"
										title={
											timerRunning
												? "Pausa el reloj para cambiar de tarea"
												: "Cambiar tarea"
										}
										className="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-slate-100 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400"
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

						{/* Mode Switcher: Temporizador vs Cronómetro */}
						<div
							role="tablist"
							aria-label="Modo de tiempo"
							className="mb-6 inline-flex items-center gap-1 rounded-full border border-white/12 bg-slate-950/50 p-1 backdrop-blur-md"
						>
							<button
								type="button"
								role="tab"
								aria-selected={!isStopwatch}
								disabled={timerRunning}
								title={
									timerRunning
										? "Pausa para cambiar de modo"
										: "Cuenta regresiva con duración fija"
								}
								onClick={() => onChangeClockMode("timer")}
								className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-extrabold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
									!isStopwatch
										? "bg-yellow-300 text-slate-950 shadow-sm"
										: "text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
								}`}
							>
								<Hourglass className="h-3.5 w-3.5" />
								<span>Temporizador</span>
							</button>
							<button
								type="button"
								role="tab"
								aria-selected={isStopwatch}
								disabled={timerRunning}
								title={
									timerRunning
										? "Pausa para cambiar de modo"
										: "Cuenta ascendente de tiempo libre"
								}
								onClick={() => onChangeClockMode("stopwatch")}
								className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-extrabold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
									isStopwatch
										? "bg-purple-400 text-slate-950 shadow-sm"
										: "text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
								}`}
							>
								<Timer className="h-3.5 w-3.5" />
								<span>Cronómetro</span>
							</button>
						</div>

						{/* Circular SVG Clock */}
						<div className="relative mb-6 flex items-center justify-center">
							<svg className="h-48 w-48 rotate-[-90deg]" role="presentation">
								<title>
									{isStopwatch
										? "Progreso del Cronómetro"
										: "Progreso del Temporizador"}
								</title>
								<circle
									cx="96"
									cy="96"
									r={circleRadius}
									className="stroke-white/12 fill-none"
									strokeWidth="6"
								/>
								<circle
									cx="96"
									cy="96"
									r={circleRadius}
									className={`fill-none ${
										isStopwatch ? "stroke-purple-400" : "stroke-[#eab308]"
									} ${
										skipRingTransition
											? "transition-none"
											: "transition-[stroke-dashoffset,stroke] duration-300"
									}`}
									strokeWidth="7"
									strokeDasharray={circleCircumference}
									strokeDashoffset={strokeDashoffset}
									strokeLinecap="round"
								/>
							</svg>
							<div className="absolute flex flex-col items-center">
								<span
									className={`font-mono font-black tracking-tight tabular-nums text-[var(--sea-ink)] ${
										hasHours ? "text-3xl" : "text-4xl"
									}`}
								>
									{formatClock(displayedSeconds)}
								</span>
								<span
									className={`mt-1 text-[10px] font-black uppercase tracking-widest ${
										isStopwatch ? "text-purple-300/90" : "text-yellow-400/85"
									}`}
								>
									{statusLabel}
								</span>
							</div>
						</div>

						{/* Clock Controls */}
						<div className="flex w-full flex-col items-center gap-4">
							{/* Duration presets + custom duration (Timer mode only) */}
							{!isStopwatch && (
								<div className="flex flex-wrap items-center justify-center gap-1 rounded-full border border-white/12 bg-slate-950/50 p-1 backdrop-blur-md">
									{DURATION_PRESETS.map((mins) => (
										<button
											key={mins}
											type="button"
											onClick={() => {
												setIsCustomOpen(false);
												onChangeDuration(mins);
											}}
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

									{isCustomDurationActive && !showCustomEditor && (
										<button
											type="button"
											onClick={handleOpenCustomDuration}
											disabled={timerRunning}
											title="Editar tiempo personalizado"
											className="rounded-full bg-yellow-300 px-4 py-1.5 text-xs font-extrabold text-slate-950 shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
										>
											{timerDuration} min
										</button>
									)}

									{showCustomEditor ? (
										<form
											onSubmit={handleCustomDurationSubmit}
											className="inline-flex items-center gap-1 pl-1"
										>
											<input
												ref={customInputRef}
												type="number"
												min={1}
												max={180}
												inputMode="numeric"
												aria-label="Minutos personalizados"
												placeholder="min"
												value={customMinutesInput}
												onChange={(e) => setCustomMinutesInput(e.target.value)}
												onKeyDown={(e) => {
													if (e.key === "Escape") {
														setIsCustomOpen(false);
													}
												}}
												className="w-14 rounded-full border border-yellow-400/50 bg-slate-900/90 px-2.5 py-1 text-center font-mono text-xs font-black text-yellow-200 outline-none focus:border-yellow-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
											/>
											<button
												type="submit"
												aria-label="Aplicar tiempo personalizado"
												title="Aplicar"
												className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-300 text-slate-950 transition hover:bg-yellow-200 cursor-pointer"
											>
												<Check className="h-3.5 w-3.5" />
											</button>
											<button
												type="button"
												onClick={() => setIsCustomOpen(false)}
												aria-label="Cancelar tiempo personalizado"
												title="Cancelar"
												className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-slate-100 cursor-pointer"
											>
												<X className="h-3.5 w-3.5" />
											</button>
										</form>
									) : (
										<button
											type="button"
											onClick={handleOpenCustomDuration}
											disabled={timerRunning}
											aria-label="Tiempo personalizado"
											title="Tiempo personalizado (1 a 180 min)"
											className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--sea-ink-soft)] transition-all hover:bg-white/10 hover:text-yellow-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
										>
											<Plus className="h-3.5 w-3.5" />
										</button>
									)}
								</div>
							)}

							{/* Primary playback controls */}
							<div className="flex items-center gap-3">
								<button
									type="button"
									onClick={onToggleRunning}
									className={`flex h-12 min-w-36 items-center justify-center gap-2 rounded-full px-6 text-sm font-black transition-all active:scale-95 shadow-md cursor-pointer ${
										timerRunning
											? "bg-amber-500 text-slate-950 hover:bg-amber-400"
											: isStopwatch
												? "bg-purple-400 text-slate-950 hover:bg-purple-300 shadow-purple-500/25"
												: "bg-yellow-300 text-slate-950 hover:bg-yellow-200 shadow-yellow-500/20"
									}`}
								>
									{timerRunning ? (
										<Pause className="h-4.5 w-4.5" />
									) : (
										<Play className="h-4.5 w-4.5" />
									)}
									<span>{primaryButtonLabel}</span>
								</button>

								<button
									type="button"
									onClick={onResetTimer}
									className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[var(--sea-ink-soft)] hover:border-yellow-400/45 hover:bg-white/10 hover:text-[var(--sea-ink)] transition-colors cursor-pointer backdrop-blur-md"
									title={isStopwatch ? "Reiniciar cronómetro" : "Reiniciar"}
									aria-label={
										isStopwatch
											? "Reiniciar cronómetro"
											: "Reiniciar temporizador"
									}
								>
									<RotateCcw className="h-4.5 w-4.5" />
								</button>

								<button
									type="button"
									onClick={onFinishSession}
									disabled={isStopwatch && elapsedSeconds === 0}
									className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[var(--sea-ink-soft)] hover:border-emerald-400/50 hover:bg-emerald-500/15 hover:text-emerald-300 transition-colors cursor-pointer backdrop-blur-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-white/15 disabled:hover:bg-white/5 disabled:hover:text-[var(--sea-ink-soft)]"
									title="Finalizar y registrar sesión"
									aria-label="Finalizar sesión ahora"
								>
									<Check className="h-4.5 w-4.5" />
								</button>
							</div>
						</div>
					</div>
				) : (
					/* Empty Drop-Zone Invitation */
					<div className="flex w-full max-w-md flex-col items-center justify-center rounded-3xl border border-dashed border-white/20 bg-white/[0.03] px-8 py-14 text-center backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
						<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-400/35 bg-yellow-400/12 text-yellow-300 shadow-[0_0_24px_rgba(250,204,21,0.15)]">
							<Target className="h-7 w-7" />
						</div>
						<h2 className="display-title m-0 text-lg font-black text-[var(--sea-ink)]">
							Arrastra una tarea aquí
						</h2>
						<p className="mt-2 mb-0 text-xs leading-relaxed font-medium text-[var(--sea-ink-soft)]">
							Toma cualquier nota del panel izquierdo y suéltala en este espacio
							(o haz clic sobre ella) para iniciar tu sesión de Focus.
						</p>
					</div>
				)}
			</div>

			{/* Footer Stats */}
			<div className="relative z-10 mt-6 flex flex-wrap items-center justify-center gap-3 border-t border-white/10 pt-4 text-xs font-bold text-[var(--sea-ink-soft)]">
				<span>Sesiones completadas: {completedSessions}</span>
				<span aria-hidden="true">•</span>
				<span>Tiempo enfocado: {formatFocusedTotal(totalFocusedSeconds)}</span>
			</div>
		</section>
	);
}
