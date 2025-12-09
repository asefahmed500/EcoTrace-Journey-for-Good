
import { getServerSession } from '@/lib/session';
import { getJourneys, getAuthenticatedUserData, getLeaderboard } from '@/app/actions';
import { MainDashboard } from '@/components/dashboard/main-dashboard';
import { DashboardErrorBoundary } from '@/components/dashboard/dashboard-error-boundary';
import { DashboardErrorRecovery } from '@/components/dashboard/dashboard-error-recovery';
import { redirect } from 'next/navigation';


export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard');
  }

  try {
    const [journeys, userData, leaderboard] = await Promise.all([
      getJourneys(),
      getAuthenticatedUserData(),
      getLeaderboard()
    ]);

    const { preferences, achievements, team } = userData;

    return (
      <DashboardErrorRecovery>
        <DashboardErrorBoundary>
          <MainDashboard 
            journeys={journeys} 
            preferences={preferences} 
            achievements={achievements} 
            leaderboard={leaderboard}
            team={team}
          />
        </DashboardErrorBoundary>
      </DashboardErrorRecovery>
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    redirect('/login?error=dashboard_error');
  }
}
