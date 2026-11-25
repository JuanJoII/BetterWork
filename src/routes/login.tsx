import { useAuthActions } from "@convex-dev/auth/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import { Lock, LogIn, Mail, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { sileo } from "sileo";
import GradientText from "../components/GradientText";
import { useResolvedTheme } from "../utils/theme";
import { getErrorToastTheme, getSuccessToastTheme } from "../utils/toast";

export const Route = createFileRoute("/login")({
	component: LoginPage,
});

function LoginPage() {
	const { isLoading, isAuthenticated } = useConvexAuth();
	const { signIn } = useAuthActions();
	const navigate = useNavigate();
	const resolvedTheme = useResolvedTheme();

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
			<div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)]">
				<div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500/25 border-t-amber-500 dark:border-yellow-500/20 dark:border-t-yellow-400" />
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
				...getErrorToastTheme(),
			});
			return;
		}

		// 2. Email format validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(trimmedEmail)) {
			sileo.error({
				title: "Correo inválido",
				description:
					"Por favor, introduce una dirección de correo válida (ejemplo@correo.com).",
				...getErrorToastTheme(),
			});
			return;
		}

		// 3. Password length validation
		if (trimmedPassword.length < 8) {
			sileo.error({
				title: "Contraseña muy corta",
				description: "La contraseña debe tener al menos 8 caracteres.",
				...getErrorToastTheme(),
			});
			return;
		}

		// 4. Password complexity validation (must contain at least one letter and one number)
		const hasLetter = /[a-zA-Z]/.test(trimmedPassword);
		const hasNumber = /[0-9]/.test(trimmedPassword);
		if (!hasLetter || !hasNumber) {
			sileo.error({
				title: "Contraseña insegura",
				description:
					"La contraseña debe incluir al menos una letra y un número.",
				...getErrorToastTheme(),
			});
			return;
		}

		// 5. Confirm password matching (only for register)
		if (isRegister && trimmedPassword !== confirmPassword.trim()) {
			sileo.error({
				title: "Contraseñas no coinciden",
				description: "La confirmación de la contraseña debe ser idéntica.",
				...getErrorToastTheme(),
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
				...getSuccessToastTheme(),
			});
		} catch (err: unknown) {
			console.error(err);
			const message =
				err instanceof Error
					? err.message
					: "Credenciales incorrectas o error en el servidor.";
			sileo.error({
				title: isRegister ? "Error al registrarse" : "Error al iniciar sesión",
				description: message,
				...getErrorToastTheme(),
			});
		} finally {
			setPending(false);
		}
	};

	const headingColors =
		resolvedTheme === "light"
			? ["#7c3aed", "#c026d3", "#d97706"]
			: ["#5227FF", "#FF9FFC", "#B497CF"];

	return (
		<main className="min-h-[85vh] flex items-center justify-center px-4 py-16 relative">
			{/* Decorative glows to match the design system */}
			<div className="pointer-events-none absolute -right-32 top-1/2 -translate-y-1/2 h-[35rem] w-[35rem] rounded-full bg-[radial-gradient(circle,rgba(234,179,8,0.12),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(250,204,21,0.04),transparent_70%)]" />
			<div className="pointer-events-none absolute -left-32 top-1/2 -translate-y-1/2 h-[35rem] w-[35rem] rounded-full bg-[radial-gradient(circle,rgba(147,51,234,0.1),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(192,132,252,0.06),transparent_70%)]" />

			<div className="w-full max-w-[32rem] relative z-10">
				{/* Refactored Auth Card containing the titles inside */}
				<div className="auth-glow-card rounded-[2.25rem] p-8 dot-grid sm:p-10">
					{/* Top Branding Section INSIDE the container */}
					<div className="text-center mb-12">
						<GradientText
							colors={headingColors}
							animationSpeed={8}
							showBorder={false}
							className="text-4xl sm:text-5xl font-black tracking-tight leading-tight pb-1"
						>
							<h1 className="font-serif font-black">
								{isRegister ? "¡Crea tu cuenta!" : "¡Bienvenido de nuevo!"}
							</h1>
						</GradientText>
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
							<label
								htmlFor="login-email"
								className="block text-[10px] font-black uppercase tracking-widest text-[var(--sea-ink-soft)] mb-2 pl-1 font-sans"
							>
								Correo Electrónico
							</label>
							<div className="auth-input-container">
								<input
									id="login-email"
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
							<label
								htmlFor="login-password"
								className="block text-[10px] font-black uppercase tracking-widest text-[var(--sea-ink-soft)] mb-2 pl-1 font-sans"
							>
								Contraseña
							</label>
							<div className="auth-input-container">
								<input
									id="login-password"
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
								<label
									htmlFor="login-confirm-password"
									className="block text-[10px] font-black uppercase tracking-widest text-[var(--sea-ink-soft)] mb-2 pl-1 font-sans"
								>
									Confirmar Contraseña
								</label>
								<div className="auth-input-container">
									<input
										id="login-confirm-password"
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
										<span>Iniciar Sesión</span>
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
