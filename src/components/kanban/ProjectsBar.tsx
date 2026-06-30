import { ChevronDown, Plus } from "lucide-react";
import { useState } from "react";
import type { Project } from "../../types/kanban";

interface ProjectsBarProps {
	projects: Project[];
	currentProjectId: string;
	setCurrentProjectId: (id: string) => void;
	handleCreateProject: () => void;
}

export default function ProjectsBar({
	projects,
	currentProjectId,
	setCurrentProjectId,
	handleCreateProject,
}: ProjectsBarProps) {
	const [showDropdown, setShowDropdown] = useState(false);

	const handleProjectSelect = (id: string) => {
		setCurrentProjectId(id);
		setShowDropdown(false);
	};

	const showRemainingDropdown = projects.length > 3;
	const visibleProjects = projects.slice(0, 3);
	const dropdownProjects = projects.slice(3);
	const isCurrentProjectInDropdown = dropdownProjects.some(
		(p) => p.id === currentProjectId,
	);

	return (
		<div className="flex flex-wrap items-center gap-2 relative">
			{/* Always show Tablero General */}
			<button
				type="button"
				onClick={() => handleProjectSelect("all")}
				className={`rounded-full px-4 py-2 text-xs font-extrabold transition-all duration-200 active:scale-95 shadow-sm border cursor-pointer ${
					currentProjectId === "all"
						? "bg-yellow-300 border-yellow-400 text-slate-950"
						: "border-yellow-500/20 bg-yellow-500/5 text-yellow-100/90 hover:bg-yellow-400/10"
				}`}
			>
				Tablero General
			</button>

			{/* Visible projects (up to 3) */}
			{visibleProjects.map((proj) => (
				<button
					key={proj.id}
					type="button"
					onClick={() => handleProjectSelect(proj.id)}
					className={`rounded-full px-4 py-2 text-xs font-extrabold transition-all duration-200 active:scale-95 shadow-sm border cursor-pointer ${
						currentProjectId === proj.id
							? "bg-yellow-300 border-yellow-400 text-slate-950"
							: "border-yellow-500/20 bg-yellow-500/5 text-yellow-100/90 hover:bg-yellow-400/10"
					}`}
				>
					{proj.name}
				</button>
			))}

			{/* Dropdown for remaining projects */}
			{showRemainingDropdown && (
				<div className="relative">
					<button
						type="button"
						onClick={() => setShowDropdown(!showDropdown)}
						className={`rounded-full px-3.5 py-2 text-xs font-extrabold transition-all duration-200 active:scale-95 shadow-sm border cursor-pointer flex items-center gap-1.5 ${
							isCurrentProjectInDropdown
								? "bg-yellow-300 border-yellow-400 text-slate-950"
								: "border-yellow-500/20 bg-yellow-500/5 text-yellow-100/90 hover:bg-yellow-400/10"
						}`}
					>
						<span>
							{isCurrentProjectInDropdown
								? projects.find((p) => p.id === currentProjectId)?.name
								: "Más"}
						</span>
						<ChevronDown className="h-3 w-3" />
					</button>

					{showDropdown && (
						<div className="absolute left-0 mt-2 w-48 z-40 rounded-2xl border border-yellow-500/20 bg-slate-900 p-2.5 shadow-xl backdrop-blur-md">
							{dropdownProjects.map((proj) => (
								<button
									key={proj.id}
									type="button"
									onClick={() => handleProjectSelect(proj.id)}
									className={`w-full text-left rounded-xl px-3 py-2 text-xs font-extrabold transition cursor-pointer ${
										currentProjectId === proj.id
											? "bg-yellow-300 text-slate-950"
											: "text-yellow-100/90 hover:bg-yellow-400/10"
									}`}
								>
									{proj.name}
								</button>
							))}
						</div>
					)}
				</div>
			)}

			{/* Add Project trigger */}
			{showRemainingDropdown ? (
				<button
					type="button"
					onClick={handleCreateProject}
					title="Nuevo Proyecto"
					className="rounded-full p-2.5 text-xs font-extrabold border border-dashed border-yellow-500/35 bg-transparent text-yellow-400 hover:bg-yellow-400/10 transition cursor-pointer flex items-center justify-center"
				>
					<Plus className="h-4 w-4" />
				</button>
			) : (
				<button
					type="button"
					onClick={handleCreateProject}
					className="rounded-full px-3.5 py-2 text-xs font-extrabold border border-dashed border-yellow-500/35 bg-transparent text-yellow-400 hover:bg-yellow-400/10 transition cursor-pointer"
				>
					+ Nuevo Proyecto
				</button>
			)}
		</div>
	);
}
