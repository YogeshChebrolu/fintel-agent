"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";

export function StreamDemo() {
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);

  async function run() {
    setOutput("");
    setRunning(true);
    try {
      const response = await fetch(`${API_URL}/api/stream`);
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          setOutput((prev) => prev + decoder.decode(value));
        }
      }
    } catch {
      setOutput("⚠️ Could not reach the Hono streaming endpoint.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Streaming via Hono</CardTitle>
        <CardDescription>
          Reads a token stream from the Bun service — where real LLM streaming
          would live.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="bg-muted/40 min-h-24 rounded-md border p-3 font-mono text-sm">
          {output || (
            <span className="text-muted-foreground">
              Press run to stream from the API.
            </span>
          )}
        </div>
        <Button onClick={run} disabled={running} variant="secondary">
          <Sparkles />
          {running ? "Streaming…" : "Run stream"}
        </Button>
      </CardContent>
    </Card>
  );
}
