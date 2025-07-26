import type { PublicUserProfile } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AchievementsList } from '@/components/dashboard/achievements-list';
import { Leaf, Calendar, Trophy } from 'lucide-react';
import Image from 'next/image';

interface UserProfilePageProps {
  user: PublicUserProfile;
}

export function UserProfilePage({ user }: UserProfilePageProps) {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="p-0 relative">
          <div className="h-32 md:h-48 w-full">
            <Image
              src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop"
              alt="User profile banner"
              fill
              className="rounded-t-lg object-cover"
              data-ai-hint="green forest canopy"
              priority
            />
            <div className="absolute inset-0 bg-black/50 rounded-t-lg" />
          </div>
          <div className="absolute -bottom-12 left-6">
              <Avatar className="h-24 w-24 border-4 border-background bg-background">
                  <AvatarImage src={user.image ?? undefined} alt={user.name} data-ai-hint="person face" />
                  <AvatarFallback className="text-4xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
          </div>
          <div className="pt-14 px-6 pb-4">
            <CardTitle className="text-3xl md:text-4xl font-bold [text-shadow:1px_1px_2px_rgba(0,0,0,0.1)]">{user.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2 text-muted-foreground">
                <Calendar className="size-4" /> Member since {new Date(user.memberSince).toLocaleDateString()}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
            <div className="grid gap-4 md:grid-cols-2 mt-4">
                 <Card className="bg-card-foreground/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total CO2 Footprint</CardTitle>
                        <Leaf className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{user.totalEmissions.toFixed(2)} kg</div>
                        <p className="text-xs text-muted-foreground">Cumulative emissions from all logged journeys</p>
                    </CardContent>
                </Card>
                 <Card className="bg-card-foreground/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Achievements Unlocked</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{user.achievements.length}</div>
                        <p className="text-xs text-muted-foreground">Total badges earned</p>
                    </CardContent>
                </Card>
            </div>
        </CardContent>
      </Card>

      <AchievementsList achievements={user.achievements} />
    </div>
  )
}
