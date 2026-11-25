export default function LiquidGlassBackground() {
	return (
		<div
			aria-hidden="true"
			className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
		>
			{/* Frosted specular surface gradient */}
			<div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/30 to-purple-100/45 dark:from-white/[0.08] dark:via-transparent dark:to-purple-500/[0.05]" />

			{/* Top liquid glass rim highlight */}
			<div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white dark:via-white/40 to-transparent" />

			{/* Gently drifting brand ambient orbs */}
			<div className="liquid-orb-a absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.28),rgba(234,179,8,0.1)_48%,transparent_72%)] dark:bg-[radial-gradient(circle,rgba(250,204,21,0.24),rgba(234,179,8,0.06)_48%,transparent_72%)] blur-2xl" />
			<div className="liquid-orb-b absolute -bottom-28 -left-24 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(147,51,234,0.24),rgba(124,58,237,0.09)_50%,transparent_72%)] dark:bg-[radial-gradient(circle,rgba(168,85,247,0.28),rgba(124,58,237,0.08)_50%,transparent_72%)] blur-2xl" />
			<div className="liquid-orb-c absolute right-1/4 top-1/2 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.16),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(255,0,182,0.14),transparent_70%)] blur-3xl" />
		</div>
	);
}
