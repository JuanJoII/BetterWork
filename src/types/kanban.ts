export interface Project {
	id: string;
	name: string;
	createdAt: string;
}

export interface Task {
	id: string;
	title: string;
	description: string;
	priority: "low" | "medium" | "high";
	column: "pendiente" | "en-proceso" | "finalizado";
	projectId?: string;
	isRitual?: boolean;
	createdAt: string;
}

export interface Ritual {
	id: string;
	title: string;
	description: string;
	createdAt: string;
}
