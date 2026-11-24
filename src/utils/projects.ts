import type { Project } from "../types/kanban";

export const GENERAL_BOARD_LABEL = "Tablero General";

export function isDefaultGeneralProject(
	project: Pick<Project, "name">,
): boolean {
	const normalized = project.name.trim().toLowerCase();
	return normalized === "general" || normalized === "tablero general";
}

export function getProjectDisplayName(project: Pick<Project, "name">): string {
	return isDefaultGeneralProject(project) ? GENERAL_BOARD_LABEL : project.name;
}
