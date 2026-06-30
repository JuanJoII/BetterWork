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
