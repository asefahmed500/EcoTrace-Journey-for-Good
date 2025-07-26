"use client";

import type { Achievement } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DynamicIcon } from "@/components/icons/dynamic-icon";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AchievementsListProps {
  achievements: Achievement[];
}

export function AchievementsList({ achievements }: AchievementsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Achievements</CardTitle>
        <CardDescription>Badges you've earned on your eco-journey.</CardDescription>
      </CardHeader>
      <CardContent>
        {achievements.length > 0 ? (
          <TooltipProvider>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {achievements.map((achievement) => (
                <Tooltip key={achievement.name}>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center justify-center gap-2 p-4 border rounded-lg bg-card-foreground/5 aspect-square transition-all hover:bg-card-foreground/10">
                      <DynamicIcon name={achievement.icon} className="size-12 text-primary" />
                      <p className="text-sm font-semibold text-center truncate w-full">{achievement.name}</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[200px]">
                    <p className="font-bold">{achievement.name}</p>
                    <p className="text-muted-foreground">{achievement.description}</p>
                    <p className="text-xs text-muted-foreground/80 mt-2">Earned on {new Date(achievement.date).toLocaleDateString()}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
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
