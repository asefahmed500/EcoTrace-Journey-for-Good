import { notFound } from 'next/navigation';
import { getPublicUserData } from '@/app/actions';
import { UserProfilePage } from '@/components/profile/user-profile-page';

export default async function ProfilePage({ params }: { params: { userId: string } }) {
  const userData = await getPublicUserData(params.userId);

  if (!userData) {
    notFound();
  }

  return (
    <div className="container py-12">
        <UserProfilePage user={userData} />
    </div>
  );
}
