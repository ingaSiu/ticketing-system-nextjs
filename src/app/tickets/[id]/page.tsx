import CloseTicketButton from '@/components/CloseTicketButton';
import CommentForm from './comment-form';
import CommentList from '@/components/CommentList';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/current-user';
import { getPriorityClass } from '@/utils/ui';
import { getTicketById } from '@/actions/ticket.actions';
import { logEvent } from '@/utils/sentry';
import { notFound } from 'next/navigation';

const TicketDetailsPage = async (props: { params: Promise<{ id: string }> }) => {
  const { id } = await props.params;
  const ticket = await getTicketById(id);
  const user = await getCurrentUser();

  if (!ticket) {
    notFound();
  }

  const isAdmin = user?.role === 'ADMIN';
  const shouldShowButton = isAdmin && ticket.status !== 'Closed';

  logEvent('Viewing ticket details', 'ticket', { ticketId: ticket.id }, 'info');
  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow border border-gray-200 p-8 space-y-6">
        <h1 className="text-3xl font-bold text-blue-600">{ticket.subject}</h1>

        <div className="text-gray-700">
          <h2 className="text-lg font-semibold mb-2">Description</h2>
          <p>{ticket.description}</p>
        </div>

        <div className="text-gray-700">
          <h2 className="text-lg font-semibold mb-2">Created by</h2>
          {ticket.user ? (
            <Link
              href={`/users/${ticket.user.id}`}
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
            >
              {ticket.user.name || ticket.user.email}
            </Link>
          ) : (
            <p className="text-gray-500">Unknown user</p>
          )}
        </div>

        <div className="text-gray-700">
          <h2 className="text-lg font-semibold mb-2">Status</h2>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              ticket.status === 'Open'
                ? 'bg-green-100 text-green-800'
                : ticket.status === 'Closed'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {ticket.status}
          </span>
        </div>

        <div className="text-gray-700">
          <h2 className="text-lg font-semibold mb-2">Priority</h2>
          <p className={getPriorityClass(ticket.priority)}>{ticket.priority}</p>
        </div>

        <div className="text-gray-700">
          <h2 className="text-lg font-semibold mb-2">Created At</h2>
          <p>{new Date(ticket.createdAt).toLocaleString()}</p>
        </div>

        {ticket.updatedAt !== ticket.createdAt && (
          <div className="text-gray-700">
            <h2 className="text-lg font-semibold mb-2">Last Updated</h2>
            <p>{new Date(ticket.updatedAt).toLocaleString()}</p>
          </div>
        )}

        <Link
          href="/tickets"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          ← Back to Tickets
        </Link>

        {shouldShowButton && <CloseTicketButton ticketId={ticket.id} isClosed={ticket.status === 'Closed'} />}

        <div className="bg-white rounded-lg shadow border border-gray-200 p-8 space-y-6">
          <CommentList comments={ticket.comments} />

          {isAdmin && <CommentForm ticketId={ticket.id.toString()} />}
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsPage;
