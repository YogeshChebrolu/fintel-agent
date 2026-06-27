import {
  createDeepSeek,
  type DeepSeekProvider,
} from "@ai-sdk/deepseek";

// -----------------------------------------------------------------------------
// DeepSeek client factory
//
// DeepSeek (https://www.deepseek.com) serves its own models via an
// OpenAI-compatible API. The provider plugs straight into the Vercel AI SDK.
//
// Per-project convention: clients live in a `lib/` folder. This is the shared
// LLM client for the agent package.
// -----------------------------------------------------------------------------

/** DeepSeek's general-purpose chat model. */
export const DEFAULT_MODEL = "deepseek-chat";

let cached: DeepSeekProvider | null = null;

/**
 * Create (or reuse) a DeepSeek provider instance.
 *
 * Reads `DEEPSEEK_API_KEY` from the environment by default. Pass an explicit
 * key to override (e.g. per-request keys, tests).
 */
export function createDeepSeekClient(
  apiKey: string | undefined = process.env.DEEPSEEK_API_KEY,
): DeepSeekProvider {
  if (!apiKey) {
    throw new Error(
      "DEEPSEEK_API_KEY is not set. Add it to apps/api/.env (get a key at https://platform.deepseek.com/api_keys).",
    );
  }
  // Cache the default-keyed client; build a fresh one for custom keys.
  if (apiKey === process.env.DEEPSEEK_API_KEY && cached) {
    return cached;
  }
  const client = createDeepSeek({ apiKey });
  if (apiKey === process.env.DEEPSEEK_API_KEY) {
    cached = client;
  }
  return client;
}
