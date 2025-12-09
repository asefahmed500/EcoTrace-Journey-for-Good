"use client";

import React, { memo, useMemo } from 'react';
import { JourneyHistory } from './journey-history';
import type { Journey } from '@/lib/types';

interface OptimizedJourneyHistoryProps {
  journeys: Journey[];
}

const OptimizedJourneyHistoryComponent = ({ journeys }: OptimizedJourneyHistoryProps) => {
  // Memoize journeys to prevent unnecessary re-renders
  const memoizedJourneys = useMemo(() => journeys, [journeys]);

  return <JourneyHistory journeys={memoizedJourneys} />;
};

// Memo comparison function
const areEqual = (prevProps: OptimizedJourneyHistoryProps, nextProps: OptimizedJourneyHistoryProps) => {
  return prevProps.journeys.length === nextProps.journeys.length &&
         prevProps.journeys.every((journey, index) => 
           journey.id === nextProps.journeys[index]?.id
         );
};

export const OptimizedJourneyHistory = memo(OptimizedJourneyHistoryComponent, areEqual);