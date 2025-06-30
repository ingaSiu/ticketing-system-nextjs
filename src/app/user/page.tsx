import UpdateProfileForm from './update-profile-form';
import { getCurrentUser } from '@/lib/current-user';
import { redirect } from 'next/navigation';

const UserPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }
  return (
    <>
      <UpdateProfileForm user={user} />
    </>
  );
};

export default UserPage;
