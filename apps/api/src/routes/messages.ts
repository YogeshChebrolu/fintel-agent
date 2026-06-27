import { Hono } from "hono";
import { getConvex } from "../../lib/convex";

// -----------------------------------------------------------------------------
// Public REST read of Convex data — the kind of non-reactive surface (public
// API, webhook responder) where routing through Hono makes sense. Browser
// clients should read this from Convex directly instead, to keep reactivity.
//
// Mounted at "/api/messages".
// -----------------------------------------------------------------------------
export const messages = new Hono();

messages.get("/", async (c) => {
  const convex = getConvex();
  if (!convex) {
    return c.json({ error: "CONVEX_URL is not set in apps/api/.env" }, 500);
  }
  // Imported lazily so the server still boots before `convex codegen` has run
  // (the generated `api` object doesn't exist until then).
  const { api } = await import("@fintel/backend");
  const list = await convex.query(api.messages.list, {});
  return c.json({ messages: list });
});
