import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect } from "react";
import { NOTE_TONE_STYLES, type NoteToneKey } from "../../utils/noteTheme";

interface ModalShellProps {
	isOpen: boolean;
	onClose: () => void;
	ariaLabel: string;
	tone?: NoteToneKey;
	onPrevTone?: () => void;
	onNextTone?: () => void;
	children: React.ReactNode;
}

export default function ModalShell({
	isOpen,
	onClose,
	ariaLabel,
	tone = "medium",
	onPrevTone,
	onNextTone,
	children,
}: ModalShellProps) {
	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	const styles = NOTE_TONE_STYLES[tone];
	const showToneArrows = Boolean(onPrevTone && onNextTone);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
			{/* Clickable blurred backdrop */}
			<button
				type="button"
				aria-label="Cerrar ventana"
				onClick={onClose}
				className="fixed inset-0 border-none bg-slate-950/35 dark:bg-slate-950/72 backdrop-blur-md cursor-default"
			/>

			{/* Stage wrapping left arrow + sticky note + right arrow */}
			<div className="relative z-10 flex w-full max-w-[34rem] items-center justify-center gap-2 sm:gap-3.5 rise-in">
				{showToneArrows && (
					<button
						type="button"
						onClick={onPrevTone}
						aria-label="Cambiar prioridad anterior"
						title="Cambiar prioridad"
						className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full border border-white/60 bg-white/85 text-slate-700 shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-white hover:text-slate-950 active:scale-95 dark:border-white/15 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-white/30 dark:hover:bg-slate-800/90 cursor-pointer"
					>
						<ChevronLeft className="h-5 w-5" />
					</button>
				)}

				{/* Sticky Note Modal Card */}
				<div
					role="dialog"
					aria-modal="true"
					aria-label={ariaLabel}
					className={`relative flex-1 min-w-0 max-w-md rounded-3xl border p-6 sm:p-7 backdrop-blur-2xl transition-[background-color,border-color,box-shadow,color] duration-300 ${styles.modalSheet}`}
				>
					{/* Signature centered tech-tape */}
					<div
						aria-hidden="true"
						className={`pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 h-5.5 w-16 border-x shadow-sm backdrop-blur-[2px] z-20 transition-colors duration-300 ${styles.tape}`}
					/>

					{/* Subtle internal ambient tint + specular top rim */}
					<div
						aria-hidden="true"
						className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
					>
						<div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/90 dark:via-white/30 to-transparent" />
						<div
							className={`absolute -right-16 -top-16 h-48 w-48 rounded-full blur-2xl transition-all duration-300 ${styles.haloTop}`}
						/>
						<div
							className={`absolute -bottom-20 -left-16 h-48 w-48 rounded-full blur-2xl transition-all duration-300 ${styles.haloBottom}`}
						/>
					</div>

					{/* Subtle close trigger */}
					<button
						type="button"
						onClick={onClose}
						aria-label="Cerrar modal"
						className={`absolute right-3.5 top-3.5 z-20 flex h-8 w-8 items-center justify-center rounded-full transition cursor-pointer ${styles.iconButton}`}
					>
						<X className="h-4 w-4" />
					</button>

					<div className="relative z-10 max-h-[82vh] overflow-y-auto kanban-scroll pr-0.5">
						{children}
					</div>
				</div>

				{showToneArrows && (
					<button
						type="button"
						onClick={onNextTone}
						aria-label="Cambiar prioridad siguiente"
						title="Cambiar prioridad"
						className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full border border-white/60 bg-white/85 text-slate-700 shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-white hover:text-slate-950 active:scale-95 dark:border-white/15 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-white/30 dark:hover:bg-slate-800/90 cursor-pointer"
					>
						<ChevronRight className="h-5 w-5" />
					</button>
				)}
			</div>
		</div>
	);
}
