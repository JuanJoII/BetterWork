import { useMutation, useQuery } from "convex/react";
import { Check, Plus, Trash2, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { sileo } from "sileo";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import type { Daily } from "../../types/kanban";
import { getTodayDateKey } from "../../utils/date";
import { NOTE_TONE_STYLES } from "../../utils/noteTheme";
import { getErrorToastTheme, getSuccessToastTheme } from "../../utils/toast";
import ModalShell from "../ui/ModalShell";

export default function DailysBoard() {
	const convexDailys = useQuery(api.rituals.list);

	const createDailyMutation = useMutation(api.rituals.create);
	const removeDailyMutation = useMutation(api.rituals.remove);

	const today = getTodayDateKey();

	const dailys = useMemo<Daily[]>(() => {
		return (
			convexDailys?.map((d: Doc<"rituals">) => ({
				id: d._id,
				title: d.title,
				description: d.description,
				lastCompletedDate: d.lastCompletedDate,
				lastSyncedDate: d.lastSyncedDate,
				createdAt: d.createdAt,
			})) || []
		);
	}, [convexDailys]);

	const [showAddModal, setShowAddModal] = useState(false);
	const [newTitle, setNewTitle] = useState("");
	const [newDesc, setNewDesc] = useState("");
	const dailyTitleInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!showAddModal) return;
		const timer = window.setTimeout(() => {
			dailyTitleInputRef.current?.focus();
		}, 30);
		return () => window.clearTimeout(timer);
	}, [showAddModal]);

	const handleAddDaily = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newTitle.trim()) return;

		try {
			await createDailyMutation({
				title: newTitle.trim(),
				description: newDesc.trim(),
				localDate: getTodayDateKey(),
			});

			sileo.success({
				title: "¡Daily Añadido!",
				description: `"${newTitle.trim()}" se ha integrado en tus hábitos diarios y tu tablero de hoy.`,
				...getSuccessToastTheme(),
			});

			setNewTitle("");
			setNewDesc("");
			setShowAddModal(false);
		} catch (err) {
			console.error(err);
		}
	};

	const handleDeleteDaily = async (id: string, title: string) => {
		const toastKey = `delete-daily-${id}`;
		sileo.error({
			id: toastKey,
			title: "¿Eliminar daily?",
			duration: 3000,
			description: `Se removerá el daily "${title}" de tus hábitos diarios y su tarea activa si existe. Pulsa 'Eliminar' para confirmar, o cierra esta alerta para cancelar.`,
			...getErrorToastTheme(),
			button: {
				title: "Eliminar",
				onClick: () => {
					sileo.dismiss(toastKey);
					removeDailyMutation({ id: id as Id<"rituals"> })
						.then(() => {
							sileo.error({
								title: "Daily Eliminado",
								description: `"${title}" ha sido removido de tu rutina diaria.`,
								...getErrorToastTheme(),
							});
						})
						.catch((err) => {
							console.error("Error deleting daily:", err);
							sileo.error({
								title: "Error al eliminar",
								description: "No se pudo eliminar el daily. Intenta de nuevo.",
								...getErrorToastTheme(),
							});
						});
				},
			},
		} as Parameters<typeof sileo.error>[0]);
	};

	return (
		<main className="page-wrap px-4 pt-12 pb-0 max-w-4xl mx-auto">
			{/* Explanation Area */}
			<section className="mb-8 rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)]/80 backdrop-blur-md p-6 shadow-sm relative">
				<div className="flex items-center gap-3 mb-3">
					<h1 className="display-title m-0 text-2xl font-black text-[var(--sea-ink)] font-serif">
						¿Qué es un Daily?
					</h1>
				</div>
				<p className="m-0 text-xs leading-relaxed text-[var(--sea-ink-soft)] font-medium max-w-3xl">
					Los dailys son tus hábitos recurrentes diarios. Al agregarlos en esta
					sección se incorporarán automáticamente en tu columna de{" "}
					<strong>Pendiente</strong> en el Tablero principal. Cada mañana al
					ingresar a la aplicación, todos tus dailys completados volverán a
					estar activos para ayudarte a mantener tus metas.
				</p>
			</section>

			{/* Dedicated Dailys Board Column */}
			<div className="flex flex-col rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)]/80 backdrop-blur-sm p-6 shadow-sm dot-grid min-h-[500px] w-full">
				{/* Column Header */}
				<div className="mb-4 flex items-center justify-between border-b border-[var(--line)] pb-4">
					<div>
						<h2 className="display-title m-0 text-lg font-black tracking-tight text-[var(--sea-ink)] flex items-center gap-2">
							<span>Mis Dailys</span>
						</h2>
					</div>
					<span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/20 text-xs font-black text-amber-800 border border-amber-500/35 dark:bg-yellow-400/20 dark:text-yellow-400 dark:border-yellow-400/35 shadow-[0_0_10px_rgba(234,179,8,0.15)]">
						{dailys.length}
					</span>
				</div>

				{/* Top Add Card trigger */}
				<button
					type="button"
					onClick={() => setShowAddModal(true)}
					className="mb-6 flex w-full items-center justify-center gap-1 rounded-2xl border border-dashed border-purple-500/40 bg-purple-500/8 py-3 text-xs font-extrabold text-purple-800 hover:border-purple-500 hover:bg-purple-500/15 dark:border-purple-500/25 dark:bg-purple-500/5 dark:text-purple-300 dark:hover:border-purple-400 dark:hover:bg-purple-500/10 transition cursor-pointer"
				>
					<Plus className="h-4 w-4" />
					<span>Añadir Daily</span>
				</button>

				{/* Daily Cards Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
					{dailys.length > 0 ? (
						dailys.map((daily) => {
							const completedToday = daily.lastCompletedDate === today;

							return (
								<div
									key={daily.id}
									className="relative rounded-2xl border border-purple-300/80 bg-purple-50/95 text-purple-950 dark:border-purple-500/30 dark:bg-purple-950/15 dark:text-purple-100/90 p-5 flex flex-col justify-between transition-all duration-300 shadow-sm"
								>
									{/* Tech-tape overlay */}
									<div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5.5 bg-purple-300/45 border-x border-purple-400/55 dark:bg-purple-500/20 dark:border-purple-400/40 shadow-sm backdrop-blur-[2px] z-10" />

									<div>
										{/* Note meta bar */}
										<div className="relative z-10 mb-3 flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
											<span className="font-black text-purple-700 dark:text-purple-400">
												Hábito Diario
											</span>
											<div className="flex items-center gap-1.5">
												{completedToday && (
													<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-emerald-400/50 bg-emerald-100 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-300 font-black">
														<Check className="h-3 w-3" />
														Completado hoy
													</span>
												)}
												<span className="px-2 py-0.5 rounded border border-purple-300 bg-purple-100 text-purple-800 dark:border-purple-500/40 dark:bg-purple-500/20 dark:text-purple-300 font-black animate-pulse">
													DAILY
												</span>
											</div>
										</div>

										<h3 className="m-0 text-base font-black leading-snug text-purple-900 dark:text-purple-300">
											{daily.title}
										</h3>

										<p className="mt-2 mb-4 text-xs leading-relaxed opacity-90 dark:opacity-85 font-medium text-slate-700 dark:text-slate-300">
											{daily.description}
										</p>
									</div>

									{/* Delete Action Footer */}
									<div className="border-t border-purple-300/60 dark:border-purple-500/10 pt-3.5 flex items-center justify-end text-purple-700 dark:text-purple-400/75">
										<button
											type="button"
											onClick={() => handleDeleteDaily(daily.id, daily.title)}
											className="p-1.5 rounded-lg hover:bg-red-500/15 text-red-600/85 hover:text-red-700 dark:hover:bg-red-500/20 dark:text-red-400/80 dark:hover:text-red-400 transition cursor-pointer"
											title="Eliminar Daily"
										>
											<Trash2 className="h-4 w-4" />
										</button>
									</div>
								</div>
							);
						})
					) : (
						<div className="col-span-1 sm:col-span-2 flex flex-col items-center justify-center py-16 text-center text-[var(--sea-ink-soft)] border border-dashed border-[var(--line)] rounded-2xl opacity-60">
							<Zap className="h-8 w-8 opacity-30 mb-2" />
							<span className="text-xs font-bold">
								No tienes dailys activos
							</span>
						</div>
					)}
				</div>
			</div>

			{/* CREATE DAILY OVERLAY MODAL */}
			<ModalShell
				isOpen={showAddModal}
				onClose={() => setShowAddModal(false)}
				ariaLabel="Crear daily"
				tone="daily"
			>
				<form onSubmit={handleAddDaily} className="flex flex-col">
					<div className="mb-3 flex items-center gap-2.5 pr-8 pt-1">
						<label htmlFor="modal-daily-title" className="sr-only">
							Nombre del Daily
						</label>
						<input
							ref={dailyTitleInputRef}
							id="modal-daily-title"
							type="text"
							required
							placeholder="Ej. Revisar bandeja de Gmail"
							value={newTitle}
							onChange={(e) => setNewTitle(e.target.value)}
							className={`min-w-0 flex-1 border-0 border-b bg-transparent pb-2 font-serif text-xl font-black leading-snug focus:outline-none ${NOTE_TONE_STYLES.daily.titleInput}`}
						/>
						<span
							className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${NOTE_TONE_STYLES.daily.pill}`}
						>
							DAILY
						</span>
					</div>

					<label htmlFor="modal-daily-desc" className="sr-only">
						Descripción
					</label>
					<textarea
						id="modal-daily-desc"
						rows={5}
						placeholder="Instrucciones breves o rutina diaria..."
						value={newDesc}
						onChange={(e) => setNewDesc(e.target.value)}
						className="w-full resize-none bg-transparent text-sm leading-relaxed font-medium text-slate-700 placeholder:text-slate-400/90 focus:outline-none dark:text-slate-200/90 dark:placeholder:text-slate-400/60"
					/>

					<div
						className={`mt-5 flex items-center justify-end gap-2.5 border-t pt-4 pb-1 ${NOTE_TONE_STYLES.daily.divider}`}
					>
						<button
							type="button"
							onClick={() => setShowAddModal(false)}
							className={`rounded-full px-4 py-1.5 text-xs font-extrabold transition duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer ${NOTE_TONE_STYLES.daily.cancelButton} ${NOTE_TONE_STYLES.daily.focusRing}`}
						>
							Cancelar
						</button>
						<button
							type="submit"
							disabled={!newTitle.trim()}
							className={`rounded-full px-5 py-1.5 text-xs font-black shadow-sm transition duration-200 active:scale-95 disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none cursor-pointer ${NOTE_TONE_STYLES.daily.ctaButton} ${NOTE_TONE_STYLES.daily.focusRing}`}
						>
							Crear Daily
						</button>
					</div>
				</form>
			</ModalShell>
		</main>
	);
}
