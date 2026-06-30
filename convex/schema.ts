import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  projects: defineTable({
    name: v.string(),
    createdAt: v.string(),
  }).index("by_createdAt", ["createdAt"]),

  tasks: defineTable({
    title: v.string(),
    description: v.string(),
    priority: v.string(),
    column: v.string(),
    projectId: v.id("projects"),
    isRitual: v.optional(v.boolean()),
    createdAt: v.string(),
  })
    .index("by_projectId", ["projectId"])
    .index("by_column", ["column"])
    .index("by_projectId_and_column", ["projectId", "column"]),

  rituals: defineTable({
    title: v.string(),
    description: v.string(),
    createdAt: v.string(),
  }),
});
