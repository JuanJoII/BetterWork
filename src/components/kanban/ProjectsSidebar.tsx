import {
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

	const renderProjectPills = () => (
		<div className="flex flex-col gap-1.5 overflow-y-auto kanban-scroll pr-0.5 flex-1 min-h-0">
			{/* Tablero General pill */}
			<button
				type="button"
				onClick={() => handleProjectSelect("all")}
				className={`flex w-full items-center justify-between gap-2 rounded-full border px-3.5 py-1.5 text-left text-xs font-extrabold transition-all duration-200 active:scale-[0.98] cursor-pointer ${
					currentProjectId === "all"
						? "bg-yellow-300 border-yellow-400 text-slate-950 shadow-sm"
						: "border-yellow-500/20 bg-yellow-500/5 text-yellow-100/90 hover:bg-yellow-400/10"
				}`}
			>
				<span className="truncate">Tablero General</span>
				<span
					className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-black leading-none ${
						currentProjectId === "all"
							? "bg-slate-950/15 text-slate-950"
							: "bg-yellow-400/15 text-yellow-300"
					}`}
				>
					{totalTaskCount}
				</span>
			</button>

			{/* Project pills */}
			{projects.map((proj) => {
				const isSelected = currentProjectId === proj.id;
				const isGeneral = proj.name.toLowerCase() === "general";
				const count = taskCountByProject[proj.id] ?? 0;

				return (
					<div
						key={proj.id}
						className={`flex items-center rounded-full border transition-all duration-200 ${
							isSelected
								? "bg-yellow-300 border-yellow-400 text-slate-950 shadow-sm"
								: "border-yellow-500/20 bg-yellow-500/5 text-yellow-100/90 hover:bg-yellow-400/10"
						}`}
					>
						<button
							type="button"
							onClick={() => handleProjectSelect(proj.id)}
							title={proj.name}
							className={`flex flex-1 min-w-0 items-center justify-between gap-2 py-1.5 pl-3.5 text-left text-xs font-extrabold cursor-pointer ${
								isGeneral ? "pr-3.5 rounded-full" : "pr-2 rounded-l-full"
							}`}
						>
							<span className="truncate">{proj.name}</span>
							<span
								className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-black leading-none ${
									isSelected
										? "bg-slate-950/15 text-slate-950"
										: "bg-yellow-400/15 text-yellow-300/90"
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
								className={`pr-2.5 pl-1.5 py-1.5 rounded-r-full transition cursor-pointer shrink-0 ${
									isSelected
										? "text-red-700 hover:text-red-900"
										: "text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
								}`}
							>
								<X className="h-3 w-3" />
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
						className="relative z-10 flex h-full w-64 max-w-[80vw] flex-col gap-3 border-r border-[var(--line)] bg-slate-950/95 p-4 shadow-2xl backdrop-blur-md"
					>
						<div className="flex items-center justify-between gap-2 border-b border-[var(--line)] pb-2.5">
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

						{renderProjectPills()}

						<div className="border-t border-[var(--line)] pt-2.5">
							<button
								type="button"
								onClick={() => {
									setIsMobileOpen(false);
									handleCreateProject();
								}}
								className="flex w-full items-center justify-center gap-1 rounded-full border border-dashed border-yellow-500/35 bg-transparent py-1.5 text-xs font-extrabold text-yellow-400 transition hover:border-yellow-400 hover:bg-yellow-400/10 cursor-pointer"
							>
								<Plus className="h-3.5 w-3.5" />
								<span>Nuevo Proyecto</span>
							</button>
						</div>
					</aside>
				</div>
			)}

			{/* DESKTOP COMPACT STICKY SIDEBAR */}
			<aside
				aria-label="Barra lateral de proyectos"
				className={`hidden lg:flex flex-col shrink-0 sticky top-24 self-start max-h-[calc(100vh-7.5rem)] rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)]/80 backdrop-blur-md shadow-sm transition-all duration-300 ${
					isCollapsed
						? "w-14 p-2.5 items-center gap-2.5"
						: "w-52 xl:w-56 p-3 gap-3"
				}`}
			>
				{isCollapsed ? (
					<>
						<button
							type="button"
							onClick={toggleCollapsed}
							aria-label="Expandir barra lateral"
							title="Expandir barra lateral"
							className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] text-[var(--sea-ink-soft)] transition hover:border-yellow-400/40 hover:text-yellow-300 cursor-pointer"
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
									: "border-transparent text-[var(--sea-ink-soft)] hover:border-yellow-500/20 hover:bg-yellow-400/10 hover:text-yellow-200"
							}`}
						>
							<Search className="h-4 w-4" />
						</button>

						<div className="h-px w-7 bg-[var(--line)]" />

						<div className="flex flex-1 min-h-0 flex-col items-center gap-1.5 overflow-y-auto kanban-scroll py-0.5">
							<button
								type="button"
								onClick={() => handleProjectSelect("all")}
								aria-label="Tablero General"
								title={`Tablero General (${totalTaskCount})`}
								className={`flex h-9 w-9 items-center justify-center rounded-full border transition cursor-pointer ${
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
										className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-black transition cursor-pointer ${
											isSelected
												? "bg-yellow-300 border-yellow-400 text-slate-950 shadow-sm"
												: "border-yellow-500/20 bg-yellow-500/5 text-yellow-200 hover:border-yellow-400/40 hover:bg-yellow-400/15"
										}`}
									>
										{initial}
									</button>
								);
							})}
						</div>

						<div className="h-px w-7 bg-[var(--line)]" />

						<button
							type="button"
							onClick={handleCreateProject}
							aria-label="Nuevo Proyecto"
							title="Nuevo Proyecto"
							className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-yellow-500/35 bg-transparent text-yellow-400 transition hover:border-yellow-400 hover:bg-yellow-400/10 cursor-pointer"
						>
							<Plus className="h-4 w-4" />
						</button>
					</>
				) : (
					<>
						{/* Active Board Header */}
						<div className="flex items-center justify-between gap-2 px-1">
							<h2
								title={activeProjectName}
								className="display-title m-0 text-sm font-black text-[var(--sea-ink)] truncate"
							>
								{activeProjectName}
							</h2>
							<button
								type="button"
								onClick={toggleCollapsed}
								aria-label="Colapsar barra lateral"
								title="Colapsar barra lateral"
								className="rounded-lg p-1 text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)] cursor-pointer shrink-0"
							>
								<PanelLeftClose className="h-4 w-4" />
							</button>
						</div>

						{/* Integrated SearchBar right below active board name */}
						<SearchBar
							value={searchQuery}
							onChange={setSearchQuery}
							inputRef={desktopSearchRef}
						/>

						{/* Compact project pills */}
						{renderProjectPills()}

						{/* Compact Create Project pill */}
						<button
							type="button"
							onClick={handleCreateProject}
							className="flex w-full items-center justify-center gap-1 rounded-full border border-dashed border-yellow-500/35 bg-transparent py-1.5 text-xs font-extrabold text-yellow-400 transition hover:border-yellow-400 hover:bg-yellow-400/10 cursor-pointer"
						>
							<Plus className="h-3.5 w-3.5" />
							<span>Nuevo Proyecto</span>
						</button>
					</>
				)}
			</aside>
		</>
	);
}
