import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("rituals").order("desc").collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("rituals", {
      ...args,
      createdAt: new Date().toISOString(),
    });
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("rituals") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
