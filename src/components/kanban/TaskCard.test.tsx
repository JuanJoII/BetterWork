import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Task } from "../../types/kanban";
import TaskCard from "./TaskCard";

describe("TaskCard", () => {
	afterEach(() => {
		cleanup();
	});

	const baseProps = {
		currentProjectId: "all",
		colId: "pendiente",
		onDragStart: vi.fn(),
		onFocusClick: vi.fn(),
		onMoveTask: vi.fn(),
		onEditTask: vi.fn(),
		onDeleteTask: vi.fn(),
		onCompleteTask: vi.fn(),
	};

	it("renders DAILY badge for daily habit tasks", () => {
		const dailyTask: Task = {
			id: "task_1",
			title: "Standup personal",
			description: "Revisar avances del día",
			priority: "medium",
			column: "pendiente",
			projectId: "proj_1",
			isRitual: true,
			createdAt: "2026-11-23T08:00:00.000Z",
		};

		render(<TaskCard {...baseProps} task={dailyTask} />);

		expect(screen.getByText("DAILY")).toBeTruthy();
		expect(screen.getByText("Hábito Diario")).toBeTruthy();
		expect(screen.queryByText("RITUAL")).toBeNull();
		expect(screen.queryByTitle("Completar Tarea")).toBeNull();
	});

	it("renders priority badge for standard tasks", () => {
		const regularTask: Task = {
			id: "task_2",
			title: "Desplegar PR",
			description: "Revisar build de producción",
			priority: "high",
			column: "en-proceso",
			projectId: "proj_1",
			createdAt: "2026-11-23T08:00:00.000Z",
		};

		render(<TaskCard {...baseProps} task={regularTask} />);

		expect(screen.getByText("URGENTE")).toBeTruthy();
		expect(screen.queryByText("DAILY")).toBeNull();
	});

	it("renders and triggers the complete check button only in finalizado column", () => {
		const onCompleteTask = vi.fn();
		const finishedTask: Task = {
			id: "task_3",
			title: "Cerrar sprint",
			description: "Validar entregas",
			priority: "medium",
			column: "finalizado",
			projectId: "proj_1",
			createdAt: "2026-11-23T08:00:00.000Z",
		};

		render(
			<TaskCard
				{...baseProps}
				colId="finalizado"
				task={finishedTask}
				onCompleteTask={onCompleteTask}
			/>,
		);

		const completeBtn = screen.getByTitle("Completar Tarea");
		expect(completeBtn).toBeTruthy();
		fireEvent.click(completeBtn);
		expect(onCompleteTask).toHaveBeenCalledTimes(1);
	});
});
