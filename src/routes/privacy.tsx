import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/privacy")({
	head: () => ({
		meta: [
			{
				title: "Política de Privacidad — BetterWork",
			},
		],
	}),
	component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
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
					<div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-purple-800 dark:border-purple-400/30 dark:bg-purple-500/15 dark:text-purple-300">
						<ShieldCheck className="h-3.5 w-3.5" />
						<span>Documento Legal</span>
					</div>
					<h1 className="display-title m-0 font-serif text-3xl sm:text-4xl font-black tracking-tight text-[var(--sea-ink)]">
						Política de Privacidad
					</h1>
					<p className="mt-2 mb-0 text-xs font-semibold text-[var(--sea-ink-soft)]">
						Última actualización: 25 de noviembre de 2026
					</p>
				</header>

				<div className="space-y-7 text-sm leading-relaxed text-[var(--sea-ink-soft)]">
					<section>
						<h2 className="m-0 mb-2 font-serif text-lg font-black text-[var(--sea-ink)]">
							1. Introducción
						</h2>
						<p className="m-0">
							En <strong>BetterWork</strong> respetamos tu privacidad y nos
							comprometemos a proteger los datos personales que compartes al
							utilizar nuestra plataforma de organización personal (tablero
							Kanban, proyectos, Dailys, sesiones de Focus e integraciones
							opcionales con Google). Esta política explica qué información
							recopilamos, cómo la utilizamos y qué controles tienes sobre ella.
						</p>
					</section>

					<section>
						<h2 className="m-0 mb-2 font-serif text-lg font-black text-[var(--sea-ink)]">
							2. Información que recopilamos
						</h2>
						<ul className="m-0 list-disc pl-5 space-y-1.5">
							<li>
								<strong>Datos de cuenta e identidad:</strong> dirección de
								correo electrónico y contraseña cifrada (si te registras con
								correo), o tu nombre, correo electrónico verificado y foto de
								perfil proporcionados por Google cuando eliges iniciar sesión
								con Google OAuth.
							</li>
							<li>
								<strong>Contenido de productividad:</strong> proyectos, notas
								adhesivas (título, descripción, prioridad y estado en el
								tablero), hábitos diarios (<em>Dailys</em>) e historial reciente
								de tareas completadas.
							</li>
							<li>
								<strong>Datos de Google Calendar (opcional):</strong> si decides
								conectar tu calendario en el futuro, únicamente accederemos a
								los permisos explícitamente autorizados por ti para mostrar o
								sincronizar eventos relacionados con tus notas y tareas.
							</li>
							<li>
								<strong>Preferencias locales:</strong> ajustes de interfaz
								guardados en tu navegador (como el tema claro/oscuro y el estado
								del panel lateral).
							</li>
						</ul>
					</section>

					<section>
						<h2 className="m-0 mb-2 font-serif text-lg font-black text-[var(--sea-ink)]">
							3. Cómo utilizamos tu información
						</h2>
						<ul className="m-0 list-disc pl-5 space-y-1.5">
							<li>
								Autenticar tu identidad, mantener tu sesión activa y vincular tu
								cuenta de forma segura si utilizas el mismo correo verificado.
							</li>
							<li>
								Almacenar, sincronizar en tiempo real y mostrarte tus tableros,
								proyectos, notas y Dailys.
							</li>
							<li>
								Sincronizar tus tareas con Google Calendar únicamente cuando tú
								lo habilites explícitamente.
							</li>
							<li>
								Mantener la seguridad, estabilidad y rendimiento técnico de la
								aplicación.
							</li>
						</ul>
					</section>

					<section>
						<h2 className="m-0 mb-2 font-serif text-lg font-black text-[var(--sea-ink)]">
							4. Uso limitado de datos de las APIs de Google (Google API
							Services User Data Policy)
						</h2>
						<p className="m-0">
							El uso y la transferencia por parte de BetterWork a cualquier otra
							aplicación de la información recibida desde las APIs de Google se
							regirá estrictamente por la{" "}
							<a
								href="https://developers.google.com/terms/api-services-user-data-policy"
								target="_blank"
								rel="noreferrer"
								className="font-bold text-purple-700 underline decoration-purple-500/40 underline-offset-2 hover:text-amber-600 dark:text-purple-400 dark:hover:text-yellow-400"
							>
								Política de Datos de Usuario de los Servicios de API de Google
							</a>
							, incluidos los requisitos de{" "}
							<strong>Uso Limitado (Limited Use)</strong>. En particular:
						</p>
						<ul className="mt-2 mb-0 list-disc pl-5 space-y-1.5">
							<li>
								<strong>No vendemos</strong> ni alquilamos tus datos personales
								ni tus datos provenientes de Google a terceros.
							</li>
							<li>
								<strong>No utilizamos</strong> tus datos de Google para mostrar
								publicidad dirigida ni para elaborar perfiles comerciales.
							</li>
							<li>
								<strong>No utilizamos</strong> datos obtenidos mediante las APIs
								de Google Workspace para desarrollar, mejorar o entrenar modelos
								generales de inteligencia artificial o aprendizaje automático.
							</li>
						</ul>
					</section>

					<section>
						<h2 className="m-0 mb-2 font-serif text-lg font-black text-[var(--sea-ink)]">
							5. Almacenamiento, seguridad y retención
						</h2>
						<p className="m-0">
							Tus datos se almacenan en infraestructura gestionada por{" "}
							<strong>Convex</strong> con acceso estrictamente aislado por
							usuario autenticado. Las sesiones, claves criptográficas y tokens
							OAuth se procesan del lado del servidor y nunca se exponen a otros
							usuarios. Como medida de minimización de datos, los registros de
							tareas completadas se depuran automáticamente después de{" "}
							<strong>15 días</strong>.
						</p>
					</section>

					<section>
						<h2 className="m-0 mb-2 font-serif text-lg font-black text-[var(--sea-ink)]">
							6. Tus derechos y revocación de acceso
						</h2>
						<p className="m-0">
							Puedes editar o eliminar tus notas, proyectos y Dailys en
							cualquier momento directamente dentro de BetterWork. Si iniciaste
							sesión con Google o conectaste un servicio de Google, puedes
							revocar el acceso de BetterWork en cualquier momento desde{" "}
							<a
								href="https://myaccount.google.com/permissions"
								target="_blank"
								rel="noreferrer"
								className="font-bold text-purple-700 underline decoration-purple-500/40 underline-offset-2 hover:text-amber-600 dark:text-purple-400 dark:hover:text-yellow-400"
							>
								myaccount.google.com/permissions
							</a>
							. También puedes solicitar la eliminación completa de tu cuenta y
							datos asociados escribiéndonos a través de los canales de contacto
							indicados abajo.
						</p>
					</section>

					<section>
						<h2 className="m-0 mb-2 font-serif text-lg font-black text-[var(--sea-ink)]">
							7. Cambios y contacto
						</h2>
						<p className="m-0">
							Podemos actualizar esta Política de Privacidad periódicamente para
							reflejar mejoras en BetterWork o requisitos legales. Cuando
							realicemos cambios relevantes, actualizaremos la fecha en la parte
							superior de esta página. Si tienes dudas o solicitudes sobre tu
							privacidad, contáctanos vía{" "}
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
						to="/terms"
						className="font-extrabold text-purple-700 hover:text-amber-600 dark:text-purple-400 dark:hover:text-yellow-400 transition"
					>
						Ver Condiciones de Servicio →
					</Link>
				</footer>
			</article>
		</main>
	);
}
