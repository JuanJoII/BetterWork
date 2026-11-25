import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Toaster } from "sileo";
import Footer from "../components/Footer";
import Header from "../components/Header";
import "sileo/styles.css";

import ConvexProvider from "../integrations/convex/provider";

import appCss from "../styles.css?url";
import { useResolvedTheme } from "../utils/theme";

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`;

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "BetterWork",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	const resolvedTheme = useResolvedTheme();

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: static theme initialization script to prevent FOUC */}
				<script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
				<HeadContent />
			</head>
			<body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(234,179,8,0.25)] bg-[var(--bg-base)] text-[var(--sea-ink)] min-h-screen relative overflow-x-hidden transition-colors duration-200">
				{/* Ambient brand radial halos (Light & Dark Mode) */}
				<div
					aria-hidden="true"
					className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[var(--bg-base)] transition-colors duration-300"
				>
					<div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(147,51,234,0.18),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_farthest-side,rgba(168,85,247,0.22),rgba(255,255,255,0))]" />
					<div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(234,179,8,0.22),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_farthest-side,rgba(234,179,8,0.18),rgba(255,255,255,0))]" />
				</div>
				{/* Sileo inverts toast surface colors: "light" = dark toast text-white, "dark" = light toast text-dark */}
				<Toaster
					position="bottom-center"
					theme={resolvedTheme === "dark" ? "light" : "dark"}
				/>
				<ConvexProvider>
					<Header />
					<div className="relative z-10">{children}</div>
					<Footer />
					<TanStackDevtools
						config={{
							position: "bottom-right",
						}}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
						]}
					/>
				</ConvexProvider>
				<Scripts />
			</body>
		</html>
	);
}
