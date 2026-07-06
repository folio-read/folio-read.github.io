import { Suspense, lazy } from "react";
import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { ProfileProvider } from "./context/ProfileContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthGuard, GuestGuard } from "./components/AuthGuard";
import { AppShell } from "./components/AppShell";

const Auth = lazy(() => import("./routes/Auth"));
const Inbox = lazy(() => import("./routes/Inbox"));
const AddItem = lazy(() => import("./routes/AddItem"));
const ItemDetail = lazy(() => import("./routes/ItemDetail"));
const Stats = lazy(() => import("./routes/Stats"));
const Settings = lazy(() => import("./routes/Settings"));
const NotFound = lazy(() => import("./routes/NotFound"));

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="font-mono-meta text-xs uppercase tracking-wide text-[var(--fg-faint)]">Loading…</div>
    </div>
  );
}

function ShellLayout(): ReactNode {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <ProfileProvider>
            <ThemeProvider>
              <BrowserRouter basename={import.meta.env.BASE_URL}>
                <Suspense fallback={<RouteFallback />}>
                  <Routes>
                    <Route element={<GuestGuard />}>
                      <Route path="/auth" element={<Auth />} />
                    </Route>

                    <Route element={<AuthGuard />}>
                      <Route element={<ShellLayout />}>
                        <Route path="/" element={<Inbox />} />
                        <Route path="/add" element={<AddItem />} />
                        <Route path="/items/:id" element={<ItemDetail />} />
                        <Route path="/stats" element={<Stats />} />
                        <Route path="/settings" element={<Settings />} />
                      </Route>
                    </Route>

                    <Route path="/404" element={<NotFound />} />
                    <Route path="*" element={<Navigate to="/404" replace />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </ThemeProvider>
          </ProfileProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
