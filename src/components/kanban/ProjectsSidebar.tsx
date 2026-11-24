import {
	LayoutGrid,
	PanelLeftClose,
	PanelLeftOpen,
	Plus,
	Search,
	Trash2,
	X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Project } from "../../types/kanban";
import ArcList, { type ArcListItem } from "./ArcList";
import SearchBar from "./SearchBar";

interface ProjectsSidebarProps {
	projects: Project[];
	currentProjectId: string;
	setCurrentProjectId: (id: string) => void;
	searchQuery: string;
	setSearchQuery: (value: string) => void;
	totalTaskCount: number;
	taskCountByProject: Record<string, number>;
	handleCreateProject: () => void;
	handleDeleteProject: (id: string, name: string) => void;
}

const SIDEBAR_STORAGE_KEY = "kairos_sidebar_collapsed";

export default function ProjectsSidebar({
	projects,
	currentProjectId,
	setCurrentProjectId,
	searchQuery,
	setSearchQuery,
	totalTaskCount,
	taskCountByProject,
	handleCreateProject,
	handleDeleteProject,
}: ProjectsSidebarProps) {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [isMobileOpen, setIsMobileOpen] = useState(false);
	const desktopSearchRef = useRef<HTMLInputElement>(null);
	const collapsedNavRef = useRef<HTMLElement>(null);
	const collapsedWheelAccRef = useRef(0);
	const collapsedLastStepRef = useRef(0);

	useEffect(() => {
		try {
			const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
			if (stored === "true") {
				setIsCollapsed(true);
			}
		} catch {
			// ignore storage access issues
		}
	}, []);

	const toggleCollapsed = () => {
		setIsCollapsed((prev) => {
			const next = !prev;
			try {
				window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
			} catch {
				// ignore storage access issues
			}
			return next;
		});
	};

	const handleExpandAndSearch = () => {
		setIsCollapsed(false);
		try {
			window.localStorage.setItem(SIDEBAR_STORAGE_KEY, "false");
		} catch {
			// ignore storage access issues
		}
		setTimeout(() => {
			desktopSearchRef.current?.focus();
		}, 40);
	};

	const handleProjectSelect = (id: string) => {
		setCurrentProjectId(id);
		setIsMobileOpen(false);
	};

	const arcItems = useMemo<ArcListItem[]>(() => {
		return [
			{
				id: "all",
				title: "Tablero General",
				badge: totalTaskCount,
			},
			...projects.map((proj) => ({
				id: proj.id,
				title: proj.name,
				badge: taskCountByProject[proj.id] ?? 0,
			})),
		];
	}, [projects, totalTaskCount, taskCountByProject]);

	const activeIndex = useMemo(() => {
		const idx = arcItems.findIndex((item) => item.id === currentProjectId);
		return Math.max(idx, 0);
	}, [arcItems, currentProjectId]);

	const activeProject = useMemo(
		() => projects.find((proj) => proj.id === currentProjectId) ?? null,
		[projects, currentProjectId],
	);

	const canDeleteActiveProject =
		activeProject !== null && activeProject.name.toLowerCase() !== "general";

	const activeProjectName = arcItems[activeIndex]?.title ?? "Tablero General";
	const activeProjectCount = arcItems[activeIndex]?.badge ?? totalTaskCount;

	const triggerDeleteActiveProject = () => {
		if (!canDeleteActiveProject || !activeProject) return;
		handleDeleteProject(activeProject.id, activeProject.name);
	};

	const latestCollapsedRef = useRef({
		arcItems,
		activeIndex,
		setCurrentProjectId,
	});
	latestCollapsedRef.current = {
		arcItems,
		activeIndex,
		setCurrentProjectId,
	};

	// Enable smooth wheel project cycling in collapsed compact sidebar mode
	useEffect(() => {
		if (!isCollapsed) return;
		const el = collapsedNavRef.current;
		if (!el) return;

		const handleCollapsedWheel = (e: WheelEvent) => {
			const {
				arcItems: items,
				activeIndex: currentIdx,
				setCurrentProjectId: selectProject,
			} = latestCollapsedRef.current;

			if (items.length <= 1) return;

			e.preventDefault();

			const now = Date.now();
			if (now - collapsedLastStepRef.current < 130) {
				return;
			}

			collapsedWheelAccRef.current += e.deltaY;
			if (Math.abs(collapsedWheelAccRef.current) >= 24) {
				const direction = collapsedWheelAccRef.current > 0 ? 1 : -1;
				collapsedWheelAccRef.current = 0;

				const nextIdx = Math.min(
					Math.max(currentIdx + direction, 0),
					items.length - 1,
				);

				if (nextIdx !== currentIdx) {
					collapsedLastStepRef.current = now;
					selectProject(items[nextIdx].id);
				}
			}
		};

		el.addEventListener("wheel", handleCollapsedWheel, { passive: false });
		return () => {
			el.removeEventListener("wheel", handleCollapsedWheel);
		};
	}, [isCollapsed]);

	return (
		<>
			{/* MOBILE / TABLET COMPACT TRIGGER BAR */}
			<div className="flex lg:hidden w-full items-center gap-2.5">
				<button
					type="button"
					onClick={() => setIsMobileOpen(true)}
					aria-label="Abrir panel de proyectos"
					className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-strong)]/80 px-3.5 py-1.5 text-xs font-extrabold text-[var(--sea-ink)] backdrop-blur-md transition hover:border-yellow-400/40 cursor-pointer shrink-0"
				>
					<PanelLeftOpen className="h-4 w-4 text-yellow-400" />
					<span className="max-w-[10rem] truncate">{activeProjectName}</span>
					<span className="rounded-full bg-yellow-400/20 px-1.5 py-0.5 text-[10px] font-black text-yellow-300 leading-none">
						{activeProjectCount}
					</span>
				</button>

				<div className="flex-1 min-w-0">
					<SearchBar value={searchQuery} onChange={setSearchQuery} />
				</div>
			</div>

			{/* MOBILE SLIDE-OVER DRAWER */}
			{isMobileOpen && (
				<div className="fixed inset-0 z-50 flex lg:hidden">
					<button
						type="button"
						aria-label="Cerrar panel de proyectos"
						onClick={() => setIsMobileOpen(false)}
						className="fixed inset-0 bg-black/55 backdrop-blur-xs border-none"
					/>
					<aside
						aria-label="Barra lateral de proyectos móvil"
						className="relative z-10 flex h-full w-64 max-w-[82vw] flex-col justify-between gap-3 border-r border-[var(--line)] bg-slate-950/95 p-4 shadow-2xl backdrop-blur-md"
					>
						<div className="flex flex-col gap-3">
							<div className="flex items-center justify-between gap-2 pb-1">
								<h2
									title={activeProjectName}
									className="display-title m-0 text-sm font-black text-[var(--sea-ink)] truncate"
								>
									{activeProjectName}
								</h2>
								<button
									type="button"
									onClick={() => setIsMobileOpen(false)}
									aria-label="Cerrar panel"
									className="rounded-lg p-1 text-[var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)] cursor-pointer shrink-0"
								>
									<X className="h-4 w-4" />
								</button>
							</div>

							<SearchBar value={searchQuery} onChange={setSearchQuery} />
						</div>

						<ArcList
							items={arcItems}
							activeIndex={activeIndex}
							onSelect={(_idx, item) => handleProjectSelect(item.id)}
							imageSide="none"
							curve={0.95}
							spacing={64}
							visible={4}
							blur={7}
							backgroundColor="#000000"
							subtitles={false}
							autoplay={false}
							interval={5.5}
							wheel={true}
							imageAspect={0.72}
							imageRadius={22}
							className="flex-1 min-h-0"
						/>

						<div className="flex flex-col gap-2">
							<button
								type="button"
								onClick={() => {
									setIsMobileOpen(false);
									handleCreateProject();
								}}
								className="flex w-full items-center justify-center gap-1.5 rounded-full border border-dashed border-yellow-500/35 bg-transparent py-1.5 text-xs font-extrabold text-yellow-400 transition hover:border-yellow-400 hover:bg-yellow-400/10 cursor-pointer"
							>
								<Plus className="h-3.5 w-3.5" />
								<span>Nuevo Proyecto</span>
							</button>

							<button
								type="button"
								disabled={!canDeleteActiveProject}
								onClick={() => {
									setIsMobileOpen(false);
									triggerDeleteActiveProject();
								}}
								title={
									canDeleteActiveProject
										? `Eliminar proyecto ${activeProjectName}`
										: "No se puede eliminar este tablero"
								}
								className="flex w-full items-center justify-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/5 py-1.5 text-xs font-extrabold text-red-400 transition hover:border-red-400 hover:bg-red-500/15 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:border-red-500/30 disabled:hover:bg-red-500/5 cursor-pointer"
							>
								<Trash2 className="h-3.5 w-3.5" />
								<span>Eliminar Proyecto</span>
							</button>
						</div>
					</aside>
				</div>
			)}

			{/* DESKTOP FULL-HEIGHT BORDERLESS ARC SIDEBAR */}
			<aside
				aria-label="Barra lateral de proyectos"
				className={`hidden lg:flex flex-col justify-between shrink-0 sticky top-28 h-[calc(100vh-9.5rem)] transition-all duration-300 ${
					isCollapsed
						? "w-12 items-center gap-2.5 py-1"
						: "w-52 xl:w-56 gap-3 py-1"
				}`}
			>
				{isCollapsed ? (
					<>
						<div className="flex flex-col items-center gap-2.5">
							<button
								type="button"
								onClick={toggleCollapsed}
								aria-label="Expandir barra lateral"
								title="Expandir barra lateral"
								className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-strong)]/70 text-[var(--sea-ink-soft)] transition hover:border-yellow-400/40 hover:text-yellow-300 cursor-pointer"
							>
								<PanelLeftOpen className="h-4 w-4" />
							</button>

							<button
								type="button"
								onClick={handleExpandAndSearch}
								aria-label="Buscar notas"
								title={
									searchQuery ? `Buscando: "${searchQuery}"` : "Buscar notas"
								}
								className={`flex h-9 w-9 items-center justify-center rounded-full border transition cursor-pointer ${
									searchQuery
										? "border-yellow-400 bg-yellow-400/15 text-yellow-300"
										: "border-[var(--line)] bg-[var(--surface-strong)]/50 text-[var(--sea-ink-soft)] hover:border-yellow-500/30 hover:text-yellow-200"
								}`}
							>
								<Search className="h-4 w-4" />
							</button>
						</div>

						<nav
							ref={collapsedNavRef}
							aria-label="Selector compacto de proyectos"
							className="flex flex-1 min-h-0 flex-col items-center justify-center gap-1.5 overflow-y-auto kanban-scroll py-2"
						>
							<button
								type="button"
								onClick={() => handleProjectSelect("all")}
								aria-label="Tablero General"
								title={`Tablero General (${totalTaskCount})`}
								className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition cursor-pointer ${
									currentProjectId === "all"
										? "bg-yellow-300 border-yellow-400 text-slate-950 shadow-sm"
										: "border-yellow-500/20 bg-yellow-500/5 text-yellow-100/80 hover:bg-yellow-400/10"
								}`}
							>
								<LayoutGrid className="h-3.5 w-3.5" />
							</button>

							{projects.map((proj) => {
								const isSelected = currentProjectId === proj.id;
								const initial = proj.name.trim().charAt(0).toUpperCase() || "P";
								return (
									<button
										key={proj.id}
										type="button"
										onClick={() => handleProjectSelect(proj.id)}
										aria-label={proj.name}
										title={`${proj.name} (${taskCountByProject[proj.id] ?? 0})`}
										className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-black transition cursor-pointer ${
											isSelected
												? "bg-yellow-300 border-yellow-400 text-slate-950 shadow-sm"
												: "border-yellow-500/20 bg-yellow-500/5 text-yellow-200 hover:border-yellow-400/40 hover:bg-yellow-400/15"
										}`}
									>
										{initial}
									</button>
								);
							})}
						</nav>

						<div className="flex flex-col items-center gap-2">
							<button
								type="button"
								onClick={handleCreateProject}
								aria-label="Nuevo Proyecto"
								title="Nuevo Proyecto"
								className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-yellow-500/35 bg-transparent text-yellow-400 transition hover:border-yellow-400 hover:bg-yellow-400/10 cursor-pointer"
							>
								<Plus className="h-4 w-4" />
							</button>

							<button
								type="button"
								disabled={!canDeleteActiveProject}
								onClick={triggerDeleteActiveProject}
								aria-label="Eliminar Proyecto"
								title={
									canDeleteActiveProject
										? `Eliminar proyecto ${activeProjectName}`
										: "No se puede eliminar este tablero"
								}
								className="flex h-9 w-9 items-center justify-center rounded-full border border-red-500/30 bg-red-500/5 text-red-400 transition hover:border-red-400 hover:bg-red-500/15 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
							>
								<Trash2 className="h-4 w-4" />
							</button>
						</div>
					</>
				) : (
					<>
						{/* Top Row: Search + Collapse */}
						<div className="flex items-center gap-1.5">
							<SearchBar
								value={searchQuery}
								onChange={setSearchQuery}
								inputRef={desktopSearchRef}
							/>
							<button
								type="button"
								onClick={toggleCollapsed}
								aria-label="Colapsar barra lateral"
								title="Colapsar barra lateral"
								className="rounded-xl p-1.5 text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)] cursor-pointer shrink-0"
							>
								<PanelLeftClose className="h-4 w-4" />
							</button>
						</div>

						{/* Full-height Curved Arc List */}
						<ArcList
							items={arcItems}
							activeIndex={activeIndex}
							onSelect={(_idx, item) => handleProjectSelect(item.id)}
							imageSide="none"
							curve={0.95}
							spacing={64}
							visible={4}
							blur={7}
							backgroundColor="#000000"
							subtitles={false}
							autoplay={false}
							interval={5.5}
							wheel={true}
							imageAspect={0.72}
							imageRadius={22}
							className="flex-1 min-h-0"
						/>

						{/* Bottom Actions: Create + Delete Active Project */}
						<div className="flex flex-col gap-2">
							<button
								type="button"
								onClick={handleCreateProject}
								className="flex w-full items-center justify-center gap-1.5 rounded-full border border-dashed border-yellow-500/35 bg-transparent py-1.5 text-xs font-extrabold text-yellow-400 transition hover:border-yellow-400 hover:bg-yellow-400/10 cursor-pointer"
							>
								<Plus className="h-3.5 w-3.5" />
								<span>Nuevo Proyecto</span>
							</button>

							<button
								type="button"
								disabled={!canDeleteActiveProject}
								onClick={triggerDeleteActiveProject}
								title={
									canDeleteActiveProject
										? `Eliminar proyecto ${activeProjectName}`
										: "No se puede eliminar este tablero"
								}
								className="flex w-full items-center justify-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/5 py-1.5 text-xs font-extrabold text-red-400 transition hover:border-red-400 hover:bg-red-500/15 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:border-red-500/30 disabled:hover:bg-red-500/5 cursor-pointer"
							>
								<Trash2 className="h-3.5 w-3.5" />
								<span>Eliminar Proyecto</span>
							</button>
						</div>
					</>
				)}
			</aside>
		</>
	);
}
