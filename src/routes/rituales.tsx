import { createFileRoute } from "@tanstack/react-router";
import AuthGuard from "../components/AuthGuard";
import RitualesBoard from "../components/rituales/RitualesBoard";

export const Route = createFileRoute("/rituales")({
	component: RitualesPage,
});

function RitualesPage() {
	return (
		<AuthGuard>
			<RitualesBoard />
		</AuthGuard>
	);
}
