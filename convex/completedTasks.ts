import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation, query } from "./_generated/server";

export const COMPLETED_TASKS_RETENTION_DAYS = 15;
export const COMPLETED_TASKS_RETENTION_MS =
	COMPLETED_TASKS_RETENTION_DAYS * 24 * 60 * 60 * 1000;
const PURGE_BATCH_SIZE = 200;

export const list = query({
	args: {
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			return [];
		}

		const maxItems = Math.min(Math.max(args.limit ?? 100, 1), 500);
		return await ctx.db
			.query("completedTasks")
			.withIndex("by_userId_and_completedAt", (q) => q.eq("userId", userId))
			.order("desc")
			.take(maxItems);
	},
});

export const purgeExpired = internalMutation({
	args: {},
	handler: async (ctx) => {
		const cutoff = Date.now() - COMPLETED_TASKS_RETENTION_MS;
		const expired = await ctx.db
			.query("completedTasks")
			.withIndex("by_completedAt", (q) => q.lt("completedAt", cutoff))
			.take(PURGE_BATCH_SIZE);

		for (const doc of expired) {
			await ctx.db.delete(doc._id);
		}

		const hasMore = expired.length === PURGE_BATCH_SIZE;
		if (hasMore) {
			await ctx.scheduler.runAfter(0, internal.completedTasks.purgeExpired, {});
		}

		return {
			deleted: expired.length,
			hasMore,
		};
	},
});
