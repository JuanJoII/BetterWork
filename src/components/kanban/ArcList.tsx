import { useEffect, useRef, useState } from "react";
import ProjectIcon from "./ProjectIcon";

export interface ArcListItem {
	id: string;
	title: string;
	icon?: string;
	subtitle?: string;
	badge?: string | number;
}

export interface ArcListProps {
	items: ArcListItem[];
	activeIndex: number;
	onSelect: (index: number, item: ArcListItem) => void;
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
	const minStageHeight = Math.max(spacing * visible, spacing * 2.5);
	const maxArcPull = Math.round(20 * curve);
	const rightSafetyGutter = maxArcPull + 8;

	return (
		<div
			className={`relative flex flex-col items-stretch select-none ${className}`.trim()}
		>
			{/* Curved Arc Viewport (fills available vertical space; scroll wheel cycles projects) */}
			<nav
				ref={viewportRef}
				aria-label="Selector de proyectos"
				className="relative flex-1 w-full overflow-hidden"
				style={{
					minHeight: `${minStageHeight}px`,
					maskImage:
						"linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)",
					WebkitMaskImage:
						"linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)",
				}}
			>
				{items.map((item, idx) => {
					const offset = idx - safeActiveIndex;
					const absOffset = Math.abs(offset);
					const isActive = offset === 0;
					const isHovered = hoveredIndex === idx;
					const isOutOfRange = absOffset > halfVisible + 1.25;

					const translateY = offset * spacing;
					// Convex right-facing arc: active item bows outward toward the board,
					// neighbors above/below curve inward toward the left edge
					const arcRetreat = absOffset ** 1.55 * curve * 12;
					const translateX = Math.max(0, maxArcPull - arcRetreat);
					const scale = isActive ? 1 : Math.max(0.78, 1 - absOffset * 0.08);
					const computedBlur =
						isActive || isHovered
							? 0
							: Math.min(blur, (absOffset / halfVisible) * blur * 0.65);
					const opacity = isOutOfRange
						? 0
						: isActive || isHovered
							? 1
							: Math.max(0.22, 1 - absOffset * 0.26);

					return (
						<div
							key={item.id}
							style={{
								position: "absolute",
								left: 0,
								right: `${rightSafetyGutter}px`,
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
						>
							<button
								type="button"
								onClick={() => onSelect(idx, item)}
								onMouseEnter={() => setHoveredIndex(idx)}
								onMouseLeave={() => setHoveredIndex(null)}
								title={item.title}
								className="group relative flex w-full min-w-0 items-center justify-between gap-2 pb-1.5 pt-1 text-left cursor-pointer"
							>
								<div className="min-w-0 flex-1 flex items-center gap-2">
									{item.icon && (
										<ProjectIcon
											icon={item.icon}
											className={
												isActive
													? "h-4 w-4 text-amber-700 dark:text-yellow-300"
													: "h-3.5 w-3.5 text-slate-500 group-hover:text-amber-700 dark:text-slate-400 dark:group-hover:text-yellow-200"
											}
											emojiClassName={
												isActive
													? "text-base leading-none"
													: "text-sm leading-none"
											}
										/>
									)}
									<div className="min-w-0 flex-1">
										<span
											className={`block truncate transition-colors ${
												isActive
													? "display-title text-[17px] font-black text-amber-700 dark:text-yellow-300"
													: "text-sm font-bold text-slate-600 group-hover:text-amber-700 dark:text-slate-300 dark:group-hover:text-yellow-100"
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
								</div>

								{item.badge !== undefined && (
									<span
										className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-black leading-none ${
											isActive
												? "bg-amber-400 text-slate-950 dark:bg-yellow-300"
												: "bg-slate-200/85 text-slate-700 dark:bg-slate-800/80 dark:text-yellow-200/75"
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
						</div>
					);
				})}
			</nav>
		</div>
	);
}
