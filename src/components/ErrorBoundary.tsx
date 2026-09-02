import { Component, type ErrorInfo, type ReactNode } from "react";
import * as Sentry from "@sentry/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCw } from "lucide-react";
import siteConfig from "@/config/siteConfig";
import type { ErrorBoundaryProps, ErrorBoundaryState } from "@/types/components/ErrorBoundary.types";

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    // Also report to Sentry in production — a no-op if Sentry.init() was
    // never called (dev, or VITE_SENTRY_DSN unset), so this never throws
    // on its own.
    Sentry.captureException(error, {
      extra: { componentStack: errorInfo.componentStack },
    });
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-destructive" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-form-header leading-tight tracking-tight">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              An unexpected error occurred on {siteConfig.title}. Reloading the
              page usually fixes it.
            </p>

            <div className="mt-8">
              <Button
                onClick={this.handleReload}
                className="bg-primary hover:bg-primary-light w-full sm:w-auto"
              >
                <RotateCw className="w-4 h-4 mr-2" />
                Reload page
              </Button>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <Card className="mt-8 text-left">
                <CardHeader>
                  <CardTitle className="text-sm text-destructive">
                    Error details (visible in development only)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs whitespace-pre-wrap break-words text-muted-foreground max-h-64 overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;