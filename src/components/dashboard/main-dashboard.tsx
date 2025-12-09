
"use client";

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OptimizedFootprintMap } from './optimized-footprint-map';
import { JourneyLogForm } from './journey-log-form';
import { PredictiveRoutingForm } from './predictive-routing-form';
import { OptimizedJourneyHistory } from './optimized-journey-history';
import { AccountSettingsForm } from './account-settings-form';
import { AchievementsList } from './achievements-list';
import { Leaderboard } from './leaderboard';
import type { Journey, UserPreferences, Achievement, LeaderboardUser } from '@/lib/types';
import { Leaf, Droplets, Trophy, BarChart, Settings, LineChart, History, BotMessageSquare } from 'lucide-react';
import { OptimizedAnalyticsDashboard } from './optimized-analytics-dashboard';
import { StorytellerDisplay } from './storyteller-display';
import { CommunityGamification } from './community-gamification';
import { ApiHealthCheck } from './api-health-check';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { RefreshCw } from 'lucide-react';
import { PerformanceMonitor } from './performance-monitor';
import { useDashboardStore } from '@/lib/stores/dashboard-store';
import { RouteAnalytics } from './route-analytics';


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

  // Use Zustand store
  const {
    journeys,
    preferences,
    achievements,
    leaderboard,
    team,
    isLoading,
    isRefreshing,
    summary,
    initializeData,
    refreshData,
  } = useDashboardStore();

  // Initialize store with server data on mount
  useEffect(() => {
    initializeData({
      journeys: initialJourneys,
      preferences: initialPreferences,
      achievements: initialAchievements,
      leaderboard: initialLeaderboard,
      team: initialTeam,
    });
  }, [initializeData, initialJourneys, initialPreferences, initialAchievements, initialLeaderboard, initialTeam]);

  const handleRefresh = () => {
    refreshData();
  };

  // Remove unnecessary loading state since we have initial data
  if (isLoading && journeys.length === 0) {
      return (
          <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <Skeleton className="h-10 w-64 mb-2" />
                  <Skeleton className="h-4 w-96" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                  <Skeleton className="xl:col-span-3 h-[600px]" />
                  <Skeleton className="xl:col-span-2 h-[600px]" />
              </div>
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">EcoTrace Dashboard</h1>
            <p className="text-muted-foreground mt-1">Track your carbon footprint and environmental impact</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button 
              onClick={async () => {
                try {
                  const response = await fetch('/api/gamification/update', { method: 'POST' });
                  const data = await response.json();
                  console.log('Achievement check result:', data);
                  if (data.newAchievements?.length > 0) {
                    alert(`${data.newAchievements.length} new achievements unlocked!`);
                    handleRefresh();
                  } else {
                    alert('No new achievements at this time');
                  }
                } catch (error) {
                  console.error('Achievement check failed:', error);
                }
              }}
              variant="outline"
              size="sm"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Check Achievements
            </Button>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total CO2 Footprint</CardTitle>
              <div className="p-2 bg-muted rounded-full">
                <Leaf className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{summary.totalEmissions.toFixed(2)} kg</div>
              <p className="text-xs text-muted-foreground mt-1">Based on your logged journeys</p>
              <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${Math.min(100, (summary.totalEmissions / 100) * 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eco-Friendly Trips</CardTitle>
              <div className="p-2 bg-muted rounded-full">
                <Droplets className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{summary.ecoFriendlyTrips}</div>
              <p className="text-xs text-muted-foreground mt-1">Walking or cycling trips</p>
              <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, (summary.ecoFriendlyTrips / Math.max(summary.totalJourneys, 1)) * 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <div className="p-2 bg-muted rounded-full">
                <Trophy className="h-4 w-4 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{achievements.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Milestones unlocked</p>
              <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, (achievements.length / 10) * 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Journeys</CardTitle>
              <div className="p-2 bg-muted rounded-full">
                <BarChart className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{summary.totalJourneys}</div>
              <p className="text-xs text-muted-foreground mt-1">Trips recorded</p>
              <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, (summary.totalJourneys / 50) * 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-7 gap-6">
          {/* Map Section */}
          <div className="xl:col-span-4">
            <OptimizedFootprintMap journeys={journeys} />
          </div>
          
          {/* Tools and Analytics Section */}
          <div className="xl:col-span-3 space-y-6">
            {/* Route Analytics */}
            <RouteAnalytics />
            
            {/* Tools */}
            <Card className="shadow-sm">
              <Tabs defaultValue="log" className="w-full">
                <CardHeader className="pb-3">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="log">
                      Carbon Calculator
                    </TabsTrigger>
                    <TabsTrigger value="predict">
                      Route Predictor
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent className="pt-0">
                  <TabsContent value="log" className="mt-0">
                    <JourneyLogForm onSuccess={handleRefresh} />
                  </TabsContent>
                  <TabsContent value="predict" className="mt-0">
                    <PredictiveRoutingForm />
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>
        </div>
        
        {/* Detailed Analytics Section */}
        <Card className="shadow-sm">
          <Tabs defaultValue="analytics" className="w-full">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-xl">Detailed Analytics</CardTitle>
                  <CardDescription>Explore your environmental impact in depth</CardDescription>
                </div>
              </div>
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 p-1">
                <TabsTrigger value="analytics" className="text-xs sm:text-sm">
                  <LineChart className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4"/>
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="story" className="text-xs sm:text-sm">
                  <BotMessageSquare className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4"/>
                  <span className="hidden sm:inline">AI Summary</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="text-xs sm:text-sm">
                  <History className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4"/>
                  <span className="hidden sm:inline">History</span>
                </TabsTrigger>
                <TabsTrigger value="community" className="text-xs sm:text-sm">
                  <Trophy className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4"/>
                  <span className="hidden sm:inline">Community</span>
                </TabsTrigger>
                <TabsTrigger value="achievements" className="text-xs sm:text-sm">
                  <Trophy className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4"/>
                  <span className="hidden sm:inline">Achievements</span>
                </TabsTrigger>
                <TabsTrigger value="leaderboard" className="text-xs sm:text-sm">
                  <BarChart className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4"/>
                  <span className="hidden sm:inline">Leaderboard</span>
                </TabsTrigger>
                <TabsTrigger value="health" className="text-xs sm:text-sm">
                  <Settings className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4"/>
                  <span className="hidden sm:inline">API Health</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-xs sm:text-sm">
                  <Settings className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4"/>
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="analytics" className="mt-0">
                <OptimizedAnalyticsDashboard journeys={journeys} />
              </TabsContent>
              <TabsContent value="story" className="mt-0">
                <StorytellerDisplay />
              </TabsContent>
              <TabsContent value="history" className="mt-0">
                <OptimizedJourneyHistory journeys={journeys} />
              </TabsContent>
              <TabsContent value="community" className="mt-0">
                <CommunityGamification 
                  journeys={journeys}
                  achievements={achievements}
                  leaderboard={leaderboard}
                  userStats={{
                    totalPoints: achievements.length * 50,
                    rank: 1,
                    level: Math.floor(achievements.length / 3) + 1,
                    streaks: {}
                  }}
                />
              </TabsContent>
              <TabsContent value="achievements" className="mt-0">
                <AchievementsList achievements={achievements} />
              </TabsContent>
              <TabsContent value="leaderboard" className="mt-0">
                <Leaderboard leaderboard={leaderboard} />
              </TabsContent>
              <TabsContent value="health" className="mt-0">
                <ApiHealthCheck />
              </TabsContent>
              <TabsContent value="settings" className="mt-0">
                <AccountSettingsForm preferences={preferences} team={team}/>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
      {process.env.NODE_ENV === 'development' && <PerformanceMonitor />}
    </div>
  );
}
