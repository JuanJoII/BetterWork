import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginPage } from "../routes/login";

const signInMock = vi.fn();
const navigateMock = vi.fn();
const sileoErrorMock = vi.fn();
const sileoSuccessMock = vi.fn();

vi.mock("@convex-dev/auth/react", () => ({
	useAuthActions: () => ({
		signIn: signInMock,
	}),
}));

vi.mock("convex/react", () => ({
	useConvexAuth: () => ({
		isLoading: false,
		isAuthenticated: false,
	}),
}));

vi.mock("@tanstack/react-router", () => ({
	createFileRoute: () => () => ({}),
	useNavigate: () => navigateMock,
}));

vi.mock("sileo", () => ({
	sileo: {
		error: (...args: unknown[]) => sileoErrorMock(...args),
		success: (...args: unknown[]) => sileoSuccessMock(...args),
	},
}));

describe("LoginPage Google Sign-In", () => {
	beforeEach(() => {
		signInMock.mockReset();
		navigateMock.mockReset();
		sileoErrorMock.mockReset();
		sileoSuccessMock.mockReset();
	});

	it("triggers Google OAuth sign-in redirecting to root", async () => {
		signInMock.mockResolvedValue({ signingIn: false });
		render(<LoginPage />);

		const googleButton = screen.getByRole("button", {
			name: /continuar con google/i,
		});
		fireEvent.click(googleButton);

		await waitFor(() => {
			expect(signInMock).toHaveBeenCalledWith("google", { redirectTo: "/" });
		});
	});

	it("shows a Sileo error toast and re-enables the button if Google sign-in fails", async () => {
		signInMock.mockRejectedValueOnce(new Error("OAuth error"));
		render(<LoginPage />);

		const googleButton = screen.getByRole("button", {
			name: /continuar con google/i,
		});
		fireEvent.click(googleButton);

		await waitFor(() => {
			expect(sileoErrorMock).toHaveBeenCalledWith(
				expect.objectContaining({
					title: "Error con Google",
					description: "OAuth error",
				}),
			);
		});

		expect((googleButton as HTMLButtonElement).disabled).toBe(false);
	});
});
