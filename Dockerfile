# syntax=docker/dockerfile:1

# ---------- Stage 1: Build ----------
FROM oven/bun:1-alpine AS builder
WORKDIR /app

ARG VITE_CONVEX_URL
ARG VITE_CONVEX_SITE_URL
ENV VITE_CONVEX_URL=$VITE_CONVEX_URL
ENV VITE_CONVEX_SITE_URL=$VITE_CONVEX_SITE_URL

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# ---------- Stage 2: Runtime ----------
FROM oven/bun:1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000

ARG VITE_CONVEX_URL
ARG VITE_CONVEX_SITE_URL
ENV VITE_CONVEX_URL=$VITE_CONVEX_URL
ENV VITE_CONVEX_SITE_URL=$VITE_CONVEX_SITE_URL

RUN addgroup -g 1001 -S nodejs && adduser -S nitro -u 1001 -G nodejs

COPY --from=builder --chown=nitro:nodejs /app/.output ./.output

USER nitro

EXPOSE 3000

CMD ["bun", "run", ".output/server/index.mjs"]