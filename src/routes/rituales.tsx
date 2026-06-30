import { createFileRoute } from "@tanstack/react-router";
import { Plus, Sparkles, Trash2, X, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { sileo } from "sileo";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

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
	const convexRituals = useQuery(api.rituals.list);
	const convexTasks = useQuery(api.tasks.list);
	const convexProjects = useQuery(api.projects.list);

	const createRitualMutation = useMutation(api.rituals.create);
	const removeRitualMutation = useMutation(api.rituals.remove);
	const createTaskMutation = useMutation(api.tasks.create);
	const removeTaskMutation = useMutation(api.tasks.remove);

	const rituals = useMemo<Ritual[]>(() => {
		return (
			convexRituals?.map((r) => ({
				id: r._id,
				title: r.title,
				description: r.description,
				createdAt: r.createdAt,
			})) || []
		);
	}, [convexRituals]);

	const [showAddModal, setShowAddModal] = useState(false);
	const [newTitle, setNewTitle] = useState("");
	const [newDesc, setNewDesc] = useState("");

	const handleAddRitual = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newTitle.trim()) return;

		try {
			// Create ritual template in Convex
			await createRitualMutation({
				title: newTitle.trim(),
				description: newDesc.trim(),
			});

			// Find a default project to assign the task to
			const mainProj = convexProjects?.[0];
			if (mainProj) {
				await createTaskMutation({
					title: newTitle.trim(),
					description: newDesc.trim(),
					priority: "medium",
					column: "pendiente",
					projectId: mainProj._id,
					isRitual: true,
				});
			}

			sileo.success({
				title: "¡Ritual Añadido!",
				description: `"${newTitle.trim()}" se ha integrado en tus hábitos diarios y tu tablero de hoy.`,
				fill: "#130f26",
				styles: {
					title: "text-purple-200 font-extrabold",
					description: "text-purple-300/80 text-xs font-semibold mt-0.5",
				},
			});

			setNewTitle("");
			setNewDesc("");
			setShowAddModal(false);
		} catch (err) {
			console.error(err);
		}
	};

	const handleDeleteRitual = async (id: string, title: string) => {
		if (
			confirm(
				`¿Deseas eliminar el ritual "${title}"? Se removerá de tus hábitos diarios.`,
			)
		) {
			try {
				// Remove the ritual template
				await removeRitualMutation({ id: id as Id<"rituals"> });

				// Also remove the task instance of this ritual if it exists
				if (convexTasks) {
					const matchingTasks = convexTasks.filter(
						(t) => t.isRitual && t.title === title,
					);
					for (const task of matchingTasks) {
						await removeTaskMutation({ id: task._id });
					}
				}

				sileo.error({
					title: "Ritual Eliminado",
					description: `"${title}" ha sido removido de tu rutina diaria.`,
					fill: "#260f1c",
					styles: {
						title: "text-red-200 font-extrabold",
						description: "text-red-300/80 text-xs font-semibold mt-0.5",
					},
				});
			} catch (err) {
				console.error(err);
			}
		}
	};

	return (
		<main className="page-wrap px-4 py-8 max-w-4xl mx-auto">
			{/* Explanation Area */}
			<section className="mb-8 rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)]/75 backdrop-blur-md p-6 shadow-sm relative">
				<div className="flex items-center gap-3 mb-3">
					<h1 className="display-title m-0 text-2xl font-black text-slate-100 font-serif">
						¿Qué es un Ritual?
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
							<span>Mis Rituales</span>
						</h2>
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
