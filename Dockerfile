# syntax=docker/dockerfile:1
# -----------------------------------------------------------------------------
# Dockerfile for apps/api (Hono on Bun) — used by Render / Railway.
#
# The API depends on the @fintel/agent workspace package, so the build context
# is the WHOLE monorepo and the install happens at the root. We install in the
# final image (not a separate deps stage) so Bun's workspace node_modules — its
# hoisted root deps, per-package folders, and @fintel/* symlinks — are all built
# in place and complete at runtime. Host node_modules is excluded by
# .dockerignore, so this is a clean install.
# -----------------------------------------------------------------------------
FROM oven/bun:1.3.4-alpine
WORKDIR /app

COPY . .
RUN bun install --frozen-lockfile

# Set after install so devDependencies aren't skipped during the build.
ENV NODE_ENV=production

# No `convex codegen` needed: the /api/messages route calls Convex by reference,
# so the API runs against the live deployment without generated code.

# Render/Railway inject PORT; the server reads process.env.PORT (defaults to 8787).
EXPOSE 8787
CMD ["bun", "apps/api/src/index.ts"]
