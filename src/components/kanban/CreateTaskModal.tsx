import { Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Project, Task } from "../../types/kanban";

interface CreateTaskModalProps {
	isOpen: boolean;
	onClose: () => void;
	projects: Project[];
	currentProjectId: string;
	onSubmit: (
		title: string,
		desc: string,
		priority: Task["priority"],
		projectId: string,
	) => void;
}

export default function CreateTaskModal({
	isOpen,
	onClose,
	projects,
	currentProjectId,
	onSubmit,
}: CreateTaskModalProps) {
	const [title, setTitle] = useState("");
	const [desc, setDesc] = useState("");
	const [priority, setPriority] = useState<Task["priority"]>("medium");
	const [projectId, setProjectId] = useState("proj-1");

	// Reset form fields on open
	useEffect(() => {
		if (isOpen) {
			setTitle("");
			setDesc("");
			setPriority("medium");
			setProjectId(
				currentProjectId === "all"
					? projects[0]?.id || "proj-1"
					: currentProjectId,
			);
		}
	}, [isOpen, currentProjectId, projects]);

	if (!isOpen) return null;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) return;
		onSubmit(title.trim(), desc.trim(), priority, projectId);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
			<div className="w-full max-w-md rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface-strong)] p-6 shadow-xl relative rise-in">
				<button
					type="button"
					onClick={onClose}
					className="absolute right-4 top-4 rounded-full p-1.5 text-[var(--sea-ink-soft)] hover:bg-[var(--bg-base)]"
				>
					<X className="h-4.5 w-4.5" />
				</button>

				<h2 className="display-title mb-4 text-xl font-bold text-[var(--sea-ink)] flex items-center gap-1.5">
					<Sparkles className="h-5 w-5 text-[var(--palm)]" />
					<span>Crear Nota Adhesiva</span>
				</h2>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label
							htmlFor="add-title"
							className="block text-xs font-bold text-[var(--sea-ink-soft)] uppercase tracking-wider mb-1.5"
						>
							Título
						</label>
						<input
							id="add-title"
							type="text"
							required
							placeholder="Ej. Diseño de escala tipográfica"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="demo-input text-sm font-semibold"
						/>
					</div>

					<div>
						<label
							htmlFor="add-desc"
							className="block text-xs font-bold text-[var(--sea-ink-soft)] uppercase tracking-wider mb-1.5"
						>
							Descripción
						</label>
						<textarea
							id="add-desc"
							placeholder="Ej. Tareas a realizar y recordatorios..."
							value={desc}
							onChange={(e) => setDesc(e.target.value)}
							className="demo-textarea text-xs"
						/>
					</div>

					<div>
						<label
							htmlFor="add-priority"
							className="block text-xs font-bold text-[var(--sea-ink-soft)] uppercase tracking-wider mb-1.5"
						>
							Prioridad
						</label>
						<select
							id="add-priority"
							value={priority}
							onChange={(e) => setPriority(e.target.value as Task["priority"])}
							className="demo-select text-xs font-semibold"
						>
							<option value="low">Baja</option>
							<option value="medium">Media</option>
							<option value="high">Alta / Urgente</option>
						</select>
					</div>

					{currentProjectId === "all" && (
						<div>
							<label
								htmlFor="add-project"
								className="block text-xs font-bold text-[var(--sea-ink-soft)] uppercase tracking-wider mb-1.5"
							>
								Proyecto Destino
							</label>
							<select
								id="add-project"
								value={projectId}
								onChange={(e) => setProjectId(e.target.value)}
								className="demo-select text-xs font-semibold"
							>
								{projects.map((proj) => (
									<option key={proj.id} value={proj.id}>
										{proj.name}
									</option>
								))}
							</select>
						</div>
					)}

					<div className="pt-2 flex justify-end gap-2">
						<button
							type="button"
							onClick={onClose}
							className="rounded-xl border border-[var(--line)] px-4 py-2 text-xs font-bold text-[var(--sea-ink-soft)] hover:bg-[var(--bg-base)]"
						>
							Cancelar
						</button>
						<button
							type="submit"
							className="rounded-xl bg-[var(--lagoon)] text-white px-5 py-2 text-xs font-extrabold hover:bg-[var(--lagoon-deep)] active:scale-95 transition shadow-md"
						>
							Guardar Nota
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
