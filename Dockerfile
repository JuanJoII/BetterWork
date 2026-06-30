# syntax=docker/dockerfile:1

# ---------- Stage 1: Build ----------
FROM oven/bun:1-alpine AS builder
WORKDIR /app

# Build-time variables for Vite / Convex (horneadas en el bundle del cliente)
ARG VITE_CONVEX_URL
ARG VITE_CONVEX_SITE_URL
ENV VITE_CONVEX_URL=$VITE_CONVEX_URL
ENV VITE_CONVEX_SITE_URL=$VITE_CONVEX_SITE_URL

# Instala dependencias primero (cache layer)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copia el resto del código y compila
COPY . .
RUN bun run build

# ---------- Stage 2: Runtime ----------
FROM node:20-alpine AS runner
WORKDIR /app

# Variables de entorno del runtime
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Si tu server (loaders/server functions) también necesita estas variables
ARG VITE_CONVEX_URL
ARG VITE_CONVEX_SITE_URL
ENV VITE_CONVEX_URL=$VITE_CONVEX_URL
ENV VITE_CONVEX_SITE_URL=$VITE_CONVEX_SITE_URL

# Usuario no privilegiado
RUN addgroup -g 1001 -S nodejs && adduser -S nitro -u 1001

# Copia solo el output compilado de Nitro
COPY --from=builder --chown=nitro:nodejs /app/.output ./.output

USER nitro

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["node", ".output/server/index.mjs"]