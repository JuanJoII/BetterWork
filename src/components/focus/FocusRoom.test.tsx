import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FocusRoom from "./FocusRoom";

const { mockUseKanbanData, mockUpdateColumn, mockSileo } = vi.hoisted(() => ({
	mockUseKanbanData: vi.fn(),
	mockUpdateColumn: vi.fn(),
	mockSileo: {
		success: vi.fn(),
		error: vi.fn(),
		dismiss: vi.fn(),
	},
}));

vi.mock("../../hooks/useKanbanData", () => ({
	useKanbanData: () => mockUseKanbanData(),
}));

vi.mock("sileo", () => ({
	sileo: mockSileo,
}));

vi.mock("@tanstack/react-router", () => ({
	Link: ({
		to,
		children,
		className,
	}: {
		to: string;
		children: React.ReactNode;
		className?: string;
	}) => (
		<a href={to} className={className}>
			{children}
		</a>
	),
}));

vi.mock("../../utils/audio", () => ({
	playCompletionChime: vi.fn(),
}));

const SAMPLE_PROJECTS = [
	{ id: "p1", name: "General", createdAt: "2026-11-01T00:00:00Z" },
	{
		id: "p2",
		name: "Backend API",
		icon: "lucide:code",
		createdAt: "2026-11-02T00:00:00Z",
	},
];

const SAMPLE_TASKS = [
	{
		id: "t1",
		title: "Diseñar endpoints",
		description: "Crear mutaciones de Convex",
		priority: "high" as const,
		column: "pendiente" as const,
		projectId: "p2",
		createdAt: "2026-11-20T00:00:00Z",
	},
	{
		id: "t2",
		title: "Revisar correos",
		description: "Daily de la mañana",
		priority: "medium" as const,
		column: "en-proceso" as const,
		projectId: "p1",
		isRitual: true,
		createdAt: "2026-11-21T00:00:00Z",
	},
	{
		id: "t3",
		title: "Deploy completado",
		description: "Ya en producción",
		priority: "low" as const,
		column: "finalizado" as const,
		projectId: "p2",
		createdAt: "2026-11-22T00:00:00Z",
	},
];

