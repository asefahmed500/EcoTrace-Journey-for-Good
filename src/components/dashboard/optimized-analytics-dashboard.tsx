"use client";

import React, { memo, useMemo } from 'react';
import { AnalyticsDashboard } from './analytics-dashboard';
import type { Journey } from '@/lib/types';

interface OptimizedAnalyticsDashboardProps {
  journeys: Journey[];
}

const OptimizedAnalyticsDashboardComponent = ({ journeys }: OptimizedAnalyticsDashboardProps) => {
  // Memoize journeys to prevent unnecessary re-renders
  const memoizedJourneys = useMemo(() => journeys, [journeys]);

  return <AnalyticsDashboard journeys={memoizedJourneys} />;
};

// Memo comparison function
const areEqual = (prevProps: OptimizedAnalyticsDashboardProps, nextProps: OptimizedAnalyticsDashboardProps) => {
  return prevProps.journeys.length === nextProps.journeys.length &&
         prevProps.journeys.every((journey, index) => 
           journey.id === nextProps.journeys[index]?.id &&
           journey.emissions === nextProps.journeys[index]?.emissions
         );
};

export const OptimizedAnalyticsDashboard = memo(OptimizedAnalyticsDashboardComponent, areEqual);