import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { sileo } from "sileo";
import { LogIn, UserPlus, ShieldCheck, Mail, Lock } from "lucide-react";

export const Route = createFileRoute("/login")({
	component: LoginPage,
});

function LoginPage() {
	const { isLoading, isAuthenticated } = useConvexAuth();
	const { signIn } = useAuthActions();
	const navigate = useNavigate();

	const [isRegister, setIsRegister] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [pending, setPending] = useState(false);

	useEffect(() => {
		if (!isLoading && isAuthenticated) {
			navigate({ to: "/" });
		}
	}, [isLoading, isAuthenticated, navigate]);

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-slate-950">
				<div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-500/20 border-t-yellow-400" />
			</div>
		);
	}

	if (isAuthenticated) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email.trim() || !password.trim()) {
			sileo.error({
				title: "Campos incompletos",
				description: "Por favor, rellena todos los campos requeridos.",
				fill: "#260f1c",
				styles: {
					title: "text-red-200 font-extrabold",
					description: "text-red-300/80 text-xs font-semibold mt-0.5",
				},
			});
			return;
		}

		if (isRegister && password !== confirmPassword) {
			sileo.error({
				title: "Contraseñas no coinciden",
				description: "La confirmación de la contraseña no coincide con la contraseña original.",
				fill: "#260f1c",
				styles: {
					title: "text-red-200 font-extrabold",
					description: "text-red-300/80 text-xs font-semibold mt-0.5",
				},
			});
			return;
		}

		setPending(true);
		try {
			await signIn("password", {
				flow: isRegister ? "signUp" : "signIn",
				email: email.trim(),
				password: password.trim(),
			});

			sileo.success({
				title: isRegister ? "¡Registro Exitoso!" : "¡Sesión Iniciada!",
				description: isRegister 
					? "Tu cuenta ha sido creada y has iniciado sesión correctamente."
					: "Bienvenido de vuelta a BetterWork.",
				fill: "#130f26",
				styles: {
					title: "text-purple-200 font-extrabold",
					description: "text-purple-300/80 text-xs font-semibold mt-0.5",
				},
			});
		} catch (err: any) {
			console.error(err);
			sileo.error({
				title: isRegister ? "Error al registrarse" : "Error al iniciar sesión",
				description: err.message || "Credenciales incorrectas o error en el servidor.",
				fill: "#260f1c",
				styles: {
					title: "text-red-200 font-extrabold",
					description: "text-red-300/80 text-xs font-semibold mt-0.5",
				},
			});
		} finally {
			setPending(false);
		}
	};

	return (
		<main className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative">
			{/* Decorative glows */}
			<div className="pointer-events-none absolute -right-32 top-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(234,179,8,0.06),transparent_70%)]" />
			<div className="pointer-events-none absolute -left-32 top-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.08),transparent_70%)]" />

			<div className="w-full max-w-md relative z-10">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-4 shadow-inner">
						<ShieldCheck className="h-6 w-6" />
					</div>
					<h1 className="text-3xl font-black tracking-tight text-white font-serif mb-2">
						{isRegister ? "Crear cuenta" : "Iniciar sesión"}
					</h1>
					<p className="text-xs text-[var(--sea-ink-soft)] font-semibold">
						{isRegister 
							? "Regístrate para comenzar a organizar tus tareas y rituales" 
							: "Ingresa tus credenciales para acceder a tus tableros"}
					</p>
				</div>

				{/* Card */}
				<div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)]/75 backdrop-blur-md p-8 shadow-xl dot-grid">
					<form onSubmit={handleSubmit} className="space-y-5">
						<div>
							<label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
								Correo Electrónico
							</label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--sea-ink-soft)]" />
								<input
									type="email"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="tu@correo.com"
									className="demo-input py-2.5 pl-10 pr-4 text-xs font-semibold w-full bg-slate-950/40 border border-yellow-500/10 text-yellow-100 placeholder-yellow-100/30 rounded-xl focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
								/>
							</div>
						</div>

						<div>
							<label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
								Contraseña
							</label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--sea-ink-soft)]" />
								<input
									type="password"
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="••••••••"
									className="demo-input py-2.5 pl-10 pr-4 text-xs font-semibold w-full bg-slate-950/40 border border-yellow-500/10 text-yellow-100 placeholder-yellow-100/30 rounded-xl focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
								/>
							</div>
						</div>

						{isRegister && (
							<div>
								<label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
									Confirmar Contraseña
								</label>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--sea-ink-soft)]" />
									<input
										type="password"
										required
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										placeholder="••••••••"
										className="demo-input py-2.5 pl-10 pr-4 text-xs font-semibold w-full bg-slate-950/40 border border-yellow-500/10 text-yellow-100 placeholder-yellow-100/30 rounded-xl focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
									/>
								</div>
							</div>
						)}

						<button
							type="submit"
							disabled={pending}
							className="w-full flex h-11 items-center justify-center gap-2 rounded-xl bg-yellow-400 border border-yellow-500 text-slate-950 hover:bg-yellow-300 font-extrabold text-xs tracking-wide shadow-md hover:shadow-yellow-400/10 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
						>
							{pending ? (
								<div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
							) : isRegister ? (
								<>
									<UserPlus className="h-4 w-4" />
									<span>Registrarse</span>
								</>
							) : (
								<>
									<LogIn className="h-4 w-4" />
									<span>Iniciar Sesión</span>
								</>
							)}
						</button>
					</form>

					<div className="mt-6 border-t border-[var(--line)] pt-4 text-center">
						<button
							type="button"
							onClick={() => {
								setIsRegister(!isRegister);
								setEmail("");
								setPassword("");
								setConfirmPassword("");
							}}
							className="text-xs font-bold text-purple-400 hover:text-purple-300 hover:underline transition bg-transparent border-none cursor-pointer"
						>
							{isRegister 
								? "¿Ya tienes una cuenta? Inicia sesión" 
								: "¿No tienes una cuenta? Regístrate gratis"}
						</button>
					</div>
				</div>
			</div>
		</main>
	);
}
