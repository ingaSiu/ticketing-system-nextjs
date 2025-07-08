import Link from 'next/link';
import type { Ticket } from '@/generated/prisma';
import { getPriorityClass } from '@/utils/ui';

type TicketItemProps = {
  ticket: Ticket & {
    user?: {
      id: string;
      name: string | null;
      email: string;
    };
  };
  showUser?: boolean;
};
const TicketItem = ({ ticket, showUser = true }: TicketItemProps) => {
  const isClosed = ticket.status === 'Closed';
  return (
    <div
      key={ticket.id}
      className={`flex justify-between items-center bg-white rounded-lg shadow border border-gray-200 p-6 ${
        isClosed ? 'opacity-50' : ''
      }`}
    >
      <div>
        <h2 className="text-xl font-semibold text-blue-600">{ticket.subject}</h2>

        {showUser && ticket.user && (
          <div className="mt-2 text-sm text-gray-600">
            <span>Created by: </span>
            <Link
              href={`/users/${ticket.user.id}`}
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
            >
              {ticket.user.name || ticket.user.email}
            </Link>
          </div>
        )}

        <div className="mt-2 text-sm text-gray-500">
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
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
      </div>

      <div className="text-right space-y-2">
        <div className="text-sm text-gray-500">
          Priority: <span className={getPriorityClass(ticket.priority)}>{ticket.priority}</span>
        </div>

        <div className="text-xs text-gray-400">{new Date(ticket.createdAt).toLocaleDateString()}</div>

        <Link
          href={`/tickets/${ticket.id}`}
          className={`inline-block mt-2  text-sm px-3 py-1 rounded  transition text-center ${
            isClosed
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed pointer-events-none'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          View Ticket
        </Link>
      </div>
    </div>
  );
};

export default TicketItem;
