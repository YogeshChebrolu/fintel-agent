"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@fintel/backend";
import { MessageBoard } from "@/components/message-board";
import { StreamDemo } from "@/components/stream-demo";
import { AgentChat } from "@/components/agent-chat";
import { SignOutButton } from "@/components/sign-out-button";

export default function AppPage() {
  const me = useQuery(api.users.currentUser);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex items-center justify-between">
        <div className="flex flex-col">
          <Link
            href="/"
            className="text-muted-foreground font-mono text-xs hover:underline"
          >
            fintel-agent
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            {me === undefined
              ? "Loading your account…"
              : me
                ? `Signed in as ${me.email ?? me.name ?? "your account"}`
                : "Not signed in"}
          </p>
        </div>
        <SignOutButton />
      </header>

      <AgentChat />
      <MessageBoard />
      <StreamDemo />
    </main>
  );
}
