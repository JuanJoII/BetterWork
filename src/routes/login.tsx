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
		const trimmedEmail = email.trim();
		const trimmedPassword = password.trim();

		// 1. Check for empty fields
		if (!trimmedEmail || !trimmedPassword) {
			sileo.error({
				title: "Campos vacíos",
				description: "Por favor, ingresa tu correo y contraseña.",
				fill: "#260f1c",
				styles: {
					title: "text-red-200 font-extrabold",
					description: "text-red-300/80 text-xs font-semibold mt-0.5",
				},
			});
			return;
		}

		// 2. Email format validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(trimmedEmail)) {
			sileo.error({
				title: "Correo inválido",
				description: "Por favor, introduce una dirección de correo válida (ejemplo@correo.com).",
				fill: "#260f1c",
				styles: {
					title: "text-red-200 font-extrabold",
					description: "text-red-300/80 text-xs font-semibold mt-0.5",
				},
			});
			return;
		}

		// 3. Password length validation
		if (trimmedPassword.length < 8) {
			sileo.error({
				title: "Contraseña muy corta",
				description: "La contraseña debe tener al menos 8 caracteres.",
				fill: "#260f1c",
				styles: {
					title: "text-red-200 font-extrabold",
					description: "text-red-300/80 text-xs font-semibold mt-0.5",
				},
			});
			return;
		}

		// 4. Password complexity validation (must contain at least one letter and one number)
		const hasLetter = /[a-zA-Z]/.test(trimmedPassword);
		const hasNumber = /[0-9]/.test(trimmedPassword);
		if (!hasLetter || !hasNumber) {
			sileo.error({
				title: "Contraseña insegura",
				description: "La contraseña debe incluir al menos una letra y un número.",
				fill: "#260f1c",
				styles: {
					title: "text-red-200 font-extrabold",
					description: "text-red-300/80 text-xs font-semibold mt-0.5",
				},
			});
			return;
		}

		// 5. Confirm password matching (only for register)
		if (isRegister && trimmedPassword !== confirmPassword.trim()) {
			sileo.error({
				title: "Contraseñas no coinciden",
				description: "La confirmación de la contraseña debe ser idéntica.",
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
				email: trimmedEmail,
				password: trimmedPassword,
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
		<main className="min-h-[85vh] flex items-center justify-center px-4 py-16 relative">
			{/* Decorative glows to match the design system */}
			<div className="pointer-events-none absolute -right-32 top-1/2 -translate-y-1/2 h-[35rem] w-[35rem] rounded-full bg-[radial-gradient(circle,rgba(250,204,21,0.04),transparent_70%)]" />
			<div className="pointer-events-none absolute -left-32 top-1/2 -translate-y-1/2 h-[35rem] w-[35rem] rounded-full bg-[radial-gradient(circle,rgba(192,132,252,0.06),transparent_70%)]" />

			<div className="w-full max-w-[32rem] relative z-10">
				{/* Refactored Auth Card containing the titles inside */}
				<div className="auth-glow-card rounded-[2.25rem] p-8 dot-grid sm:p-10">
					{/* Top Branding Section INSIDE the container */}
					<div className="text-center mb-8">
						<div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-4 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
							<ShieldCheck className="h-7 w-7 text-purple-300" />
						</div>
						<h1 className="text-3xl font-black tracking-tight text-white font-serif mb-2">
							{isRegister ? "Crear una Cuenta" : "Iniciar Sesión"}
						</h1>
						<p className="text-xs text-[var(--sea-ink-soft)] font-medium max-w-sm mx-auto">
							{isRegister 
								? "Regístrate en BetterWork para gestionar tus tareas y automatizar tus rituales de productividad." 
								: "Ingresa tus credenciales para acceder a tus tableros y cronómetro de concentración."}
						</p>
					</div>

					{/* Custom Tabs */}
					<div className="auth-tabs">
						<button
							type="button"
							onClick={() => {
								setIsRegister(false);
								setEmail("");
								setPassword("");
								setConfirmPassword("");
							}}
							className={`auth-tab-btn ${!isRegister ? "is-active" : ""}`}
						>
							Iniciar Sesión
						</button>
						<button
							type="button"
							onClick={() => {
								setIsRegister(true);
								setEmail("");
								setPassword("");
								setConfirmPassword("");
							}}
							className={`auth-tab-btn ${isRegister ? "is-active" : ""}`}
						>
							Registrarse
						</button>
					</div>

					<form onSubmit={handleSubmit} className="space-y-5">
						<div>
							<label className="block text-[10px] font-black uppercase tracking-widest text-[var(--sea-ink-soft)] mb-2 pl-1 font-sans">
								Correo Electrónico
							</label>
							<div className="auth-input-container">
								<input
									type="email"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="tu@correo.com"
									className="auth-input"
								/>
								<Mail className="auth-input-icon h-4 w-4" />
							</div>
						</div>

						<div>
							<label className="block text-[10px] font-black uppercase tracking-widest text-[var(--sea-ink-soft)] mb-2 pl-1 font-sans">
								Contraseña
							</label>
							<div className="auth-input-container">
								<input
									type="password"
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="••••••••"
									className="auth-input"
								/>
								<Lock className="auth-input-icon h-4 w-4" />
							</div>
						</div>

						{isRegister && (
							<div>
								<label className="block text-[10px] font-black uppercase tracking-widest text-[var(--sea-ink-soft)] mb-2 pl-1 font-sans">
									Confirmar Contraseña
								</label>
								<div className="auth-input-container">
									<input
										type="password"
										required
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										placeholder="••••••••"
										className="auth-input"
									/>
									<Lock className="auth-input-icon h-4 w-4" />
								</div>
							</div>
						)}

						<div className="pt-2">
							<button
								type="submit"
								disabled={pending}
								className="auth-submit-btn"
							>
								{pending ? (
									<div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
								) : isRegister ? (
									<>
										<UserPlus className="h-4.5 w-4.5" />
										<span>Crear Cuenta</span>
									</>
								) : (
									<>
										<LogIn className="h-4.5 w-4.5" />
										<span>Entrar al Sistema</span>
									</>
								)}
							</button>
						</div>
					</form>
				</div>
			</div>
		</main>
	);
}
