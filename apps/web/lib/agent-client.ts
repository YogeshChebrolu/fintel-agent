// -----------------------------------------------------------------------------
// Agent client — browser-side consumer of the Hono SSE endpoint.
//
// Per-project convention: clients live in a `lib/` folder. This one speaks to
// POST /api/agent/chat and parses the Server-Sent Events stream.
//
// Why not native EventSource? `EventSource` only does GET and can't send a JSON
// body, so we use `fetch` + a manual SSE frame parser over the response stream.
// -----------------------------------------------------------------------------

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface StreamHandlers {
  onDelta?: (chunk: string) => void;
  onError?: (message: string) => void;
  onDone?: () => void;
  signal?: AbortSignal;
}

/** Parse one SSE frame ("event: x\ndata: y\ndata: z") into {event, data}. */
function parseFrame(frame: string): { event: string; data: string } {
  let event = "message";
  const dataLines: string[] = [];
  for (const line of frame.split("\n")) {
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      // Spec: strip a single leading space after the colon.
      dataLines.push(line.slice(5).replace(/^ /, ""));
    }
  }
  return { event, data: dataLines.join("\n") };
}

/**
 * Stream a chat completion from the agent, invoking handlers as events arrive.
 * Resolves when the stream completes (or is aborted).
 */
export async function streamAgentChat(
  messages: ChatMessage[],
  handlers: StreamHandlers = {},
): Promise<void> {
  const response = await fetch(`${API_URL}/api/agent/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
    signal: handlers.signal,
  });

  if (!response.ok || !response.body) {
    const message = `Agent request failed (${response.status})`;
    handlers.onError?.(message);
    throw new Error(message);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE frames are separated by a blank line. Keep the trailing partial.
      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";

      for (const raw of frames) {
        if (!raw.trim()) continue;
        const { event, data } = parseFrame(raw);
        if (event === "delta") handlers.onDelta?.(data);
        else if (event === "error") handlers.onError?.(data);
        else if (event === "done") handlers.onDone?.();
      }
    }
  } finally {
    reader.releaseLock();
  }
}
