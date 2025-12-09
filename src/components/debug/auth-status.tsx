'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AuthTestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

interface SessionData {
  user?: {
    id?: string;
    name?: string;
    email?: string;
    image?: string;
  };
}

export function AuthStatus() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [testResult, setTestResult] = useState<AuthTestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      setSession(data.user ? { user: data.user } : null);
      setStatus(data.user ? 'authenticated' : 'unauthenticated');
    } catch (error) {
      setSession(null);
      setStatus('unauthenticated');
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const runAuthTest = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/test');
      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to run auth test',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-run test on component mount
    runAuthTest();
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Authentication Status
            <Badge variant={status === 'authenticated' ? 'default' : 'secondary'}>
              {status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {session ? (
            <div className="space-y-2">
              <p><strong>User ID:</strong> {session.user?.id || 'Not available'}</p>
              <p><strong>Name:</strong> {session.user?.name || 'Not available'}</p>
              <p><strong>Email:</strong> {session.user?.email || 'Not available'}</p>
              <p><strong>Image:</strong> {session.user?.image ? 'Available' : 'Not available'}</p>
            </div>
          ) : (
            <p>No active session</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            System Test
            <Button 
              size="sm" 
              onClick={runAuthTest} 
              disabled={loading}
            >
              {loading ? 'Testing...' : 'Run Test'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {testResult ? (
            <div className="space-y-2">
              <Badge variant={testResult.success ? 'default' : 'destructive'}>
                {testResult.success ? 'Success' : 'Failed'}
              </Badge>
              <p>{testResult.message}</p>
              
              {testResult.data && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-semibold">Test Details:</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Database Connected:</strong> {testResult.data.database?.connected ? 'Yes' : 'No'}</p>
                    <p><strong>User Count:</strong> {testResult.data.database?.userCount || 0}</p>
                    <p><strong>Environment Variables:</strong></p>
                    <ul className="ml-4 space-y-1">
                      <li>MongoDB URI: {testResult.data.environment?.hasMongoUri ? '✅' : '❌'}</li>
                      <li>Auth Secret: {testResult.data.environment?.hasAuthSecret ? '✅' : '❌'}</li>
                      <li>Google Client ID: {testResult.data.environment?.hasGoogleClientId ? '✅' : '❌'}</li>
                      <li>Google Client Secret: {testResult.data.environment?.hasGoogleClientSecret ? '✅' : '❌'}</li>
                      <li>Google Maps Key: {testResult.data.environment?.hasGoogleMapsKey ? '✅' : '❌'}</li>
                    </ul>
                  </div>
                </div>
              )}
              
              {testResult.error && (
                <div className="mt-2 p-2 bg-destructive/10 rounded text-sm">
                  <strong>Error:</strong> {testResult.error}
                </div>
              )}
            </div>
          ) : (
            <p>Click &ldquo;Run Test&rdquo; to check system status</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}