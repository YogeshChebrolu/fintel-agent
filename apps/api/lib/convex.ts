import { ConvexHttpClient } from "convex/browser";

// -----------------------------------------------------------------------------
// Convex client (singleton)
//
// Per-project convention: clients live in a `lib/` folder. This is the
// server-to-server Convex client the Hono routes use when they need data Convex
// owns (the browser talks to Convex directly for reactive reads — Hono only
// reaches for this on non-Convex surfaces like webhooks or public REST).
//
// Returns null when no deployment URL is configured, so the server still boots.
// -----------------------------------------------------------------------------

let instance: ConvexHttpClient | null = null;

export function getConvex(): ConvexHttpClient | null {
  if (instance) return instance;
  const url = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return null;
  instance = new ConvexHttpClient(url);
  return instance;
}
