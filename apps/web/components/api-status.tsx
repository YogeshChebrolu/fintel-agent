"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";

type Status = "checking" | "ok" | "down";

const styles: Record<Status, string> = {
  checking: "bg-muted text-muted-foreground",
  ok: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  down: "bg-destructive/15 text-destructive",
};

const labels: Record<Status, string> = {
  checking: "checking…",
  ok: "online",
  down: "offline",
};

export function ApiStatus() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let active = true;
    fetch(`${API_URL}/health`)
      .then((r) => {
        if (!r.ok) throw new Error("bad status");
      })
      .then(() => active && setStatus("ok"))
      .catch(() => active && setStatus("down"));
    return () => {
      active = false;
    };
  }, []);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-xs ${styles[status]}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      Hono API {labels[status]}
    </span>
  );
}
