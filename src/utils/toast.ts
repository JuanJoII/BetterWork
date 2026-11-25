import { getResolvedThemeFromDOM } from "./theme";

export function getSuccessToastTheme() {
	const isDark = getResolvedThemeFromDOM() === "dark";
	if (isDark) {
		return {
			fill: "#130f26",
			styles: {
				title: "text-purple-200 font-extrabold",
				description: "text-purple-300/80 text-xs font-semibold mt-0.5",
				button: "bg-purple-600 text-white hover:bg-purple-700 font-bold",
			},
		};
	}

	return {
		fill: "#faf5ff",
		styles: {
			title: "text-purple-950 font-extrabold",
			description: "text-purple-800/85 text-xs font-semibold mt-0.5",
			button: "bg-purple-600 text-white hover:bg-purple-700 font-bold",
		},
	};
}

export function getErrorToastTheme() {
	const isDark = getResolvedThemeFromDOM() === "dark";
	if (isDark) {
		return {
			fill: "#260f1c",
			styles: {
				title: "text-red-200 font-extrabold",
				description: "text-red-300/80 text-xs font-semibold mt-0.5",
				button: "bg-red-600 text-white hover:bg-red-700 font-bold",
			},
		};
	}

	return {
		fill: "#fff1f2",
		styles: {
			title: "text-red-950 font-extrabold",
			description: "text-red-800/85 text-xs font-semibold mt-0.5",
			button: "bg-red-600 text-white hover:bg-red-700 font-bold",
		},
	};
}
