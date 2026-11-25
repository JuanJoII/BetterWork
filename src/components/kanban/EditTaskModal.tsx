import { LayoutGrid, Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Project, Task } from "../../types/kanban";
import {
	getProjectDisplayName,
	isDefaultGeneralProject,
} from "../../utils/projects";
import ModalShell from "../ui/ModalShell";
import ProjectIcon from "./ProjectIcon";

interface EditTaskModalProps {
	task: Task | null;
	onClose: () => void;
	projects: Project[];
	onSubmit: (updatedTask: Task) => void;
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
		dotClass: "bg-slate-400",
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

const COLUMN_OPTIONS: {
	value: Task["column"];
	label: string;
	activeClass: string;
}[] = [
	{
		value: "pendiente",
		label: "Pendiente",
		activeClass:
			"border-purple-500/70 bg-purple-100 text-purple-900 dark:border-purple-400/65 dark:bg-purple-500/20 dark:text-purple-200",
	},
	{
		value: "en-proceso",
		label: "En Proceso",
		activeClass:
			"border-amber-500/75 bg-amber-300/45 text-amber-950 dark:border-yellow-400/65 dark:bg-yellow-400/20 dark:text-yellow-200",
	},
	{
		value: "finalizado",
		label: "Finalizado",
		activeClass:
			"border-emerald-500/70 bg-emerald-100 text-emerald-900 dark:border-emerald-400/65 dark:bg-emerald-500/20 dark:text-emerald-200",
	},
];

export default function EditTaskModal({
	task,
	onClose,
	projects,
	onSubmit,
}: EditTaskModalProps) {
	const [title, setTitle] = useState("");
	const [desc, setDesc] = useState("");
	const [priority, setPriority] = useState<Task["priority"]>("medium");
	const [column, setColumn] = useState<Task["column"]>("pendiente");
	const [projectId, setProjectId] = useState("proj-1");
	const titleInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (task) {
			setTitle(task.title);
			setDesc(task.description);
			setPriority(task.priority);
			setColumn(task.column);
			setProjectId(task.projectId || projects[0]?.id || "proj-1");
			const timer = window.setTimeout(() => {
				titleInputRef.current?.focus();
			}, 30);
			return () => window.clearTimeout(timer);
		}
	}, [task, projects]);

	if (!task) return null;

	const isDaily = !!task.isRitual;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) return;
		onSubmit({
			...task,
			title: title.trim(),
			description: desc.trim(),
			priority,
			column,
			projectId,
		});
	};

	return (
		<ModalShell
			isOpen={true}
			onClose={onClose}
			titleId="edit-task-modal-title"
			tone={isDaily ? "purple" : "amber"}
		>
			{/* Header */}
			<div className="mb-5 flex items-center gap-2.5 pr-8">
				<div
					className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border ${
						isDaily
							? "border-purple-400/50 bg-purple-400/20 text-purple-700 dark:border-purple-400/40 dark:bg-purple-500/20 dark:text-purple-300"
							: "border-amber-400/50 bg-amber-300/25 text-amber-700 dark:border-yellow-400/35 dark:bg-yellow-400/15 dark:text-yellow-300"
					}`}
				>
					<Pencil className="h-4 w-4" />
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<h2
						id="edit-task-modal-title"
						className="display-title m-0 text-lg font-black tracking-tight text-[var(--sea-ink)]"
					>
						Editar Nota
					</h2>
					{isDaily && (
						<span className="rounded-full border border-purple-300 bg-purple-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-purple-800 dark:border-purple-400/40 dark:bg-purple-500/20 dark:text-purple-200">
							DAILY
						</span>
					)}
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-5">
				{/* Tactile Sticky-Note Composition Surface */}
				<div
					className={`rounded-2xl border p-4 ${
						isDaily
							? "border-purple-300/75 bg-purple-50/75 dark:border-purple-500/30 dark:bg-purple-950/25"
							: "border-amber-300/75 bg-amber-50/75 dark:border-yellow-500/25 dark:bg-yellow-950/20"
					}`}
				>
					<label htmlFor="edit-title" className="sr-only">
						Título
					</label>
					<input
						ref={titleInputRef}
						id="edit-title"
						type="text"
						required
						placeholder="Título de la nota..."
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className={`w-full border-0 border-b bg-transparent pb-2.5 font-serif text-lg font-black focus:outline-none ${
							isDaily
								? "border-purple-300/70 text-purple-950 placeholder:text-purple-900/40 focus:border-purple-500 dark:border-purple-400/25 dark:text-purple-200 dark:placeholder:text-purple-200/35 dark:focus:border-purple-400"
								: "border-amber-300/70 text-amber-950 placeholder:text-amber-900/40 focus:border-amber-500 dark:border-yellow-500/20 dark:text-yellow-200 dark:placeholder:text-yellow-100/30 dark:focus:border-yellow-400/60"
						}`}
					/>

					<label htmlFor="edit-desc" className="sr-only">
						Descripción
					</label>
					<textarea
						id="edit-desc"
						rows={3}
						placeholder="Detalles o notas adicionales..."
						value={desc}
						onChange={(e) => setDesc(e.target.value)}
						className="mt-3 w-full resize-none bg-transparent text-xs sm:text-sm leading-relaxed font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none dark:text-slate-200 dark:placeholder:text-slate-500"
					/>
				</div>

				{/* Column / Status Segmented Pills */}
				<fieldset className="m-0 border-0 p-0">
					<legend className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[var(--sea-ink-soft)]">
						Estado
					</legend>
					<div className="grid grid-cols-3 gap-2">
						{COLUMN_OPTIONS.map((opt) => {
							const isSelected = column === opt.value;
							return (
								<button
									key={opt.value}
									type="button"
									aria-pressed={isSelected}
									onClick={() => setColumn(opt.value)}
									className={`rounded-full border px-3 py-2 text-xs font-extrabold transition cursor-pointer ${
										isSelected
											? opt.activeClass
											: "border-slate-200/90 bg-slate-100/70 text-[var(--sea-ink-soft)] hover:border-slate-300 hover:text-[var(--sea-ink)] dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/25"
									}`}
								>
									{opt.label}
								</button>
							);
						})}
					</div>
				</fieldset>

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

				{/* Project Selector Chips */}
				{projects.length > 0 && (
					<div>
						<span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[var(--sea-ink-soft)]">
							Proyecto
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
												? isDaily
													? "border-purple-600 bg-purple-600 text-white shadow-xs dark:border-purple-400 dark:bg-purple-400 dark:text-slate-950"
													: "border-amber-500 bg-amber-400 text-slate-950 shadow-xs dark:border-yellow-400 dark:bg-yellow-300"
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
						className={`rounded-full px-5 py-2 text-xs font-black shadow-sm transition active:scale-95 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer ${
							isDaily
								? "bg-purple-600 text-white hover:bg-purple-500 dark:bg-purple-400 dark:text-slate-950 dark:hover:bg-purple-300"
								: "bg-amber-400 text-slate-950 hover:bg-amber-300 dark:bg-yellow-300 dark:hover:bg-yellow-200"
						}`}
					>
						Actualizar Nota
					</button>
				</div>
			</form>
		</ModalShell>
	);
}
