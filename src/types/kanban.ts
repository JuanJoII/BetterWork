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
	ritualId?: string;
	createdAt: string;
}

export interface Daily {
	id: string;
	title: string;
	description: string;
	lastCompletedDate?: string;
	lastSyncedDate?: string;
	createdAt: string;
}

export interface CompletedTask {
	id: string;
	title: string;
	description: string;
	priority: "low" | "medium" | "high";
	projectId?: string;
	projectName: string;
	isRitual?: boolean;
	ritualId?: string;
	completedAt: number;
	completedDate: string;
}
