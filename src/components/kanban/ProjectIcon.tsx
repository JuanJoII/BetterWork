import {
	BookOpen,
	Briefcase,
	Code2,
	Cpu,
	Dumbbell,
	Flame,
	Globe,
	Heart,
	Home,
	Layers,
	type LucideIcon,
	Music,
	Palette,
	Rocket,
	Sparkles,
	Star,
	Target,
} from "lucide-react";

export interface LucideIconOption {
	key: string;
	label: string;
	Icon: LucideIcon;
}

export const CURATED_LUCIDE_ICONS: LucideIconOption[] = [
	{ key: "rocket", label: "Cohete", Icon: Rocket },
	{ key: "code", label: "Código", Icon: Code2 },
	{ key: "briefcase", label: "Trabajo", Icon: Briefcase },
	{ key: "palette", label: "Diseño", Icon: Palette },
	{ key: "target", label: "Objetivos", Icon: Target },
	{ key: "flame", label: "Prioridad", Icon: Flame },
	{ key: "book", label: "Estudio", Icon: BookOpen },
	{ key: "sparkles", label: "Ideas", Icon: Sparkles },
	{ key: "globe", label: "Web", Icon: Globe },
	{ key: "cpu", label: "Tech", Icon: Cpu },
	{ key: "layers", label: "Producto", Icon: Layers },
	{ key: "home", label: "Personal", Icon: Home },
	{ key: "dumbbell", label: "Salud", Icon: Dumbbell },
	{ key: "music", label: "Música", Icon: Music },
	{ key: "heart", label: "Favorito", Icon: Heart },
	{ key: "star", label: "Destacado", Icon: Star },
];

export const CURATED_EMOJIS = [
	"🚀",
	"💻",
	"🎨",
	"📚",
	"⚡",
	"🔥",
	"🎯",
	"🧠",
	"🌱",
	"💼",
	"🏠",
	"🎵",
	"🏋️",
	"🛠️",
	"✨",
	"📌",
] as const;

const LUCIDE_MAP = new Map<string, LucideIcon>(
	CURATED_LUCIDE_ICONS.map((item) => [item.key, item.Icon]),
);

export function formatLucideIcon(key: string): string {
	return `lucide:${key}`;
}

export function formatEmojiIcon(emoji: string): string {
	return `emoji:${emoji.trim()}`;
}

export function parseProjectIcon(
	icon?: string,
): { kind: "lucide"; key: string } | { kind: "emoji"; value: string } | null {
	if (!icon?.trim()) return null;
	if (icon.startsWith("lucide:")) {
		const key = icon.slice("lucide:".length);
		if (LUCIDE_MAP.has(key)) {
			return { kind: "lucide", key };
		}
		return null;
	}
	if (icon.startsWith("emoji:")) {
		const value = icon.slice("emoji:".length).trim();
		return value ? { kind: "emoji", value } : null;
	}
	return { kind: "emoji", value: icon.trim() };
}

interface ProjectIconProps {
	icon?: string;
	className?: string;
	emojiClassName?: string;
}

export default function ProjectIcon({
	icon,
	className = "h-3.5 w-3.5",
	emojiClassName = "text-sm leading-none",
}: ProjectIconProps) {
	const parsed = parseProjectIcon(icon);
	if (!parsed) return null;

	if (parsed.kind === "lucide") {
		const IconComponent = LUCIDE_MAP.get(parsed.key);
		if (!IconComponent) return null;
		return (
			<IconComponent
				className={`shrink-0 ${className}`.trim()}
				aria-hidden="true"
			/>
		);
	}

	return (
		<span className={`shrink-0 ${emojiClassName}`.trim()} aria-hidden="true">
			{parsed.value}
		</span>
	);
}
