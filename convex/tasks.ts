import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

function normalizeTitle(title: string): string {
	return title.trim().toLowerCase();
}

export const list = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			return [];
		}
		return await ctx.db
			.query("tasks")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.order("desc")
			.collect();
	},
});

export const listByProject = query({
	args: { projectId: v.id("projects") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			return [];
		}
		const project = await ctx.db.get(args.projectId);
		if (!project || project.userId !== userId) {
			return [];
		}
		return await ctx.db
			.query("tasks")
			.withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
			.order("desc")
			.collect();
	},
});

export const create = mutation({
	args: {
		title: v.string(),
		description: v.string(),
		priority: v.string(),
		column: v.string(),
		projectId: v.id("projects"),
		isRitual: v.optional(v.boolean()),
		ritualId: v.optional(v.id("rituals")),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error("Not authenticated");
		}
		const project = await ctx.db.get(args.projectId);
		if (!project || project.userId !== userId) {
			throw new Error("Unauthorized");
		}
		const id = await ctx.db.insert("tasks", {
			userId,
			...args,
			createdAt: new Date().toISOString(),
		});
		return id;
	},
});

export const update = mutation({
	args: {
		id: v.id("tasks"),
		title: v.string(),
		description: v.string(),
		priority: v.string(),
		column: v.string(),
		projectId: v.id("projects"),
		isRitual: v.optional(v.boolean()),
		ritualId: v.optional(v.id("rituals")),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error("Not authenticated");
		}
		const task = await ctx.db.get(args.id);
		if (!task || task.userId !== userId) {
			throw new Error("Unauthorized");
		}
		const project = await ctx.db.get(args.projectId);
		if (!project || project.userId !== userId) {
			throw new Error("Unauthorized");
		}
		const { id, ...rest } = args;
		await ctx.db.patch(id, rest);
	},
});

export const updateColumn = mutation({
	args: {
		id: v.id("tasks"),
		column: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error("Not authenticated");
		}
		const task = await ctx.db.get(args.id);
		if (!task || task.userId !== userId) {
			throw new Error("Unauthorized");
		}
		await ctx.db.patch(args.id, { column: args.column });
	},
});

export const complete = mutation({
	args: {
		id: v.id("tasks"),
		localDate: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error("Not authenticated");
		}
		const task = await ctx.db.get(args.id);
		if (!task || task.userId !== userId) {
			throw new Error("Unauthorized");
		}

		const project = await ctx.db.get(task.projectId);
		const projectName = project?.name ?? "General";

		let matchingRitual: Doc<"rituals"> | null = null;
		if (task.ritualId) {
			const candidate = await ctx.db.get(task.ritualId);
			if (candidate && candidate.userId === userId) {
				matchingRitual = candidate;
			}
		} else if (task.isRitual) {
			const userRituals = await ctx.db
				.query("rituals")
				.withIndex("by_userId", (q) => q.eq("userId", userId))
				.collect();
			const targetTitle = normalizeTitle(task.title);
			matchingRitual =
				userRituals.find((r) => normalizeTitle(r.title) === targetTitle) ??
				null;
		}

		const completedTaskId = await ctx.db.insert("completedTasks", {
			userId,
			title: task.title,
			description: task.description,
			priority: task.priority,
			projectId: task.projectId,
			projectName,
			isRitual: task.isRitual,
			ritualId: matchingRitual?._id ?? task.ritualId,
			completedAt: Date.now(),
			completedDate: args.localDate,
		});

		await ctx.db.delete(task._id);

		if (matchingRitual) {
			await ctx.db.patch(matchingRitual._id, {
				lastCompletedDate: args.localDate,
				lastSyncedDate: args.localDate,
			});
		}

		return { completedTaskId };
	},
});

export const undoComplete = mutation({
	args: {
		completedTaskId: v.id("completedTasks"),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error("Not authenticated");
		}
		const record = await ctx.db.get(args.completedTaskId);
		if (!record || record.userId !== userId) {
			throw new Error("Unauthorized");
		}

		let targetProjectId = record.projectId;
		if (targetProjectId) {
			const project = await ctx.db.get(targetProjectId);
			if (!project || project.userId !== userId) {
				targetProjectId = undefined;
			}
		}

		if (!targetProjectId) {
			const firstProject = await ctx.db
				.query("projects")
				.withIndex("by_userId", (q) => q.eq("userId", userId))
				.first();
			if (!firstProject) {
				throw new Error("No project available to restore task");
			}
			targetProjectId = firstProject._id;
		}

		const restoredTaskId = await ctx.db.insert("tasks", {
			userId,
			title: record.title,
			description: record.description,
			priority: record.priority,
			column: "finalizado",
			projectId: targetProjectId,
			isRitual: record.isRitual,
			ritualId: record.ritualId,
			createdAt: new Date().toISOString(),
		});

		await ctx.db.delete(record._id);

		if (record.isRitual) {
			let matchingRitual: Doc<"rituals"> | null = null;
			if (record.ritualId) {
				const candidate = await ctx.db.get(record.ritualId);
				if (candidate && candidate.userId === userId) {
					matchingRitual = candidate;
				}
			} else {
				const userRituals = await ctx.db
					.query("rituals")
					.withIndex("by_userId", (q) => q.eq("userId", userId))
					.collect();
				const targetTitle = normalizeTitle(record.title);
				matchingRitual =
					userRituals.find((r) => normalizeTitle(r.title) === targetTitle) ??
					null;
			}

			if (
				matchingRitual &&
				matchingRitual.lastCompletedDate === record.completedDate
			) {
				await ctx.db.patch(matchingRitual._id, {
					lastCompletedDate: undefined,
				});
			}
		}

		return { restoredTaskId };
	},
});

export const remove = mutation({
	args: { id: v.id("tasks") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error("Not authenticated");
		}
		const task = await ctx.db.get(args.id);
		if (!task || task.userId !== userId) {
			throw new Error("Unauthorized");
		}
		await ctx.db.delete(args.id);
	},
});
