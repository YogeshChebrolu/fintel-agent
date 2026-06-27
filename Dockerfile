# syntax=docker/dockerfile:1
# -----------------------------------------------------------------------------
# Dockerfile for apps/api (Hono on Bun) — used by Railway.
#
# The API depends on the @fintel/agent workspace package that lives at the repo
# root, so the build context is the WHOLE monorepo and the install happens at the
# root. We only run the api at the end.
# -----------------------------------------------------------------------------
FROM oven/bun:1.3.4-alpine AS deps
WORKDIR /app

# Copy only manifests first so `bun install` is cached across source changes.
COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/convex/package.json packages/convex/package.json
COPY packages/fin-agent/package.json packages/fin-agent/package.json
RUN bun install --frozen-lockfile

# -----------------------------------------------------------------------------
FROM oven/bun:1.3.4-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# node_modules (with workspace symlinks) from the deps stage + full source.
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# No `convex codegen` needed: the /api/messages route calls Convex by reference
# via `anyApi`, so the API runs against the live deployment without generated code.

# Railway injects PORT; the server reads process.env.PORT (defaults to 8787).
EXPOSE 8787
CMD ["bun", "apps/api/src/index.ts"]
