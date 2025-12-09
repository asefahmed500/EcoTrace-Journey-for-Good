"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// Progress component removed - using custom progress bars
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy, Users, Target, Calendar, Zap, Star, Crown, Medal, 
  Car, Bus, Bike, Footprints, Leaf, MessageSquare, Share2,
  TrendingUp, Award, Gift, Clock, CheckCircle, Play, Globe, MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Journey, Achievement, LeaderboardUser } from '@/lib/types';
import { ecoChallenges, type EcoChallenge } from '@/lib/achievements';
import { DynamicIcon } from '@/components/icons/dynamic-icon';

interface CommunityGamificationProps {
  journeys: Journey[];
  achievements: Achievement[];
  leaderboard: LeaderboardUser[];
  userStats: {
    totalPoints: number;
    rank: number;
    level: number;
    streaks: Record<string, number>;
  };
}

interface ActiveChallenge {
  challenge: EcoChallenge;
  startDate: Date;
  progress: number;
  completed: boolean;
  daysRemaining: number;
}

interface ImpactStory {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  title: string;
  content: string;
  emissions_saved: number;
  likes: number;
  comments: number;
  createdAt: Date;
  tags: string[];
}

export function CommunityGamification({ 
  journeys, 
  achievements, 
  leaderboard, 
  userStats 
}: CommunityGamificationProps) {
  const [activeChallenges, setActiveChallenges] = useState<ActiveChallenge[]>([]);
  const [availableChallenges, setAvailableChallenges] = useState<EcoChallenge[]>(ecoChallenges);
  const [impactStories, setImpactStories] = useState<ImpactStory[]>([]);
  const [selectedLeaderboardType, setSelectedLeaderboardType] = useState<'global' | 'friends' | 'neighborhood'>('global');
  const { toast } = useToast();

  // Calculate user level based on points
  const getUserLevel = (points: number) => {
    if (points < 100) return { level: 1, nextLevel: 100, title: 'Eco Newbie' };
    if (points < 300) return { level: 2, nextLevel: 300, title: 'Green Starter' };
    if (points < 600) return { level: 3, nextLevel: 600, title: 'Eco Explorer' };
    if (points < 1000) return { level: 4, nextLevel: 1000, title: 'Carbon Conscious' };
    if (points < 1500) return { level: 5, nextLevel: 1500, title: 'Sustainability Star' };
    if (points < 2500) return { level: 6, nextLevel: 2500, title: 'Eco Champion' };
    if (points < 4000) return { level: 7, nextLevel: 4000, title: 'Green Guardian' };
    if (points < 6000) return { level: 8, nextLevel: 6000, title: 'Climate Hero' };
    if (points < 10000) return { level: 9, nextLevel: 10000, title: 'Eco Legend' };
    return { level: 10, nextLevel: 10000, title: 'Planet Protector' };
  };

  const levelInfo = getUserLevel(userStats.totalPoints);
  const progressToNext = userStats.totalPoints >= levelInfo.nextLevel ? 100 : 
    ((userStats.totalPoints % (levelInfo.nextLevel / levelInfo.level)) / (levelInfo.nextLevel / levelInfo.level)) * 100;

  // Start a new challenge
  const startChallenge = async (challengeId: string) => {
    const challenge = availableChallenges.find(c => c.id === challengeId);
    if (!challenge) return;

    const startDate = new Date();
    const result = challenge.condition(journeys as any, startDate);
    
    const newActiveChallenge: ActiveChallenge = {
      challenge,
      startDate,
      progress: result.progress,
      completed: result.completed,
      daysRemaining: challenge.duration
    };

    setActiveChallenges(prev => [...prev, newActiveChallenge]);
    setAvailableChallenges(prev => prev.filter(c => c.id !== challengeId));
    
    toast({
      title: "Challenge Started! 🎯",
      description: `You've joined the ${challenge.name}. Good luck!`,
    });
  };

  // Get achievement rarity color
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Mock impact stories (in real app, these would come from API)
  useEffect(() => {
    const mockStories: ImpactStory[] = [
      {
        id: '1',
        userId: 'user1',
        userName: 'Sarah Chen',
        userImage: 'https://placehold.co/40x40',
        title: 'My Car-Free Month Journey',
        content: 'Completed my first car-free month challenge! Discovered amazing bike routes and saved 45kg of CO2. The city looks so different when you slow down and really see it.',
        emissions_saved: 45.2,
        likes: 23,
        comments: 8,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        tags: ['cycling', 'car-free', 'urban-exploration']
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Mike Rodriguez',
        userImage: 'https://placehold.co/40x40',
        title: 'Public Transit Adventures',
        content: 'Week 3 of my public transit challenge. Met interesting people, read 2 books, and my stress levels are way down. Who knew commuting could be relaxing?',
        emissions_saved: 28.7,
        likes: 15,
        comments: 5,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        tags: ['public-transit', 'mindfulness', 'community']
      },
      {
        id: '3',
        userId: 'user3',
        userName: 'Emma Thompson',
        userImage: 'https://placehold.co/40x40',
        title: 'Walking Changed My Life',
        content: 'Started walking to work 6 months ago. Lost 15 pounds, saved $200/month on gas, and discovered a local coffee shop that makes the best lattes in town!',
        emissions_saved: 156.3,
        likes: 42,
        comments: 12,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        tags: ['walking', 'health', 'local-business', 'savings']
      }
    ];
    setImpactStories(mockStories);
  }, []);

  return (
    <div className="space-y-6">
      {/* User Level & Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Level {levelInfo.level} - {levelInfo.title}
                  <Badge variant="secondary">{userStats.totalPoints} pts</Badge>
                </CardTitle>
                <CardDescription>Rank #{userStats.rank} globally</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{userStats.totalPoints}</div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {levelInfo.level + 1}</span>
              <span>{userStats.totalPoints}/{levelInfo.nextLevel}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-primary h-3 rounded-full transition-all" 
                style={{ width: `${progressToNext}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="challenges" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="leaderboards" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Leaderboards
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="stories" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Stories
          </TabsTrigger>
        </TabsList>

        {/* Eco-Challenges Tab */}
        <TabsContent value="challenges" className="space-y-6">
          {/* Active Challenges */}
          {activeChallenges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-green-600" />
                  Active Challenges
                </CardTitle>
                <CardDescription>Your ongoing eco-challenges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {activeChallenges.map((activeChallenge, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-green-50/50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <DynamicIcon name={activeChallenge.challenge.icon} className="h-6 w-6 text-green-600" />
                          <div>
                            <h3 className="font-semibold">{activeChallenge.challenge.name}</h3>
                            <p className="text-sm text-muted-foreground">{activeChallenge.challenge.description}</p>
                          </div>
                        </div>
                        {activeChallenge.completed && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed!
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress: {activeChallenge.progress}/{activeChallenge.challenge.target}</span>
                          <span>{activeChallenge.daysRemaining} days remaining</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all" 
                            style={{ width: `${(activeChallenge.progress / activeChallenge.challenge.target) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <Gift className="h-4 w-4" />
                        Reward: {activeChallenge.challenge.reward.points} points + &ldquo;{activeChallenge.challenge.reward.badge}&rdquo; badge
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Available Challenges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Available Challenges
              </CardTitle>
              <CardDescription>Join eco-challenges to earn points and badges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {availableChallenges.map((challenge) => (
                  <div key={challenge.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <DynamicIcon name={challenge.icon} className="h-6 w-6 text-primary" />
                        <div>
                          <h3 className="font-semibold">{challenge.name}</h3>
                          <p className="text-sm text-muted-foreground">{challenge.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {challenge.duration} days
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          {challenge.target} {challenge.type.replace('-', ' ')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Gift className="h-4 w-4" />
                        {challenge.reward.points} points + &ldquo;{challenge.reward.badge}&rdquo; badge
                      </div>
                      <Button 
                        onClick={() => startChallenge(challenge.id)}
                        className="w-full"
                        size="sm"
                      >
                        Start Challenge
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Leaderboards Tab */}
        <TabsContent value="leaderboards" className="space-y-6">
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
                    variant={selectedLeaderboardType === 'global' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedLeaderboardType('global')}
                  >
                    <Globe className="h-4 w-4 mr-1" />
                    Global
                  </Button>
                  <Button 
                    variant={selectedLeaderboardType === 'friends' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedLeaderboardType('friends')}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Friends
                  </Button>
                  <Button 
                    variant={selectedLeaderboardType === 'neighborhood' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedLeaderboardType('neighborhood')}
                  >
                    <MapPin className="h-4 w-4 mr-1" />
                    Local
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.slice(0, 10).map((user, index) => (
                  <div key={user.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-center w-8 h-8">
                      {index < 3 ? (
                        <Trophy className={cn(
                          "h-6 w-6",
                          index === 0 && "text-yellow-500",
                          index === 1 && "text-gray-400",
                          index === 2 && "text-orange-400"
                        )} />
                      ) : (
                        <span className="font-bold text-muted-foreground">#{index + 1}</span>
                      )}
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.image ?? undefined} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <p className="font-semibold">{user.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">
                          {user.achievements?.length || 0} badges
                        </Badge>
                        <span>Member since {new Date(user.memberSince || '').toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{user.totalEmissions.toFixed(2)} kg</div>
                      <div className="text-sm text-muted-foreground">CO2 saved</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Achievement Gallery
              </CardTitle>
              <CardDescription>
                Your sustainable travel milestones - {achievements.length} badges earned
              </CardDescription>
            </CardHeader>
            <CardContent>
              {achievements.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.name} className="group relative">
                      <div className="flex flex-col items-center justify-center gap-2 p-4 border rounded-lg bg-card-foreground/5 aspect-square transition-all hover:bg-card-foreground/10 hover:shadow-md">
                        <DynamicIcon name={achievement.icon} className="size-12 text-primary group-hover:scale-110 transition-transform" />
                        <p className="text-sm font-semibold text-center truncate w-full">{achievement.name}</p>
                        <Badge variant="secondary" className="text-xs">
                          {new Date(achievement.date).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-10">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Your achievements will appear here as you log journeys.</p>
                  <p className="text-sm">Keep up the great work!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Impact Stories Tab */}
        <TabsContent value="stories" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Impact Stories
                  </CardTitle>
                  <CardDescription>Share your carbon reduction journey with the community</CardDescription>
                </div>
                <Button>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Your Story
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {impactStories.map((story) => (
                  <div key={story.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={story.userImage} alt={story.userName} />
                        <AvatarFallback>{story.userName.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{story.userName}</h3>
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                            {story.emissions_saved.toFixed(1)} kg CO2 saved
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {story.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <h4 className="font-semibold mb-2">{story.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{story.content}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                          <Star className="h-4 w-4" />
                          {story.likes}
                        </button>
                        <button className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                          <MessageSquare className="h-4 w-4" />
                          {story.comments}
                        </button>
                      </div>
                      <div className="flex gap-1 ml-auto">
                        {story.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}