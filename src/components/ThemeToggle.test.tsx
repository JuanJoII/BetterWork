import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ThemeToggle from "./ThemeToggle";

describe("ThemeToggle", () => {
	beforeEach(() => {
		window.localStorage.clear();
		document.documentElement.classList.remove("light", "dark");
		document.documentElement.removeAttribute("data-theme");
		Object.defineProperty(window, "matchMedia", {
			writable: true,
			value: vi.fn().mockImplementation((query: string) => ({
				matches: true,
				media: query,
				onchange: null,
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				addListener: vi.fn(),
				removeListener: vi.fn(),
				dispatchEvent: vi.fn(),
			})),
		});
	});

	afterEach(() => {
		cleanup();
	});

	it("renders a morphing SVG icon and cycles between auto, light, and dark modes", () => {
		const { container } = render(<ThemeToggle />);

		const btn = screen.getByRole("button", {
			name: /Tema: Automático/i,
		});
		expect(container.querySelector("svg")).toBeTruthy();

		// auto -> light
		fireEvent.click(btn);
		expect(window.localStorage.getItem("theme")).toBe("light");
		expect(document.documentElement.classList.contains("light")).toBe(true);
		expect(btn.getAttribute("aria-label")).toMatch(/Tema: Claro/i);

		// light -> dark
		fireEvent.click(btn);
		expect(window.localStorage.getItem("theme")).toBe("dark");
		expect(document.documentElement.classList.contains("dark")).toBe(true);
		expect(btn.getAttribute("aria-label")).toMatch(/Tema: Oscuro/i);

		// dark -> auto
		fireEvent.click(btn);
		expect(window.localStorage.getItem("theme")).toBe("auto");
		expect(btn.getAttribute("aria-label")).toMatch(/Tema: Automático/i);
	});
});
