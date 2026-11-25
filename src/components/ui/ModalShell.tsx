import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalShellProps {
	isOpen: boolean;
	onClose: () => void;
	titleId: string;
	tone?: "amber" | "purple";
	children: React.ReactNode;
}

export default function ModalShell({
	isOpen,
	onClose,
	titleId,
	tone = "amber",
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

	const isPurple = tone === "purple";

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Clickable blurred backdrop */}
			<button
				type="button"
				aria-label="Cerrar ventana"
				onClick={onClose}
				className="fixed inset-0 border-none bg-slate-950/35 dark:bg-slate-950/70 backdrop-blur-md cursor-default"
			/>

			{/* Tactile Studio Sheet */}
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				className={`relative z-10 w-full max-w-lg rounded-[2rem] border p-6 sm:p-7 backdrop-blur-2xl rise-in ${
					isPurple
						? "border-purple-300/80 bg-white/95 shadow-[0_24px_60px_rgba(88,28,135,0.16),0_4px_16px_rgba(15,23,42,0.08)] dark:border-purple-400/30 dark:bg-slate-950/92 dark:shadow-[0_28px_72px_rgba(0,0,0,0.75),0_0_40px_rgba(168,85,247,0.14)]"
						: "border-amber-300/80 bg-white/95 shadow-[0_24px_60px_rgba(180,83,9,0.14),0_4px_16px_rgba(15,23,42,0.08)] dark:border-yellow-400/25 dark:bg-slate-950/92 dark:shadow-[0_28px_72px_rgba(0,0,0,0.75),0_0_40px_rgba(250,204,21,0.12)]"
				}`}
			>
				{/* Signature centered tech-tape */}
				<div
					aria-hidden="true"
					className={`pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 h-5.5 w-16 border-x shadow-sm backdrop-blur-[2px] z-20 ${
						isPurple
							? "bg-purple-300/55 border-purple-400/60 dark:bg-purple-500/25 dark:border-purple-400/45"
							: "bg-amber-300/55 border-amber-400/60 dark:bg-yellow-400/18 dark:border-yellow-400/40"
					}`}
				/>

				{/* Subtle internal ambient sheen + specular top rim */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
				>
					<div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/90 dark:via-white/35 to-transparent" />
					<div
						className={`absolute -right-20 -top-20 h-52 w-52 rounded-full blur-2xl ${
							isPurple
								? "bg-[radial-gradient(circle,rgba(147,51,234,0.16),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(168,85,247,0.22),transparent_70%)]"
								: "bg-[radial-gradient(circle,rgba(245,158,11,0.18),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(250,204,21,0.18),transparent_70%)]"
						}`}
					/>
					<div
						className={`absolute -bottom-24 -left-20 h-56 w-56 rounded-full blur-2xl ${
							isPurple
								? "bg-[radial-gradient(circle,rgba(234,179,8,0.12),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(250,204,21,0.1),transparent_70%)]"
								: "bg-[radial-gradient(circle,rgba(147,51,234,0.12),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(168,85,247,0.16),transparent_70%)]"
						}`}
					/>
				</div>

				{/* Close trigger */}
				<button
					type="button"
					onClick={onClose}
					aria-label="Cerrar modal"
					className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-[var(--sea-ink-soft)] transition hover:border-[var(--line)] hover:bg-slate-900/5 hover:text-[var(--sea-ink)] dark:hover:bg-white/10 cursor-pointer"
				>
					<X className="h-4 w-4" />
				</button>

				<div className="relative z-10 max-h-[82vh] overflow-y-auto kanban-scroll pr-0.5">
					{children}
				</div>
			</div>
		</div>
	);
}
