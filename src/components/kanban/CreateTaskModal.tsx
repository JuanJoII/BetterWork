import { LayoutGrid, StickyNote } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Project, Task } from "../../types/kanban";
import {
	getProjectDisplayName,
	isDefaultGeneralProject,
} from "../../utils/projects";
import ModalShell from "../ui/ModalShell";
import ProjectIcon from "./ProjectIcon";

interface CreateTaskModalProps {
	isOpen: boolean;
	onClose: () => void;
	projects: Project[];
	currentProjectId: string;
	column?: Task["column"];
	onSubmit: (
		title: string,
		desc: string,
		priority: Task["priority"],
		projectId: string,
	) => void;
}

const PRIORITY_OPTIONS: {
	value: Task["priority"];
	label: string;
	dotClass: string;
	activeClass: string;
}[] = [
	{
		value: "low",
		label: "Baja",
		dotClass: "bg-slate-400 dark:bg-slate-400",
		activeClass:
			"border-slate-400/70 bg-slate-200/80 text-slate-900 dark:border-slate-500/70 dark:bg-slate-800 dark:text-slate-100",
	},
	{
		value: "medium",
		label: "Media",
		dotClass: "bg-amber-500 dark:bg-yellow-400",
		activeClass:
			"border-amber-500/70 bg-amber-300/45 text-amber-950 dark:border-yellow-400/70 dark:bg-yellow-400/20 dark:text-yellow-200",
	},
	{
		value: "high",
		label: "Urgente",
		dotClass: "bg-red-500 dark:bg-red-400",
		activeClass:
			"border-red-500/60 bg-red-100 text-red-800 dark:border-red-400/60 dark:bg-red-500/20 dark:text-red-200",
	},
];

const COLUMN_BADGE: Record<
	Task["column"],
	{ label: string; badgeClass: string }
> = {
	pendiente: {
		label: "En Pendiente",
		badgeClass:
			"border-purple-300/80 bg-purple-100/80 text-purple-800 dark:border-purple-400/40 dark:bg-purple-500/15 dark:text-purple-200",
	},
	"en-proceso": {
		label: "En Proceso",
		badgeClass:
			"border-amber-300/80 bg-amber-100/80 text-amber-900 dark:border-yellow-400/40 dark:bg-yellow-400/15 dark:text-yellow-200",
	},
	finalizado: {
		label: "En Finalizado",
		badgeClass:
			"border-emerald-300/80 bg-emerald-100/80 text-emerald-800 dark:border-emerald-400/40 dark:bg-emerald-500/15 dark:text-emerald-200",
	},
};

