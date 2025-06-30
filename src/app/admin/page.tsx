import TicketItem from '@/components/TicketItem';
import { getCurrentUser } from '@/lib/current-user';
import { getTickets } from '@/actions/ticket.actions';
import { redirect } from 'next/navigation';

const DashboardPage = async () => {
  const user = await getCurrentUser();
  const tickets = await getTickets();

  if (!user || user.role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <>
      <div className="space-y-4 max-w-2xl mx-auto mt-6 ">
        {tickets.map((ticket) => (
          <TicketItem key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </>
  );
};

export default DashboardPage;
