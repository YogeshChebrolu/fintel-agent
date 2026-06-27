# Deployment

Three pieces, three homes:

| Piece              | Host    | How                                            |
| ------------------ | ------- | ---------------------------------------------- |
| `packages/convex`  | Convex  | `convex deploy` (run by the Vercel build)      |
| `apps/api` (Hono)  | Railway | Dockerfile at repo root (persistent, for SSE)  |
| `apps/web` (Next)  | Vercel  | Git-connected, `apps/web` as the root dir      |

> The API streams Server-Sent Events, so it needs a long-running server —
> that's why it's on Railway (a persistent container) and not serverless.

Config already committed: [`Dockerfile`](Dockerfile), [`.dockerignore`](.dockerignore),
[`railway.json`](railway.json), [`apps/web/vercel.json`](apps/web/vercel.json).

---

## Order of operations

Do these in order — each step produces a URL the next one needs.

### 1. Convex production deployment

You can let the Vercel build deploy Convex for you (step 3 does this via
`convex deploy --cmd`). You only need to grab a **deploy key** now:

1. Open the [Convex dashboard](https://dashboard.convex.dev) → your project →
   **Settings → URL & Deploy Key**.
2. Switch to the **Production** deployment, click **Generate Production Deploy Key**.
3. Copy it — this is `CONVEX_DEPLOY_KEY` (used by Vercel in step 3).
4. Copy the **Production** deployment URL (`https://<name>.convex.cloud`) — this
   is `CONVEX_URL` for Railway in step 2.

> First time only: if no production deployment exists yet, create it once locally:
> ```bash
> cd packages/convex
> bunx convex deploy        # pushes functions/schema to prod, prints the prod URL
> ```

### 2. API → Railway

1. [Railway](https://railway.app) → **New Project → Deploy from GitHub repo** →
   pick `YogeshChebrolu/fintel-agent`.
2. Railway auto-detects `railway.json` + the root `Dockerfile`. **Leave Root
   Directory empty** (the build context must be the whole monorepo so the
   `workspace:*` packages install).
3. **Variables** (Settings → Variables):
   | Key                  | Value                                              |
   | -------------------- | -------------------------------------------------- |
   | `CONVEX_URL`         | prod Convex URL from step 1                         |
   | `DEEPSEEK_API_KEY`   | your DeepSeek key                                  |
   | `WEB_ORIGIN`         | `https://localhost:3000` for now (fix in step 4)   |
   | `OPENROUTER_API_KEY` | *(optional — fallback provider)*                   |
   | `EXA_API_KEY`        | *(optional — web search)*                          |
   - **Do not set `PORT`** — Railway injects it and the server reads it.
4. **Settings → Networking → Generate Domain.** Copy the URL
   (`https://<svc>.up.railway.app`) — this is `NEXT_PUBLIC_API_URL` for step 3.
5. Health check is `/health` (already configured in `railway.json`).

### 3. Web → Vercel

1. [Vercel](https://vercel.com) → **Add New → Project** → import the repo.
2. **Root Directory: `apps/web`** (Edit → select `apps/web`). `vercel.json`
   there already sets the install/build commands (the build runs
   `convex deploy --cmd 'next build'`, which deploys Convex **and** injects
   `NEXT_PUBLIC_CONVEX_URL` into the build automatically).
3. **Environment Variables:**
   | Key                  | Value                                          |
   | -------------------- | ---------------------------------------------- |
   | `CONVEX_DEPLOY_KEY`  | prod deploy key from step 1                     |
   | `NEXT_PUBLIC_API_URL`| Railway URL from step 2                         |
   - `NEXT_PUBLIC_CONVEX_URL` is set automatically by `convex deploy` during the
     build — no need to add it by hand.
4. **Deploy.** Copy the resulting domain (`https://<app>.vercel.app`).

### 4. Close the CORS loop

Back in **Railway → Variables**, set `WEB_ORIGIN` to the Vercel domain
(comma-separated if you have several), then redeploy the API. Without this the
browser's calls to the API are blocked by CORS.

---

## Environment variable reference

**Railway (`apps/api`)** — `CONVEX_URL`, `DEEPSEEK_API_KEY`, `WEB_ORIGIN`,
optional `OPENROUTER_API_KEY`, `EXA_API_KEY`. (`PORT` is injected.)

**Vercel (`apps/web`)** — `CONVEX_DEPLOY_KEY`, `NEXT_PUBLIC_API_URL`.
(`NEXT_PUBLIC_CONVEX_URL` injected by the build.)

**Convex** — secrets the backend itself needs (e.g. `RESEND_API_KEY` for auth
emails) go in the Convex dashboard, not Railway/Vercel.

---

## Notes & gotchas

- **The API needs no Convex codegen.** `/api/messages` calls the deployed query
  by reference (`makeFunctionReference("messages:list")`), so the Docker image
  ships without generated code and the route works against the live deployment
  given a valid `CONVEX_URL`. The only cost is that call being untyped.
- **The web build still regenerates Convex code** (it's gitignored), which is why
  Vercel goes through `convex deploy --cmd 'next build'` rather than a bare
  `next build` — the web app uses the generated `api` for end-to-end types.
- **SSE idle timeout**: Bun is capped at `idleTimeout: 255` (in
  `apps/api/src/index.ts`). Railway's proxy allows long-lived streams, so this
  is the binding limit — fine for chat responses.
