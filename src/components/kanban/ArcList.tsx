import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface ArcListItem {
	id: string;
	title: string;
	subtitle?: string;
	badge?: string | number;
	canDelete?: boolean;
}

export interface ArcListProps {
	items: ArcListItem[];
	activeIndex: number;
	onSelect: (index: number, item: ArcListItem) => void;
	onDelete?: (item: ArcListItem) => void;
	imageSide?: "left" | "right" | "none";
	curve?: number;
	spacing?: number;
	visible?: number;
	blur?: number;
	backgroundColor?: string;
	subtitles?: boolean;
	autoplay?: boolean;
	interval?: number;
	wheel?: boolean;
	imageAspect?: number;
	imageRadius?: number;
	className?: string;
}

export default function ArcList({
	items,
	activeIndex,
	onSelect,
	onDelete,
	curve = 0.95,
	spacing = 64,
	visible = 4,
	blur = 7,
	subtitles = false,
	autoplay = false,
	interval = 5.5,
	wheel = true,
	className = "",
}: ArcListProps) {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const viewportRef = useRef<HTMLElement>(null);
	const wheelAccumulatorRef = useRef(0);
	const lastStepTimeRef = useRef(0);

	const safeActiveIndex =
		items.length === 0
			? 0
			: Math.min(Math.max(activeIndex, 0), items.length - 1);

	// Keep latest refs so native non-passive wheel listener never goes stale
	const latestRef = useRef({ items, safeActiveIndex, onSelect, wheel });
	latestRef.current = { items, safeActiveIndex, onSelect, wheel };

	// Native non-passive wheel listener for smooth single-step project cycling
	useEffect(() => {
		const el = viewportRef.current;
		if (!el) return;

		const handleNativeWheel = (e: WheelEvent) => {
			const {
				items: currentItems,
				safeActiveIndex: currentIdx,
				onSelect: selectFn,
				wheel: wheelEnabled,
			} = latestRef.current;

			if (!wheelEnabled || currentItems.length <= 1) return;

			e.preventDefault();

			const now = Date.now();
			if (now - lastStepTimeRef.current < 130) {
				return;
			}

			wheelAccumulatorRef.current += e.deltaY;
			const threshold = 24;

			if (Math.abs(wheelAccumulatorRef.current) >= threshold) {
				const direction = wheelAccumulatorRef.current > 0 ? 1 : -1;
				wheelAccumulatorRef.current = 0;

				const nextIndex = Math.min(
					Math.max(currentIdx + direction, 0),
					currentItems.length - 1,
				);

				if (nextIndex !== currentIdx) {
					lastStepTimeRef.current = now;
					selectFn(nextIndex, currentItems[nextIndex]);
				}
			}
		};

		el.addEventListener("wheel", handleNativeWheel, { passive: false });
		return () => {
			el.removeEventListener("wheel", handleNativeWheel);
		};
	}, []);

	// Optional autoplay support
	useEffect(() => {
		if (!autoplay || items.length <= 1) return;
		const timer = window.setInterval(() => {
			const next = (safeActiveIndex + 1) % items.length;
			onSelect(next, items[next]);
		}, interval * 1000);
		return () => window.clearInterval(timer);
	}, [autoplay, interval, items, safeActiveIndex, onSelect]);

	const halfVisible = Math.max(1, visible / 2);
	const stageHeight = Math.max(spacing * visible, spacing * 2.5);
	const maxArcPull = Math.round(24 * curve);

	return (
		<div
			className={`relative flex flex-col items-stretch select-none ${className}`.trim()}
		>
			{/* Curved Arc Viewport (scroll wheel cycles projects) */}
			<nav
				ref={viewportRef}
				aria-label="Selector de proyectos"
				className="relative w-full overflow-hidden"
				style={{
					height: `${stageHeight}px`,
					maskImage:
						"linear-gradient(to bottom, transparent 0%, black 16%, black 84%, transparent 100%)",
					WebkitMaskImage:
						"linear-gradient(to bottom, transparent 0%, black 16%, black 84%, transparent 100%)",
				}}
			>
				{items.map((item, idx) => {
					const offset = idx - safeActiveIndex;
					const absOffset = Math.abs(offset);
					const isActive = offset === 0;
					const isHovered = hoveredIndex === idx;
					const isOutOfRange = absOffset > halfVisible + 0.75;

					const translateY = offset * spacing;
					// Convex right-facing arc: active item bows outward toward the board,
					// neighbors above/below curve inward toward the left edge
					const arcRetreat = absOffset ** 1.55 * curve * 14;
					const translateX = Math.max(0, maxArcPull - arcRetreat);
					const scale = isActive ? 1 : Math.max(0.78, 1 - absOffset * 0.09);
					const computedBlur =
						isActive || isHovered
							? 0
							: Math.min(blur, (absOffset / halfVisible) * blur * 0.65);
					const opacity = isOutOfRange
						? 0
						: isActive || isHovered
							? 1
							: Math.max(0.24, 1 - absOffset * 0.28);

					return (
						<div
							key={item.id}
							style={{
								position: "absolute",
								left: 0,
								right: 0,
								top: "50%",
								transform: `translate3d(${translateX}px, calc(-50% + ${translateY}px), 0) scale(${scale})`,
								transformOrigin: "left center",
								opacity,
								filter:
									computedBlur > 0
										? `blur(${computedBlur.toFixed(1)}px)`
										: "none",
								pointerEvents: isOutOfRange ? "none" : "auto",
								zIndex: isActive
									? 20
									: Math.max(1, 15 - Math.round(absOffset * 3)),
								transition:
									"transform 380ms cubic-bezier(0.22, 1, 0.36, 1), opacity 280ms ease, filter 240ms ease",
							}}
							className="pr-5"
						>
							<div className="flex items-center gap-1.5 py-1">
								<button
									type="button"
									onClick={() => onSelect(idx, item)}
									onMouseEnter={() => setHoveredIndex(idx)}
									onMouseLeave={() => setHoveredIndex(null)}
									title={item.title}
									className="group relative flex flex-1 min-w-0 items-center justify-between gap-2 pb-1.5 text-left cursor-pointer"
								>
									<div className="min-w-0">
										<span
											className={`block truncate transition-colors ${
												isActive
													? "display-title text-[17px] font-black text-yellow-300"
													: "text-sm font-bold text-slate-300 group-hover:text-yellow-100"
											}`}
										>
											{item.title}
										</span>
										{subtitles && item.subtitle && (
											<span className="block truncate text-[11px] font-semibold text-[var(--sea-ink-soft)]">
												{item.subtitle}
											</span>
										)}
									</div>

									{item.badge !== undefined && (
										<span
											className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-black leading-none ${
												isActive
													? "bg-yellow-300 text-slate-950"
													: "bg-slate-800/80 text-yellow-200/75"
											}`}
										>
											{item.badge}
										</span>
									)}

									{/* Horizontal navbar-style indicator animating left-to-right */}
									<span
										aria-hidden="true"
										className={`pointer-events-none absolute left-0 bottom-0 h-[2px] w-full origin-left rounded-full bg-gradient-to-r from-purple-500 to-yellow-400 transition-transform duration-200 ease-out ${
											isActive
												? "scale-x-100"
												: "scale-x-0 group-hover:scale-x-100"
										}`}
									/>
								</button>

								{item.canDelete && onDelete && isActive && (
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											onDelete(item);
										}}
										aria-label={`Eliminar proyecto ${item.title}`}
										title={`Eliminar proyecto ${item.title}`}
										className="shrink-0 mb-1.5 rounded-full p-1 text-red-400/80 transition hover:bg-red-500/20 hover:text-red-300 cursor-pointer"
									>
										<X className="h-3.5 w-3.5" />
									</button>
								)}
							</div>
						</div>
					);
				})}
			</nav>
		</div>
	);
}
