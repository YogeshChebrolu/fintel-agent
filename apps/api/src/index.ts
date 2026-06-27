import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { meta } from "./routes/meta";
import { agent } from "./routes/agent";
import { messages } from "./routes/messages";
import { stream } from "./routes/stream";

// -----------------------------------------------------------------------------
// fintel-agent — Hono API (runs on Bun)
//
// Division of labour in this stack:
//   • Convex  owns data, reactive queries, mutations, and auth.
//   • Hono    owns things Convex isn't the right tool for: streaming AI
//             responses, third-party webhooks, and public REST endpoints.
//
// This file stays thin on purpose: middleware + route mounting only. Each route
// group lives in ./routes/*, and the clients they use live in ../lib/*.
// -----------------------------------------------------------------------------

const app = new Hono();

// --- Middleware --------------------------------------------------------------
const allowedOrigins = (process.env.WEB_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use("*", logger());
app.use("*", cors({ origin: allowedOrigins, credentials: true }));

// --- Routes (mounted in order of importance) ---------------------------------
app.route("/", meta); //            GET  /  ·  GET /health
app.route("/api/agent", agent); //  POST /api/agent/chat   (the Fin agent)
app.route("/api/messages", messages); // GET /api/messages (Convex read)
app.route("/api/stream", stream); // GET  /api/stream       (demo stream)

// --- Server ------------------------------------------------------------------
const port = Number(process.env.PORT ?? 8787);
console.log(`🔥 Hono API listening on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
  // Streaming responses (SSE) can sit idle while the model queues/thinks; the
  // default 10s would kill them. 255s is Bun's max.
  idleTimeout: 255,
};
