import { useNavigate } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
	const { isLoading, isAuthenticated } = useConvexAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			navigate({ to: "/login" });
		}
	}, [isLoading, isAuthenticated, navigate]);

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)]">
				<div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500/25 border-t-amber-500 dark:border-yellow-500/20 dark:border-t-yellow-400" />
			</div>
		);
	}

	if (!isAuthenticated) return null;

	return <>{children}</>;
}
