import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Project, Task } from "../../types/kanban";
import CreateTaskModal from "./CreateTaskModal";
import EditTaskModal from "./EditTaskModal";

const PROJECTS: Project[] = [
	{ id: "p1", name: "General", createdAt: "2026-11-01T00:00:00Z" },
	{
		id: "p2",
		name: "Backend API",
		icon: "lucide:code",
		createdAt: "2026-11-02T00:00:00Z",
	},
];

describe("Sticky-note direct manipulation modals", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders CreateTaskModal as a sticky note without redundant header/project picker and cycles priority colors with side arrows", () => {
		const onSubmit = vi.fn();
		const onClose = vi.fn();

		render(
			<CreateTaskModal
				isOpen={true}
				onClose={onClose}
				projects={PROJECTS}
				currentProjectId="p2"
				onSubmit={onSubmit}
			/>,
		);

		expect(
			screen.getByRole("dialog", { name: "Crear nota adhesiva" }),
		).toBeTruthy();
		expect(screen.queryByText("Nueva Nota")).toBeNull();
		expect(screen.queryByText("Proyecto Destino")).toBeNull();

		// Starts in Media (yellow)
		expect(screen.getByText("Media")).toBeTruthy();

		// Next arrow cycles Media -> Urgente (red)
		fireEvent.click(
			screen.getByRole("button", { name: "Cambiar prioridad siguiente" }),
		);
		expect(screen.getByText("Urgente")).toBeTruthy();

		// Next arrow wraps Urgente -> Baja (green)
		fireEvent.click(
			screen.getByRole("button", { name: "Cambiar prioridad siguiente" }),
		);
		expect(screen.getByText("Baja")).toBeTruthy();

		// Previous arrow goes back Baja -> Urgente (red)
		fireEvent.click(
			screen.getByRole("button", { name: "Cambiar prioridad anterior" }),
		);
		expect(screen.getByText("Urgente")).toBeTruthy();

		fireEvent.change(screen.getByLabelText("Título"), {
			target: { value: "Diseñar nota directa" },
		});
		fireEvent.change(screen.getByLabelText("Descripción"), {
			target: { value: "Sin campos redundantes" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Guardar Nota" }));

		// Automatically uses the active board project (p2)
		expect(onSubmit).toHaveBeenCalledWith(
			"Diseñar nota directa",
			"Sin campos redundantes",
			"high",
			"p2",
		);

		fireEvent.keyDown(document, { key: "Escape" });
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("cycles priority colors in EditTaskModal for regular tasks and omits arrows for Daily notes", () => {
		const onSubmit = vi.fn();
		const regularTask: Task = {
			id: "t1",
			title: "Revisar endpoints",
			description: "Validar mutaciones",
			priority: "medium",
			column: "en-proceso",
			projectId: "p2",
			createdAt: "2026-11-20T00:00:00Z",
		};

		render(
			<EditTaskModal
				task={regularTask}
				onClose={vi.fn()}
				projects={PROJECTS}
				onSubmit={onSubmit}
			/>,
		);

		expect(screen.queryByText("Editar Nota")).toBeNull();
		expect(screen.getByText("Media")).toBeTruthy();

		fireEvent.click(
			screen.getByRole("button", { name: "Cambiar prioridad anterior" }),
		);
		expect(screen.getByText("Baja")).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: "Actualizar Nota" }));

		expect(onSubmit).toHaveBeenCalledWith(
			expect.objectContaining({
				id: "t1",
				priority: "low",
				column: "en-proceso",
				projectId: "p2",
			}),
		);

		cleanup();

		// Daily notes stay purple without priority color arrows
		render(
			<EditTaskModal
				task={{ ...regularTask, id: "t2", isRitual: true }}
				onClose={vi.fn()}
				projects={PROJECTS}
				onSubmit={vi.fn()}
			/>,
		);

		expect(screen.getByText("DAILY")).toBeTruthy();
		expect(
			screen.queryByRole("button", { name: "Cambiar prioridad siguiente" }),
		).toBeNull();
	});
});
