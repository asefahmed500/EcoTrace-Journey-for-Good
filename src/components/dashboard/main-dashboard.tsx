
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FootprintMap } from './footprint-map';
import { JourneyLogForm } from './journey-log-form';
import { PredictiveRoutingForm } from './predictive-routing-form';
import { JourneyHistory } from './journey-history';
import { AccountSettingsForm } from './account-settings-form';
import { AchievementsList } from './achievements-list';
import { Leaderboard } from './leaderboard';
import type { Journey, UserPreferences, Achievement, LeaderboardUser } from '@/lib/types';
import { Leaf, Droplets, Trophy, BarChart, Settings, LineChart, History, BotMessageSquare } from 'lucide-react';
import { AnalyticsDashboard } from './analytics-dashboard';
import { StorytellerDisplay } from './storyteller-display';
import { Skeleton } from '../ui/skeleton';

interface MainDashboardProps {
  // Pass initial data, but allow for client-side fetching to update it
  journeys: Journey[];
  preferences: UserPreferences;
  achievements: Achievement[];
  leaderboard: LeaderboardUser[];
  team?: { id: string; name: string; inviteCode: string; } | null
}

export function MainDashboard({ 
    journeys: initialJourneys,
    preferences: initialPreferences,
    achievements: initialAchievements,
    leaderboard: initialLeaderboard,
    team: initialTeam
}: MainDashboardProps) {

  const [journeys, setJourneys] = useState(initialJourneys);
  const [achievements, setAchievements] = useState(initialAchievements);
  const [leaderboard, setLeaderboard] = useState(initialLeaderboard);
  const [preferences, setPreferences] = useState(initialPreferences);
  const [team, setTeam] = useState(initialTeam);
  const [summary, setSummary] = useState({ totalEmissions: 0, ecoFriendlyTrips: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect runs on mount and whenever the component is refreshed
    // It keeps the dashboard data up-to-date without a full page reload
    const fetchData = async () => {
      setIsLoading(true);
      // Fetch all data in parallel for performance
      const [journeysRes, summaryRes, achievementsRes, leaderboardRes, userRes] = await Promise.all([
          fetch('/api/journey'),
          fetch('/api/carbon/summary'),
          fetch('/api/gamification/badges'),
          fetch('/api/team/leaderboard'),
          fetch('/api/user/preferences')
      ]);
      
      const journeysData = await journeysRes.json();
      const summaryData = await summaryRes.json();
      const achievementsData = await achievementsRes.json();
      const leaderboardData = await leaderboardRes.json();
      const userData = await userRes.json();
      
      setJourneys(journeysData);
      setSummary(summaryData);
      setAchievements(achievementsData);
      setLeaderboard(leaderboardData.leaderboard || []); // Handle global vs team
      setPreferences(userData); // Assuming getAuthenticatedUserData is adapted to return this
      if (leaderboardData.type === 'team') {
          // A bit of an assumption here, might need a dedicated team endpoint
          setTeam({ id: 'teamid', name: leaderboardData.name, inviteCode: '' });
      } else {
          setTeam(null);
      }
      
      setIsLoading(false);
    };

    fetchData();
  }, []); // Empty dependency array means this runs once on mount. `router.refresh()` will re-trigger it.

  if (isLoading && journeys.length === 0) {
      return (
          <div className="space-y-8">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Skeleton className="h-28" />
                  <Skeleton className="h-28" />
                  <Skeleton className="h-28" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  <Skeleton className="lg:col-span-3 h-[550px]" />
                  <Skeleton className="lg:col-span-2 h-[550px]" />
              </div>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-96 w-full" />
          </div>
      )
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total CO2 Footprint</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalEmissions.toFixed(2)} kg</div>
            <p className="text-xs text-muted-foreground">Based on your logged journeys</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eco-Friendly Trips</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.ecoFriendlyTrips}</div>
            <p className="text-xs text-muted-foreground">Walking or cycling trips</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements Unlocked</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{achievements.length}</div>
            <p className="text-xs text-muted-foreground">Keep up the great work!</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <FootprintMap journeys={journeys} />
        </div>
        <div className="lg:col-span-2">
          <Tabs defaultValue="log" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="log">Calculator</TabsTrigger>
              <TabsTrigger value="predict">Predictive</TabsTrigger>
            </TabsList>
            <TabsContent value="log">
              <JourneyLogForm />
            </TabsContent>
            <TabsContent value="predict">
              <PredictiveRoutingForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
            <TabsTrigger value="analytics"><LineChart className="mr-2 h-4 w-4"/> Analytics</TabsTrigger>
            <TabsTrigger value="story"><BotMessageSquare className="mr-2 h-4 w-4"/> AI Summary</TabsTrigger>
            <TabsTrigger value="history"><History className="mr-2 h-4 w-4"/> History</TabsTrigger>
            <TabsTrigger value="achievements"><Trophy className="mr-2 h-4 w-4"/> Achievements</TabsTrigger>
            <TabsTrigger value="leaderboard"><BarChart className="mr-2 h-4 w-4"/> Leaderboard</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4"/> Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="analytics">
            <AnalyticsDashboard journeys={journeys} />
        </TabsContent>
        <TabsContent value="story">
            <StorytellerDisplay />
        </TabsContent>
        <TabsContent value="history">
            <JourneyHistory journeys={journeys} />
        </TabsContent>
        <TabsContent value="achievements">
            <AchievementsList achievements={achievements} />
        </TabsContent>
        <TabsContent value="leaderboard">
            <Leaderboard leaderboard={leaderboard} />
        </TabsContent>
        <TabsContent value="settings">
            <AccountSettingsForm preferences={preferences} team={team}/>
        </TabsContent>
      </Tabs>
    </div>
  );
}
