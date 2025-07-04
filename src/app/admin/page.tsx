import TicketFilters from '@/components/TicketFilters';
import { TicketFilters as TicketFiltersType } from '@/types/ticket';
import TicketItem from '@/components/TicketItem';
import { getCurrentUser } from '@/lib/current-user';
import { getTickets } from '@/actions/ticket.actions';
import { redirect } from 'next/navigation';

type DashboardPageProps = {
  searchParams: {
    priority?: string;
    status?: string;
    userId?: string;
    search?: string;
  };
};

const DashboardPage = async ({ searchParams }: DashboardPageProps) => {
  const user = await getCurrentUser();

  if (!user || user.role !== 'ADMIN') {
    redirect('/login');
  }
  const params = await searchParams;

  const filters: TicketFiltersType = {};
  if (params.priority) filters.priority = params.priority;
  if (params.status) filters.status = params.status;
  if (params.search) filters.search = params.search;

  const tickets = await getTickets(filters);
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard - Tickets</h1>

      <TicketFilters />

      <div className="mb-4 text-sm text-gray-600">
        Showing {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No tickets found matching the current filters.</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl mx-auto">
          {tickets.map((ticket) => (
            <TicketItem key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
