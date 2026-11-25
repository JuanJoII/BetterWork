import { getResolvedThemeFromDOM } from "./theme";

export function getSuccessToastTheme() {
	const isDark = getResolvedThemeFromDOM() === "dark";
	return {
		fill: isDark ? "#130f26" : "#faf5ff",
		styles: {
			title: "bw-toast-title-success font-extrabold",
			description: "bw-toast-desc-success text-xs font-semibold mt-0.5",
			button: "bw-toast-btn-success font-bold",
		},
	};
}

export function getErrorToastTheme() {
	const isDark = getResolvedThemeFromDOM() === "dark";
	return {
		fill: isDark ? "#260f1c" : "#fff1f2",
		styles: {
			title: "bw-toast-title-error font-extrabold",
			description: "bw-toast-desc-error text-xs font-semibold mt-0.5",
			button: "bw-toast-btn-error font-bold",
		},
	};
}
