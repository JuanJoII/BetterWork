import type { Task } from "../types/kanban";

export type NoteToneKey = "low" | "medium" | "high" | "daily";

export const PRIORITY_ORDER: readonly Task["priority"][] = [
	"low",
	"medium",
	"high",
] as const;

export const PRIORITY_LABEL: Record<Task["priority"], string> = {
	low: "Baja",
	medium: "Media",
	high: "Urgente",
};

export function cyclePriority(
	current: Task["priority"],
	direction: "prev" | "next",
): Task["priority"] {
	const index = PRIORITY_ORDER.indexOf(current);
	const safeIndex = index === -1 ? 1 : index;
	const nextIndex =
		direction === "next"
			? (safeIndex + 1) % PRIORITY_ORDER.length
			: (safeIndex - 1 + PRIORITY_ORDER.length) % PRIORITY_ORDER.length;
	return PRIORITY_ORDER[nextIndex];
}

export function getNoteToneKey(
	task: Pick<Task, "priority" | "isRitual">,
): NoteToneKey {
	if (task.isRitual) return "daily";
	return task.priority;
}

export interface NoteToneStyles {
	card: string;
	cardHover: string;
	modalSheet: string;
	tape: string;
	haloTop: string;
	haloBottom: string;
	title: string;
	titleInput: string;
	metaText: string;
	projectText: string;
	divider: string;
	focusButton: string;
	iconButton: string;
	activeBottomShadow: string;
	pill: string;
	ctaButton: string;
	cancelButton: string;
	focusRing: string;
}

