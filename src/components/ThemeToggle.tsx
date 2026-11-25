import { Monitor, Moon, Sun } from "lucide";
import { MorphIcon } from "morphicons/react";
import { useEffect, useState } from "react";
import { notifyThemeChange, type ThemeMode } from "../utils/theme";

function getInitialMode(): ThemeMode {
	if (typeof window === "undefined") {
		return "auto";
	}

	const stored = window.localStorage.getItem("theme");
	if (stored === "light" || stored === "dark" || stored === "auto") {
		return stored;
	}

	return "auto";
}

function applyThemeMode(mode: ThemeMode) {
	const prefersDark =
		typeof window !== "undefined" && typeof window.matchMedia === "function"
			? window.matchMedia("(prefers-color-scheme: dark)").matches
			: true;
	const resolved = mode === "auto" ? (prefersDark ? "dark" : "light") : mode;

	document.documentElement.classList.remove("light", "dark");
	document.documentElement.classList.add(resolved);

	if (mode === "auto") {
		document.documentElement.removeAttribute("data-theme");
	} else {
		document.documentElement.setAttribute("data-theme", mode);
	}

	document.documentElement.style.colorScheme = resolved;
	notifyThemeChange(resolved);
}

export default function ThemeToggle() {
	const [mode, setMode] = useState<ThemeMode>("auto");

	useEffect(() => {
		const initialMode = getInitialMode();
		setMode(initialMode);
		applyThemeMode(initialMode);
	}, []);

	useEffect(() => {
		if (mode !== "auto" || typeof window.matchMedia !== "function") {
			return;
		}

		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => applyThemeMode("auto");

		media.addEventListener("change", onChange);
		return () => {
			media.removeEventListener("change", onChange);
		};
	}, [mode]);

	function toggleMode() {
		const nextMode: ThemeMode =
			mode === "light" ? "dark" : mode === "dark" ? "auto" : "light";
		setMode(nextMode);
		applyThemeMode(nextMode);
		window.localStorage.setItem("theme", nextMode);
	}

	const label =
		mode === "auto"
			? "Tema: Automático (sistema). Haz clic para cambiar a Claro."
			: mode === "dark"
				? "Tema: Oscuro. Haz clic para cambiar a Automático."
				: "Tema: Claro. Haz clic para cambiar a Oscuro.";

	const currentIcon = mode === "auto" ? Monitor : mode === "dark" ? Moon : Sun;

	const iconTintClass =
		mode === "light"
			? "text-amber-500 hover:text-amber-600 dark:text-yellow-300 dark:hover:text-yellow-200"
			: mode === "dark"
				? "text-purple-600 hover:text-purple-700 dark:text-purple-300 dark:hover:text-purple-200"
				: "text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]";

	return (
		<button
			type="button"
			onClick={toggleMode}
			aria-label={label}
			title={label}
			className={`rounded-xl p-2 transition-colors duration-300 hover:bg-[var(--link-bg-hover)] flex items-center justify-center cursor-pointer ${iconTintClass}`}
		>
			<MorphIcon
				icon={currentIcon}
				size={20}
				strokeWidth={2}
				spring="snappy"
				reducedMotion="user"
				className="h-5 w-5"
			/>
		</button>
	);
}