describe("FocusRoom", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		window.localStorage.clear();
		Object.defineProperty(window, "matchMedia", {
			writable: true,
			value: vi.fn().mockImplementation((query: string) => ({
				matches: false,
				media: query,
				onchange: null,
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				addListener: vi.fn(),
				removeListener: vi.fn(),
				dispatchEvent: vi.fn(),
			})),
		});
		mockUpdateColumn.mockResolvedValue(undefined);
		mockUseKanbanData.mockReturnValue({
			projects: SAMPLE_PROJECTS,
			tasks: SAMPLE_TASKS,
			updateColumnMutation: mockUpdateColumn,
		});
	});

	afterEach(() => {
		cleanup();
	});

	it("renders active tasks in the Kanban side panel and filters via SearchBar and project Filters popover", () => {
		render(<FocusRoom />);

		// By default shows active tasks (pendiente + en-proceso), excluding finalizado
		expect(screen.getByText("Diseñar endpoints")).toBeTruthy();
		expect(screen.getByText("Revisar correos")).toBeTruthy();
		expect(screen.queryByText("Deploy completado")).toBeNull();

		// Open Filters popover and filter by Backend API project
		fireEvent.click(screen.getByRole("button", { name: "Filtrar tareas" }));
		expect(
			screen.getByRole("dialog", { name: "Filtros de tareas" }),
		).toBeTruthy();

		const dialog = screen.getByRole("dialog", { name: "Filtros de tareas" });
		const backendOption = Array.from(dialog.querySelectorAll("button")).find(
			(btn) => btn.textContent?.includes("Backend API"),
		);
		expect(backendOption).toBeTruthy();
		if (backendOption) fireEvent.click(backendOption);

		expect(screen.getByText("Diseñar endpoints")).toBeTruthy();
		expect(screen.queryByText("Revisar correos")).toBeNull();

		// SearchBar further filters visible tasks
		fireEvent.change(screen.getByPlaceholderText("Buscar tareas..."), {
			target: { value: "inexistente" },
		});
		expect(
			screen.getByText("No se encontraron tareas con estos filtros"),
		).toBeTruthy();
	});

	it("loads a dragged task onto the timer drop zone, updates GradientText title, and moves pendiente tasks to en-proceso", async () => {
		render(<FocusRoom />);

		expect(screen.getByRole("heading", { name: "Focus en ..." })).toBeTruthy();
		expect(screen.getByText("Arrastra una tarea aquí")).toBeTruthy();

		const timerZone = screen.getByLabelText("Zona de temporizador Focus");
		const dropData = {
			getData: vi.fn().mockReturnValue("t1"),
			setData: vi.fn(),
			dropEffect: "move",
		};

		fireEvent.drop(timerZone, { dataTransfer: dropData });

		await waitFor(() => {
			expect(mockUpdateColumn).toHaveBeenCalledWith({
				id: "t1",
				column: "en-proceso",
			});
		});

		expect(
			screen.getByRole("heading", { name: "Focus en Diseñar endpoints" }),
		).toBeTruthy();
		expect(screen.getByText("25:00")).toBeTruthy();
		expect(screen.getByRole("button", { name: /Comenzar/i })).toBeTruthy();
		expect(window.localStorage.getItem("kairos_active_task_id")).toBe("t1");
	});

	it("shows a clean drag-over overlay without subtitle", () => {
		render(<FocusRoom />);

		const timerZone = screen.getByLabelText("Zona de temporizador Focus");
		fireEvent.dragEnter(timerZone);

		expect(screen.getByText("Suelta la nota aquí")).toBeTruthy();
		expect(
			screen.queryByText(/Se cargará en el temporizador para iniciar Focus/i),
		).toBeNull();
	});

	it("lets the user switch between Temporizador and Cronómetro, counts up, and records focused time on finish", async () => {
		vi.useFakeTimers();
		try {
			window.localStorage.setItem("kairos_active_task_id", "t2");
			render(<FocusRoom />);

			// Starts in Temporizador mode with presets visible
			expect(screen.getByText("25:00")).toBeTruthy();
			expect(screen.getByRole("button", { name: "25 min" })).toBeTruthy();

			// Switch to Cronómetro mode
			fireEvent.click(screen.getByRole("tab", { name: /Cronómetro/i }));
			expect(screen.getByText("00:00")).toBeTruthy();
			expect(screen.queryByRole("button", { name: "25 min" })).toBeNull();
			expect(window.localStorage.getItem("kairos_focus_mode")).toBe(
				"stopwatch",
			);

			// Finish button disabled at 00:00 in stopwatch mode
			const finishBtn = screen.getByRole("button", {
				name: "Finalizar sesión ahora",
			}) as HTMLButtonElement;
			expect(finishBtn.disabled).toBe(true);

			// Start counting up
			fireEvent.click(screen.getByRole("button", { name: /Comenzar/i }));
			act(() => {
				vi.advanceTimersByTime(3000);
			});
			expect(screen.getByText("00:03")).toBeTruthy();
			expect(finishBtn.disabled).toBe(false);

			// Finish session and record time
			fireEvent.click(finishBtn);
			expect(screen.getByText("Sesiones completadas: 1")).toBeTruthy();
			expect(screen.getByText("Tiempo enfocado: 3 s")).toBeTruthy();
			expect(screen.getByText("00:00")).toBeTruthy();
			expect(mockUpdateColumn).toHaveBeenCalledWith({
				id: "t2",
				column: "finalizado",
			});
		} finally {
			vi.useRealTimers();
		}
	});

	it("blocks dragging and switching tasks while the timer or stopwatch is running", () => {
		window.localStorage.setItem("kairos_active_task_id", "t2");
		render(<FocusRoom />);

		expect(
			screen.getByRole("heading", { name: "Focus en Revisar correos" }),
		).toBeTruthy();

		// Start the timer
		fireEvent.click(screen.getByRole("button", { name: /Comenzar/i }));

		const otherTaskCard = screen
			.getByText("Diseñar endpoints")
			.closest('[role="button"]');
		expect(otherTaskCard?.getAttribute("draggable")).toBe("false");

		// Clicking another task does not switch while running
		if (otherTaskCard) fireEvent.click(otherTaskCard);
		expect(
			screen.getByRole("heading", { name: "Focus en Revisar correos" }),
		).toBeTruthy();

		// Dragging over and dropping onto the timer stage is ignored while running
		const timerZone = screen.getByLabelText("Zona de temporizador Focus");
		fireEvent.dragEnter(timerZone);
		expect(screen.queryByText("Suelta la nota aquí")).toBeNull();

		fireEvent.drop(timerZone, {
			dataTransfer: {
				getData: vi.fn().mockReturnValue("t1"),
				setData: vi.fn(),
				dropEffect: "move",
			},
		});
		expect(
			screen.getByRole("heading", { name: "Focus en Revisar correos" }),
		).toBeTruthy();

		// Pausing restores dragging and switching
		fireEvent.click(screen.getByRole("button", { name: /Pausar/i }));
		expect(otherTaskCard?.getAttribute("draggable")).toBe("true");
		if (otherTaskCard) fireEvent.click(otherTaskCard);
		expect(
			screen.getByRole("heading", { name: "Focus en Diseñar endpoints" }),
		).toBeTruthy();
	});

	it("allows setting a custom timer duration via the + button", () => {
		window.localStorage.setItem("kairos_active_task_id", "t2");
		render(<FocusRoom />);

		fireEvent.click(
			screen.getByRole("button", { name: "Tiempo personalizado" }),
		);

		const input = screen.getByLabelText("Minutos personalizados");
		fireEvent.change(input, { target: { value: "15" } });
		fireEvent.click(
			screen.getByRole("button", { name: "Aplicar tiempo personalizado" }),
		);

		expect(screen.getByText("15:00")).toBeTruthy();
		expect(screen.getByRole("button", { name: "15 min" })).toBeTruthy();
	});
});
