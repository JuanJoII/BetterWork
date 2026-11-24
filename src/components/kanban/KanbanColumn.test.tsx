import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import KanbanColumn from "./KanbanColumn";

describe("KanbanColumn drop overlay", () => {
	afterEach(() => {
		cleanup();
	});

	const baseProps = {
		column: {
			id: "en-proceso",
			title: "En Proceso",
			subtitle: "Trabajo activo",
			color: "border-yellow-200 text-yellow-700 bg-yellow-500/5",
		},
		tasks: [],
		projects: [],
		currentProjectId: "all",
		onDragOver: vi.fn(),
		onDrop: vi.fn(),
		onAddCard: vi.fn(),
		onDragStart: vi.fn(),
		onDragEnd: vi.fn(),
		onFocusClick: vi.fn(),
		onMoveTask: vi.fn(),
		onEditTask: vi.fn(),
		onDeleteTask: vi.fn(),
		onCompleteTask: vi.fn(),
	};

	it("shows the drop overlay when dragging a task from another column and hides it on drop", () => {
		const onDrop = vi.fn();
		const { container } = render(
			<KanbanColumn
				{...baseProps}
				isDraggingFromOtherColumn={true}
				onDrop={onDrop}
			/>,
		);

		const columnEl = container.querySelector("[data-kanban-column]");
		expect(columnEl).toBeTruthy();
		if (!columnEl) return;

		expect(screen.queryByText("Mover a En Proceso")).toBeNull();

		fireEvent.dragEnter(columnEl);
		expect(screen.getByText("Mover a En Proceso")).toBeTruthy();

		fireEvent.drop(columnEl);
		expect(onDrop).toHaveBeenCalledTimes(1);
		expect(screen.queryByText("Mover a En Proceso")).toBeNull();
	});

	it("does not show the drop overlay when dragging within the same column", () => {
		const { container } = render(
			<KanbanColumn {...baseProps} isDraggingFromOtherColumn={false} />,
		);

		const columnEl = container.querySelector("[data-kanban-column]");
		expect(columnEl).toBeTruthy();
		if (!columnEl) return;

		fireEvent.dragEnter(columnEl);
		expect(screen.queryByText("Mover a En Proceso")).toBeNull();
	});
});
