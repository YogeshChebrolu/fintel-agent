import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { streamText } from "hono/streaming";
import { ConvexHttpClient } from "convex/browser";

// -----------------------------------------------------------------------------
// fintel-agent — Hono API (runs on Bun)
//
// Division of labour in this stack:
//   • Convex  owns data, reactive queries, mutations, and auth.
//   • Hono    owns things Convex isn't the right tool for: streaming AI
//             responses, third-party webhooks, and public REST endpoints.
//
// Hono is NOT a pass-through for data the browser can read from Convex directly
// (that would just add a hop and kill reactivity). When Hono does need data, it
// talks to Convex server-to-server via ConvexHttpClient.
// -----------------------------------------------------------------------------

const app = new Hono();

const allowedOrigins = (process.env.WEB_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use("*", logger());
app.use("*", cors({ origin: allowedOrigins, credentials: true }));

// Server-to-server Convex client (only created if a URL is configured).
const convexUrl = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

app.get("/", (c) =>
  c.json({
    name: "fintel-agent api",
    runtime: "hono + bun",
    status: "ok",
    endpoints: ["/health", "/api/messages", "/api/stream"],
  }),
);

app.get("/health", (c) =>
  c.json({ status: "healthy", time: new Date().toISOString() }),
);

// Example REST endpoint that reads from Convex server-side (e.g. for a public
// API consumed by non-Convex clients, or a webhook responder).
app.get("/api/messages", async (c) => {
  if (!convex) {
    return c.json({ error: "CONVEX_URL is not set in apps/api/.env" }, 500);
  }
  // Imported lazily so the server still boots before `convex codegen` has run
  // (the generated `api` object doesn't exist until then).
  const { api } = await import("@fintel/backend");
  const messages = await convex.query(api.messages.list, {});
  return c.json({ messages });
});

// Example streaming endpoint — the kind of work Hono is best at. Swap the fake
// token loop for a real LLM stream (e.g. the Anthropic SDK) when you build the
// agent. The browser reads this with a normal `fetch()` + ReadableStream.
app.get("/api/stream", (c) => {
  return streamText(c, async (stream) => {
    const tokens =
      "Streaming from the Hono + Bun service. This is where the AI agent's token stream would flow.".split(
        " ",
      );
    for (const token of tokens) {
      await stream.write(token + " ");
      await stream.sleep(60);
    }
  });
});

const port = Number(process.env.PORT ?? 8787);
console.log(`🔥 Hono API listening on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
