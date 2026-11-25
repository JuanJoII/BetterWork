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

describe("Kanban tactile modals", () => {
	afterEach(() => {
		cleanup();
	});

	it("submits CreateTaskModal with pill priority, project chip, and supports Escape close", () => {
		const onSubmit = vi.fn();
		const onClose = vi.fn();

		render(
			<CreateTaskModal
				isOpen={true}
				onClose={onClose}
				projects={PROJECTS}
				currentProjectId="all"
				column="en-proceso"
				onSubmit={onSubmit}
			/>,
		);

		expect(screen.getByRole("dialog")).toBeTruthy();
		expect(screen.getByText("En Proceso")).toBeTruthy();

		fireEvent.change(screen.getByLabelText("Título"), {
			target: { value: "Diseñar modal" },
		});
		fireEvent.change(screen.getByLabelText("Descripción"), {
			target: { value: "Usar píldoras táctiles" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Urgente" }));
		fireEvent.click(screen.getByRole("button", { name: "Backend API" }));
		fireEvent.click(screen.getByRole("button", { name: "Guardar Nota" }));

		expect(onSubmit).toHaveBeenCalledWith(
			"Diseñar modal",
			"Usar píldoras táctiles",
			"high",
			"p2",
		);

		fireEvent.keyDown(document, { key: "Escape" });
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("edits status, priority, and project via tactile pills in EditTaskModal", () => {
		const onSubmit = vi.fn();
		const sampleTask: Task = {
			id: "t1",
			title: "Revisar logs",
			description: "Daily matutino",
			priority: "medium",
			column: "pendiente",
			projectId: "p1",
			isRitual: true,
			createdAt: "2026-11-20T00:00:00Z",
		};

		render(
			<EditTaskModal
				task={sampleTask}
				onClose={vi.fn()}
				projects={PROJECTS}
				onSubmit={onSubmit}
			/>,
		);

		expect(screen.getByText("DAILY")).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: "Finalizado" }));
		fireEvent.click(screen.getByRole("button", { name: "Baja" }));
		fireEvent.click(screen.getByRole("button", { name: "Backend API" }));
		fireEvent.click(screen.getByRole("button", { name: "Actualizar Nota" }));

		expect(onSubmit).toHaveBeenCalledWith(
			expect.objectContaining({
				id: "t1",
				title: "Revisar logs",
				priority: "low",
				column: "finalizado",
				projectId: "p2",
			}),
		);
	});
});
