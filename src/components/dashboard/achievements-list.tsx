"use client";

import type { Achievement } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DynamicIcon } from "@/components/icons/dynamic-icon";
// Using title attribute instead of Tooltip component

interface AchievementsListProps {
  achievements: Achievement[];
}

export function AchievementsList({ achievements }: AchievementsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Achievements</CardTitle>
        <CardDescription>Badges you&apos;ve earned on your eco-journey.</CardDescription>
      </CardHeader>
      <CardContent>
        {achievements.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {achievements.map((achievement) => (
              <div 
                key={achievement.name}
                className="flex flex-col items-center justify-center gap-2 p-4 border rounded-lg bg-card-foreground/5 aspect-square transition-all hover:bg-card-foreground/10"
                title={`${achievement.name}: ${achievement.description} - Earned on ${new Date(achievement.date).toLocaleDateString()}`}
              >
                <DynamicIcon name={achievement.icon} className="size-12 text-primary" />
                <p className="text-sm font-semibold text-center truncate w-full">{achievement.name}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-10">
            <p>Your achievements will appear here as you log journeys.</p>
            <p className="text-sm">Keep up the great work!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
