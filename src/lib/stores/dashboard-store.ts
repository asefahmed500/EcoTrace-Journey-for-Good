import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Journey, UserPreferences, Achievement, LeaderboardUser } from '@/lib/types';

interface DashboardState {
  // Data
  journeys: Journey[];
  preferences: UserPreferences;
  achievements: Achievement[];
  leaderboard: LeaderboardUser[];
  team: { id: string; name: string; inviteCode: string; } | null;
  
  // UI State
  isLoading: boolean;
  isRefreshing: boolean;
  lastUpdated: number;
  
  // Computed values
  summary: {
    totalEmissions: number;
    ecoFriendlyTrips: number;
    totalJourneys: number;
  };
  
  // Actions
  setJourneys: (journeys: Journey[]) => void;
  setPreferences: (preferences: UserPreferences) => void;
  setAchievements: (achievements: Achievement[]) => void;
  setLeaderboard: (leaderboard: LeaderboardUser[]) => void;
  setTeam: (team: { id: string; name: string; inviteCode: string; } | null) => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  
  // Complex actions
  initializeData: (data: {
    journeys: Journey[];
    preferences: UserPreferences;
    achievements: Achievement[];
    leaderboard: LeaderboardUser[];
    team?: { id: string; name: string; inviteCode: string; } | null;
  }) => void;
  
  refreshData: () => Promise<void>;
  addJourney: (journey: Journey) => void;
}

const calculateSummary = (journeys: Journey[]) => ({
  totalEmissions: journeys.reduce((sum, journey) => sum + journey.emissions, 0),
  ecoFriendlyTrips: journeys.filter(journey => 
    journey.mode === 'walking' || journey.mode === 'cycling'
  ).length,
  totalJourneys: journeys.length,
});

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set, get) => ({
      // Initial state
      journeys: [],
      preferences: {
        favoriteRoutes: '',
        transportModes: '',
        environmentalPriorities: '',
      },
      achievements: [],
      leaderboard: [],
      team: null,
      isLoading: false,
      isRefreshing: false,
      lastUpdated: Date.now(),
      summary: {
        totalEmissions: 0,
        ecoFriendlyTrips: 0,
        totalJourneys: 0,
      },
      
      // Simple setters
      setJourneys: (journeys) => set((state) => ({
        journeys,
        summary: calculateSummary(journeys),
        lastUpdated: Date.now(),
      })),
      
      setPreferences: (preferences) => set({ preferences }),
      
      setAchievements: (achievements) => set({ achievements }),
      
      setLeaderboard: (leaderboard) => set({ leaderboard }),
      
      setTeam: (team) => set({ team }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setRefreshing: (isRefreshing) => set({ isRefreshing }),
      
      // Initialize with server data
      initializeData: (data) => set({
        journeys: data.journeys,
        preferences: data.preferences,
        achievements: data.achievements,
        leaderboard: data.leaderboard,
        team: data.team || null,
        summary: calculateSummary(data.journeys),
        lastUpdated: Date.now(),
      }),
      
      // Refresh data from API
      refreshData: async () => {
        const { setRefreshing, setJourneys, setAchievements, setLeaderboard } = get();
        
        setRefreshing(true);
        
        try {
          const [journeysRes, achievementsRes, leaderboardRes] = await Promise.all([
            fetch('/api/journey'),
            fetch('/api/gamification/badges'),
            fetch('/api/team/leaderboard')
          ]);
          
          if (journeysRes.ok) {
            const journeysData = await journeysRes.json();
            setJourneys(journeysData);
          }
          
          if (achievementsRes.ok) {
            const achievementsData = await achievementsRes.json();
            setAchievements(achievementsData.achievements || achievementsData || []);
          }
          
          if (leaderboardRes.ok) {
            const leaderboardData = await leaderboardRes.json();
            setLeaderboard(Array.isArray(leaderboardData) ? leaderboardData : []);
          }
          
        } catch (error) {
          console.error('Error refreshing dashboard data:', error);
        } finally {
          setRefreshing(false);
        }
      },
      
      // Add a new journey optimistically
      addJourney: (journey) => set((state) => {
        const newJourneys = [...state.journeys, journey];
        return {
          journeys: newJourneys,
          summary: calculateSummary(newJourneys),
          lastUpdated: Date.now(),
        };
      }),
    }),
    {
      name: 'dashboard-store',
    }
  )
);