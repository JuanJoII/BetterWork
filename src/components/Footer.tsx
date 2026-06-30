export default function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className="mt-20 border-t border-[var(--line)] px-4 pb-14 pt-10 text-[var(--sea-ink-soft)]">
			<div className="page-wrap flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
				<p className="m-0 text-sm">
					&copy; {year} Juan José Camacho. All rights reserved.
				</p>
				<p className="island-kicker m-0">Apoyame en GitHub</p>
			</div>
			<div className="mt-4 flex justify-center gap-4">
				<a
					href="https://portafolio.jayjo.cloud"
					target="_blank"
					rel="noreferrer"
					className="rounded-xl p-2 text-purple-400 transition hover:bg-[var(--link-bg-hover)] hover:text-yellow-400"
				>
					<span className="sr-only">Ir a mi web</span>
					<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-world"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M21.165 16a10 10 0 0 1 -8.434 5.973a1 1 0 0 0 .617 -.444a18 18 0 0 0 2.28 -5.528z" /><path d="M8.372 16a18 18 0 0 0 2.28 5.53a1 1 0 0 0 .616 .443a10 10 0 0 1 -8.433 -5.973z" /><path d="M13.57 16a16 16 0 0 1 -1.57 3.884a16 16 0 0 1 -1.57 -3.884" /><path d="M8.034 10a18 18 0 0 0 0 4h-5.832a10 10 0 0 1 -.002 -4z" /><path d="M13.952 10a16 16 0 0 1 0 4h-3.904a16 16 0 0 1 0 -4z" /><path d="M21.8 10a10.05 10.05 0 0 1 -.002 4h-5.832c.149 -1.329 .149 -2.67 0 -4z" /><path d="M11.267 2.027a1 1 0 0 0 -.615 .444a18 18 0 0 0 -2.28 5.529h-5.54a10.01 10.01 0 0 1 8.334 -5.967z" /><path d="M12 4.116a16 16 0 0 1 1.57 3.885h-3.14c.34 -1.317 .85 -2.6 1.53 -3.817z" /><path d="M12.733 2.026a10.01 10.01 0 0 1 8.435 5.974h-5.54a18 18 0 0 0 -2.28 -5.53a1 1 0 0 0 -.517 -.414z" /></svg>
				</a>
				<a
					href="https://github.com/JuanJoII"
					target="_blank"
					rel="noreferrer"
					className="rounded-xl p-2 text-purple-400 transition hover:bg-[var(--link-bg-hover)] hover:text-yellow-400"
				>
					<span className="sr-only">Mi GitHub</span>
					<svg viewBox="0 0 16 16" aria-hidden="true" width="32" height="32">
						<path
							fill="currentColor"
							d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
						/>
					</svg>
				</a>
			</div>
		</footer>
	);
}
