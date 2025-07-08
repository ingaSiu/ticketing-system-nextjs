import { getUserById, getUserStats } from '@/actions/user.actions';
import { notFound, redirect } from 'next/navigation';

import Link from 'next/link';
import TicketItem from '@/components/TicketItem';
import { getCurrentUser } from '@/lib/current-user';
import { getPriorityClass } from '@/utils/ui';

const UserProfilePage = async (props: { params: Promise<{ id: string }> }) => {
  const { id } = await props.params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  const [user, stats] = await Promise.all([getUserById(id), getUserStats(id)]);

  if (!user) {
    notFound();
  }

  const isOwnProfile = currentUser.id === user.id;

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link
          href="/tickets"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          ← Back to Tickets
        </Link>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-blue-600">{user.name || 'User Profile'}</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
            <div className="text-right">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}
              >
                {user.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Account Details</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Member since:</span> {new Date(user.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Last updated:</span> {new Date(user.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {stats && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Ticket Statistics</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Total Tickets:</span> {stats.totalTickets}
                  </div>
                  <div>
                    <span className="font-medium">Open:</span> {stats.statusCounts.Open || 0}
                  </div>
                  <div>
                    <span className="font-medium">Closed:</span> {stats.statusCounts.Closed || 0}
                  </div>
                  <div>
                    <span className="font-medium">In Progress:</span> {stats.statusCounts['In Progress'] || 0}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {stats && stats.totalTickets > 0 && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Priority Distribution</h2>
            <div className="flex flex-wrap gap-4">
              {Object.entries(stats.priorityCounts).map(([priority, count]) => (
                <div key={priority} className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityClass(priority)}`}>
                    {priority}
                  </span>
                  <span className="text-sm text-gray-600">({count})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">
            {isOwnProfile ? 'Your Tickets' : `${user.name || 'User'}'s Tickets`}
          </h2>

          {user.tickets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No tickets found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {user.tickets.map((ticket) => (
                <TicketItem key={ticket.id} ticket={ticket} showUser={false} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
