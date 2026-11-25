import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getTodayDateKey } from "../../utils/date";
import DailysBoard from "./DailysBoard";

const { mockUseQuery, mockUseMutation, mockSileo } = vi.hoisted(() => ({
	mockUseQuery: vi.fn(),
	mockUseMutation: vi.fn(),
	mockSileo: {
		success: vi.fn(),
		error: vi.fn(),
		dismiss: vi.fn(),
	},
}));

vi.mock("convex/react", () => ({
	useQuery: (...args: unknown[]) => mockUseQuery(...args),
	useMutation: (...args: unknown[]) => mockUseMutation(...args),
}));

vi.mock("sileo", () => ({
	sileo: mockSileo,
}));

describe("DailysBoard", () => {
	const createDaily = vi.fn();
	const removeDaily = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		let mutationIdx = 0;
		const mutations = [createDaily, removeDaily];
		mockUseMutation.mockImplementation(() => {
			const fn = mutations[mutationIdx % mutations.length];
			mutationIdx += 1;
			return fn;
		});
	});

	afterEach(() => {
		cleanup();
	});

	it("renders empty state with Dailys copy instead of Rituales", () => {
		mockUseQuery.mockReturnValue([]);

		render(<DailysBoard />);

		expect(screen.getByText("¿Qué es un Daily?")).toBeTruthy();
		expect(screen.getByText("Mis Dailys")).toBeTruthy();
		expect(screen.getByText("No tienes dailys activos")).toBeTruthy();
		expect(screen.queryByText(/Ritual/i)).toBeNull();
	});

	it("renders existing dailys, shows server-backed completed badge, and creates a new daily", async () => {
		createDaily.mockResolvedValue("daily_new");
		const today = getTodayDateKey();

		mockUseQuery.mockReturnValue([
			{
				_id: "daily_1",
				title: "Revisar correos",
				description: "Inbox zero cada mañana",
				lastCompletedDate: today,
				createdAt: "2026-11-23T08:00:00.000Z",
			},
		]);

		render(<DailysBoard />);

		expect(screen.getByText("Revisar correos")).toBeTruthy();
		expect(screen.getByText("DAILY")).toBeTruthy();
		expect(screen.getByText("Completado hoy")).toBeTruthy();

		fireEvent.click(screen.getByRole("button", { name: /Añadir Daily/i }));
		expect(screen.getByRole("dialog", { name: "Crear daily" })).toBeTruthy();
		expect(screen.queryByText("Añadir Nuevo Daily")).toBeNull();

		fireEvent.change(screen.getByLabelText("Nombre del Daily"), {
			target: { value: "Planificar el día" },
		});
		fireEvent.change(screen.getByLabelText("Descripción"), {
			target: { value: "Definir 3 prioridades" },
		});

		fireEvent.click(screen.getByRole("button", { name: "Crear Daily" }));

		await waitFor(() => {
			expect(createDaily).toHaveBeenCalledWith({
				title: "Planificar el día",
				description: "Definir 3 prioridades",
				localDate: today,
			});
		});

		expect(mockSileo.success).toHaveBeenCalledWith(
			expect.objectContaining({ title: "¡Daily Añadido!" }),
		);
	});
});
