
"use client";

import { useState } from "react";
import type { LeaderboardUser } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Calendar, Medal, Users, Globe, MapPin, Crown, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface LeaderboardProps {
    leaderboard: LeaderboardUser[];
}

export function Leaderboard({ leaderboard }: LeaderboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<'global' | 'friends' | 'neighborhood'>('global');

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-400";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-orange-400";
    return "text-muted-foreground";
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="size-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="size-6 text-gray-400" />;
    if (rank === 3) return <Star className="size-6 text-orange-400" />;
    return <span className="font-bold text-lg">{rank}</span>;
  }

  const getLeaderboardData = () => {
    // In a real app, this would filter based on the selected category
    return leaderboard;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Leaderboards
            </CardTitle>
            <CardDescription>Compete with friends, neighborhoods, and cities</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={selectedCategory === 'global' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('global')}
            >
              <Globe className="h-4 w-4 mr-1" />
              Global
            </Button>
            <Button 
              variant={selectedCategory === 'friends' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('friends')}
            >
              <Users className="h-4 w-4 mr-1" />
              Friends
            </Button>
            <Button 
              variant={selectedCategory === 'neighborhood' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('neighborhood')}
            >
              <MapPin className="h-4 w-4 mr-1" />
              Local
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="emissions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="emissions">Lowest Emissions</TabsTrigger>
            <TabsTrigger value="streaks">Longest Streaks</TabsTrigger>
            <TabsTrigger value="achievements">Most Badges</TabsTrigger>
          </TabsList>
          
          <TabsContent value="emissions" className="mt-4">
            {getLeaderboardData().length > 0 ? (
              <ul className="space-y-2">
                {getLeaderboardData().slice(0, 10).map((user) => (
                  <li key={user.id}>
                    <Link href={`/profile/${user.id}`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors border">
                      <div className={cn("flex items-center justify-center w-10 h-10", getRankColor(user.rank))}>
                        {getRankIcon(user.rank)}
                      </div>
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.image ?? undefined} alt={user.name}/>
                        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow">
                        <p className="font-semibold">{user.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {user.achievements?.length || 0} badges
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Member since {new Date(user.memberSince || '').toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{user.totalEmissions.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">kg CO2 saved</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-muted-foreground py-10">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>The leaderboard is currently empty.</p>
                <p className="text-sm">Log journeys to see how you rank!</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="streaks" className="mt-4">
            <div className="text-center text-muted-foreground py-10">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Streak leaderboard coming soon!</p>
              <p className="text-sm">Track consecutive days of eco-friendly travel.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="achievements" className="mt-4">
            <div className="text-center text-muted-foreground py-10">
              <Medal className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Achievement leaderboard coming soon!</p>
              <p className="text-sm">See who has earned the most badges.</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
