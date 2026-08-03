import { useEffect, useRef } from "react";
import gsap from "gsap";

interface ShockwaveWrapperProps {
	id: string;
	children: React.ReactNode;
}

export const dispatchShockwave = (x: number, y: number, originId: string) => {
	if (typeof window !== "undefined") {
		window.dispatchEvent(
			new CustomEvent("kanban-shockwave", {
				detail: { x, y, originId },
			}),
		);
	}
};

export default function ShockwaveWrapper({ id, children }: ShockwaveWrapperProps) {
	const elementRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleShockwave = (e: Event) => {
			const { x, y, originId } = (e as CustomEvent).detail;
			if (id === originId || !elementRef.current) return;

			const cardHtml = elementRef.current;
			const cardRect = cardHtml.getBoundingClientRect();
			const cardCenterX = cardRect.left + cardRect.width / 2;
			const cardCenterY = cardRect.top + cardRect.height / 2;

			const dx = cardCenterX - x;
			const dy = cardCenterY - y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			const maxDistance = 900;
			if (distance < maxDistance && distance > 0) {
				const force = (1 - distance / maxDistance) * 40;
				const angle = Math.atan2(dy, dx);
				const forceX = Math.cos(angle) * force;
				const forceY = Math.sin(angle) * force;

				// Kill any running animations to avoid overlapping conflicts
				gsap.killTweensOf(cardHtml);

				// Subtle outward explosion push, followed by a smooth elastic settle
				const tl = gsap.timeline();
				tl.to(cardHtml, {
					x: forceX,
					y: forceY,
					duration: 0.08,
					ease: "power2.out",
				}).to(cardHtml, {
					x: 0,
					y: 0,
					duration: 0.45,
					ease: "elastic.out(0.85, 0.55)",
				});
			}
		};

		window.addEventListener("kanban-shockwave", handleShockwave);
		return () => {
			window.removeEventListener("kanban-shockwave", handleShockwave);
		};
	}, [id]);

	return (
		<div ref={elementRef} className="will-change-transform">
			{children}
		</div>
	);
}
