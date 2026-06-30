import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useConvexAuth } from "convex/react";

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
			<div className="flex min-h-screen items-center justify-center bg-slate-950">
				<div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-500/20 border-t-yellow-400" />
			</div>
		);
	}

	if (!isAuthenticated) return null;

	return <>{children}</>;
}
