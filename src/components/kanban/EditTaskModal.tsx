import { useEffect, useRef, useState } from "react";
import type { Project, Task } from "../../types/kanban";
import {
	cyclePriority,
	NOTE_TONE_STYLES,
	PRIORITY_LABEL,
} from "../../utils/noteTheme";
import ModalShell from "../ui/ModalShell";

interface EditTaskModalProps {
	task: Task | null;
	onClose: () => void;
	projects: Project[];
	onSubmit: (updatedTask: Task) => void;
}

export default function EditTaskModal({
	task,
	onClose,
	onSubmit,
}: EditTaskModalProps) {
	const [title, setTitle] = useState("");
	const [desc, setDesc] = useState("");
	const [priority, setPriority] = useState<Task["priority"]>("medium");
	const titleInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!task) return;
		setTitle(task.title);
		setDesc(task.description);
		setPriority(task.priority);
		const timer = window.setTimeout(() => {
			titleInputRef.current?.focus();
		}, 30);
		return () => window.clearTimeout(timer);
	}, [task]);

	if (!task) return null;

	const isDaily = !!task.isRitual;
	const toneKey = isDaily ? "daily" : priority;
	const styles = NOTE_TONE_STYLES[toneKey];

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) return;
		onSubmit({
			...task,
			title: title.trim(),
			description: desc.trim(),
			priority,
		});
	};

	return (
		<ModalShell
			isOpen={true}
			onClose={onClose}
			ariaLabel="Editar nota adhesiva"
			tone={toneKey}
			onPrevTone={
				isDaily ? undefined : () => setPriority((p) => cyclePriority(p, "prev"))
			}
			onNextTone={
				isDaily ? undefined : () => setPriority((p) => cyclePriority(p, "next"))
			}
		>
			<form onSubmit={handleSubmit} className="flex flex-col">
				{/* Title row with temporary priority guide pill (or DAILY badge for rituals) */}
				<div className="mb-3 flex items-center gap-2.5 pr-8 pt-1">
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
						className={`min-w-0 flex-1 border-0 border-b bg-transparent pb-2 font-serif text-xl font-black leading-snug focus:outline-none transition-colors duration-200 ${styles.titleInput}`}
					/>
					<span
						data-priority-guide-pill
						className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider transition-colors duration-200 ${styles.pill}`}
					>
						{isDaily ? "DAILY" : PRIORITY_LABEL[priority]}
					</span>
				</div>

				{/* Note body / description */}
				<label htmlFor="edit-desc" className="sr-only">
					Descripción
				</label>
				<textarea
					id="edit-desc"
					rows={5}
					placeholder="Escribe tu nota aquí..."
					value={desc}
					onChange={(e) => setDesc(e.target.value)}
					className="w-full resize-none bg-transparent text-sm leading-relaxed font-medium text-slate-700 placeholder:text-slate-400/90 focus:outline-none dark:text-slate-200/90 dark:placeholder:text-slate-400/60"
				/>

				{/* Sticky Note Footer Actions */}
				<div
					className={`mt-5 flex items-center justify-end gap-2.5 border-t pt-4 pb-1 transition-colors duration-200 ${styles.divider}`}
				>
					<button
						type="button"
						onClick={onClose}
						className={`rounded-full px-4 py-1.5 text-xs font-extrabold transition duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer ${styles.cancelButton} ${styles.focusRing}`}
					>
						Cancelar
					</button>
					<button
						type="submit"
						disabled={!title.trim()}
						className={`rounded-full px-5 py-1.5 text-xs font-black shadow-sm transition duration-200 active:scale-95 disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none cursor-pointer ${styles.ctaButton} ${styles.focusRing}`}
					>
						Actualizar Nota
					</button>
				</div>
			</form>
		</ModalShell>
	);
}
