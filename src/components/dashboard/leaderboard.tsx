
"use client";

import type { LeaderboardUser } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface LeaderboardProps {
    leaderboard: LeaderboardUser[];
}

export function Leaderboard({ leaderboard }: LeaderboardProps) {

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-400";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-orange-400";
    return "text-muted-foreground";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
        <CardDescription>Top 10 users with the lowest carbon footprint. Click to view profile.</CardDescription>
      </CardHeader>
      <CardContent>
        {leaderboard.length > 0 ? (
          <ul className="space-y-1">
            {leaderboard.map((user) => (
              <li key={user.id}>
                <Link href={`/profile/${user.id}`} className="flex items-center gap-4 p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <div className={cn("flex items-center justify-center font-bold text-lg w-8", getRankColor(user.rank))}>
                    {user.rank <= 3 ? <Trophy className="size-6 fill-current" /> : user.rank}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.image ?? undefined} alt={user.name}/>
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <p className="font-semibold">{user.name}</p>
                  </div>
                  <div className="font-mono text-right">
                    <p className="font-bold">{user.totalEmissions.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">kg CO2</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-muted-foreground py-10">
            <p>The leaderboard is currently empty.</p>
            <p className="text-sm">Log journeys to see how you rank!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
