import { createFileRoute } from "@tanstack/react-router";
import AuthGuard from "../components/AuthGuard";
import DailysBoard from "../components/dailys/DailysBoard";

export const Route = createFileRoute("/dailys")({
	component: DailysPage,
});

function DailysPage() {
	return (
		<AuthGuard>
			<DailysBoard />
		</AuthGuard>
	);
}