export default function CreateTaskModal({
	isOpen,
	onClose,
	projects,
	currentProjectId,
	column = "pendiente",
	onSubmit,
}: CreateTaskModalProps) {
	const [title, setTitle] = useState("");
	const [desc, setDesc] = useState("");
	const [priority, setPriority] = useState<Task["priority"]>("medium");
	const [projectId, setProjectId] = useState("proj-1");
	const titleInputRef = useRef<HTMLInputElement>(null);

	// Reset form fields on open and focus title input
	useEffect(() => {
		if (isOpen) {
			const defaultProject =
				projects.find(isDefaultGeneralProject) ?? projects[0];
			setTitle("");
			setDesc("");
			setPriority("medium");
			setProjectId(
				currentProjectId === "all"
					? defaultProject?.id || "proj-1"
					: currentProjectId,
			);
			const timer = window.setTimeout(() => {
				titleInputRef.current?.focus();
			}, 30);
			return () => window.clearTimeout(timer);
		}
	}, [isOpen, currentProjectId, projects]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) return;
		onSubmit(title.trim(), desc.trim(), priority, projectId);
	};

	const columnMeta = COLUMN_BADGE[column];

	return (
		<ModalShell
			isOpen={isOpen}
			onClose={onClose}
			titleId="create-task-modal-title"
			tone="amber"
		>
			{/* Header */}
			<div className="mb-5 flex items-center gap-2.5 pr-8">
				<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-amber-400/50 bg-amber-300/25 text-amber-700 dark:border-yellow-400/35 dark:bg-yellow-400/15 dark:text-yellow-300">
					<StickyNote className="h-4.5 w-4.5" />
				</div>
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-2">
						<h2
							id="create-task-modal-title"
							className="display-title m-0 text-lg font-black tracking-tight text-[var(--sea-ink)]"
						>
							Nueva Nota
						</h2>
						<span
							className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${columnMeta.badgeClass}`}
						>
							{columnMeta.label}
						</span>
					</div>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-5">
				{/* Tactile Sticky-Note Composition Surface */}
				<div className="rounded-2xl border border-amber-300/75 bg-amber-50/75 p-4 dark:border-yellow-500/25 dark:bg-yellow-950/20">
					<label htmlFor="add-title" className="sr-only">
						Título
					</label>
					<input
						ref={titleInputRef}
						id="add-title"
						type="text"
						required
						placeholder="Título de la nota..."
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className="w-full border-0 border-b border-amber-300/70 bg-transparent pb-2.5 font-serif text-lg font-black text-amber-950 placeholder:text-amber-900/40 focus:border-amber-500 focus:outline-none dark:border-yellow-500/20 dark:text-yellow-200 dark:placeholder:text-yellow-100/30 dark:focus:border-yellow-400/60"
					/>

					<label htmlFor="add-desc" className="sr-only">
						Descripción
					</label>
					<textarea
						id="add-desc"
						rows={3}
						placeholder="Añade detalles, pasos o recordatorios..."
						value={desc}
						onChange={(e) => setDesc(e.target.value)}
						className="mt-3 w-full resize-none bg-transparent text-xs sm:text-sm leading-relaxed font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none dark:text-slate-200 dark:placeholder:text-slate-500"
					/>
				</div>

				{/* Priority Segmented Pills */}
				<fieldset className="m-0 border-0 p-0">
					<legend className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[var(--sea-ink-soft)]">
						Prioridad
					</legend>
					<div className="grid grid-cols-3 gap-2">
						{PRIORITY_OPTIONS.map((opt) => {
							const isSelected = priority === opt.value;
							return (
								<button
									key={opt.value}
									type="button"
									aria-pressed={isSelected}
									onClick={() => setPriority(opt.value)}
									className={`flex items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-xs font-extrabold transition cursor-pointer ${
										isSelected
											? opt.activeClass
											: "border-slate-200/90 bg-slate-100/70 text-[var(--sea-ink-soft)] hover:border-amber-400/50 hover:text-[var(--sea-ink)] dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-yellow-400/35"
									}`}
								>
									<span
										aria-hidden="true"
										className={`h-2 w-2 rounded-full ${opt.dotClass}`}
									/>
									<span>{opt.label}</span>
								</button>
							);
						})}
					</div>
				</fieldset>

				{/* Project Destination Chips (when creating from Tablero General) */}
				{currentProjectId === "all" && projects.length > 0 && (
					<div>
						<span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[var(--sea-ink-soft)]">
							Proyecto Destino
						</span>
						<div className="flex flex-wrap gap-1.5">
							{projects.map((proj) => {
								const isSelected = projectId === proj.id;
								const isGeneral = isDefaultGeneralProject(proj);
								return (
									<button
										key={proj.id}
										type="button"
										onClick={() => setProjectId(proj.id)}
										aria-pressed={isSelected}
										className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-extrabold transition cursor-pointer ${
											isSelected
												? "border-amber-500 bg-amber-400 text-slate-950 shadow-xs dark:border-yellow-400 dark:bg-yellow-300"
												: "border-slate-200/90 bg-slate-100/70 text-[var(--sea-ink-soft)] hover:border-amber-400/55 hover:text-[var(--sea-ink)] dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-yellow-400/35"
										}`}
									>
										{isGeneral ? (
											<LayoutGrid className="h-3.5 w-3.5 shrink-0" />
										) : proj.icon ? (
											<ProjectIcon
												icon={proj.icon}
												className="h-3.5 w-3.5 shrink-0"
												emojiClassName="text-xs leading-none"
											/>
										) : (
											<span aria-hidden="true" className="text-xs">
												📁
											</span>
										)}
										<span className="max-w-[11rem] truncate">
											{getProjectDisplayName(proj)}
										</span>
									</button>
								);
							})}
						</div>
					</div>
				)}

				{/* Actions */}
				<div className="flex items-center justify-end gap-2 border-t border-slate-900/8 dark:border-white/10 pt-4">
					<button
						type="button"
						onClick={onClose}
						className="rounded-full border border-slate-200/90 px-4 py-2 text-xs font-extrabold text-[var(--sea-ink-soft)] transition hover:border-slate-300 hover:text-[var(--sea-ink)] dark:border-white/12 dark:hover:border-white/25 cursor-pointer"
					>
						Cancelar
					</button>
					<button
						type="submit"
						disabled={!title.trim()}
						className="rounded-full bg-amber-400 px-5 py-2 text-xs font-black text-slate-950 shadow-sm transition hover:bg-amber-300 dark:bg-yellow-300 dark:hover:bg-yellow-200 active:scale-95 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
					>
						Guardar Nota
					</button>
				</div>
			</form>
		</ModalShell>
	);
}
