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
		<div
			className={`flex w-full items-center gap-2 rounded-xl border border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-strong)_88%,white_12%)] px-3 py-1.5 transition focus-within:border-[color-mix(in_oklab,var(--lagoon-deep)_58%,var(--line))] focus-within:shadow-[0_0_0_3px_color-mix(in_oklab,var(--lagoon)_24%,transparent)] ${className}`.trim()}
		>
			<Search
				className="h-3.5 w-3.5 shrink-0 text-[var(--sea-ink-soft)]"
				aria-hidden="true"
			/>
			<input
				ref={inputRef}
				type="text"
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				aria-label={placeholder}
				className="w-full min-w-0 bg-transparent text-xs font-semibold text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)] focus:outline-none"
			/>
			{value && (
				<button
					type="button"
					onClick={() => onChange("")}
					aria-label="Limpiar búsqueda"
					className="shrink-0 rounded-md p-0.5 text-[var(--sea-ink-soft)] transition hover:text-[var(--sea-ink)] cursor-pointer"
				>
					<X className="h-3.5 w-3.5" />
				</button>
			)}
		</div>
	);
}
