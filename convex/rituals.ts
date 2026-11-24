import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
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
			.query("rituals")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.collect();
	},
});

export const create = mutation({
	args: {
		title: v.string(),
		description: v.string(),
		localDate: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error("Not authenticated");
		}
		const nowIso = new Date().toISOString();
		const ritualId = await ctx.db.insert("rituals", {
			userId,
			title: args.title,
			description: args.description,
			lastSyncedDate: args.localDate,
			createdAt: nowIso,
		});

		// Automatically create today's active task instance in the user's default project
		const defaultProject = await ctx.db
			.query("projects")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.first();

		if (defaultProject) {
			await ctx.db.insert("tasks", {
				userId,
				title: args.title,
				description: args.description,
				priority: "medium",
				column: "pendiente",
				projectId: defaultProject._id,
				isRitual: true,
				ritualId,
				createdAt: nowIso,
			});
		}

		return ritualId;
	},
});

export const syncForDate = mutation({
	args: {
		localDate: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error("Not authenticated");
		}

		const defaultProject = await ctx.db
			.query("projects")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.first();

		if (!defaultProject) {
			return { created: 0, reset: 0 };
		}

		const rituals = await ctx.db
			.query("rituals")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.collect();

		if (rituals.length === 0) {
			return { created: 0, reset: 0 };
		}

		const tasks = await ctx.db
			.query("tasks")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.collect();

		let created = 0;
		let reset = 0;

		for (const ritual of rituals) {
			const targetTitle = normalizeTitle(ritual.title);

			// If already completed today, never recreate it today
			if (ritual.lastCompletedDate === args.localDate) {
				if (ritual.lastSyncedDate !== args.localDate) {
					await ctx.db.patch(ritual._id, {
						lastSyncedDate: args.localDate,
					});
				}
				continue;
			}

			const matchingTasks = tasks.filter(
				(t) =>
					t.ritualId === ritual._id ||
					(t.isRitual && !t.ritualId && normalizeTitle(t.title) === targetTitle),
			);

			if (matchingTasks.length > 0) {
				const isNewDay = ritual.lastSyncedDate !== args.localDate;
				for (const task of matchingTasks) {
					if (isNewDay && task.column === "finalizado") {
						await ctx.db.patch(task._id, {
							column: "pendiente",
							ritualId: ritual._id,
						});
						reset += 1;
					} else if (!task.ritualId) {
						await ctx.db.patch(task._id, { ritualId: ritual._id });
					}
				}
				if (isNewDay) {
					await ctx.db.patch(ritual._id, {
						lastSyncedDate: args.localDate,
					});
				}
			} else {
				await ctx.db.insert("tasks", {
					userId,
					title: ritual.title,
					description: ritual.description,
					priority: "medium",
					column: "pendiente",
					projectId: defaultProject._id,
					isRitual: true,
					ritualId: ritual._id,
					createdAt: new Date().toISOString(),
				});
				await ctx.db.patch(ritual._id, {
					lastSyncedDate: args.localDate,
				});
				created += 1;
			}
		}

		return { created, reset };
	},
});

export const remove = mutation({
	args: { id: v.id("rituals") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error("Not authenticated");
		}
		const ritual = await ctx.db.get(args.id);
		if (!ritual || ritual.userId !== userId) {
			throw new Error("Unauthorized");
		}

		// Cascade delete any active task instances linked to this daily
		const tasks = await ctx.db
			.query("tasks")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.collect();
		const targetTitle = normalizeTitle(ritual.title);

		for (const task of tasks) {
			if (
				task.ritualId === ritual._id ||
				(task.isRitual && !task.ritualId && normalizeTitle(task.title) === targetTitle)
			) {
				await ctx.db.delete(task._id);
			}
		}

		await ctx.db.delete(args.id);
	},
});
