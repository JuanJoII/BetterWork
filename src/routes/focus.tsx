import { createFileRoute } from "@tanstack/react-router";
import AuthGuard from "../components/AuthGuard";
import FocusRoom from "../components/focus/FocusRoom";

export const Route = createFileRoute("/focus")({
	component: FocusPage,
});

function FocusPage() {
	return (
		<AuthGuard>
			<FocusRoom />
		</AuthGuard>
	);
}
