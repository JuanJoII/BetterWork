import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NOTE_TONE_STYLES, type NoteToneKey } from "../../utils/noteTheme";

export interface ModalAnchorRect {
	top: number;
	left: number;
	width: number;
	height: number;
}

interface ModalShellProps {
	isOpen: boolean;
	onClose: () => void;
	ariaLabel: string;
	tone?: NoteToneKey;
	anchorRect?: ModalAnchorRect | null;
	onPrevTone?: () => void;
	onNextTone?: () => void;
	children: React.ReactNode;
}

const VIEWPORT_MARGIN = 16;
const ARROW_SLOT_WIDTH = 56; // 44px arrow + 12px gap

export default function ModalShell({
	isOpen,
	onClose,
	ariaLabel,
	tone = "medium",
	anchorRect = null,
	onPrevTone,
	onNextTone,
	children,
}: ModalShellProps) {
	const stageRef = useRef<HTMLDivElement>(null);
	const [anchoredStyle, setAnchoredStyle] = useState<{
		top: number;
		left: number;
		cardWidth: number;
	} | null>(null);

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

	const showToneArrows = Boolean(onPrevTone && onNextTone);

	// Compute clamped in-place coordinates anchored to the clicked card
	useLayoutEffect(() => {
		if (!isOpen || !anchorRect || typeof window === "undefined") {
			setAnchoredStyle(null);
			return;
		}

		const computePosition = () => {
			const vw = window.innerWidth;
			const vh = window.innerHeight;

			// Fall back to centered modal on very narrow screens
			if (vw < 640) {
				setAnchoredStyle(null);
				return;
			}

			const arrowsOverhead = showToneArrows ? ARROW_SLOT_WIDTH * 2 : 0;
			const maxCardWidth = Math.max(
				280,
				vw - VIEWPORT_MARGIN * 2 - arrowsOverhead,
			);
			const cardWidth = Math.min(Math.max(anchorRect.width, 320), maxCardWidth);
			const totalStageWidth = cardWidth + arrowsOverhead;

			// Center the card horizontally over the original card's center
			const originalCenterX = anchorRect.left + anchorRect.width / 2;
			const idealStageLeft = originalCenterX - totalStageWidth / 2;
			const clampedLeft = Math.min(
				Math.max(idealStageLeft, VIEWPORT_MARGIN),
				Math.max(VIEWPORT_MARGIN, vw - totalStageWidth - VIEWPORT_MARGIN),
			);

			const measuredHeight =
				stageRef.current?.getBoundingClientRect().height ||
				Math.max(anchorRect.height, 300);
			const clampedTop = Math.min(
				Math.max(anchorRect.top, VIEWPORT_MARGIN + 8),
				Math.max(VIEWPORT_MARGIN + 8, vh - measuredHeight - VIEWPORT_MARGIN),
			);

			setAnchoredStyle({
				top: Math.round(clampedTop),
				left: Math.round(clampedLeft),
				cardWidth: Math.round(cardWidth),
			});
		};

		computePosition();
		window.addEventListener("resize", computePosition);
		return () => window.removeEventListener("resize", computePosition);
	}, [isOpen, anchorRect, showToneArrows]);

	if (!isOpen || typeof document === "undefined") return null;

	const styles = NOTE_TONE_STYLES[tone];
	const isAnchored = anchoredStyle !== null;

	const modalContent = (
		<div
			className={
				isAnchored
					? "fixed inset-0 z-[60]"
					: "fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4"
			}
		>
			{/* Clickable blurred backdrop covering the entire viewport (including Header) */}
			<button
				type="button"
				aria-label="Cerrar ventana"
				onClick={onClose}
				className="fixed inset-0 border-none bg-slate-950/35 dark:bg-slate-950/72 backdrop-blur-md cursor-default"
			/>

			{/* Stage wrapping left arrow + sticky note + right arrow */}
			<div
				ref={stageRef}
				data-anchored={isAnchored ? "true" : "false"}
				style={
					isAnchored
						? {
								position: "fixed",
								top: `${anchoredStyle.top}px`,
								left: `${anchoredStyle.left}px`,
							}
						: undefined
				}
				className={
					isAnchored
						? "z-10 flex items-center justify-center gap-2 sm:gap-3 animate-in fade-in zoom-in-[0.98] duration-200"
						: "relative z-10 flex w-full max-w-[34rem] items-center justify-center gap-2 sm:gap-3.5 rise-in"
				}
			>
				{showToneArrows && (
					<button
						type="button"
						onClick={onPrevTone}
						aria-label="Cambiar prioridad anterior"
						title="Cambiar prioridad"
						className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full border border-slate-300/80 bg-white/90 text-slate-700 shadow-lg backdrop-blur-md transition duration-200 hover:scale-110 hover:border-amber-500/70 hover:bg-white hover:text-slate-950 hover:shadow-xl active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:border-white/20 dark:bg-slate-900/85 dark:text-slate-200 dark:hover:border-yellow-400/60 dark:hover:bg-slate-800 dark:hover:text-white dark:focus-visible:ring-yellow-300 dark:focus-visible:ring-offset-slate-950 cursor-pointer"
					>
						<ChevronLeft className="h-5 w-5" />
					</button>
				)}

				{/* Sticky Note Modal Card */}
				<div
					role="dialog"
					aria-modal="true"
					aria-label={ariaLabel}
					style={
						isAnchored ? { width: `${anchoredStyle.cardWidth}px` } : undefined
					}
					className={`relative rounded-3xl border px-5 py-5 sm:px-6 sm:py-6 backdrop-blur-2xl transition-[background-color,border-color,box-shadow,color] duration-300 ${
						isAnchored ? "shrink-0" : "flex-1 min-w-0 max-w-md"
					} ${styles.modalSheet}`}
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
						className={`absolute right-3.5 top-3.5 z-20 flex h-8 w-8 items-center justify-center rounded-full transition duration-200 hover:scale-105 cursor-pointer ${styles.iconButton} ${styles.focusRing}`}
					>
						<X className="h-4 w-4" />
					</button>

					{/* Generous X/Y gutter inside scroll area so button focus rings and shadows never clip */}
					<div className="relative z-10 max-h-[82vh] overflow-y-auto kanban-scroll px-1.5 py-2">
						{children}
					</div>
				</div>

				{showToneArrows && (
					<button
						type="button"
						onClick={onNextTone}
						aria-label="Cambiar prioridad siguiente"
						title="Cambiar prioridad"
						className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full border border-slate-300/80 bg-white/90 text-slate-700 shadow-lg backdrop-blur-md transition duration-200 hover:scale-110 hover:border-amber-500/70 hover:bg-white hover:text-slate-950 hover:shadow-xl active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:border-white/20 dark:bg-slate-900/85 dark:text-slate-200 dark:hover:border-yellow-400/60 dark:hover:bg-slate-800 dark:hover:text-white dark:focus-visible:ring-yellow-300 dark:focus-visible:ring-offset-slate-950 cursor-pointer"
					>
						<ChevronRight className="h-5 w-5" />
					</button>
				)}
			</div>
		</div>
	);

	return createPortal(modalContent, document.body);
}
