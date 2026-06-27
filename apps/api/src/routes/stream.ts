import { Hono } from "hono";
import { streamText } from "hono/streaming";

// -----------------------------------------------------------------------------
// Demo stream — a fake token loop, kept as the simplest possible example of Hono
// streaming. The real LLM stream lives in routes/agent.ts.
//
// Mounted at "/api/stream".
// -----------------------------------------------------------------------------
export const stream = new Hono();

stream.get("/", (c) =>
  streamText(c, async (s) => {
    const tokens =
      "Streaming from the Hono + Bun service. This is where the AI agent's token stream would flow.".split(
        " ",
      );
    for (const token of tokens) {
      await s.write(token + " ");
      await s.sleep(60);
    }
  }),
);
