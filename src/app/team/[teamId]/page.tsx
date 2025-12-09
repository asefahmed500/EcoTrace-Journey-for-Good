import { getAuthSession } from '@/lib/auth-wrapper';
import { notFound, redirect } from 'next/navigation';
import { getTeamDashboardData, getAuthenticatedUserData } from '@/app/actions';
import { TeamDashboard } from '@/components/team/team-dashboard';

export default async function TeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const session = await getAuthSession();
  if (!session?.user) {
    redirect('/login');
  }
  
  const { teamId } = await params;
  const teamData = await getTeamDashboardData(teamId);

  if (!teamData) {
    notFound();
  }

  return (
    <div className="container py-12">
        <TeamDashboard team={teamData} />
    </div>
  );
}
