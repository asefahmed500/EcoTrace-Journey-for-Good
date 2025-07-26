
import { auth } from '@/auth';
import { getJourneys, getAuthenticatedUserData, getLeaderboard } from '@/app/actions';
import { MainDashboard } from '@/components/dashboard/main-dashboard';
import { redirect } from 'next/navigation';


export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const journeys = await getJourneys();
  const { preferences, achievements, team } = await getAuthenticatedUserData();
  const leaderboard = await getLeaderboard();

  return (
    <MainDashboard 
      journeys={journeys} 
      preferences={preferences} 
      achievements={achievements} 
      leaderboard={leaderboard}
      team={team}
    />
  );
}
