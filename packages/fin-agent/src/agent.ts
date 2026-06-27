import {
  generateText,
  streamText,
  type LanguageModel,
  type ModelMessage,
  type StreamTextResult,
  type ToolSet,
} from "ai";
// OpenRouter — kept for reference; swap back by uncommenting and using
// `createOpenRouterClient` below instead of the DeepSeek client.
// import { createOpenRouterClient, DEFAULT_MODEL } from "../lib/openrouter";
import { createDeepSeekClient, DEFAULT_MODEL } from "../lib/deepseek";

// -----------------------------------------------------------------------------
// Agent — a thin, boilerplate wrapper around the Vercel AI SDK.
//
// This is the seam where the "agent" lives: system prompt, model choice, tools,
// and the generate/stream methods. The transport (HTTP/SSE) is deliberately
// kept OUT of here — apps/api owns that. Keeping the agent transport-agnostic
// means it can run from a Hono route, a Convex action, a script, or a test.
// -----------------------------------------------------------------------------

export type ChatMessage = ModelMessage;

export interface AgentConfig {
  /** DeepSeek API key. Defaults to `DEEPSEEK_API_KEY` from the env. */
  apiKey?: string;
  /** Model id. Defaults to `deepseek-chat`. */
  model?: string;
  /** System prompt that defines the agent's persona and rules. */
  system?: string;
  /** Sampling temperature (0–2). */
  temperature?: number;
  /** Tools the model may call. Empty by default — add your own. */
  tools?: ToolSet;
}

const DEFAULT_SYSTEM =
  "You are Fin, a concise and helpful financial assistant. " +
  "Explain clearly, show your reasoning briefly, and never give individualized " +
  "investment advice — add a short disclaimer when discussing markets.";

export class Agent {
  private readonly model: LanguageModel;
  private readonly system: string;
  private readonly temperature: number;
  private readonly tools: ToolSet;

  constructor(config: AgentConfig = {}) {
    // OpenRouter (commented out — see import above):
    // const openrouter = createOpenRouterClient(config.apiKey);
    // this.model = openrouter.chat(config.model ?? DEFAULT_MODEL);
    const deepseek = createDeepSeekClient(config.apiKey);
    this.model = deepseek.chat(config.model ?? DEFAULT_MODEL);
    this.system = config.system ?? DEFAULT_SYSTEM;
    this.temperature = config.temperature ?? 0.7;
    this.tools = config.tools ?? {};
  }

  /**
   * Stream a response token-by-token. Returns the AI SDK stream result; the
   * caller decides how to deliver it (e.g. `result.textStream` over SSE).
   */
  stream(messages: ChatMessage[]): StreamTextResult<ToolSet, never> {
    return streamText({
      model: this.model,
      system: this.system,
      temperature: this.temperature,
      tools: this.tools,
      messages,
    });
  }

  /** Convenience for a one-shot, non-streaming completion. */
  async generate(messages: ChatMessage[]): Promise<string> {
    const { text } = await generateText({
      model: this.model,
      system: this.system,
      temperature: this.temperature,
      tools: this.tools,
      messages,
    });
    return text;
  }

  /** Shorthand: stream a reply to a single user prompt. */
  ask(prompt: string): StreamTextResult<ToolSet, never> {
    return this.stream([{ role: "user", content: prompt }]);
  }
}
