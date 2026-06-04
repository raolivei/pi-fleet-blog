import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Control Center render error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="cc-fatal">
          <h1>Control Center failed to load</h1>
          <pre>{this.state.error.message}</pre>
          <p>Check the browser console, then restart with <code>npm run dev</code> in control-center/.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
