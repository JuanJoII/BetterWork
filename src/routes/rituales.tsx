import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/rituales")({
	beforeLoad: () => {
		throw redirect({
			to: "/dailys",
			replace: true,
		});
	},
});
