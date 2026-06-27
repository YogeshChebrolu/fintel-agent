"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Send } from "lucide-react";
import { api } from "@fintel/backend";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function MessageBoard() {
  const messages = useQuery(api.messages.list);
  const send = useMutation(api.messages.send);
  const [body, setBody] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = body.trim();
    if (!text) return;
    setBody("");
    await send({ body: text });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live message board</CardTitle>
        <CardDescription>
          A reactive Convex query — open this page in two tabs and watch it sync.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="bg-muted/40 flex max-h-72 flex-col gap-2 overflow-y-auto rounded-md border p-3">
          {messages === undefined ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : messages.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No messages yet. Be the first.
            </p>
          ) : (
            messages.map((message) => (
              <div key={message._id} className="text-sm">
                <span className="text-muted-foreground font-mono text-xs">
                  {message.author}
                </span>
                <p>{message.body}</p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Write a message…"
            maxLength={500}
          />
          <Button type="submit" disabled={!body.trim()}>
            <Send />
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
