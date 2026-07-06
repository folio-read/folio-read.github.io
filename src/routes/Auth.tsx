import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { GithubMark } from "../components/icons/GithubMark";
import { validateEmailDomain } from "../data/validateEmail";
import { ThemeToggle } from "../components/ThemeToggle";

type Mode = "signin" | "signup";

export default function Auth() {
  const { signInWithPassword, signUpWithPassword, signInWithGitHub } = useAuth();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const [githubLoading, setGithubLoading] = useState(false);

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim() || !password) return;
    setStatus("submitting");
    setError(null);
    try {
      if (mode === "signup") {
        const domainCheck = await validateEmailDomain(email.trim());
        if (!domainCheck.valid) {
          setStatus("error");
          setError(domainCheck.reason ?? "This email address looks invalid.");
          return;
        }
        await signUpWithPassword(email.trim(), password);
      } else {
        await signInWithPassword(email.trim(), password);
      }
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error
          ? err.message
          : mode === "signup"
          ? "Could not create your account."
          : "Could not sign you in.",
      );
    }
  }

  async function handleGitHub() {
    setGithubLoading(true);
    setError(null);
    try {
      await signInWithGitHub();
    } catch (err) {
      setGithubLoading(false);
      setError(err instanceof Error ? err.message : "Could not start GitHub sign-in.");
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[var(--bg)] px-6">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        <h1 className="font-serif-display text-3xl text-[var(--fg)]">Folio</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">
          A calm place to save what you mean to read, and to remember what you underlined.
        </p>

        <div
          role="tablist"
          aria-label="Sign in or create account"
          className="mt-8 inline-flex border border-[var(--hairline)] p-0.5"
        >
          {(["signin", "signup"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={mode === value}
              onClick={() => {
                setMode(value);
                setStatus("idle");
                setError(null);
              }}
              className={`px-4 py-1.5 font-mono-meta text-[11px] uppercase tracking-wide transition-colors ${
                mode === value ? "bg-[var(--fg)] text-[var(--bg)]" : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
              }`}
            >
              {value === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-3">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-[var(--fg-muted)]">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full border border-[var(--hairline)] bg-transparent px-3 py-2 text-sm text-[var(--fg)] outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-[var(--fg-muted)]">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={mode === "signup" ? "At least 6 characters" : "••••••••"}
              className="mt-1 w-full border border-[var(--hairline)] bg-transparent px-3 py-2 text-sm text-[var(--fg)] outline-none focus:border-[var(--accent)]"
            />
          </div>

          <button
            type="submit"
            disabled={status === "submitting"}
            className="flex w-full items-center justify-center gap-2 bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-[var(--accent-ink)] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {status === "submitting"
              ? mode === "signup"
                ? "Creating account…"
                : "Signing in…"
              : mode === "signup"
              ? "Create account"
              : "Sign in"}
          </button>

          {error && (
            <p role="alert" className="text-sm text-[var(--accent)]">
              {error}
            </p>
          )}
        </form>

        <div className="my-6 flex items-center gap-3 text-[var(--fg-faint)]">
          <div className="h-px flex-1 bg-[var(--hairline)]" />
          <span className="font-mono-meta text-[11px] uppercase tracking-wide">or</span>
          <div className="h-px flex-1 bg-[var(--hairline)]" />
        </div>

        <button
          type="button"
          onClick={handleGitHub}
          disabled={githubLoading}
          className="flex w-full items-center justify-center gap-2 border border-[var(--hairline)] px-4 py-2.5 text-sm font-medium text-[var(--fg)] transition-colors hover:border-[var(--fg-faint)] disabled:opacity-50"
        >
          <GithubMark className="h-4 w-4" />
          {githubLoading ? "Redirecting…" : "Continue with GitHub"}
        </button>
      </div>
    </div>
  );
}
