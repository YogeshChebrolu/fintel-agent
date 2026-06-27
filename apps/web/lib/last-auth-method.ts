// Remembers which method the user last signed in with, so the sign-in page can
// surface a "Last used" hint. Stored client-side only — it's a UX nicety, not
// a security boundary.
export type AuthMethod = "password" | "google";

const STORAGE_KEY = "fintel:last-auth-method";

export function getLastAuthMethod(): AuthMethod | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "password" || value === "google" ? value : null;
}

export function setLastAuthMethod(method: AuthMethod): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, method);
}
