import { auth } from '@/auth';
import { notFound, redirect } from 'next/navigation';
import { getTeamDashboardData, getAuthenticatedUserData } from '@/app/actions';
import { TeamDashboard } from '@/components/team/team-dashboard';

export default async function TeamPage({ params }: { params: { teamId: string } }) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  
  const teamData = await getTeamDashboardData(params.teamId);

  if (!teamData) {
    notFound();
  }

  return (
    <div className="container py-12">
        <TeamDashboard team={teamData} />
    </div>
  );
}
