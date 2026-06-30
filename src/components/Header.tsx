import { Link } from "@tanstack/react-router";
import { Compass, HelpCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
	const [showGuide, setShowGuide] = useState(false);
	const guideRef = useRef<HTMLDivElement>(null);

	// Close help guide when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				guideRef.current &&
				!guideRef.current.contains(event.target as Node)
			) {
				setShowGuide(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<header className="sticky top-4 z-50 mx-auto w-[calc(100%-2rem)] max-w-5xl">
			<nav className="relative flex items-center justify-between gap-x-4 py-2 px-5 rounded-full border border-[var(--line)] bg-slate-900/65 backdrop-blur-md shadow-xl shadow-black/25">
				<h1 className="m-0 flex-shrink-0 text-base font-black tracking-tight">
					<Link
						to="/"
						className="text-purple-400 hover:text-yellow-400 transition no-underline font-serif font-black text-lg"
					>
						BetterWork
					</Link>
				</h1>

				{/* Centered Navigation Links (Desktop) */}
				<div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-5 text-sm font-semibold">
					<Link
						to="/"
						className="nav-link"
						activeProps={{ className: "nav-link is-active" }}
					>
						Tablero
					</Link>
					<Link
						to="/focus"
						className="nav-link"
						activeProps={{ className: "nav-link is-active" }}
					>
						Concentrarme
					</Link>
					<Link
						to="/rituales"
						className="nav-link"
						activeProps={{ className: "nav-link is-active" }}
					>
						Rituales
					</Link>
				</div>

				{/* Mobile Navigation */}
				<div className="flex md:hidden items-center gap-3 text-xs font-semibold">
					<Link
						to="/"
						className="nav-link"
						activeProps={{ className: "nav-link is-active" }}
					>
						Tablero
					</Link>
					<Link
						to="/focus"
						className="nav-link"
						activeProps={{ className: "nav-link is-active" }}
					>
						Concentrarme
					</Link>
				</div>

				<div className="flex items-center gap-1 sm:gap-1.5">
					{/* Workspace Help Tooltip Trigger */}
					<div className="relative" ref={guideRef}>
						<button
							type="button"
							onClick={() => setShowGuide(!showGuide)}
							className="rounded-xl p-2 text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
							aria-label="Workspace Guide"
						>
							<HelpCircle className="h-5 w-5" />
						</button>

						{showGuide && (
							<div className="absolute right-0 mt-2 w-80 z-[100] rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
								<div className="flex items-center justify-between border-b border-[var(--line)] pb-2 mb-3">
									<div className="flex items-center gap-1.5 text-[var(--sea-ink)]">
										<Compass className="h-4 w-4 text-[var(--lagoon)]" />
										<span className="text-xs font-extrabold uppercase tracking-wider">
											BetterWork Guide
										</span>
									</div>
									<button
										type="button"
										onClick={() => setShowGuide(false)}
										className="text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
									>
										<X className="h-4 w-4" />
									</button>
								</div>
								<ul className="m-0 list-decimal pl-4 space-y-2 text-xs leading-relaxed text-[var(--sea-ink-soft)] font-medium">
									<li>
										Organiza tu flujo de trabajo en 3 columnas:{" "}
										<strong>Pendiente</strong>, <strong>En Proceso</strong> y{" "}
										<strong>Finalizado</strong>.
									</li>
									<li>
										Haz clic en <strong>"Focus"</strong> (icono de cronómetro)
										en cualquier tarjeta para abrir la sesión de Deep Work en la
										ruta exclusiva.
									</li>
									<li>
										Arrastra las notas adhesivas directamente, o haz clic en las
										flechas para moverlas lateralmente.
									</li>
									<li>
										Las notas cuentan con colores y niveles de prioridad
										contrastantes (morados y amarillos).
									</li>
								</ul>
							</div>
						)}
					</div>

					<ThemeToggle />
				</div>
			</nav>
		</header>
	);
}
