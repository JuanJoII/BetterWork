import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FileText } from "lucide-react";

export const Route = createFileRoute("/terms")({
	head: () => ({
		meta: [
			{
				title: "Condiciones de Servicio — BetterWork",
			},
		],
	}),
	component: TermsOfServicePage,
});

function TermsOfServicePage() {
	return (
		<main className="page-wrap mx-auto max-w-4xl px-4 pt-12 pb-6">
			<div className="mb-6">
				<Link
					to="/"
					className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-strong)]/80 px-4 py-1.5 text-xs font-extrabold text-[var(--sea-ink-soft)] backdrop-blur-md transition hover:border-purple-400/50 hover:text-[var(--sea-ink)] no-underline"
				>
					<ArrowLeft className="h-3.5 w-3.5" />
					<span>Volver a BetterWork</span>
				</Link>
			</div>

			<article className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)]/85 p-6 sm:p-10 shadow-sm backdrop-blur-md">
				<header className="border-b border-[var(--line)] pb-6 mb-8">
					<div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/35 bg-amber-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-amber-800 dark:border-yellow-400/30 dark:bg-yellow-400/15 dark:text-yellow-300">
						<FileText className="h-3.5 w-3.5" />
						<span>Documento Legal</span>
					</div>
					<h1 className="display-title m-0 font-serif text-3xl sm:text-4xl font-black tracking-tight text-[var(--sea-ink)]">
						Condiciones de Servicio
					</h1>
					<p className="mt-2 mb-0 text-xs font-semibold text-[var(--sea-ink-soft)]">
						Última actualización: 25 de noviembre de 2026
					</p>
				</header>

				<div className="space-y-7 text-sm leading-relaxed text-[var(--sea-ink-soft)]">
					<section>
						<h2 className="m-0 mb-2 font-serif text-lg font-black text-[var(--sea-ink)]">
							1. Aceptación de las condiciones
						</h2>
						<p className="m-0">
							Al acceder o utilizar <strong>BetterWork</strong>, aceptas quedar
							sujeto a estas Condiciones de Servicio y a nuestra{" "}
							<Link
								to="/privacy"
								className="font-bold text-purple-700 underline decoration-purple-500/40 underline-offset-2 hover:text-amber-600 dark:text-purple-400 dark:hover:text-yellow-400"
							>
								Política de Privacidad
							</Link>
							. Si no estás de acuerdo con alguna parte de estos términos, te
							pedimos no utilizar la aplicación.
						</p>
					</section>

					<section>
						<h2 className="m-0 mb-2 font-serif text-lg font-black text-[var(--sea-ink)]">
							2. Descripción del servicio
						</h2>
						<p className="m-0">
							BetterWork es una aplicación web de productividad personal que te
							permite organizar proyectos y notas en un tablero Kanban,
							gestionar hábitos diarios (<em>Dailys</em>), ejecutar sesiones de
							concentración en <em>Focus</em> e integrar opcionalmente servicios
							de Google (como inicio de sesión con Google y sincronización con
							Google Calendar).
						</p>
					</section>

					<section>
						<h2 className="m-0 mb-2 font-serif text-lg font-black text-[var(--sea-ink)]">
							3. Cuentas y seguridad
						</h2>
						<ul className="m-0 list-disc pl-5 space-y-1.5">
							<li>
								Puedes crear y acceder a tu cuenta mediante correo electrónico y
								contraseña o iniciando sesión con tu cuenta de Google.
							</li>
							<li>
								Si inicias sesión con Google utilizando el mismo correo
								verificado de una cuenta previa, ambas vías de acceso podrán
								vincularse a tu mismo espacio de trabajo para preservar tus
								datos.
							</li>
							<li>
								Eres responsable de mantener la confidencialidad de tus
								credenciales y de toda actividad realizada desde tu cuenta.
							</li>
						</ul>
					</section>

					<section>
						<h2 className="m-0 mb-2 font-serif text-lg font-black text-[var(--sea-ink)]">
							4. Propiedad de tu contenido
						</h2>
						<p className="m-0">
							Conservas todos los derechos y la titularidad sobre los proyectos,
							notas, descripciones y Dailys que crees en BetterWork. Solo nos
							concedes el permiso técnico necesario para alojar, procesar y
							mostrar ese contenido con el único fin de prestarte el servicio.
						</p>
					</section>

					<section>
						<h2 className="m-0 mb-2 font-serif text-lg font-black text-[var(--sea-ink)]">
							5. Uso aceptable
						</h2>
						<p className="m-0">
							Te comprometes a utilizar BetterWork de forma lícita y a no
							intentar vulnerar su seguridad, acceder a datos de otros usuarios,
							automatizar solicitudes abusivas ni interferir con el
							funcionamiento normal de la plataforma o de las APIs de terceros
							conectadas.
						</p>
					</section>

					<section>
						<h2 className="m-0 mb-2 font-serif text-lg font-black text-[var(--sea-ink)]">
							6. Servicios de terceros (Google)
						</h2>
						<p className="m-0">
							El uso de Google Sign-In y de futuras integraciones con Google
							Calendar está sujeto también a los términos y políticas vigentes
							de Google. Puedes revocar los permisos otorgados a BetterWork en
							cualquier momento desde la configuración de tu cuenta de Google.
						</p>
					</section>

					<section>
						<h2 className="m-0 mb-2 font-serif text-lg font-black text-[var(--sea-ink)]">
							7. Disponibilidad y limitación de responsabilidad
						</h2>
						<p className="m-0">
							BetterWork se ofrece &ldquo;tal cual&rdquo; y &ldquo;según
							disponibilidad&rdquo;. Aunque trabajamos para mantener el servicio
							estable y seguro, no garantizamos disponibilidad ininterrumpida ni
							ausencia total de errores. En la máxima medida permitida por la
							ley aplicable, el desarrollador no será responsable por daños
							indirectos, pérdida de datos o interrupciones derivadas del uso o
							imposibilidad de uso del servicio.
						</p>
					</section>

					<section>
						<h2 className="m-0 mb-2 font-serif text-lg font-black text-[var(--sea-ink)]">
							8. Modificaciones y contacto
						</h2>
						<p className="m-0">
							Podemos actualizar estas Condiciones de Servicio en cualquier
							momento publicando la versión revisada en esta misma URL. El uso
							continuado de BetterWork tras dichos cambios implica su
							aceptación. Para consultas, contáctanos a través de{" "}
							<a
								href="https://portafolio.jayjo.cloud"
								target="_blank"
								rel="noreferrer"
								className="font-bold text-purple-700 underline decoration-purple-500/40 underline-offset-2 hover:text-amber-600 dark:text-purple-400 dark:hover:text-yellow-400"
							>
								portafolio.jayjo.cloud
							</a>{" "}
							o{" "}
							<a
								href="https://github.com/JuanJoII/BetterWork"
								target="_blank"
								rel="noreferrer"
								className="font-bold text-purple-700 underline decoration-purple-500/40 underline-offset-2 hover:text-amber-600 dark:text-purple-400 dark:hover:text-yellow-400"
							>
								GitHub
							</a>
							.
						</p>
					</section>
				</div>

				<footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-6 text-xs font-semibold text-[var(--sea-ink-soft)]">
					<span>BetterWork — Organización personal y enfoque</span>
					<Link
						to="/privacy"
						className="font-extrabold text-purple-700 hover:text-amber-600 dark:text-purple-400 dark:hover:text-yellow-400 transition"
					>
						Ver Política de Privacidad →
					</Link>
				</footer>
			</article>
		</main>
	);
}
