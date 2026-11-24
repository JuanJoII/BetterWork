import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
	const handleCreateProject = vi.fn();
	const handleDeleteProject = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
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
				handleCreateProject={handleCreateProject}
				handleDeleteProject={handleDeleteProject}
				{...overrides}
			/>,
		);

	it("shows the active board name as heading and omits redundant Proyectos/Espacio de trabajo subtitles", () => {
		renderSidebar({ currentProjectId: "p2" });

		expect(screen.getByRole("heading", { name: "Backend API" })).toBeTruthy();
		expect(screen.queryByText("Espacio de trabajo")).toBeNull();
		expect(screen.queryByText("Proyectos")).toBeNull();
	});

	it("lists all projects vertically as pills without hiding items past 3", () => {
		renderSidebar();

		expect(screen.getAllByText("Tablero General").length).toBeGreaterThan(0);
		for (const project of SAMPLE_PROJECTS) {
			expect(screen.getByText(project.name)).toBeTruthy();
		}
		expect(screen.queryByText("Más")).toBeNull();
	});

	it("selects a project, creates a project, and deletes only non-General projects", () => {
		renderSidebar();

		fireEvent.click(screen.getByText("Backend API"));
		expect(setCurrentProjectId).toHaveBeenCalledWith("p2");

		expect(
			screen.queryByRole("button", { name: "Eliminar proyecto General" }),
		).toBeNull();

		fireEvent.click(
			screen.getByRole("button", { name: "Eliminar proyecto Marketing" }),
		);
		expect(handleDeleteProject).toHaveBeenCalledWith("p4", "Marketing");

		fireEvent.click(screen.getByRole("button", { name: /Nuevo Proyecto/i }));
		expect(handleCreateProject).toHaveBeenCalledTimes(1);
	});

	it("integrates SearchBar inside the sidebar and forwards changes", () => {
		renderSidebar();

		const inputs = screen.getAllByPlaceholderText("Buscar notas...");
		fireEvent.change(inputs[0], { target: { value: "convex" } });
		expect(setSearchQuery).toHaveBeenCalledWith("convex");
	});

	it("collapses and expands the desktop sidebar rail and persists preference", () => {
		renderSidebar();

		fireEvent.click(
			screen.getByRole("button", { name: "Colapsar barra lateral" }),
		);
		expect(window.localStorage.getItem("kairos_sidebar_collapsed")).toBe(
			"true",
		);
		expect(
			screen.getByRole("button", { name: "Expandir barra lateral" }),
		).toBeTruthy();

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
