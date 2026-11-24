import {
	Folder,
	FolderOpen,
	LayoutGrid,
	PanelLeftClose,
	PanelLeftOpen,
	Plus,
	Search,
	X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Project } from "../../types/kanban";
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

	const activeProjectName =
		currentProjectId === "all"
			? "Tablero General"
			: projects.find((p) => p.id === currentProjectId)?.name ||
				"Tablero General";

	const activeProjectCount =
		currentProjectId === "all"
			? totalTaskCount
			: (taskCountByProject[currentProjectId] ?? 0);

	const renderProjectList = () => (
		<div className="flex flex-col gap-1.5 overflow-y-auto kanban-scroll pr-0.5 flex-1 min-h-0">
			{/* Tablero General */}
			<button
				type="button"
				onClick={() => handleProjectSelect("all")}
				className={`group flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-extrabold transition-all duration-200 cursor-pointer ${
					currentProjectId === "all"
						? "bg-yellow-300 border-yellow-400 text-slate-950 shadow-sm"
						: "border-transparent bg-transparent text-yellow-100/85 hover:border-yellow-500/20 hover:bg-yellow-400/10"
				}`}
			>
				<span className="flex items-center gap-2.5 min-w-0">
					<LayoutGrid className="h-4 w-4 shrink-0" />
					<span className="truncate">Tablero General</span>
				</span>
				<span
					className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${
						currentProjectId === "all"
							? "bg-slate-950/15 text-slate-950"
							: "bg-yellow-400/15 text-yellow-300"
					}`}
				>
					{totalTaskCount}
				</span>
			</button>

			{/* Divider + Section label */}
			<div className="mt-2 mb-1 flex items-center justify-between px-1.5">
				<span className="text-[10px] font-black uppercase tracking-widest text-[var(--sea-ink-soft)]">
					Proyectos
				</span>
				<span className="text-[10px] font-bold text-[var(--sea-ink-soft)]">
					{projects.length}
				</span>
			</div>

			{/* Unlimited vertical project items */}
			{projects.map((proj) => {
				const isSelected = currentProjectId === proj.id;
				const isGeneral = proj.name.toLowerCase() === "general";
				const count = taskCountByProject[proj.id] ?? 0;

				return (
					<div
						key={proj.id}
						className={`group flex items-center rounded-xl border transition-all duration-200 ${
							isSelected
								? "bg-yellow-300 border-yellow-400 text-slate-950 shadow-sm"
								: "border-transparent bg-transparent text-yellow-100/85 hover:border-yellow-500/20 hover:bg-yellow-400/10"
						}`}
					>
						<button
							type="button"
							onClick={() => handleProjectSelect(proj.id)}
							title={proj.name}
							className="flex flex-1 min-w-0 items-center justify-between gap-2 px-3 py-2 text-left text-xs font-extrabold cursor-pointer"
						>
							<span className="flex items-center gap-2.5 min-w-0">
								{isSelected ? (
									<FolderOpen className="h-4 w-4 shrink-0" />
								) : (
									<Folder className="h-4 w-4 shrink-0 opacity-75" />
								)}
								<span className="truncate">{proj.name}</span>
							</span>
							<span
								className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${
									isSelected
										? "bg-slate-950/15 text-slate-950"
										: "bg-yellow-400/10 text-yellow-300/90"
								}`}
							>
								{count}
							</span>
						</button>

						{!isGeneral && (
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									handleDeleteProject(proj.id, proj.name);
								}}
								aria-label={`Eliminar proyecto ${proj.name}`}
								title={`Eliminar proyecto ${proj.name}`}
								className={`mr-1.5 rounded-lg p-1.5 transition cursor-pointer shrink-0 ${
									isSelected
										? "text-red-700 hover:bg-red-500/15 hover:text-red-900"
										: "text-red-400/60 opacity-75 hover:opacity-100 hover:bg-red-500/15 hover:text-red-300"
								}`}
							>
								<X className="h-3.5 w-3.5" />
							</button>
						)}
					</div>
				);
			})}
		</div>
	);

	return (
		<>
			{/* MOBILE / TABLET COMPACT TRIGGER BAR */}
			<div className="flex lg:hidden w-full items-center gap-2.5">
				<button
					type="button"
					onClick={() => setIsMobileOpen(true)}
					aria-label="Abrir panel de proyectos"
					className="flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)]/80 px-3.5 py-2 text-xs font-extrabold text-[var(--sea-ink)] backdrop-blur-md transition hover:border-yellow-400/40 cursor-pointer shrink-0"
				>
					<PanelLeftOpen className="h-4 w-4 text-yellow-400" />
					<span className="max-w-[10rem] truncate">{activeProjectName}</span>
					<span className="rounded-full bg-yellow-400/20 px-1.5 py-0.5 text-[10px] font-black text-yellow-300">
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
						className="relative z-10 flex h-full w-72 max-w-[82vw] flex-col gap-4 border-r border-[var(--line)] bg-slate-950/95 p-5 shadow-2xl backdrop-blur-md"
					>
						<div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
							<span className="display-title text-base font-black text-[var(--sea-ink)]">
								Espacios
							</span>
							<button
								type="button"
								onClick={() => setIsMobileOpen(false)}
								aria-label="Cerrar panel"
								className="rounded-xl p-1.5 text-[var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)] cursor-pointer"
							>
								<X className="h-4 w-4" />
							</button>
						</div>

						<SearchBar value={searchQuery} onChange={setSearchQuery} />

						{renderProjectList()}

						<div className="border-t border-[var(--line)] pt-3">
							<button
								type="button"
								onClick={() => {
									setIsMobileOpen(false);
									handleCreateProject();
								}}
								className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-yellow-500/35 bg-yellow-500/5 py-2.5 text-xs font-extrabold text-yellow-400 transition hover:border-yellow-400 hover:bg-yellow-400/10 cursor-pointer"
							>
								<Plus className="h-4 w-4" />
								<span>Nuevo Proyecto</span>
							</button>
						</div>
					</aside>
				</div>
			)}

			{/* DESKTOP STICKY SIDEBAR */}
			<aside
				aria-label="Barra lateral de proyectos"
				className={`hidden lg:flex flex-col shrink-0 sticky top-24 self-start max-h-[calc(100vh-7.5rem)] rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)]/80 backdrop-blur-md shadow-sm transition-all duration-300 ${
					isCollapsed ? "w-16 p-3 items-center gap-3" : "w-64 xl:w-72 p-4 gap-4"
				}`}
			>
				{isCollapsed ? (
					<>
						<button
							type="button"
							onClick={toggleCollapsed}
							aria-label="Expandir barra lateral"
							title="Expandir barra lateral"
							className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] text-[var(--sea-ink-soft)] transition hover:border-yellow-400/40 hover:text-yellow-300 cursor-pointer"
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
							className={`flex h-10 w-10 items-center justify-center rounded-xl border transition cursor-pointer ${
								searchQuery
									? "border-yellow-400 bg-yellow-400/15 text-yellow-300"
									: "border-transparent text-[var(--sea-ink-soft)] hover:border-yellow-500/20 hover:bg-yellow-400/10 hover:text-yellow-200"
							}`}
						>
							<Search className="h-4 w-4" />
						</button>

						<div className="h-px w-8 bg-[var(--line)]" />

						<div className="flex flex-1 min-h-0 flex-col items-center gap-2 overflow-y-auto kanban-scroll py-0.5">
							<button
								type="button"
								onClick={() => handleProjectSelect("all")}
								aria-label="Tablero General"
								title={`Tablero General (${totalTaskCount})`}
								className={`flex h-10 w-10 items-center justify-center rounded-xl border transition cursor-pointer ${
									currentProjectId === "all"
										? "bg-yellow-300 border-yellow-400 text-slate-950 shadow-sm"
										: "border-transparent text-yellow-100/80 hover:border-yellow-500/20 hover:bg-yellow-400/10"
								}`}
							>
								<LayoutGrid className="h-4 w-4" />
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
										className={`flex h-10 w-10 items-center justify-center rounded-xl border text-xs font-black transition cursor-pointer ${
											isSelected
												? "bg-yellow-300 border-yellow-400 text-slate-950 shadow-sm"
												: "border-yellow-500/15 bg-yellow-500/5 text-yellow-200 hover:border-yellow-400/40 hover:bg-yellow-400/15"
										}`}
									>
										{initial}
									</button>
								);
							})}
						</div>

						<div className="h-px w-8 bg-[var(--line)]" />

						<button
							type="button"
							onClick={handleCreateProject}
							aria-label="Nuevo Proyecto"
							title="Nuevo Proyecto"
							className="flex h-10 w-10 items-center justify-center rounded-xl border border-dashed border-yellow-500/35 bg-yellow-500/5 text-yellow-400 transition hover:border-yellow-400 hover:bg-yellow-400/10 cursor-pointer"
						>
							<Plus className="h-4 w-4" />
						</button>
					</>
				) : (
					<>
						{/* Sidebar Header */}
						<div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
							<div className="min-w-0">
								<span className="island-kicker block text-[10px]">
									Espacio de trabajo
								</span>
								<h2 className="display-title m-0 text-base font-black text-[var(--sea-ink)] truncate">
									Proyectos
								</h2>
							</div>
							<button
								type="button"
								onClick={toggleCollapsed}
								aria-label="Colapsar barra lateral"
								title="Colapsar barra lateral"
								className="rounded-xl p-1.5 text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)] cursor-pointer"
							>
								<PanelLeftClose className="h-4 w-4" />
							</button>
						</div>

						{/* Integrated SearchBar */}
						<SearchBar
							value={searchQuery}
							onChange={setSearchQuery}
							inputRef={desktopSearchRef}
						/>

						{/* Projects vertical list */}
						{renderProjectList()}

						{/* Pinned Create Project trigger */}
						<div className="border-t border-[var(--line)] pt-3">
							<button
								type="button"
								onClick={handleCreateProject}
								className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-yellow-500/35 bg-yellow-500/5 py-2.5 text-xs font-extrabold text-yellow-400 transition hover:border-yellow-400 hover:bg-yellow-400/10 cursor-pointer"
							>
								<Plus className="h-4 w-4" />
								<span>Nuevo Proyecto</span>
							</button>
						</div>
					</>
				)}
			</aside>
		</>
	);
}
