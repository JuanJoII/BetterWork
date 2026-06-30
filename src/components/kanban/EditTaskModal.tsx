import { Edit, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Project, Task } from "../../types/kanban";

interface EditTaskModalProps {
	task: Task | null;
	onClose: () => void;
	projects: Project[];
	onSubmit: (updatedTask: Task) => void;
}

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

	useEffect(() => {
		if (task) {
			setTitle(task.title);
			setDesc(task.description);
			setPriority(task.priority);
			setColumn(task.column);
			setProjectId(task.projectId || "proj-1");
		}
	}, [task]);

	if (!task) return null;

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
					<Edit className="h-5 w-5 text-[var(--lagoon)]" />
					<span>Editar Nota Adhesiva</span>
				</h2>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label
							htmlFor="edit-title"
							className="block text-xs font-bold text-[var(--sea-ink-soft)] uppercase tracking-wider mb-1.5"
						>
							Título
						</label>
						<input
							id="edit-title"
							type="text"
							required
							placeholder="Task naming..."
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="demo-input text-sm font-semibold"
						/>
					</div>

					<div>
						<label
							htmlFor="edit-desc"
							className="block text-xs font-bold text-[var(--sea-ink-soft)] uppercase tracking-wider mb-1.5"
						>
							Descripción
						</label>
						<textarea
							id="edit-desc"
							placeholder="Task breakdowns..."
							value={desc}
							onChange={(e) => setDesc(e.target.value)}
							className="demo-textarea text-xs"
						/>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div>
							<label
								htmlFor="edit-priority"
								className="block text-xs font-bold text-[var(--sea-ink-soft)] uppercase tracking-wider mb-1.5"
							>
								Prioridad
							</label>
							<select
								id="edit-priority"
								value={priority}
								onChange={(e) =>
									setPriority(e.target.value as Task["priority"])
								}
								className="demo-select text-xs font-semibold"
							>
								<option value="low">Baja</option>
								<option value="medium">Media</option>
								<option value="high">Alta / Urgente</option>
							</select>
						</div>
						<div>
							<label
								htmlFor="edit-column"
								className="block text-xs font-bold text-[var(--sea-ink-soft)] uppercase tracking-wider mb-1.5"
							>
								Estado
							</label>
							<select
								id="edit-column"
								value={column}
								onChange={(e) => setColumn(e.target.value as Task["column"])}
								className="demo-select text-xs font-semibold"
							>
								<option value="pendiente">Pendiente</option>
								<option value="en-proceso">En Proceso</option>
								<option value="finalizado">Finalizado</option>
							</select>
						</div>
					</div>

					<div>
						<label
							htmlFor="edit-project"
							className="block text-xs font-bold text-[var(--sea-ink-soft)] uppercase tracking-wider mb-1.5"
						>
							Proyecto
						</label>
						<select
							id="edit-project"
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
							Actualizar Nota
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
