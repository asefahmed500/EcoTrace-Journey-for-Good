"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

interface ApiStatus {
  name: string;
  endpoint: string;
  status: 'checking' | 'success' | 'error';
  message: string;
  responseTime?: number;
}

export function ApiHealthCheck() {
  const [apiStatuses, setApiStatuses] = useState<ApiStatus[]>([
    { name: 'Authentication', endpoint: '/api/auth/session', status: 'checking', message: 'Checking...' },
    { name: 'User Data', endpoint: '/api/user/preferences', status: 'checking', message: 'Checking...' },
    { name: 'Journey API', endpoint: '/api/journey', status: 'checking', message: 'Checking...' },
    { name: 'Carbon Summary', endpoint: '/api/carbon/summary', status: 'checking', message: 'Checking...' },
    { name: 'Achievements', endpoint: '/api/gamification/badges', status: 'checking', message: 'Checking...' },
    { name: 'Leaderboard', endpoint: '/api/team/leaderboard', status: 'checking', message: 'Checking...' },
    { name: 'Google Maps', endpoint: 'maps-api', status: 'checking', message: 'Checking...' },
  ]);

  const checkApi = async (api: ApiStatus): Promise<ApiStatus> => {
    const startTime = Date.now();
    
    try {
      if (api.endpoint === 'maps-api') {
        // Special check for Google Maps API
        const { loadMapsAPI } = await import('@/lib/maps-loader');
        await loadMapsAPI();
        const responseTime = Date.now() - startTime;
        return {
          ...api,
          status: 'success',
          message: 'Google Maps API loaded successfully',
          responseTime
        };
      } else {
        const response = await fetch(api.endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const responseTime = Date.now() - startTime;
        
        if (response.ok) {
          return {
            ...api,
            status: 'success',
            message: `API responding (${response.status})`,
            responseTime
          };
        } else {
          return {
            ...api,
            status: 'error',
            message: `HTTP ${response.status}: ${response.statusText}`,
            responseTime
          };
        }
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        ...api,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        responseTime
      };
    }
  };

  const runHealthCheck = useCallback(async () => {
    setApiStatuses(prev => {
      const updatedStatuses = prev.map(api => ({ ...api, status: 'checking' as const, message: 'Checking...' }));
      
      // Run checks asynchronously
      Promise.all(updatedStatuses.map(api => checkApi(api)))
        .then(results => setApiStatuses(results))
        .catch(error => console.error('Health check failed:', error));
      
      return updatedStatuses;
    });
  }, []); // Remove apiStatuses dependency to prevent infinite loop

  useEffect(() => {
    // Only run once on mount
    runHealthCheck();
  }, [runHealthCheck]); // Include runHealthCheck in dependency array

  const getStatusIcon = (status: ApiStatus['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'checking':
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
    }
  };

  const getStatusBadge = (status: ApiStatus['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'checking':
        return <Badge variant="secondary">Checking</Badge>;
    }
  };

  const successCount = apiStatuses.filter(api => api.status === 'success').length;
  const errorCount = apiStatuses.filter(api => api.status === 'error').length;
  const checkingCount = apiStatuses.filter(api => api.status === 'checking').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            API Health Status
            <Badge variant="outline">
              {successCount}/{apiStatuses.length} Healthy
            </Badge>
          </CardTitle>
          <Button 
            onClick={runHealthCheck} 
            size="sm" 
            variant="outline"
            disabled={checkingCount > 0}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${checkingCount > 0 ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {apiStatuses.map((api, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(api.status)}
                <div>
                  <div className="font-medium">{api.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {api.endpoint === 'maps-api' ? 'Google Maps API' : api.endpoint}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {api.responseTime && (
                  <span className="text-xs text-muted-foreground">
                    {api.responseTime}ms
                  </span>
                )}
                {getStatusBadge(api.status)}
              </div>
            </div>
          ))}
        </div>
        
        {errorCount > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="font-medium text-red-800 mb-2">Issues Found:</div>
            <div className="space-y-1">
              {apiStatuses
                .filter(api => api.status === 'error')
                .map((api, index) => (
                  <div key={index} className="text-sm text-red-700">
                    <strong>{api.name}:</strong> {api.message}
                  </div>
                ))}
            </div>
          </div>
        )}
        
        {successCount === apiStatuses.length && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-green-800 font-medium">
              ✅ All APIs are functioning properly!
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}