import { Hono } from "hono";
import { makeFunctionReference } from "convex/server";
import { getConvex } from "../../lib/convex";

// Reference the deployed query by its path ("<file>:<export>") instead of the
// generated `api` object. <"query"> is the function type; args/return stay `any`.
const listMessages = makeFunctionReference<"query">("messages:list");

// -----------------------------------------------------------------------------
// Public REST read of Convex data — the kind of non-reactive surface (public
// API, webhook responder) where routing through Hono makes sense. Browser
// clients should read this from Convex directly instead, to keep reactivity.
//
// We invoke the already-deployed function by reference, so the API needs neither
// the generated `_generated/api` code nor a build-time `convex codegen` step —
// the HTTP client just sends the function path to the live deployment.
// Trade-off: the call is untyped (return is `any`), which is fine for a thin REST
// passthrough. Swap in the generated `api` if you want end-to-end types here.
//
// Mounted at "/api/messages".
// -----------------------------------------------------------------------------
export const messages = new Hono();

messages.get("/", async (c) => {
  const convex = getConvex();
  if (!convex) {
    return c.json({ error: "CONVEX_URL is not set in apps/api/.env" }, 500);
  }
  const list = await convex.query(listMessages, {});
  return c.json({ messages: list });
});
