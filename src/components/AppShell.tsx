import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { BarChart2, Inbox, Plus, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { ThemeToggle } from "./ThemeToggle";
import type { ThemePreference } from "../types";

const NAV_ITEMS = [
  { to: "/", label: "Inbox", icon: Inbox, end: true },
  { to: "/add", label: "Add", icon: Plus, end: false },
  { to: "/stats", label: "Stats", icon: BarChart2, end: false },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { profile, loading, saveProfile } = useProfile();
  const identityLabel = profile?.displayName || user?.email || "";

  function handlePersistTheme(theme: ThemePreference) {
    saveProfile({ theme });
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 sm:px-10">
      <header className="flex items-center justify-between border-b border-[var(--hairline)] py-6">
        <NavLink to="/" className="font-serif-display text-xl tracking-tight text-[var(--fg)]">
          Folio
        </NavLink>
        <div className="flex items-center gap-4">
          <nav aria-label="Primary" className="flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 font-mono-meta text-[11px] uppercase tracking-wide transition-colors ${
                    isActive
                      ? "text-[var(--accent)]"
                      : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
                  }`
                }
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="border-l border-[var(--hairline)] pl-4">
            <ThemeToggle onAfterChange={handlePersistTheme} />
          </div>

          {!loading && identityLabel && (
            <NavLink
              to="/settings"
              title={identityLabel}
              className={({ isActive }) =>
                `flex items-center gap-1.5 border-l border-[var(--hairline)] pl-4 font-mono-meta text-[11px] transition-colors hover:text-[var(--fg)] ${
                  isActive ? "text-[var(--accent)]" : "text-[var(--fg-faint)]"
                }`
              }
            >
              <User className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden max-w-[12ch] truncate sm:inline">{identityLabel}</span>
            </NavLink>
          )}
        </div>
      </header>
      <main className="flex-1 py-10">{children}</main>
    </div>
  );
}
