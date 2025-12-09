"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DashboardErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class DashboardErrorBoundary extends React.Component<
  DashboardErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: DashboardErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Filter out DOM manipulation errors and API errors that are not critical
    if (error.message.includes('removeChild') || 
        error.message.includes('Node') ||
        error.message.includes('Google Maps') ||
        error.message.includes('Network') ||
        error.message.includes('ResizeObserver') ||
        error.message.includes('Non-Error promise rejection') ||
        error.name === 'NotFoundError' ||
        error.name === 'NetworkError') {
      console.warn('Non-critical error caught:', error.message);
      return { hasError: false }; // Don't show error UI for these
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

function ErrorFallback({ error }: { error?: Error }) {
  const router = useRouter();

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-gray-100 rounded-full w-fit">
              <AlertTriangle className="h-8 w-8 text-black" />
            </div>
            <CardTitle className="text-2xl text-black">
              Oops! Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-gray-200 bg-gray-50">
              <AlertTriangle className="h-4 w-4 text-black" />
              <AlertTitle className="text-black">Dashboard Error</AlertTitle>
              <AlertDescription className="text-gray-700">
                We encountered an unexpected error while loading your dashboard. 
                This might be due to a temporary issue with our services.
              </AlertDescription>
            </Alert>

            {error && (
              <details className="bg-gray-100 p-4 rounded-lg">
                <summary className="cursor-pointer font-medium text-black mb-2">
                  Technical Details
                </summary>
                <pre className="text-xs text-gray-700 overflow-auto">
                  {error.message}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleRefresh} className="flex items-center gap-2 bg-black text-white hover:bg-gray-800">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button variant="outline" onClick={handleGoHome} className="flex items-center gap-2 border-gray-300 text-black hover:bg-gray-100">
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>If this problem persists, please contact support.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}