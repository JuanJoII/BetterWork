import { createFileRoute } from "@tanstack/react-router";
import AuthGuard from "../components/AuthGuard";
import KanbanBoard from "../components/kanban/KanbanBoard";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	return (
		<AuthGuard>
			<KanbanBoard />
		</AuthGuard>
	);
}
