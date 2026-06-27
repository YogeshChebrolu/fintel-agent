import { Hono } from "hono";

// Service metadata + health. Mounted at the root ("/").
export const meta = new Hono();

meta.get("/", (c) =>
  c.json({
    name: "fintel-agent api",
    runtime: "hono + bun",
    status: "ok",
    endpoints: ["/health", "/api/agent/chat", "/api/messages", "/api/stream"],
  }),
);

meta.get("/health", (c) =>
  c.json({ status: "healthy", time: new Date().toISOString() }),
);
