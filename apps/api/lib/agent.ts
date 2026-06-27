import { Agent } from "@fintel/agent";

// -----------------------------------------------------------------------------
// Agent client (singleton)
//
// Per-project convention: clients live in a `lib/` folder. This constructs the
// one Agent instance the Hono routes share. It reads OPENROUTER_API_KEY from
// apps/api/.env via the default in the package's OpenRouter client.
//
// Construction is lazy so the server still boots when the key is missing — the
// error only surfaces when a request actually hits the agent endpoint.
// -----------------------------------------------------------------------------

let instance: Agent | null = null;

export function getAgent(): Agent {
  if (!instance) {
    instance = new Agent();
  }
  return instance;
}
