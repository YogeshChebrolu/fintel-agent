"use client";

import { useRef, useState } from "react";
import { Bot, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { streamAgentChat, type ChatMessage } from "@/lib/agent-client";

export function AgentChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const prompt = input.trim();
    if (!prompt || streaming) return;

    const next: ChatMessage[] = [...messages, { role: "user", content: prompt }];
    // Add the user message + an empty assistant slot we'll stream into.
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    const appendToAssistant = (chunk: string) =>
      setMessages((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last?.role === "assistant") {
          copy[copy.length - 1] = { ...last, content: last.content + chunk };
        }
        return copy;
      });

    try {
      await streamAgentChat(next, {
        signal: controller.signal,
        onDelta: appendToAssistant,
        onError: (msg) => appendToAssistant(`\n\n⚠️ ${msg}`),
      });
    } catch {
      // Network-level failure already surfaced via onError where possible.
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="size-5" /> Fin agent
        </CardTitle>
        <CardDescription>
          Streamed token-by-token over SSE from the Hono API · OpenRouter ·
          llama-3.2-3b-instruct (free)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="bg-muted/40 flex max-h-96 min-h-32 flex-col gap-3 overflow-y-auto rounded-md border p-3 text-sm">
          {messages.length === 0 ? (
            <span className="text-muted-foreground">
              Ask the agent anything to start streaming.
            </span>
          ) : (
            messages.map((m, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-muted-foreground mt-0.5 shrink-0">
                  {m.role === "user" ? (
                    <User className="size-4" />
                  ) : (
                    <Bot className="size-4" />
                  )}
                </span>
                <p className="whitespace-pre-wrap break-words">
                  {m.content || (
                    <span className="text-muted-foreground">…</span>
                  )}
                </p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={send} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Fin about markets, budgeting, concepts…"
            disabled={streaming}
          />
          <Button type="submit" disabled={streaming || !input.trim()}>
            <Send />
            {streaming ? "Streaming…" : "Send"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
