import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled UI error", error, info);
  }

  handleReset = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--bg)] px-6 text-center">
          <AlertTriangle className="h-8 w-8 text-[var(--accent)]" aria-hidden="true" />
          <h1 className="font-serif-display text-2xl text-[var(--fg)]">Something went wrong</h1>
          <p className="max-w-sm text-sm text-[var(--fg-muted)]">
            Folio ran into an unexpected error. Reloading usually fixes it.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="rounded-sm bg-[var(--accent)] px-4 py-2 font-sans text-sm font-medium text-[var(--accent-ink)] transition-opacity hover:opacity-90"
          >
            Reload Folio
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
