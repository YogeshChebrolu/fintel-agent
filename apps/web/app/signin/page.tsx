"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getLastAuthMethod,
  setLastAuthMethod,
  type AuthMethod,
} from "@/lib/last-auth-method";

type View = "auth" | "forgot" | "reset";
type Flow = "signIn" | "signUp";

function LastUsedBadge() {
  return (
    <span className="bg-primary/10 text-primary ml-2 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
      Last used
    </span>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.22V7.04H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

export default function SignInPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();

  const [view, setView] = useState<View>("auth");
  const [flow, setFlow] = useState<Flow>("signIn");
  const [resetEmail, setResetEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lastMethod, setLastMethod] = useState<AuthMethod | null>(null);

  // Read once on mount (localStorage is client-only — avoids hydration mismatch).
  useEffect(() => {
    setLastMethod(getLastAuthMethod());
  }, []);

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.set("flow", flow);

    try {
      await signIn("password", formData);
      setLastAuthMethod("password");
      router.push("/app");
    } catch {
      setError(
        flow === "signIn"
          ? "Could not sign in — check your email and password, or sign up."
          : "Could not sign up — try a different email or a stronger password.",
      );
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setSubmitting(true);
    try {
      setLastAuthMethod("google");
      await signIn("google", { redirectTo: "/app" });
    } catch {
      setError("Could not start Google sign-in. Please try again.");
      setSubmitting(false);
    }
  }

  async function handleForgotSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.set("flow", "reset");
    const email = formData.get("email") as string;

    try {
      await signIn("password", formData);
      setResetEmail(email);
      setView("reset");
    } catch {
      setError("Could not send a reset code. Check the email and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.set("flow", "reset-verification");
    formData.set("email", resetEmail);

    try {
      await signIn("password", formData);
      setLastAuthMethod("password");
      router.push("/app");
    } catch {
      setError("Invalid or expired code. Double-check it and try again.");
      setSubmitting(false);
    }
  }

  function goToAuth(nextFlow?: Flow) {
    if (nextFlow) setFlow(nextFlow);
    setView("auth");
    setError(null);
  }

  // --- Forgot-password: request a code ------------------------------------
  if (view === "forgot") {
    return (
      <Shell
        title="Reset your password"
        description="Enter your email and we'll send you a reset code."
      >
        <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
          <Field
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
          />
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button type="submit" disabled={submitting} className="mt-1">
            {submitting && <Loader2 className="animate-spin" />}
            Send reset code
          </Button>
        </form>
        <BackLink onClick={() => goToAuth("signIn")} label="Back to sign in" />
      </Shell>
    );
  }

  // --- Forgot-password: enter code + new password -------------------------
  if (view === "reset") {
    return (
      <Shell
        title="Enter your reset code"
        description={`We sent an 8-digit code to ${resetEmail}.`}
      >
        <form onSubmit={handleResetSubmit} className="flex flex-col gap-4">
          <Field
            id="code"
            label="Reset code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="12345678"
          />
          <Field
            id="newPassword"
            label="New password"
            type="password"
            autoComplete="new-password"
          />
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button type="submit" disabled={submitting} className="mt-1">
            {submitting && <Loader2 className="animate-spin" />}
            Reset password
          </Button>
        </form>
        <BackLink onClick={() => goToAuth("signIn")} label="Back to sign in" />
      </Shell>
    );
  }

  // --- Sign in / sign up --------------------------------------------------
  return (
    <Shell
      title={flow === "signIn" ? "Welcome back" : "Create your account"}
      description={
        flow === "signIn"
          ? "Sign in to fintel-agent."
          : "Sign up to start using fintel-agent."
      }
    >
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={submitting}
        onClick={handleGoogle}
      >
        <GoogleIcon />
        Continue with Google
        {lastMethod === "google" && <LastUsedBadge />}
      </Button>

      <div className="my-4 flex items-center gap-3">
        <span className="bg-border h-px flex-1" />
        <span className="text-muted-foreground text-xs">or</span>
        <span className="bg-border h-px flex-1" />
      </div>

      <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="email">Email</Label>
          {lastMethod === "password" && <LastUsedBadge />}
        </div>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          {flow === "signIn" && (
            <button
              type="button"
              className="text-muted-foreground text-xs underline-offset-4 hover:underline"
              onClick={() => {
                setView("forgot");
                setError(null);
              }}
            >
              Forgot password?
            </button>
          )}
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={flow === "signIn" ? "current-password" : "new-password"}
          required
        />

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button type="submit" disabled={submitting} className="mt-1">
          {submitting && <Loader2 className="animate-spin" />}
          {flow === "signIn" ? "Sign in" : "Sign up"}
        </Button>
      </form>

      <p className="text-muted-foreground mt-4 text-center text-sm">
        {flow === "signIn" ? "No account yet?" : "Already have an account?"}{" "}
        <button
          type="button"
          className="text-foreground font-medium underline-offset-4 hover:underline"
          onClick={() => goToAuth(flow === "signIn" ? "signUp" : "signIn")}
        >
          {flow === "signIn" ? "Sign up" : "Sign in"}
        </button>
      </p>

      <p className="text-muted-foreground mt-6 text-center text-xs">
        <Link href="/" className="underline-offset-4 hover:underline">
          ← Back home
        </Link>
      </p>
    </Shell>
  );
}

function Shell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </main>
  );
}

function Field({
  id,
  label,
  ...props
}: { id: string; label: string } & React.ComponentProps<typeof Input>) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} required {...props} />
    </div>
  );
}

function BackLink({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <p className="text-muted-foreground mt-4 text-center text-sm">
      <button
        type="button"
        className="text-foreground font-medium underline-offset-4 hover:underline"
        onClick={onClick}
      >
        ← {label}
      </button>
    </p>
  );
}
