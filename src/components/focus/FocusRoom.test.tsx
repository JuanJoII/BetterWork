import {
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
});
