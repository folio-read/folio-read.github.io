import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useProfile } from "../context/ProfileContext";
import { useToast } from "../context/ToastContext";
import { ThemeToggle } from "../components/ThemeToggle";
import { TextSkeleton } from "../components/Skeletons";
import type { ThemePreference } from "../types";

export default function Settings() {
  const { user, signOut, updatePassword, signInWithPassword } = useAuth();
  const { setTheme } = useTheme();
  const { profile, loading, saveProfile } = useProfile();
  const { showToast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [syncedFromProfile, setSyncedFromProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? "");
      if (!syncedFromProfile) {
        setTheme(profile.theme);
        setSyncedFromProfile(true);
      }
    }
  }, [profile, syncedFromProfile, setTheme]);

  function handlePersistTheme(nextTheme: ThemePreference) {
    saveProfile({ theme: nextTheme });
  }

  async function handleSaveName(event: FormEvent) {
    event.preventDefault();
    await saveProfile({ displayName: displayName.trim() });
  }

  async function handleChangePassword(event: FormEvent) {
    event.preventDefault();
    if (newPassword.length < 6) {
      setPasswordStatus("error");
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus("error");
      setPasswordError("Passwords don't match.");
      return;
    }
    if (!user?.email) {
      setPasswordStatus("error");
      setPasswordError("Could not verify your account email.");
      return;
    }
    setPasswordStatus("submitting");
    setPasswordError(null);
    try {
      await signInWithPassword(user.email, currentPassword);
    } catch {
      setPasswordStatus("error");
      setPasswordError("Current password is incorrect.");
      return;
    }
    try {
      await updatePassword(newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordStatus("idle");
      showToast("Password updated", { variant: "success" });
    } catch (err) {
      setPasswordStatus("error");
      setPasswordError(err instanceof Error ? err.message : "Could not update your password.");
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-serif-display text-3xl text-[var(--fg)]">Settings</h1>

      <section className="mt-8 border-t border-[var(--hairline)] pt-6">
        <h2 className="font-mono-meta text-[11px] uppercase tracking-wide text-[var(--fg-faint)]">Profile</h2>
        {loading ? (
          <TextSkeleton className="mt-3 h-9 w-full" />
        ) : (
          <form onSubmit={handleSaveName} className="mt-3 flex gap-2">
            <input
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Your name"
              className="flex-1 border border-[var(--hairline)] bg-transparent px-3 py-2 text-sm text-[var(--fg)] outline-none focus:border-[var(--accent)]"
            />
            <button
              type="submit"
              className="border border-[var(--hairline)] px-4 py-2 text-sm text-[var(--fg)] transition-colors hover:border-[var(--fg-faint)]"
            >
              Save
            </button>
          </form>
        )}
        <p className="mt-2 text-xs text-[var(--fg-faint)]">{user?.email}</p>
      </section>

      <section className="mt-8 border-t border-[var(--hairline)] pt-6">
        <h2 className="font-mono-meta text-[11px] uppercase tracking-wide text-[var(--fg-faint)]">Appearance</h2>
        <div className="mt-3">
          <ThemeToggle onAfterChange={handlePersistTheme} />
          <p className="mt-2 text-xs text-[var(--fg-faint)]">
            System follows your device's light or dark mode automatically.
          </p>
        </div>
      </section>

      <section className="mt-8 border-t border-[var(--hairline)] pt-6">
        <h2 className="font-mono-meta text-[11px] uppercase tracking-wide text-[var(--fg-faint)]">Password</h2>
        <form onSubmit={handleChangePassword} className="mt-3 max-w-xs space-y-2">
          <input
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            placeholder="Current password"
            className="w-full border border-[var(--hairline)] bg-transparent px-3 py-2 text-sm text-[var(--fg)] outline-none focus:border-[var(--accent)]"
          />
          <input
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="New password"
            className="w-full border border-[var(--hairline)] bg-transparent px-3 py-2 text-sm text-[var(--fg)] outline-none focus:border-[var(--accent)]"
          />
          <input
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm new password"
            className="w-full border border-[var(--hairline)] bg-transparent px-3 py-2 text-sm text-[var(--fg)] outline-none focus:border-[var(--accent)]"
          />
          <button
            type="submit"
            disabled={passwordStatus === "submitting"}
            className="border border-[var(--hairline)] px-4 py-2 text-sm text-[var(--fg)] transition-colors hover:border-[var(--fg-faint)] disabled:opacity-50"
          >
            {passwordStatus === "submitting" ? "Updating…" : "Update password"}
          </button>
          {passwordError && (
            <p role="alert" className="text-sm text-[var(--accent)]">
              {passwordError}
            </p>
          )}
        </form>
      </section>

      <section className="mt-8 border-t border-[var(--hairline)] pt-6">
        <h2 className="font-mono-meta text-[11px] uppercase tracking-wide text-[var(--fg-faint)]">Account</h2>
        <button
          type="button"
          onClick={() => signOut()}
          className="mt-3 inline-flex items-center gap-2 border border-[var(--hairline)] px-4 py-2 text-sm text-[var(--fg)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out
        </button>
      </section>
    </div>
  );
}
