import type { Team } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Leaf, BarChart } from 'lucide-react';
import { Leaderboard } from '@/components/dashboard/leaderboard';
import Image from 'next/image';

interface TeamDashboardProps {
  team: Team;
}

export function TeamDashboard({ team }: TeamDashboardProps) {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="p-0 relative">
          <div className="h-48 w-full">
            <Image
              src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1200&auto=format&fit=crop"
              alt="Team banner"
              fill
              className="rounded-t-lg object-cover"
              data-ai-hint="diverse people collaborating"
              priority
            />
             <div className="absolute inset-0 bg-black/50 rounded-t-lg" />
           </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-primary-foreground p-4">
                <h1 className="text-4xl md:text-5xl font-bold [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)]">{team.name}</h1>
                <p className="text-lg md:text-xl mt-2 [text-shadow:1px_1px_2px_rgba(0,0,0,0.5)]">A summary of your team's collective environmental impact.</p>
            </div>
        </CardHeader>
        <CardContent className="pt-6">
           <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-card-foreground/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{team.memberCount}</div>
                <p className="text-xs text-muted-foreground">Active members in your team</p>
              </CardContent>
            </Card>
            <Card className="bg-card-foreground/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team's Total CO2 Footprint</CardTitle>
                <Leaf className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{team.totalEmissions.toFixed(2)} kg</div>
                <p className="text-xs text-muted-foreground">Cumulative emissions from all members</p>
              </CardContent>
            </Card>
            <Card className="bg-card-foreground/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Emissions / Member</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                    {team.memberCount > 0 ? (team.totalEmissions / team.memberCount).toFixed(2) : '0.00'} kg
                </div>
                <p className="text-xs text-muted-foreground">Average footprint per team member</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Leaderboard leaderboard={team.leaderboard} />
    </div>
  );
}