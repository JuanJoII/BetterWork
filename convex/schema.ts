import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	...authTables,
	projects: defineTable({
		userId: v.id("users"),
		name: v.string(),
		icon: v.optional(v.string()),
		createdAt: v.string(),
	})
		.index("by_userId", ["userId"])
		.index("by_createdAt", ["createdAt"]),

	tasks: defineTable({
		userId: v.id("users"),
		title: v.string(),
		description: v.string(),
		priority: v.string(),
		column: v.string(),
		projectId: v.id("projects"),
		isRitual: v.optional(v.boolean()),
		ritualId: v.optional(v.id("rituals")),
		createdAt: v.string(),
	})
		.index("by_userId", ["userId"])
		.index("by_projectId", ["projectId"])
		.index("by_ritualId", ["ritualId"])
		.index("by_column", ["column"])
		.index("by_projectId_and_column", ["projectId", "column"]),

	rituals: defineTable({
		userId: v.id("users"),
		title: v.string(),
		description: v.string(),
		lastCompletedDate: v.optional(v.string()),
		lastSyncedDate: v.optional(v.string()),
		createdAt: v.string(),
	}).index("by_userId", ["userId"]),

	completedTasks: defineTable({
		userId: v.id("users"),
		title: v.string(),
		description: v.string(),
		priority: v.string(),
		projectId: v.optional(v.id("projects")),
		projectName: v.string(),
		isRitual: v.optional(v.boolean()),
		ritualId: v.optional(v.id("rituals")),
		completedAt: v.number(),
		completedDate: v.string(),
	})
		.index("by_userId_and_completedAt", ["userId", "completedAt"])
		.index("by_userId_and_completedDate", ["userId", "completedDate"])
		.index("by_completedAt", ["completedAt"]),
});
