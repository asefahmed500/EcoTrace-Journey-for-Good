'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface DashboardErrorRecoveryProps {
  children: React.ReactNode;
}

interface DashboardErrorRecoveryState {
  hasError: boolean;
  error?: Error;
}

export class DashboardErrorRecovery extends React.Component<
  DashboardErrorRecoveryProps,
  DashboardErrorRecoveryState
> {
  constructor(props: DashboardErrorRecoveryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): DashboardErrorRecoveryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard error caught:', error, errorInfo);
    
    // Check if it's a DOM manipulation error
    if (error.message.includes('removeChild') || error.message.includes('DOM')) {
      // Try to recover after a short delay
      setTimeout(() => {
        this.setState({ hasError: false, error: undefined });
      }, 1000);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
              <AlertTriangle className="h-12 w-12 text-yellow-500" />
              <h2 className="text-2xl font-bold text-foreground">Something went wrong</h2>
              <p className="text-muted-foreground text-center max-w-md">
                The dashboard encountered an error. This is usually temporary and can be fixed by refreshing.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => this.setState({ hasError: false, error: undefined })}
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </Button>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 p-4 bg-muted rounded-lg max-w-2xl">
                  <summary className="cursor-pointer font-medium">Error Details</summary>
                  <pre className="mt-2 text-sm overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}