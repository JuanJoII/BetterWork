import { X } from "lucide-react";

interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
	return (
		<div className="relative w-full max-w-xs">
			<input
				type="text"
				placeholder="Buscar notas..."
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="demo-input py-2 pl-3.5 pr-9 text-xs font-semibold w-full"
			/>
			{value && (
				<button
					type="button"
					onClick={() => onChange("")}
					className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
				>
					<X className="h-3.5 w-3.5" />
				</button>
			)}
		</div>
	);
}
