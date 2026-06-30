import { internalMutation } from "./_generated/server";
import { mutation } from "./_generated/server";

export default internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("projects").take(1);
    if (existing.length > 0) return;

    const proj1 = await ctx.db.insert("projects", {
      name: "Proyecto Principal",
      createdAt: new Date().toISOString(),
    });
    const proj2 = await ctx.db.insert("projects", {
      name: "Estudios",
      createdAt: new Date().toISOString(),
    });

    await ctx.db.insert("tasks", {
      title: "Refining typography scale for BetterWork",
      description: "Pair Onest for headings and body. Double-check margins and scale contrast on mobile screens.",
      priority: "medium",
      column: "pendiente",
      projectId: proj1,
      createdAt: new Date().toISOString(),
    });
    await ctx.db.insert("tasks", {
      title: "Implement local storage persistence",
      description: "Save Kanban board tasks, column orders, and deep work session history so details survive browser reloads.",
      priority: "high",
      column: "pendiente",
      projectId: proj1,
      createdAt: new Date().toISOString(),
    });
    await ctx.db.insert("tasks", {
      title: "Animate Focus Deck waveforms",
      description: "Write CSS keyframe animations for the audio equalizer bands. Synchronize movements with play and pause interactions.",
      priority: "high",
      column: "en-proceso",
      projectId: proj2,
      createdAt: new Date().toISOString(),
    });
    await ctx.db.insert("tasks", {
      title: "Configure routing with TanStack Start",
      description: "Initialize project structure, register root document wrappers, and set up file-based routes for / and /about pages.",
      priority: "low",
      column: "finalizado",
      projectId: proj1,
      createdAt: new Date().toISOString(),
    });
    await ctx.db.insert("tasks", {
      title: "Draft client review presentation slides",
      description: "Synthesize user feedback and prepare wireframe slide deck for the upcoming BetterWork progress meeting.",
      priority: "medium",
      column: "pendiente",
      projectId: proj2,
      createdAt: new Date().toISOString(),
    });

    await ctx.db.insert("rituals", {
      title: "Revisar Gmail",
      description:
        "Verificar correos importantes de clientes y responder pendientes a primera hora.",
      createdAt: new Date().toISOString(),
    });
    await ctx.db.insert("rituals", {
      title: "Planificación Diaria",
      description:
        "Reorganizar las columnas del tablero y elegir el objetivo de enfoque del día.",
      createdAt: new Date().toISOString(),
    });
  },
});

export const clearAndSeed = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete all tasks
    const tasks = await ctx.db.query("tasks").take(200);
    for (const task of tasks) {
      await ctx.db.delete(task._id);
    }

    // Delete all projects
    const projects = await ctx.db.query("projects").take(200);
    for (const project of projects) {
      await ctx.db.delete(project._id);
    }

    // Delete all rituals
    const rituals = await ctx.db.query("rituals").take(200);
    for (const ritual of rituals) {
      await ctx.db.delete(ritual._id);
    }

    // Re-insert seed data
    const proj1 = await ctx.db.insert("projects", {
      name: "Proyecto Principal",
      createdAt: new Date().toISOString(),
    });
    const proj2 = await ctx.db.insert("projects", {
      name: "Estudios",
      createdAt: new Date().toISOString(),
    });

    await ctx.db.insert("tasks", {
      title: "Refining typography scale for BetterWork",
      description: "Pair Onest for headings and body. Double-check margins and scale contrast on mobile screens.",
      priority: "medium",
      column: "pendiente",
      projectId: proj1,
      createdAt: new Date().toISOString(),
    });
    await ctx.db.insert("tasks", {
      title: "Implement local storage persistence",
      description: "Save Kanban board tasks, column orders, and deep work session history so details survive browser reloads.",
      priority: "high",
      column: "pendiente",
      projectId: proj1,
      createdAt: new Date().toISOString(),
    });
    await ctx.db.insert("tasks", {
      title: "Animate Focus Deck waveforms",
      description: "Write CSS keyframe animations for the audio equalizer bands. Synchronize movements with play and pause interactions.",
      priority: "high",
      column: "en-proceso",
      projectId: proj2,
      createdAt: new Date().toISOString(),
    });
    await ctx.db.insert("tasks", {
      title: "Configure routing with TanStack Start",
      description: "Initialize project structure, register root document wrappers, and set up file-based routes for / and /about pages.",
      priority: "low",
      column: "finalizado",
      projectId: proj1,
      createdAt: new Date().toISOString(),
    });
    await ctx.db.insert("tasks", {
      title: "Draft client review presentation slides",
      description: "Synthesize user feedback and prepare wireframe slide deck for the upcoming BetterWork progress meeting.",
      priority: "medium",
      column: "pendiente",
      projectId: proj2,
      createdAt: new Date().toISOString(),
    });

    await ctx.db.insert("rituals", {
      title: "Revisar Gmail",
      description:
        "Verificar correos importantes de clientes y responder pendientes a primera hora.",
      createdAt: new Date().toISOString(),
    });
    await ctx.db.insert("rituals", {
      title: "Planificación Diaria",
      description:
        "Reorganizar las columnas del tablero y elegir el objetivo de enfoque del día.",
      createdAt: new Date().toISOString(),
    });
  },
});
