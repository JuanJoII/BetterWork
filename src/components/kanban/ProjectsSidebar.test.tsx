import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Project } from "../../types/kanban";
import ProjectsSidebar from "./ProjectsSidebar";

const SAMPLE_PROJECTS: Project[] = [
	{ id: "p1", name: "General", createdAt: "2026-11-01T00:00:00Z" },
	{ id: "p2", name: "Backend API", createdAt: "2026-11-02T00:00:00Z" },
	{ id: "p3", name: "Diseño UI", createdAt: "2026-11-03T00:00:00Z" },
	{ id: "p4", name: "Marketing", createdAt: "2026-11-04T00:00:00Z" },
	{ id: "p5", name: "Infraestructura", createdAt: "2026-11-05T00:00:00Z" },
];

describe("ProjectsSidebar", () => {
	const setCurrentProjectId = vi.fn();
	const setSearchQuery = vi.fn();
	const onCreateProject = vi.fn();
	const handleDeleteProject = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		onCreateProject.mockResolvedValue(undefined);
		window.localStorage.clear();
	});

	afterEach(() => {
		cleanup();
	});

	const renderSidebar = (overrides = {}) =>
		render(
			<ProjectsSidebar
				projects={SAMPLE_PROJECTS}
				currentProjectId="all"
				setCurrentProjectId={setCurrentProjectId}
				searchQuery=""
				setSearchQuery={setSearchQuery}
				totalTaskCount={12}
				taskCountByProject={{ p1: 4, p2: 3, p3: 2, p4: 2, p5: 1 }}
				onCreateProject={onCreateProject}
				handleDeleteProject={handleDeleteProject}
				{...overrides}
			/>,
		);

	it("renders all projects in the arc list without inline X delete buttons or arrows", () => {
		renderSidebar();

		expect(screen.getAllByText("Tablero General").length).toBeGreaterThan(0);
		for (const project of SAMPLE_PROJECTS) {
			expect(screen.getByText(project.name)).toBeTruthy();
		}
		expect(screen.queryByText("Más")).toBeNull();
		expect(
			screen.queryByRole("button", { name: /Eliminar proyecto Marketing/i }),
		).toBeNull();
	});

	it("handles wheel scrolling across the entire sidebar container without leaking to page scroll", () => {
		renderSidebar({ currentProjectId: "p4" });

		const sidebar = screen.getByLabelText("Barra lateral de proyectos");
		const wheelEvent = new WheelEvent("wheel", {
			deltaY: 100,
			bubbles: true,
			cancelable: true,
		});
		sidebar.dispatchEvent(wheelEvent);

		expect(wheelEvent.defaultPrevented).toBe(true);
		expect(setCurrentProjectId).toHaveBeenCalledWith("p5");
	});

	it("opens an anchored popover from Nuevo Proyecto and creates a project on submit", async () => {
		renderSidebar();

		fireEvent.click(screen.getByRole("button", { name: /Nuevo Proyecto/i }));
		expect(
			screen.getByRole("dialog", { name: "Crear nuevo proyecto" }),
		).toBeTruthy();

		const input = screen.getByLabelText("Nombre del proyecto");
		fireEvent.change(input, { target: { value: "Roadmap Q4" } });
		fireEvent.click(screen.getByRole("button", { name: "Crear" }));

		await waitFor(() => {
			expect(onCreateProject).toHaveBeenCalledWith("Roadmap Q4");
		});
		expect(
			screen.queryByRole("dialog", { name: "Crear nuevo proyecto" }),
		).toBeNull();
	});

	it("deletes the currently active project via the footer Trash button", () => {
		renderSidebar({ currentProjectId: "p4" });

		const deleteBtn = screen.getByRole("button", {
			name: /Eliminar Proyecto/i,
		});
		expect((deleteBtn as HTMLButtonElement).disabled).toBe(false);
		fireEvent.click(deleteBtn);
		expect(handleDeleteProject).toHaveBeenCalledWith("p4", "Marketing");
	});

	it("disables the footer delete button on Tablero General and General project", () => {
		renderSidebar({ currentProjectId: "all" });
		const deleteAllBtn = screen.getByRole("button", {
			name: /Eliminar Proyecto/i,
		}) as HTMLButtonElement;
		expect(deleteAllBtn.disabled).toBe(true);

		cleanup();

		renderSidebar({ currentProjectId: "p1" });
		const deleteGeneralBtn = screen.getByRole("button", {
			name: /Eliminar Proyecto/i,
		}) as HTMLButtonElement;
		expect(deleteGeneralBtn.disabled).toBe(true);
	});

	it("integrates SearchBar inside the sidebar and forwards changes", () => {
		renderSidebar();

		const inputs = screen.getAllByPlaceholderText("Buscar notas...");
		fireEvent.change(inputs[0], { target: { value: "convex" } });
		expect(setSearchQuery).toHaveBeenCalledWith("convex");
	});

	it("collapses, cycles projects via wheel anywhere on compact sidebar, and expands back", () => {
		renderSidebar({ currentProjectId: "p2" });

		fireEvent.click(
			screen.getByRole("button", { name: "Colapsar barra lateral" }),
		);
		expect(window.localStorage.getItem("kairos_sidebar_collapsed")).toBe(
			"true",
		);
		expect(
			screen.getByRole("button", { name: "Expandir barra lateral" }),
		).toBeTruthy();

		const sidebar = screen.getByLabelText("Barra lateral de proyectos");
		fireEvent.wheel(sidebar, { deltaY: 100 });
		expect(setCurrentProjectId).toHaveBeenCalledWith("p3");

		fireEvent.click(
			screen.getByRole("button", { name: "Expandir barra lateral" }),
		);
		expect(window.localStorage.getItem("kairos_sidebar_collapsed")).toBe(
			"false",
		);
	});

	it("opens and closes the mobile projects drawer", () => {
		renderSidebar();

		fireEvent.click(
			screen.getByRole("button", { name: "Abrir panel de proyectos" }),
		);
		expect(
			screen.getByLabelText("Barra lateral de proyectos móvil"),
		).toBeTruthy();

		fireEvent.click(screen.getByRole("button", { name: "Cerrar panel" }));
		expect(
			screen.queryByLabelText("Barra lateral de proyectos móvil"),
		).toBeNull();
	});
});