export const NOTE_TONE_STYLES: Record<NoteToneKey, NoteToneStyles> = {
	low: {
		card: "border-emerald-300/85 bg-emerald-50/95 text-emerald-950 dark:border-emerald-500/30 dark:bg-emerald-950/20 dark:text-emerald-100/90",
		cardHover:
			"hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-[0_14px_28px_rgba(16,185,129,0.12)] dark:hover:border-emerald-400/50 dark:hover:bg-emerald-950/30 dark:hover:shadow-[0_16px_32px_rgba(52,211,153,0.08)]",
		modalSheet:
			"border-emerald-300/90 bg-emerald-50/95 text-emerald-950 shadow-[0_24px_60px_rgba(16,185,129,0.18),0_6px_18px_rgba(15,23,42,0.08)] dark:border-emerald-400/35 dark:bg-[#071a15]/95 dark:text-emerald-100 dark:shadow-[0_28px_72px_rgba(0,0,0,0.75),0_0_42px_rgba(16,185,129,0.16)]",
		tape: "bg-emerald-300/50 border-emerald-400/60 dark:bg-emerald-400/18 dark:border-emerald-400/40",
		haloTop:
			"bg-[radial-gradient(circle,rgba(16,185,129,0.2),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(52,211,153,0.22),transparent_70%)]",
		haloBottom:
			"bg-[radial-gradient(circle,rgba(52,211,153,0.14),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(16,185,129,0.14),transparent_70%)]",
		title: "text-emerald-900 dark:text-emerald-300",
		titleInput:
			"border-emerald-300/75 text-emerald-950 placeholder:text-emerald-900/40 focus:border-emerald-500 dark:border-emerald-400/25 dark:text-emerald-200 dark:placeholder:text-emerald-200/35 dark:focus:border-emerald-400",
		metaText: "text-emerald-700 dark:text-emerald-400",
		projectText: "text-emerald-800/80 dark:text-emerald-400/80",
		divider: "border-emerald-300/60 dark:border-emerald-500/15",
		focusButton:
			"border-emerald-300 bg-emerald-100/80 hover:bg-emerald-200/70 text-emerald-900 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-300 dark:hover:text-emerald-200",
		iconButton:
			"hover:bg-emerald-200/75 text-emerald-800 hover:text-emerald-950 dark:hover:bg-emerald-400/20 dark:text-emerald-300/80 dark:hover:text-emerald-200",
		activeBottomShadow:
			"shadow-[0_16px_26px_-10px_rgba(16,185,129,0.4)] dark:shadow-[0_16px_26px_-10px_rgba(52,211,153,0.5)]",
		pill: "border-emerald-400/60 bg-emerald-200/70 text-emerald-900 dark:border-emerald-400/40 dark:bg-emerald-500/20 dark:text-emerald-200",
		ctaButton:
			"bg-emerald-600 text-white hover:bg-emerald-700 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(16,185,129,0.35)] dark:bg-emerald-400 dark:text-slate-950 dark:hover:bg-emerald-300 dark:hover:shadow-[0_8px_22px_rgba(52,211,153,0.38)]",
		cancelButton:
			"border border-emerald-400/35 text-emerald-900/80 hover:border-emerald-500/60 hover:bg-emerald-200/65 hover:text-emerald-950 dark:border-emerald-400/20 dark:text-emerald-200/80 dark:hover:border-emerald-400/45 dark:hover:bg-emerald-400/15 dark:hover:text-emerald-100",
		focusRing:
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-50 dark:focus-visible:ring-emerald-300 dark:focus-visible:ring-offset-[#071a15]",
	},
	medium: {
		card: "border-amber-300/85 bg-amber-50/95 text-amber-950 dark:border-yellow-500/25 dark:bg-yellow-950/20 dark:text-yellow-100/90",
		cardHover:
			"hover:border-amber-400 hover:bg-amber-50 hover:shadow-[0_14px_28px_rgba(217,119,6,0.12)] dark:hover:border-yellow-400/45 dark:hover:bg-yellow-950/30 dark:hover:shadow-[0_16px_32px_rgba(234,179,8,0.08)]",
		modalSheet:
			"border-amber-300/90 bg-amber-50/95 text-amber-950 shadow-[0_24px_60px_rgba(217,119,6,0.18),0_6px_18px_rgba(15,23,42,0.08)] dark:border-yellow-400/30 dark:bg-[#1a1506]/95 dark:text-yellow-100 dark:shadow-[0_28px_72px_rgba(0,0,0,0.75),0_0_42px_rgba(250,204,21,0.16)]",
		tape: "bg-amber-300/50 border-amber-400/60 dark:bg-yellow-400/18 dark:border-yellow-400/40",
		haloTop:
			"bg-[radial-gradient(circle,rgba(245,158,11,0.22),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(250,204,21,0.22),transparent_70%)]",
		haloBottom:
			"bg-[radial-gradient(circle,rgba(234,179,8,0.15),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(234,179,8,0.14),transparent_70%)]",
		title: "text-amber-950 dark:text-yellow-400",
		titleInput:
			"border-amber-300/75 text-amber-950 placeholder:text-amber-900/40 focus:border-amber-500 dark:border-yellow-500/25 dark:text-yellow-200 dark:placeholder:text-yellow-100/35 dark:focus:border-yellow-400",
		metaText: "text-amber-700 dark:text-yellow-400/80",
		projectText: "text-amber-800/80 dark:text-yellow-500/80",
		divider: "border-amber-300/60 dark:border-yellow-500/15",
		focusButton:
			"border-amber-300 bg-amber-100/80 hover:bg-amber-200/70 text-amber-900 dark:border-yellow-500/25 dark:bg-yellow-500/10 dark:hover:bg-yellow-400/15 dark:text-yellow-300 dark:hover:text-yellow-200",
		iconButton:
			"hover:bg-amber-200/75 text-amber-800 hover:text-amber-950 dark:hover:bg-yellow-400/20 dark:text-yellow-300/80 dark:hover:text-yellow-200",
		activeBottomShadow:
			"shadow-[0_16px_26px_-10px_rgba(217,119,6,0.4)] dark:shadow-[0_16px_26px_-10px_rgba(250,204,21,0.48)]",
		pill: "border-amber-400/70 bg-amber-200/75 text-amber-950 dark:border-yellow-400/40 dark:bg-yellow-400/20 dark:text-yellow-200",
		ctaButton:
			"bg-amber-400 text-slate-950 hover:bg-amber-500 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(217,119,6,0.32)] dark:bg-yellow-300 dark:text-slate-950 dark:hover:bg-yellow-200 dark:hover:shadow-[0_8px_22px_rgba(250,204,21,0.36)]",
		cancelButton:
			"border border-amber-400/40 text-amber-900/80 hover:border-amber-500/65 hover:bg-amber-200/65 hover:text-amber-950 dark:border-yellow-400/20 dark:text-yellow-200/80 dark:hover:border-yellow-400/45 dark:hover:bg-yellow-400/15 dark:hover:text-yellow-100",
		focusRing:
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-50 dark:focus-visible:ring-yellow-300 dark:focus-visible:ring-offset-[#1a1506]",
	},
	high: {
		card: "border-red-300/85 bg-red-50/95 text-red-950 dark:border-red-500/30 dark:bg-red-950/25 dark:text-red-100/90",
		cardHover:
			"hover:border-red-400 hover:bg-red-50 hover:shadow-[0_14px_28px_rgba(220,38,38,0.12)] dark:hover:border-red-400/55 dark:hover:bg-red-950/35 dark:hover:shadow-[0_16px_32px_rgba(248,113,113,0.08)]",
		modalSheet:
			"border-red-300/90 bg-red-50/95 text-red-950 shadow-[0_24px_60px_rgba(220,38,38,0.18),0_6px_18px_rgba(15,23,42,0.08)] dark:border-red-400/35 dark:bg-[#1f0a10]/95 dark:text-red-100 dark:shadow-[0_28px_72px_rgba(0,0,0,0.75),0_0_42px_rgba(239,68,68,0.18)]",
		tape: "bg-red-300/50 border-red-400/60 dark:bg-red-400/18 dark:border-red-400/40",
		haloTop:
			"bg-[radial-gradient(circle,rgba(239,68,68,0.2),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(248,113,113,0.22),transparent_70%)]",
		haloBottom:
			"bg-[radial-gradient(circle,rgba(220,38,38,0.14),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(239,68,68,0.14),transparent_70%)]",
		title: "text-red-900 dark:text-red-300",
		titleInput:
			"border-red-300/75 text-red-950 placeholder:text-red-900/40 focus:border-red-500 dark:border-red-400/25 dark:text-red-200 dark:placeholder:text-red-200/35 dark:focus:border-red-400",
		metaText: "text-red-700 dark:text-red-400",
		projectText: "text-red-800/80 dark:text-red-400/80",
		divider: "border-red-300/60 dark:border-red-500/15",
		focusButton:
			"border-red-300 bg-red-100/80 hover:bg-red-200/70 text-red-900 dark:border-red-500/25 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-300 dark:hover:text-red-200",
		iconButton:
			"hover:bg-red-200/75 text-red-800 hover:text-red-950 dark:hover:bg-red-400/20 dark:text-red-300/80 dark:hover:text-red-200",
		activeBottomShadow:
			"shadow-[0_16px_26px_-10px_rgba(220,38,38,0.4)] dark:shadow-[0_16px_26px_-10px_rgba(248,113,113,0.5)]",
		pill: "border-red-400/65 bg-red-200/70 text-red-900 dark:border-red-400/40 dark:bg-red-500/20 dark:text-red-200",
		ctaButton:
			"bg-red-600 text-white hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(220,38,38,0.35)] dark:bg-red-400 dark:text-slate-950 dark:hover:bg-red-300 dark:hover:shadow-[0_8px_22px_rgba(248,113,113,0.38)]",
		cancelButton:
			"border border-red-400/35 text-red-900/80 hover:border-red-500/60 hover:bg-red-200/65 hover:text-red-950 dark:border-red-400/20 dark:text-red-200/80 dark:hover:border-red-400/45 dark:hover:bg-red-400/15 dark:hover:text-red-100",
		focusRing:
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-red-50 dark:focus-visible:ring-red-300 dark:focus-visible:ring-offset-[#1f0a10]",
	},
	daily: {
		card: "border-purple-300/85 bg-purple-50/95 text-purple-950 dark:border-purple-500/30 dark:bg-purple-950/20 dark:text-purple-100/90",
		cardHover:
			"hover:border-purple-400 hover:bg-purple-50 hover:shadow-[0_14px_28px_rgba(126,34,206,0.12)] dark:hover:border-purple-400/55 dark:hover:bg-purple-950/30 dark:hover:shadow-[0_16px_32px_rgba(168,85,247,0.08)]",
		modalSheet:
			"border-purple-300/90 bg-purple-50/95 text-purple-950 shadow-[0_24px_60px_rgba(126,34,206,0.18),0_6px_18px_rgba(15,23,42,0.08)] dark:border-purple-400/35 dark:bg-[#130a22]/95 dark:text-purple-100 dark:shadow-[0_28px_72px_rgba(0,0,0,0.75),0_0_42px_rgba(168,85,247,0.18)]",
		tape: "bg-purple-300/50 border-purple-400/60 dark:bg-purple-500/25 dark:border-purple-400/45",
		haloTop:
			"bg-[radial-gradient(circle,rgba(147,51,234,0.2),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(168,85,247,0.24),transparent_70%)]",
		haloBottom:
			"bg-[radial-gradient(circle,rgba(168,85,247,0.14),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(124,58,237,0.16),transparent_70%)]",
		title: "text-purple-900 dark:text-purple-300",
		titleInput:
			"border-purple-300/75 text-purple-950 placeholder:text-purple-900/40 focus:border-purple-500 dark:border-purple-400/25 dark:text-purple-200 dark:placeholder:text-purple-200/35 dark:focus:border-purple-400",
		metaText: "text-purple-700 dark:text-purple-400",
		projectText: "text-purple-800/80 dark:text-purple-300/80",
		divider: "border-purple-300/60 dark:border-purple-500/15",
		focusButton:
			"border-purple-300 bg-purple-100/80 hover:bg-purple-200/70 text-purple-900 dark:border-purple-500/25 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 dark:text-purple-300 dark:hover:text-purple-200",
		iconButton:
			"hover:bg-purple-200/75 text-purple-800 hover:text-purple-950 dark:hover:bg-purple-400/20 dark:text-purple-300/80 dark:hover:text-purple-200",
		activeBottomShadow:
			"shadow-[0_16px_26px_-10px_rgba(126,34,206,0.4)] dark:shadow-[0_16px_26px_-10px_rgba(168,85,247,0.55)]",
		pill: "border-purple-400/60 bg-purple-200/70 text-purple-900 dark:border-purple-400/40 dark:bg-purple-500/20 dark:text-purple-200",
		ctaButton:
			"bg-purple-600 text-white hover:bg-purple-700 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(126,34,206,0.35)] dark:bg-purple-400 dark:text-slate-950 dark:hover:bg-purple-300 dark:hover:shadow-[0_8px_22px_rgba(192,132,252,0.38)]",
		cancelButton:
			"border border-purple-400/35 text-purple-900/80 hover:border-purple-500/60 hover:bg-purple-200/65 hover:text-purple-950 dark:border-purple-400/20 dark:text-purple-200/80 dark:hover:border-purple-400/45 dark:hover:bg-purple-400/15 dark:hover:text-purple-100",
		focusRing:
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 focus-visible:ring-offset-purple-50 dark:focus-visible:ring-purple-300 dark:focus-visible:ring-offset-[#130a22]",
	},
};

export function getNoteToneStyles(
	task: Pick<Task, "priority" | "isRitual">,
): NoteToneStyles {
	return NOTE_TONE_STYLES[getNoteToneKey(task)];
}
