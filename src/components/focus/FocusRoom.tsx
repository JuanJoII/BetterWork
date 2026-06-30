import { Link } from "@tanstack/react-router";
import {
	AlertCircle,
	ArrowLeft,
	CheckCircle,
	Clock,
	Pause,
	Play,
	RotateCcw,
	SkipForward,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import type { Task } from "../../types/kanban";
import { playCompletionChime } from "../../utils/audio";

export default function FocusRoom() {
	// Load Tasks from Convex
	const convexTasks = useQuery(api.tasks.list);
	const updateColumnMutation = useMutation(api.tasks.updateColumn);

	const tasks = useMemo<Task[]>(() => {
		return (
			convexTasks?.map((t: Doc<"tasks">) => ({
				id: t._id,
				title: t.title,
				description: t.description,
				priority: t.priority as Task["priority"],
				column: t.column as Task["column"],
				projectId: t.projectId,
				isRitual: t.isRitual,
				createdAt: t.createdAt,
			})) || []
		);
	}, [convexTasks]);

	// Load Active Task ID
	const [activeTaskId, setActiveTaskId] = useState<string>(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("kairos_active_task_id");
			if (saved) return saved;
		}
		return "";
	});

	// Timer States
	const [timerDuration, setTimerDuration] = useState<number>(25); // minutes
	const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
	const [timerRunning, setTimerRunning] = useState<boolean>(false);
	const [completedSessions, setCompletedSessions] = useState<number>(0);
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	// Sync active task change
	useEffect(() => {
		localStorage.setItem("kairos_active_task_id", activeTaskId);
	}, [activeTaskId]);

	// Computed Active Task
	const activeTask = useMemo(() => {
		const task = tasks.find((t) => t.id === activeTaskId);
		// Fallback to first non-completed task if not found
		if (!task && tasks.length > 0) {
			const pendingTask = tasks.find((t) => t.column !== "finalizado");
			return pendingTask || tasks[0];
		}
		return task || null;
	}, [tasks, activeTaskId]);

	// Handle active task fallback assignment
	useEffect(() => {
		if (activeTask && activeTask.id !== activeTaskId) {
			setActiveTaskId(activeTask.id);
		}
	}, [activeTask, activeTaskId]);

	// Timer Tick
	useEffect(() => {
		if (timerRunning) {
			timerRef.current = setInterval(() => {
				setSecondsRemaining((prev) => {
					if (prev <= 1) {
						setTimerRunning(false);
						playCompletionChime();
						setCompletedSessions((c) => c + 1);

						// Mark task as Finalizado automatically when Pomodoro finishes
						if (activeTask) {
							updateColumnMutation({
								id: activeTask.id as Id<"tasks">,
								column: "finalizado",
							}).catch((e) => console.error("Error completing task:", e));
						}
						return timerDuration * 60;
					}
					return prev - 1;
				});
			}, 1000);
		} else {
			if (timerRef.current) clearInterval(timerRef.current);
		}

		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [timerRunning, timerDuration, activeTask]);

	// Reset timer on duration change
	useEffect(() => {
		setSecondsRemaining(timerDuration * 60);
		setTimerRunning(false);
	}, [timerDuration]);

	// Dropdown list of eligible focus tasks (exclude completed)
	const focusableTasks = useMemo(() => {
		return tasks.filter((t) => t.column !== "finalizado");
	}, [tasks]);

	// Formatter for MM:SS
	const formatTime = (secs: number) => {
		const mins = Math.floor(secs / 60);
		const rem = secs % 60;
		return `${mins.toString().padStart(2, "0")}:${rem.toString().padStart(2, "0")}`;
	};

	// SVG math
	const circleRadius = 70;
	const circleCircumference = 2 * Math.PI * circleRadius;
	const progressPercentage = (secondsRemaining / (timerDuration * 60)) * 100;
	const strokeDashoffset =
		circleCircumference - (progressPercentage / 100) * circleCircumference;

	return (
		<main className="page-wrap px-4 py-12 max-w-3xl min-h-[85vh] flex flex-col justify-center">
			{/* Back button */}
			<div className="mb-8">
				<Link
					to="/"
					className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-xs font-bold text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] hover:border-[var(--lagoon)] transition no-underline"
				>
					<ArrowLeft className="h-4 w-4" />
					<span>Volver al Tablero</span>
				</Link>
			</div>

			{/* Immersive Focus Room Container */}
			<section className="island-shell relative overflow-hidden rounded-[2.5rem] p-8 sm:p-12 shadow-xl border border-[var(--line)]">
				{/* Decorative backgrounds */}
				<div className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(234,179,8,0.14),transparent_65%)]" />
				<div className="pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.18),transparent_65%)]" />

				<div className="mb-8 flex flex-col items-center justify-between gap-4 border-b border-[var(--line)] pb-6 sm:flex-row">
					<div className="flex items-center gap-2.5">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-[var(--lagoon)]">
							<Clock className="h-5 w-5" />
						</div>
						<div>
							<span className="island-kicker block text-[10px]">
								Deep Work Room
							</span>
							<h2 className="display-title m-0 text-lg font-bold text-[var(--sea-ink)]">
								Focus Room
							</h2>
						</div>
					</div>

					{/* Quick task selector dropdown */}
					<div className="w-full sm:w-auto">
						{focusableTasks.length > 0 ? (
							<select
								id="task-focus-selector"
								value={activeTaskId}
								onChange={(e) => {
									setActiveTaskId(e.target.value);
									setTimerRunning(false);
								}}
								className="demo-select text-xs font-bold w-full sm:w-60 border-[var(--line)] bg-[var(--surface-strong)] py-2"
							>
								{focusableTasks.map((t) => (
									<option key={t.id} value={t.id}>
										[{t.priority.toUpperCase()}] {t.title}
									</option>
								))}
							</select>
						) : (
							<span className="text-xs font-bold text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-1.5">
								No hay tareas pendientes
							</span>
						)}
					</div>
				</div>

				{activeTask ? (
					<div className="flex flex-col items-center text-center">
						{/* Immersive Yellow Style Card */}
						<div className="relative mb-10 w-full max-w-md rounded-2xl border border-yellow-500/20 bg-yellow-950/20 p-6 text-left shadow-[0_12px_28px_rgba(234,179,8,0.02)] text-yellow-100/90">
							{/* Tech-tape overlay */}
							<div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5.5 bg-yellow-400/10 border-x border-yellow-400/30 shadow-sm backdrop-blur-[2px] z-10" />

							<div className="mb-3 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-yellow-900">
								<span className="opacity-75 text-yellow-400/70 font-black">
									Prioridad {activeTask.priority}
								</span>
								{activeTask.priority === "high" && (
									<span className="px-2 py-0.5 rounded border border-red-500/20 bg-red-500/10 text-red-400 font-black">
										URGENTE
									</span>
								)}
							</div>
							<h3 className="text-lg font-black text-yellow-400 leading-snug">
								{activeTask.title}
							</h3>
							<p className="mt-2 text-xs leading-relaxed text-slate-300 opacity-85 font-semibold">
								{activeTask.description}
							</p>

							{activeTask.column === "finalizado" && (
								<div className="mt-4 border-t border-yellow-500/10 pt-3.5 flex items-center justify-end text-[10px] font-bold text-emerald-400">
									<span className="flex items-center gap-1">
										<CheckCircle className="h-3.5 w-3.5" />
										¡Completado!
									</span>
								</div>
							)}
						</div>

						{/* BIG IMMERSIVE TIMER CIRCLE */}
						<div className="relative mb-10 flex items-center justify-center">
							<svg className="h-44 w-44 rotate-[-90deg]" role="presentation">
								<title>Progreso del Temporizador</title>
								<circle
									cx="88"
									cy="88"
									r={circleRadius}
									className="stroke-[var(--line)] fill-none"
									strokeWidth="6"
								/>
								<circle
									cx="88"
									cy="88"
									r={circleRadius}
									className="stroke-[#ca8a04] fill-none transition-all duration-300"
									strokeWidth="7"
									strokeDasharray={circleCircumference}
									strokeDashoffset={strokeDashoffset}
									strokeLinecap="round"
								/>
							</svg>
							<div className="absolute flex flex-col items-center">
								<span className="font-mono text-4xl font-black tracking-tight text-[var(--sea-ink)]">
									{formatTime(secondsRemaining)}
								</span>
								<span className="text-[10px] font-bold uppercase tracking-wider text-[var(--sea-ink-soft)] mt-0.5">
									Deep Focus
								</span>
							</div>
						</div>

						{/* CONTROLS */}
						<div className="flex flex-col items-center gap-5 w-full">
							{/* Duration selections */}
							<div className="flex items-center gap-1 rounded-xl bg-[var(--bg-base)] p-1 border border-[var(--line)]">
								{[25, 45, 60].map((mins) => (
									<button
										key={mins}
										type="button"
										onClick={() => {
											setTimerDuration(mins);
											setSecondsRemaining(mins * 60);
											setTimerRunning(false);
										}}
										disabled={timerRunning}
										className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
											timerDuration === mins
												? "bg-[var(--surface-strong)] text-[var(--sea-ink)] shadow-sm"
												: "text-[var(--sea-ink-soft)] hover:bg-white/40"
										}`}
									>
										{mins} Minutos
									</button>
								))}
							</div>

							{/* Action Buttons */}
							<div className="flex items-center gap-3">
								<button
									type="button"
									onClick={() => setTimerRunning(!timerRunning)}
									className={`flex h-14 w-32 items-center justify-center gap-2 rounded-full font-bold text-white transition-all active:scale-95 shadow-md ${
										timerRunning
											? "bg-amber-600 hover:bg-amber-500"
											: "bg-[#ca8a04] hover:bg-yellow-600 shadow-yellow-500/20"
									}`}
								>
									{timerRunning ? (
										<Pause className="h-5 w-5" />
									) : (
										<Play className="h-5 w-5" />
									)}
									<span>{timerRunning ? "Pausar" : "Comenzar"}</span>
								</button>

								<button
									type="button"
									onClick={() => {
										setTimerRunning(false);
										setSecondsRemaining(timerDuration * 60);
									}}
									className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-strong)] text-[var(--sea-ink-soft)] hover:bg-[var(--bg-base)] transition-colors"
									title="Reiniciar"
								>
									<RotateCcw className="h-5 w-5" />
								</button>

								<button
									type="button"
									onClick={() => {
										setTimerRunning(false);
										setSecondsRemaining(1); // Instantly finishes
									}}
									className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-strong)] text-[var(--sea-ink-soft)] hover:bg-[var(--bg-base)] transition-colors"
									title="Saltar"
								>
									<SkipForward className="h-5 w-5" />
								</button>
							</div>
						</div>

						{/* Session Stats */}
						<div className="mt-8 border-t border-[var(--line)] pt-5 w-full text-xs text-[var(--sea-ink-soft)] font-bold flex items-center justify-center gap-4">
							<span>Sesiones Completadas: {completedSessions}</span>
							<span>•</span>
							<span>Tiempo enfocado: {completedSessions * timerDuration}m</span>
						</div>
					</div>
				) : (
					<div className="flex flex-col items-center justify-center py-16 text-center text-[var(--sea-ink-soft)]">
						<AlertCircle className="mb-3 h-10 w-10 opacity-30 text-purple-400" />
						<p className="text-sm font-semibold max-w-sm">
							No tienes ninguna tarea activa en foco. Ve al tablero principal,
							selecciona una nota y pulsa "Focus" para cargarla.
						</p>
						<Link
							to="/"
							className="mt-4 rounded-xl bg-[var(--lagoon)] px-4 py-2 text-xs font-bold text-white no-underline shadow-sm hover:bg-[var(--lagoon-deep)] transition"
						>
							Ir al Tablero
						</Link>
					</div>
				)}
			</section>
		</main>
	);
}
