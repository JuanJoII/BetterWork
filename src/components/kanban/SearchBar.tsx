import { Search, X } from "lucide-react";
import type { RefObject } from "react";

interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	inputRef?: RefObject<HTMLInputElement | null>;
}

export default function SearchBar({
	value,
	onChange,
	placeholder = "Buscar notas...",
	className = "",
	inputRef,
}: SearchBarProps) {
	return (
		<div className={`relative w-full ${className}`.trim()}>
			<Search
				className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--sea-ink-soft)]"
				aria-hidden="true"
			/>
			<input
				ref={inputRef}
				type="text"
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				aria-label={placeholder}
				className="demo-input w-full py-2 pl-9 pr-8 text-xs font-semibold"
			/>
			{value && (
				<button
					type="button"
					onClick={() => onChange("")}
					aria-label="Limpiar búsqueda"
					className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-[var(--sea-ink-soft)] transition hover:text-[var(--sea-ink)] cursor-pointer"
				>
					<X className="h-3.5 w-3.5" />
				</button>
			)}
		</div>
	);
}
