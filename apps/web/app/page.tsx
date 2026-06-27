import Link from "next/link";
import { ArrowRight, Database, Globe, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiStatus } from "@/components/api-status";

const tiers = [
  {
    icon: Globe,
    name: "Next.js 16",
    role: "Frontend",
    points: [
      "App Router + React Server Components",
      "Tailwind v4 + shadcn/ui",
      "Subscribes to Convex for live data",
    ],
  },
  {
    icon: Server,
    name: "Hono + Bun",
    role: "API",
    points: [
      "Streaming AI endpoints (SSE)",
      "Webhooks & public REST",
      "Talks to Convex server-to-server",
    ],
  },
  {
    icon: Database,
    name: "Convex",
    role: "Data + Auth",
    points: [
      "Reactive database & functions",
      "Convex Auth (email + password)",
      "End-to-end type safety",
    ],
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.92_0_0)_0%,transparent_100%)] dark:bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.25_0_0)_0%,transparent_100%)]" />

      <div className="relative mx-auto flex max-w-5xl flex-col gap-16 px-6 py-20">
        <header className="flex items-center justify-between">
          <span className="font-mono text-sm font-semibold tracking-tight">
            fintel-agent
          </span>
          <Button asChild variant="ghost" size="sm">
            <Link href="/signin">Sign in</Link>
          </Button>
        </header>

        <section className="flex flex-col items-center gap-6 text-center">
          <ApiStatus />
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            A full-stack starter on Next.js, Hono + Bun, and Convex
          </h1>
          <p className="text-muted-foreground max-w-xl text-balance">
            Convex owns data, reactivity, and auth. Hono owns streaming and
            integrations. Next.js renders it all. Everything below is wired and
            running.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link href="/app">
                Open the app <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/signin">Create an account</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {tiers.map((tier) => (
            <Card key={tier.name}>
              <CardHeader>
                <tier.icon className="text-muted-foreground size-5" />
                <CardTitle className="mt-2">{tier.name}</CardTitle>
                <CardDescription className="font-mono text-xs uppercase tracking-wider">
                  {tier.role}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-muted-foreground space-y-1.5 text-sm">
                  {tier.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span className="text-foreground/40">—</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}
