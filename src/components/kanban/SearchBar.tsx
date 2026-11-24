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
							? "w-64 max-w-[calc(100vw-5rem)] border-yellow-400/75 bg-slate-950/92 pr-2 shadow-[0_0_0_3px_rgba(250,204,21,0.16),0_10px_28px_rgba(250,204,21,0.22)]"
							: hasQuery
								? "w-9 border-yellow-400/70 bg-yellow-400/15 shadow-[0_0_16px_rgba(250,204,21,0.22)] hover:border-yellow-300"
								: "w-9 border-yellow-500/20 bg-slate-900/75 hover:border-yellow-400/45 hover:bg-slate-900/90"
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
								? "text-yellow-300"
								: "text-[var(--sea-ink-soft)] hover:text-yellow-300"
						}`}
					>
						<Search className="h-[17px] w-[17px]" strokeWidth={2.25} />
						{!isExpanded && hasQuery && (
							<span
								aria-hidden="true"
								className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-yellow-300 shadow-[0_0_6px_rgba(250,204,21,0.9)]"
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
						className={`min-w-0 bg-transparent text-xs font-semibold text-yellow-50 placeholder:text-slate-400 focus:outline-none transition-opacity duration-200 ${
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
							className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-yellow-400/15 hover:text-yellow-200 cursor-pointer"
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
			className={`group flex h-9 w-full items-center gap-2 rounded-full border border-yellow-500/20 bg-slate-900/75 px-3.5 backdrop-blur-md transition-[border-color,box-shadow,background-color] duration-200 hover:border-yellow-400/35 focus-within:border-yellow-400/75 focus-within:bg-slate-950/90 focus-within:shadow-[0_0_0_3px_rgba(250,204,21,0.16),0_8px_24px_rgba(250,204,21,0.2)] ${className}`.trim()}
		>
			<Search
				className={`h-[17px] w-[17px] shrink-0 transition-colors duration-200 ${
					hasQuery
						? "text-yellow-300"
						: "text-[var(--sea-ink-soft)] group-focus-within:text-yellow-300"
				}`}
				strokeWidth={2.25}
				aria-hidden="true"
			/>
			<input
				ref={resolvedInputRef}
				type="text"
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				aria-label={placeholder}
				className="w-full min-w-0 bg-transparent text-xs font-semibold text-yellow-50 placeholder:text-slate-400 focus:outline-none"
			/>
			{value && (
				<button
					type="button"
					onClick={handleClear}
					aria-label="Limpiar búsqueda"
					className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-yellow-400/15 hover:text-yellow-200 cursor-pointer"
				>
					<X className="h-3.5 w-3.5" />
				</button>
			)}
		</div>
	);
}
