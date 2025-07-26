export type Journey = {
  id: string;
  userId: string;
  origin: string;
  destination: string;
  distance: number;
  mode: string;
  emissions: number;
  date: Date;
  originCoords: { lat: number, lng: number };
  destinationCoords: { lat: number, lng: number };
  createdAt: Date;
};

export type UserPreferences = {
  favoriteRoutes: string;
  transportModes: string;
  environmentalPriorities: string;
};

export type CommunityImpactZone = {
  name: string;
  lat: number;
  lng: number;
  reasoning: string;
};

export type Achievement = {
  name: string;
  description: string;
  icon: string;
  date: Date;
};

export type LeaderboardUser = {
  id: string;
  name: string;
  image?: string | null;
  totalEmissions: number;
  rank: number;
};

export type PublicUserProfile = {
  name:string;
  image?: string | null;
  totalEmissions: number;
  achievements: Achievement[];
  memberSince: string;
};

export type EvChargingStation = {
  id: string;
  name: string;
  vicinity: string;
  location: { lat: number; lng: number };
  isOpenNow: boolean | 'unknown';
};

export type Team = {
  id: string;
  name: string;
  totalEmissions: number;
  memberCount: number;
  leaderboard: LeaderboardUser[];
};

export type AiStory = {
    title: string;
    narrative: string;
};
