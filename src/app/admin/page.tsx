import { getCurrentUser } from '@/lib/current-user';
import { redirect } from 'next/navigation';

const DashboardPage = async () => {
  const user = await getCurrentUser();

  if (!user || user.role !== 'ADMIN') {
    redirect('/login');
  }

  return <div>DashboardPage</div>;
};

export default DashboardPage;
