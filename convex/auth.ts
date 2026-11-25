import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import type { GenericMutationCtx } from "convex/server";
import type { DataModel, Doc, Id } from "./_generated/dataModel";

async function findUniqueUserByEmail(
	ctx: GenericMutationCtx<DataModel>,
	email: string,
): Promise<Doc<"users"> | null> {
	const trimmed = email.trim();
	if (!trimmed) return null;

	const exactMatches = await ctx.db
		.query("users")
		.withIndex("email", (q) => q.eq("email", trimmed))
		.take(2);
	if (exactMatches.length === 1) return exactMatches[0];
	if (exactMatches.length > 1) return null;

	const lower = trimmed.toLowerCase();
	if (lower !== trimmed) {
		const lowerMatches = await ctx.db
			.query("users")
			.withIndex("email", (q) => q.eq("email", lower))
			.take(2);
		if (lowerMatches.length === 1) return lowerMatches[0];
	}

	return null;
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	providers: [
		Password,
		Google({
			profile(googleProfile) {
				const email =
					typeof googleProfile.email === "string"
						? googleProfile.email.trim().toLowerCase()
						: undefined;
				return {
					id: googleProfile.sub,
					name: googleProfile.name,
					email,
					image: googleProfile.picture,
					emailVerified: googleProfile.email_verified === true,
				};
			},
		}),
	],
	callbacks: {
		async createOrUpdateUser(ctx, args) {
			const typedCtx = ctx as unknown as GenericMutationCtx<DataModel>;
			const {
				emailVerified: profileEmailVerified,
				phoneVerified: profilePhoneVerified,
				...rawProfile
			} = args.profile;

			const email =
				typeof rawProfile.email === "string"
					? rawProfile.email.trim()
					: undefined;
			const name =
				typeof rawProfile.name === "string" ? rawProfile.name : undefined;
			const image =
				typeof rawProfile.image === "string" ? rawProfile.image : undefined;
			const phone =
				typeof rawProfile.phone === "string" ? rawProfile.phone : undefined;

			// 1. Existing linked account: refresh profile metadata safely
			if (args.existingUserId !== null) {
				const existingUserId = args.existingUserId as Id<"users">;
				const existing = await typedCtx.db.get(existingUserId);
				if (existing) {
					const patch: Partial<Doc<"users">> = {};
					if (name && existing.name !== name) patch.name = name;
					if (image && existing.image !== image) patch.image = image;
					if (email && !existing.email) patch.email = email;
					if (
						profileEmailVerified === true &&
						existing.emailVerificationTime === undefined
					) {
						patch.emailVerificationTime = Date.now();
					}
					if (Object.keys(patch).length > 0) {
						await typedCtx.db.patch(existingUserId, patch);
					}
					return existingUserId;
				}
			}

			// 2. OAuth sign-in with verified email: link to existing user with the same email
			if (
				args.type === "oauth" &&
				profileEmailVerified === true &&
				email !== undefined
			) {
				const existingUser = await findUniqueUserByEmail(typedCtx, email);
				if (existingUser) {
					const patch: Partial<Doc<"users">> = {};
					if (existingUser.emailVerificationTime === undefined) {
						patch.emailVerificationTime = Date.now();
					}
					if (name && !existingUser.name) patch.name = name;
					if (image && !existingUser.image) patch.image = image;
					if (Object.keys(patch).length > 0) {
						await typedCtx.db.patch(existingUser._id, patch);
					}
					return existingUser._id;
				}
			}

			// 3. Credentials sign-up: prevent overwriting/duplicating an existing account by email
			if (args.type === "credentials" && email !== undefined) {
				const existingUser = await findUniqueUserByEmail(typedCtx, email);
				if (existingUser) {
					throw new Error(
						"Ya existe una cuenta registrada con este correo. Inicia sesión con Google o usa tu contraseña existente.",
					);
				}
			}

			// 4. Brand-new user
			return await typedCtx.db.insert("users", {
				...(name !== undefined ? { name } : {}),
				...(image !== undefined ? { image } : {}),
				...(email !== undefined ? { email } : {}),
				...(phone !== undefined ? { phone } : {}),
				...(profileEmailVerified === true
					? { emailVerificationTime: Date.now() }
					: {}),
				...(profilePhoneVerified === true
					? { phoneVerificationTime: Date.now() }
					: {}),
			});
		},
	},
});
