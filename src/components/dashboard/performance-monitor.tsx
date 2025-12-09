'use client';

import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';

export function PerformanceMonitor() {
  const [renderCount, setRenderCount] = useState(0);
  const [lastRender, setLastRender] = useState(Date.now());
  const renderCountRef = useRef(0);

  // Use ref to track renders without causing re-renders
  renderCountRef.current += 1;

  useEffect(() => {
    // Only update state occasionally to avoid infinite loops
    const interval = setInterval(() => {
      setRenderCount(renderCountRef.current);
      setLastRender(Date.now());
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []); // Empty dependency array

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-1">
      <Badge variant="outline" className="text-xs">
        Renders: {renderCount}
      </Badge>
      <Badge variant="outline" className="text-xs">
        Last: {new Date(lastRender).toLocaleTimeString()}
      </Badge>
    </div>
  );
}