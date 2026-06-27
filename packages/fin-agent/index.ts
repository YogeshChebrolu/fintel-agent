// Public entrypoint for the @fintel/agent package.
//
// The Agent class is transport-agnostic AI logic powered by the Vercel AI SDK
// over OpenRouter. Apps consume it directly (server-side) and expose it however
// they like — apps/api streams it to the browser over SSE.
export { Agent, type AgentConfig, type ChatMessage } from "./src/agent";
// Active provider: DeepSeek (deepseek-chat).
export { createDeepSeekClient, DEFAULT_MODEL } from "./lib/deepseek";
// OpenRouter client stays available if you want to switch back.
export { createOpenRouterClient } from "./lib/openrouter";
