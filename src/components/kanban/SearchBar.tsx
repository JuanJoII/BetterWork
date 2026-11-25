import { Search, X } from "lucide-react";
import { type RefObject, useEffect, useRef } from "react";

interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	inputRef?: RefObject<HTMLInputElement | null>;
	/** When true, starts as a circular magnifying-glass trigger and morphs into a pill on click */
	expandable?: boolean;
	expanded?: boolean;
	onExpandedChange?: (expanded: boolean) => void;
}

export default function SearchBar({
	value,
	onChange,
	placeholder = "Buscar notas...",
	className = "",
	inputRef,
	expandable = false,
	expanded = true,
	onExpandedChange,
}: SearchBarProps) {
	const internalInputRef = useRef<HTMLInputElement>(null);
	const resolvedInputRef = inputRef ?? internalInputRef;
	const containerRef = useRef<HTMLDivElement>(null);

	const isExpanded = expandable ? expanded : true;
	const hasQuery = value.trim().length > 0;

	useEffect(() => {
		if (!expandable || !isExpanded) return;

		const focusTimer = window.setTimeout(() => {
			resolvedInputRef.current?.focus();
		}, 40);

		const handlePointerDown = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				onExpandedChange?.(false);
			}
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onExpandedChange?.(false);
			}
		};

		document.addEventListener("mousedown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			window.clearTimeout(focusTimer);
			document.removeEventListener("mousedown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [expandable, isExpanded, onExpandedChange, resolvedInputRef]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && expandable) {
			e.preventDefault();
			resolvedInputRef.current?.blur();
			onExpandedChange?.(false);
		}
	};

	const handleClear = () => {
		onChange("");
		resolvedInputRef.current?.focus();
	};

	if (expandable) {
		return (
			<div
				ref={containerRef}
				className={`relative h-9 w-9 shrink-0 ${className}`.trim()}
			>
				<div
					className={`absolute left-0 top-0 z-50 flex h-9 items-center overflow-hidden rounded-full border backdrop-blur-md transition-[width,box-shadow,border-color,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
						isExpanded
							? "w-64 max-w-[calc(100vw-5rem)] border-amber-500/75 bg-white/95 pr-2 shadow-[0_0_0_3px_rgba(245,158,11,0.16),0_10px_28px_rgba(15,23,42,0.12)] dark:border-yellow-400/75 dark:bg-slate-950/92 dark:shadow-[0_0_0_3px_rgba(250,204,21,0.16),0_10px_28px_rgba(250,204,21,0.22)]"
							: hasQuery
								? "w-9 border-amber-500/70 bg-amber-400/20 shadow-[0_0_14px_rgba(245,158,11,0.2)] hover:border-amber-500 dark:border-yellow-400/70 dark:bg-yellow-400/15 dark:shadow-[0_0_16px_rgba(250,204,21,0.22)] dark:hover:border-yellow-300"
								: "w-9 border-amber-500/30 bg-white/85 hover:border-amber-500/60 hover:bg-white dark:border-yellow-500/20 dark:bg-slate-900/75 dark:hover:border-yellow-400/45 dark:hover:bg-slate-900/90"
					}`}
				>
					<button
						type="button"
						onClick={() => onExpandedChange?.(!isExpanded)}
						aria-label="Buscar notas"
						aria-expanded={isExpanded}
						title={hasQuery ? `Buscando: "${value}"` : "Buscar notas"}
						className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors cursor-pointer ${
							isExpanded || hasQuery
								? "text-amber-600 dark:text-yellow-300"
								: "text-[var(--sea-ink-soft)] hover:text-amber-600 dark:hover:text-yellow-300"
						}`}
					>
						<Search className="h-3.5 w-3.5" strokeWidth={2} />
						{!isExpanded && hasQuery && (
							<span
								aria-hidden="true"
								className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.85)] dark:bg-yellow-300 dark:shadow-[0_0_6px_rgba(250,204,21,0.9)]"
							/>
						)}
					</button>

					<input
						ref={resolvedInputRef}
						type="text"
						placeholder={placeholder}
						value={value}
						onChange={(e) => onChange(e.target.value)}
						onKeyDown={handleKeyDown}
						aria-label={placeholder}
						tabIndex={isExpanded ? 0 : -1}
						className={`min-w-0 bg-transparent text-xs font-semibold text-slate-900 placeholder:text-slate-400 dark:text-yellow-50 dark:placeholder:text-slate-400 focus:outline-none transition-opacity duration-200 ${
							isExpanded
								? "flex-1 pr-1 opacity-100 pointer-events-auto"
								: "w-0 opacity-0 pointer-events-none"
						}`}
					/>

					{isExpanded && value && (
						<button
							type="button"
							onClick={handleClear}
							aria-label="Limpiar búsqueda"
							className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-amber-400/20 hover:text-amber-700 dark:text-slate-400 dark:hover:bg-yellow-400/15 dark:hover:text-yellow-200 cursor-pointer"
						>
							<X className="h-3.5 w-3.5" />
						</button>
					)}
				</div>
			</div>
		);
	}

	return (
		<div
			className={`group flex h-9 w-full items-center gap-2 rounded-full border border-amber-500/30 bg-white/85 px-3.5 backdrop-blur-md transition-[border-color,box-shadow,background-color] duration-200 hover:border-amber-500/55 focus-within:border-amber-500/80 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(245,158,11,0.16),0_8px_20px_rgba(15,23,42,0.08)] dark:border-yellow-500/20 dark:bg-slate-900/75 dark:hover:border-yellow-400/35 dark:focus-within:border-yellow-400/75 dark:focus-within:bg-slate-950/90 dark:focus-within:shadow-[0_0_0_3px_rgba(250,204,21,0.16),0_8px_24px_rgba(250,204,21,0.2)] ${className}`.trim()}
		>
			<Search
				className={`h-3.5 w-3.5 shrink-0 transition-colors duration-200 ${
					hasQuery
						? "text-amber-600 dark:text-yellow-300"
						: "text-[var(--sea-ink-soft)] group-focus-within:text-amber-600 dark:group-focus-within:text-yellow-300"
				}`}
				strokeWidth={2}
				aria-hidden="true"
			/>
			<input
				ref={resolvedInputRef}
				type="text"
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				aria-label={placeholder}
				className="w-full min-w-0 bg-transparent text-xs font-semibold text-slate-900 placeholder:text-slate-400 dark:text-yellow-50 dark:placeholder:text-slate-400 focus:outline-none"
			/>
			{value && (
				<button
					type="button"
					onClick={handleClear}
					aria-label="Limpiar búsqueda"
					className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-amber-400/20 hover:text-amber-700 dark:text-slate-400 dark:hover:bg-yellow-400/15 dark:hover:text-yellow-200 cursor-pointer"
				>
					<X className="h-3.5 w-3.5" />
				</button>
			)}
		</div>
	);
}
