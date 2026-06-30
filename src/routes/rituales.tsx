import { createFileRoute } from "@tanstack/react-router";
import { Plus, Sparkles, Trash2, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { sileo } from "sileo";

export const Route = createFileRoute("/rituales")({
	component: RitualesPage,
});

interface Ritual {
	id: string;
	title: string;
	description: string;
	createdAt: string;
}

interface Task {
	id: string;
	title: string;
	description: string;
	priority: "low" | "medium" | "high";
	column: "pendiente" | "en-proceso" | "finalizado";
	projectId?: string;
	isRitual?: boolean;
	createdAt: string;
}

function RitualesPage() {
	const [rituals, setRituals] = useState<Ritual[]>(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("kairos_rituals");
			if (saved) {
				try {
					return JSON.parse(saved) as Ritual[];
				} catch (e) {
					console.error(e);
				}
			}
		}
		return [
			{
				id: "rit-1",
				title: "Revisar Gmail",
				description:
					"Verificar correos importantes de clientes y responder pendientes a primera hora.",
				createdAt: new Date().toISOString(),
			},
			{
				id: "rit-2",
				title: "Planificación Diaria",
				description:
					"Reorganizar las columnas del tablero y elegir el objetivo de enfoque del día.",
				createdAt: new Date().toISOString(),
			},
		];
	});

	const [showAddModal, setShowAddModal] = useState(false);
	const [newTitle, setNewTitle] = useState("");
	const [newDesc, setNewDesc] = useState("");

	useEffect(() => {
		localStorage.setItem("kairos_rituals", JSON.stringify(rituals));
	}, [rituals]);

	const handleAddRitual = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newTitle.trim()) return;

		const newRitual: Ritual = {
			id: `rit-${Date.now()}`,
			title: newTitle.trim(),
			description: newDesc.trim(),
			createdAt: new Date().toISOString(),
		};

		// Add template
		setRituals((prev) => [newRitual, ...prev]);

		// Immediately add to current Kanban tasks list
		if (typeof window !== "undefined") {
			try {
				const savedTasks = localStorage.getItem("kairos_kanban_tasks");
				const tasks = savedTasks ? (JSON.parse(savedTasks) as Task[]) : [];
				const newTask: Task = {
					id: `ritual-${newRitual.id}-${Date.now()}`,
					title: newRitual.title,
					description: newRitual.description,
					priority: "medium",
					column: "pendiente",
					isRitual: true,
					projectId: "proj-1",
					createdAt: new Date().toISOString(),
				};
				localStorage.setItem(
					"kairos_kanban_tasks",
					JSON.stringify([newTask, ...tasks]),
				);
			} catch (err) {
				console.error(err);
			}
		}

		sileo.success({
			title: "¡Ritual Añadido!",
			description: `"${newRitual.title}" se ha integrado en tus hábitos diarios y tu tablero de hoy.`,
		});

		setNewTitle("");
		setNewDesc("");
		setShowAddModal(false);
	};

	const handleDeleteRitual = (id: string, title: string) => {
		if (
			confirm(
				`¿Deseas eliminar el ritual "${title}"? Se removerá de tus hábitos diarios.`,
			)
		) {
			setRituals((prev) => prev.filter((r) => r.id !== id));

			// Remove active tasks of this ritual from the board
			if (typeof window !== "undefined") {
				try {
					const savedTasks = localStorage.getItem("kairos_kanban_tasks");
					if (savedTasks) {
						const tasks = JSON.parse(savedTasks) as Task[];
						const filtered = tasks.filter(
							(t) => !t.id.startsWith(`ritual-${id}`) && t.title !== title,
						);
						localStorage.setItem(
							"kairos_kanban_tasks",
							JSON.stringify(filtered),
						);
					}
				} catch (err) {
					console.error(err);
				}
			}

			sileo.error({
				title: "Ritual Eliminado",
				description: `"${title}" ha sido removido de tu rutina diaria.`,
			});
		}
	};

	return (
		<main className="page-wrap px-4 py-8 max-w-4xl mx-auto">
			{/* Explanation Area */}
			<section className="mb-8 rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)]/75 backdrop-blur-md p-6 shadow-sm relative">
				<div className="flex items-center gap-3 mb-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
						<Zap className="h-5 w-5 animate-pulse" />
					</div>
					<h1 className="display-title m-0 text-2xl font-black text-slate-100 font-serif">
						Mis Rituales Diarios
					</h1>
				</div>
				<p className="m-0 text-xs leading-relaxed text-[var(--sea-ink-soft)] font-medium max-w-3xl">
					Los rituales son tus hábitos recurrentes diarios. Al agregarlos en
					esta sección se incorporarán automáticamente en tu columna de
					**Pendiente** en el Tablero principal. Cada mañana al ingresar a la
					aplicación, todos tus rituales completados volverán a estar activos
					para ayudarte a mantener tus metas.
				</p>
			</section>

			{/* Dedicated Ritual Board Column */}
			<div className="flex flex-col rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)]/75 backdrop-blur-sm p-6 shadow-sm dot-grid min-h-[500px] w-full">
				{/* Column Header */}
				<div className="mb-4 flex items-center justify-between border-b border-[var(--line)] pb-4">
					<div>
						<h2 className="display-title m-0 text-lg font-black tracking-tight text-slate-100 flex items-center gap-2">
							<Zap className="h-5 w-5 text-purple-400" />
							<span>Hábitos Diarios</span>
						</h2>
						<span className="text-xs font-bold text-[var(--sea-ink-soft)]">
							Tus rituales activos para el día a día
						</span>
					</div>
					<span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400/20 text-xs font-black text-yellow-400 border border-yellow-400/35 shadow-[0_0_10px_rgba(234,179,8,0.15)]">
						{rituals.length}
					</span>
				</div>

				{/* Top Add Card trigger */}
				<button
					type="button"
					onClick={() => setShowAddModal(true)}
					className="mb-6 flex w-full items-center justify-center gap-1 rounded-2xl border border-dashed border-purple-500/25 bg-purple-500/5 py-3 text-xs font-extrabold text-purple-300 hover:border-purple-400 hover:bg-purple-500/10 transition cursor-pointer"
				>
					<Plus className="h-4 w-4" />
					<span>Añadir Ritual</span>
				</button>

				{/* Ritual Cards Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
					{rituals.length > 0 ? (
						rituals.map((rit) => (
							<div
								key={rit.id}
								className="relative rounded-2xl border border-purple-500/30 bg-purple-950/15 p-5 flex flex-col justify-between transition-all duration-300 shadow-sm text-purple-100/90"
							>
								{/* Tech-tape overlay */}
								<div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5.5 bg-purple-500/20 border-x border-purple-400/40 shadow-sm backdrop-blur-[2px] z-10" />

								<div>
									{/* Note meta bar */}
									<div className="relative z-10 mb-3 flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
										<span className="font-black text-purple-400">Hábitos</span>
										<span className="px-2 py-0.5 rounded border border-purple-500/40 bg-purple-500/20 text-purple-300 font-black animate-pulse">
											🔮 RITUAL
										</span>
									</div>

									<h3 className="m-0 text-base font-black leading-snug text-purple-300">
										{rit.title}
									</h3>

									<p className="mt-2 mb-4 text-xs leading-relaxed opacity-85 font-medium text-slate-300">
										{rit.description}
									</p>
								</div>

								{/* Delete Action Footer */}
								<div className="border-t border-purple-500/10 pt-3.5 flex items-center justify-end text-purple-400/75">
									<button
										type="button"
										onClick={() => handleDeleteRitual(rit.id, rit.title)}
										className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400/80 hover:text-red-400 transition cursor-pointer"
										title="Eliminar Ritual"
									>
										<Trash2 className="h-4 w-4" />
									</button>
								</div>
							</div>
						))
					) : (
						<div className="col-span-1 sm:col-span-2 flex flex-col items-center justify-center py-16 text-center text-[var(--sea-ink-soft)] border border-dashed border-[var(--line)] rounded-2xl opacity-60">
							<Zap className="h-8 w-8 opacity-30 mb-2" />
							<span className="text-xs font-bold">
								No tienes rituales activos
							</span>
						</div>
					)}
				</div>
			</div>

			{/* CREATE RITUAL OVERLAY MODAL */}
			{showAddModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
					<div className="w-full max-w-md rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface-strong)] p-6 shadow-xl relative rise-in">
						<button
							type="button"
							onClick={() => setShowAddModal(false)}
							className="absolute right-4 top-4 rounded-full p-1.5 text-[var(--sea-ink-soft)] hover:bg-[var(--bg-base)]"
						>
							<X className="h-4.5 w-4.5" />
						</button>

						<h2 className="display-title mb-4 text-xl font-bold text-[var(--sea-ink)] flex items-center gap-1.5">
							<Sparkles className="h-5 w-5 text-purple-400" />
							<span>Añadir Nuevo Ritual</span>
						</h2>

						<form onSubmit={handleAddRitual} className="space-y-4">
							<div>
								<label
									htmlFor="modal-rit-title"
									className="block text-xs font-bold text-[var(--sea-ink-soft)] uppercase tracking-wider mb-1.5"
								>
									Nombre del Ritual
								</label>
								<input
									id="modal-rit-title"
									type="text"
									required
									placeholder="Ej. Revisar bandeja de Gmail"
									value={newTitle}
									onChange={(e) => setNewTitle(e.target.value)}
									className="demo-input text-sm font-semibold"
								/>
							</div>

							<div>
								<label
									htmlFor="modal-rit-desc"
									className="block text-xs font-bold text-[var(--sea-ink-soft)] uppercase tracking-wider mb-1.5"
								>
									Descripción
								</label>
								<textarea
									id="modal-rit-desc"
									placeholder="Instrucciones breves..."
									value={newDesc}
									onChange={(e) => setNewDesc(e.target.value)}
									className="demo-textarea text-xs h-24"
								/>
							</div>

							<div className="pt-2 flex justify-end gap-2">
								<button
									type="button"
									onClick={() => setShowAddModal(false)}
									className="rounded-xl border border-[var(--line)] px-4 py-2 text-xs font-bold text-[var(--sea-ink-soft)] hover:bg-[var(--bg-base)]"
								>
									Cancelar
								</button>
								<button
									type="submit"
									className="rounded-xl bg-purple-600 text-white px-5 py-2 text-xs font-extrabold hover:bg-purple-700 active:scale-95 transition shadow-md cursor-pointer"
								>
									Crear Ritual
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</main>
	);
}
