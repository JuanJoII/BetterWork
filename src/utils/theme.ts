import { useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "auto";
export type ResolvedTheme = "light" | "dark";

export const THEME_CHANGE_EVENT = "betterwork-theme-change";

export function getResolvedThemeFromDOM(): ResolvedTheme {
	if (typeof document === "undefined") {
		return "dark";
	}
	if (document.documentElement.classList.contains("light")) {
		return "light";
	}
	if (document.documentElement.classList.contains("dark")) {
		return "dark";
	}
	if (
		typeof window !== "undefined" &&
		typeof window.matchMedia === "function"
	) {
		return window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light";
	}
	return "dark";
}

export function notifyThemeChange(resolved: ResolvedTheme) {
	if (typeof window === "undefined") return;
	window.dispatchEvent(
		new CustomEvent<ResolvedTheme>(THEME_CHANGE_EVENT, { detail: resolved }),
	);
}

export function useResolvedTheme(): ResolvedTheme {
	const [resolved, setResolved] = useState<ResolvedTheme>("dark");

	useEffect(() => {
		setResolved(getResolvedThemeFromDOM());

		const handleThemeEvent = (event: Event) => {
			const custom = event as CustomEvent<ResolvedTheme>;
			if (custom.detail === "light" || custom.detail === "dark") {
				setResolved(custom.detail);
			} else {
				setResolved(getResolvedThemeFromDOM());
			}
		};

		window.addEventListener(THEME_CHANGE_EVENT, handleThemeEvent);
		return () => {
			window.removeEventListener(THEME_CHANGE_EVENT, handleThemeEvent);
		};
	}, []);

	return resolved;
}
