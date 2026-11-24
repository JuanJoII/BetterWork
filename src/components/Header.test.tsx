import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Header from "./Header";

vi.mock("convex/react", () => ({
	useConvexAuth: () => ({ isAuthenticated: true }),
}));

vi.mock("@convex-dev/auth/react", () => ({
	useAuthActions: () => ({ signOut: vi.fn() }),
}));

vi.mock("@tanstack/react-router", () => ({
	Link: ({
		to,
		children,
		className,
	}: {
		to: string;
		children: React.ReactNode;
		className?: string;
	}) => (
		<a href={to} className={className}>
			{children}
		</a>
	),
}));

vi.mock("./ThemeToggle", () => ({
	default: () => <button type="button">Theme</button>,
}));

describe("Header", () => {
	afterEach(() => {
		cleanup();
	});

	it("links to /dailys in both desktop and mobile navigation and removes Rituales", () => {
		render(<Header />);

		const dailysLinks = screen.getAllByRole("link", { name: "Dailys" });
		expect(dailysLinks).toHaveLength(2);
		for (const link of dailysLinks) {
			expect(link.getAttribute("href")).toBe("/dailys");
		}
		expect(screen.queryByRole("link", { name: /Rituales/i })).toBeNull();
	});
});
