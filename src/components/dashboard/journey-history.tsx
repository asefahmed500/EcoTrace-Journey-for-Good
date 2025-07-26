
"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Car, Bus, Bike, Footprints, Route, ArrowUp, ArrowDown } from "lucide-react";
import type { Journey } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

const modeIcons: { [key: string]: React.ReactNode } = {
    'driving': <Car className="h-4 w-4" />,
    'public transit': <Bus className="h-4 w-4" />,
    'cycling': <Bike className="h-4 w-4" />,
    'walking': <Footprints className="h-4 w-4" />,
};

interface JourneyHistoryProps {
    journeys: Journey[];
}

type SortKey = keyof Journey | 'route';

export function JourneyHistory({ journeys }: JourneyHistoryProps) {
  const [sortConfig, setSortConfig] = useState<{ key: SortKey, direction: 'ascending' | 'descending' } | null>({ key: 'date', direction: 'descending' });

  const sortedJourneys = useMemo(() => {
    let sortableJourneys = [...journeys];
    if (sortConfig !== null) {
      sortableJourneys.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortConfig.key === 'route') {
          aValue = `${a.origin} to ${a.destination}`;
          bValue = `${b.origin} to ${b.destination}`;
        } else {
          aValue = a[sortConfig.key];
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableJourneys;
  }, [journeys, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Journey History</CardTitle>
        <CardDescription>A log of your recent travels and their impact. Click headers to sort.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('route')} className="px-2">
                    Route {getSortIcon('route')}
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button variant="ghost" onClick={() => requestSort('mode')} className="px-2">
                    Mode {getSortIcon('mode')}
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                   <Button variant="ghost" onClick={() => requestSort('date')} className="px-2">
                    Date {getSortIcon('date')}
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" onClick={() => requestSort('emissions')} className="px-2">
                    CO2 (kg) {getSortIcon('emissions')}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedJourneys.length > 0 ? (
                sortedJourneys.map((journey) => (
                  <TableRow key={journey.id}>
                    <TableCell>
                      <div className="font-medium max-w-[200px] truncate" title={`${journey.origin} to ${journey.destination}`}>{journey.origin} to {journey.destination}</div>
                    </TableCell>
                    <TableCell className="text-center">
                        <Badge variant="outline" className={cn(
                          "capitalize",
                          journey.emissions > 10 ? "border-destructive/50 text-destructive" :
                          journey.emissions > 2 ? "border-orange-400/50 text-orange-400" :
                          "border-primary/50 text-primary"
                        )}>
                            <div className="flex items-center gap-2">
                                {modeIcons[journey.mode.toLowerCase()] || <Route className="h-4 w-4" />}
                                {journey.mode}
                            </div>
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="text-sm text-muted-foreground">{new Date(journey.date).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell className="text-right font-mono">{journey.emissions.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                        You haven't logged any journeys yet. Use the calculator to get started!
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
