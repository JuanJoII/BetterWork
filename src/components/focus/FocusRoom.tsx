import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sileo } from "sileo";
import type { Id } from "../../../convex/_generated/dataModel";
import { useKanbanData } from "../../hooks/useKanbanData";
import type { Task } from "../../types/kanban";
import { playCompletionChime } from "../../utils/audio";
import FocusTaskPanel, { type FocusStatusFilter } from "./FocusTaskPanel";
import FocusTimerStage, { type FocusClockMode } from "./FocusTimerStage";

gsap.registerPlugin(useGSAP);

const ACTIVE_TASK_STORAGE_KEY = "kairos_active_task_id";
const FOCUS_MODE_STORAGE_KEY = "kairos_focus_mode";

export default function FocusRoom() {
	const workspaceRef = useRef<HTMLDivElement>(null);
	const { projects, tasks, updateColumnMutation } = useKanbanData();

	// Search & Filters for left task drawer
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
	const [statusFilter, setStatusFilter] = useState<FocusStatusFilter>("active");

	// Drag state
	const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

	// Active task loaded into the timer
	const [activeTaskId, setActiveTaskId] = useState<string>(() => {
		if (typeof window !== "undefined") {
			return window.localStorage.getItem(ACTIVE_TASK_STORAGE_KEY) || "";
		}
		return "";
	});

	// Clock mode: countdown timer vs count-up stopwatch
	const [clockMode, setClockMode] = useState<FocusClockMode>(() => {
		if (typeof window !== "undefined") {
			const saved = window.localStorage.getItem(FOCUS_MODE_STORAGE_KEY);
			if (saved === "timer" || saved === "stopwatch") return saved;
		}
		return "timer";
	});

	// Timer & stopwatch states
	const [timerDuration, setTimerDuration] = useState<number>(25);
	const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
	const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
	const [timerRunning, setTimerRunning] = useState<boolean>(false);
	const [completedSessions, setCompletedSessions] = useState<number>(0);
	const [totalFocusedSeconds, setTotalFocusedSeconds] = useState<number>(0);
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

	// Smooth GPU-only top-to-bottom panel entrance (avoids backdrop-filter + clipPath flicker)
	useGSAP(
		() => {
			if (
				typeof window === "undefined" ||
				typeof window.matchMedia !== "function"
			) {
				return;
			}
			const mm = gsap.matchMedia();

			mm.add("(prefers-reduced-motion: no-preference)", () => {
				gsap.fromTo(
					"[data-focus-panel]",
					{
						autoAlpha: 0,
						y: -24,
						scale: 0.985,
					},
					{
						autoAlpha: 1,
						y: 0,
						scale: 1,
						duration: 0.62,
						stagger: 0.1,
						ease: "power3.out",
						clearProps: "transform,opacity,visibility",
					},
				);
			});

			return () => mm.revert();
		},
		{ scope: workspaceRef },
	);

	// Subtle pop when loading a new task onto the timer stage
	useGSAP(
		() => {
			if (
				!activeTaskId ||
				typeof window === "undefined" ||
				typeof window.matchMedia !== "function"
			) {
				return;
			}
			const mm = gsap.matchMedia();
			mm.add("(prefers-reduced-motion: no-preference)", () => {
				gsap.fromTo(
					"[data-active-focus-card]",
					{ autoAlpha: 0, y: -10, scale: 0.96 },
					{
						autoAlpha: 1,
						y: 0,
						scale: 1,
						duration: 0.32,
						ease: "back.out(1.4)",
						overwrite: "auto",
						clearProps: "transform,opacity,visibility",
					},
				);
			});
			return () => mm.revert();
		},
		{
			scope: workspaceRef,
			dependencies: [activeTaskId],
			revertOnUpdate: true,
		},
	);

	// Persist active task ID
	useEffect(() => {
		if (typeof window !== "undefined") {
			if (activeTaskId) {
				window.localStorage.setItem(ACTIVE_TASK_STORAGE_KEY, activeTaskId);
			} else {
				window.localStorage.removeItem(ACTIVE_TASK_STORAGE_KEY);
			}
		}
	}, [activeTaskId]);

	// Persist preferred Focus clock mode
	useEffect(() => {
		if (typeof window !== "undefined") {
			window.localStorage.setItem(FOCUS_MODE_STORAGE_KEY, clockMode);
		}
	}, [clockMode]);

	const activeTask = useMemo(() => {
		if (!activeTaskId) return null;
		return tasks.find((t) => t.id === activeTaskId) ?? null;
	}, [tasks, activeTaskId]);

	const activeProject = useMemo(() => {
		if (!activeTask?.projectId) return undefined;
		return projects.find((p) => p.id === activeTask.projectId);
	}, [activeTask, projects]);

	// Filter tasks for left drawer
	const filteredTasks = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();
		return tasks.filter((t) => {
			const matchesSearch =
				!query ||
				t.title.toLowerCase().includes(query) ||
				t.description.toLowerCase().includes(query);

			const matchesProject =
				selectedProjectId === "all" ||
				t.projectId === selectedProjectId ||
				(!t.projectId && projects[0] && selectedProjectId === projects[0].id);

			const matchesStatus =
				statusFilter === "all"
					? true
					: statusFilter === "active"
						? t.column !== "finalizado"
						: t.column === statusFilter;

			return matchesSearch && matchesProject && matchesStatus;
		});
	}, [tasks, projects, searchQuery, selectedProjectId, statusFilter]);

	const completeActiveSession = useCallback(
		(focusedSecondsForSession: number) => {
			setTimerRunning(false);
			playCompletionChime();
			setCompletedSessions((c) => c + 1);
			if (focusedSecondsForSession > 0) {
				setTotalFocusedSeconds((prev) => prev + focusedSecondsForSession);
			}
			setSecondsRemaining(timerDuration * 60);
			setElapsedSeconds(0);

			if (activeTask && activeTask.column !== "finalizado") {
				updateColumnMutation({
					id: activeTask.id as Id<"tasks">,
					column: "finalizado",
				}).catch((e) => console.error("Error completing task:", e));
			}

			sileo.success({
				title: "Sesión Focus completada",
				description: activeTask
					? `"${activeTask.title}" registrada en tu progreso.`
					: "Tu sesión de enfoque ha sido registrada.",
				fill: "#130f26",
				styles: {
					title: "text-purple-200 font-extrabold",
					description: "text-purple-300/80 text-xs font-semibold mt-0.5",
				},
			});
		},
		[activeTask, timerDuration, updateColumnMutation],
	);

	// Clock interval tick (countdown for timer, count-up for stopwatch)
	useEffect(() => {
		if (!timerRunning) {
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
			return;
		}

		timerRef.current = setInterval(() => {
			if (clockMode === "timer") {
				setSecondsRemaining((prev) => Math.max(0, prev - 1));
			} else {
				setElapsedSeconds((prev) => prev + 1);
			}
		}, 1000);

		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
		};
	}, [timerRunning, clockMode]);

	// Auto-complete when countdown reaches 0
	useEffect(() => {
		if (clockMode === "timer" && timerRunning && secondsRemaining === 0) {
			completeActiveSession(timerDuration * 60);
		}
	}, [
		clockMode,
		timerRunning,
		secondsRemaining,
		timerDuration,
		completeActiveSession,
	]);

	const loadTaskIntoTimer = async (taskId: string) => {
		if (!taskId || timerRunning) return;
		const targetTask = tasks.find((t) => t.id === taskId);
		if (!targetTask) return;

		setActiveTaskId(targetTask.id);
		setTimerRunning(false);
		setSecondsRemaining(timerDuration * 60);
		setElapsedSeconds(0);
		setDraggingTaskId(null);

		if (targetTask.column === "pendiente") {
			try {
				await updateColumnMutation({
					id: targetTask.id as Id<"tasks">,
					column: "en-proceso",
				});
			} catch (e) {
				console.error("Error moving task to en-proceso:", e);
			}
		}

		sileo.success({
			title: "Tarea cargada en Focus",
			description:
				clockMode === "stopwatch"
					? `"${targetTask.title}" está lista en el cronómetro.`
					: `"${targetTask.title}" está lista en el temporizador.`,
			fill: "#130f26",
			styles: {
				title: "text-purple-200 font-extrabold",
				description: "text-purple-300/80 text-xs font-semibold mt-0.5",
			},
		});
	};

	const handleDropTask = (droppedId: string) => {
		setDraggingTaskId(null);
		if (timerRunning) return;
		const targetId = droppedId || draggingTaskId || "";
		if (targetId) {
			void loadTaskIntoTimer(targetId);
		}
	};

	const handleClearActiveTask = () => {
		if (timerRunning) return;
		setTimerRunning(false);
		setSecondsRemaining(timerDuration * 60);
		setElapsedSeconds(0);
		setActiveTaskId("");
	};

	const handleMarkFinished = async (task: Task) => {
		setTimerRunning(false);
		try {
			await updateColumnMutation({
				id: task.id as Id<"tasks">,
				column: "finalizado",
			});
			sileo.success({
				title: "Tarea movida a Finalizado",
				description: `"${task.title}" se actualizó en tu tablero.`,
				fill: "#130f26",
				styles: {
					title: "text-purple-200 font-extrabold",
					description: "text-purple-300/80 text-xs font-semibold mt-0.5",
				},
			});
		} catch (e) {
			console.error("Error finishing task:", e);
		}
	};

	const handleChangeClockMode = (nextMode: FocusClockMode) => {
		if (nextMode === clockMode || timerRunning) return;
		setTimerRunning(false);
		setClockMode(nextMode);
		setSecondsRemaining(timerDuration * 60);
		setElapsedSeconds(0);
	};

	const handleChangeDuration = (minutes: number) => {
		if (timerRunning) return;
		const clampedMinutes = Math.max(1, Math.min(180, Math.round(minutes)));
		setTimerDuration(clampedMinutes);
		setSecondsRemaining(clampedMinutes * 60);
		setTimerRunning(false);
	};

	const handleToggleRunning = () => {
		setDraggingTaskId(null);
		setTimerRunning((prev) => !prev);
	};

	const handleResetClock = () => {
		setTimerRunning(false);
		if (clockMode === "stopwatch") {
			setElapsedSeconds(0);
		} else {
			setSecondsRemaining(timerDuration * 60);
		}
	};

	const handleFinishSession = () => {
		if (clockMode === "stopwatch") {
			if (elapsedSeconds <= 0) return;
			completeActiveSession(elapsedSeconds);
			return;
		}
		const elapsedInTimer = Math.max(0, timerDuration * 60 - secondsRemaining);
		completeActiveSession(
			elapsedInTimer > 0 ? elapsedInTimer : timerDuration * 60,
		);
	};

	return (
		<main
			ref={workspaceRef}
			className="mx-auto w-[calc(100%-2rem)] max-w-[92rem] pt-12 pb-0 relative"
		>
			<div className="flex flex-col lg:flex-row gap-6 items-start">
				<FocusTaskPanel
					tasks={filteredTasks}
					projects={projects}
					activeTaskId={activeTaskId}
					draggingTaskId={draggingTaskId}
					isLocked={timerRunning}
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					selectedProjectId={selectedProjectId}
					onProjectChange={setSelectedProjectId}
					statusFilter={statusFilter}
					onStatusFilterChange={setStatusFilter}
					onSelectTask={(id) => void loadTaskIntoTimer(id)}
					onDragStartTask={setDraggingTaskId}
					onDragEndTask={() => setDraggingTaskId(null)}
				/>

				<FocusTimerStage
					activeTask={activeTask}
					activeProject={activeProject}
					isDraggingTask={draggingTaskId !== null}
					clockMode={clockMode}
					timerDuration={timerDuration}
					secondsRemaining={secondsRemaining}
					elapsedSeconds={elapsedSeconds}
					timerRunning={timerRunning}
					completedSessions={completedSessions}
					totalFocusedSeconds={totalFocusedSeconds}
					onDropTask={handleDropTask}
					onClearActiveTask={handleClearActiveTask}
					onMarkFinished={(task) => void handleMarkFinished(task)}
					onChangeClockMode={handleChangeClockMode}
					onChangeDuration={handleChangeDuration}
					onToggleRunning={handleToggleRunning}
					onResetTimer={handleResetClock}
					onFinishSession={handleFinishSession}
				/>
			</div>
		</main>
	);
}
