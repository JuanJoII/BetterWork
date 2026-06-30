import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    return await ctx.db
      .query("projects")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const id = await ctx.db.insert("projects", {
      userId,
      name: args.name,
      createdAt: new Date().toISOString(),
    });
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const project = await ctx.db.get(args.id);
    if (!project || project.userId !== userId) {
      throw new Error("Unauthorized");
    }
    
    // Cascading delete: Find and delete all tasks belonging to this project
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.id))
      .collect();
    for (const task of tasks) {
      await ctx.db.delete(task._id);
    }

    // Finally delete the project itself
    await ctx.db.delete(args.id);
  },
});

