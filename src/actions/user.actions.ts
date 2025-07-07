import { getCurrentUser } from '@/lib/current-user';
import { logEvent } from '@/utils/sentry';
import { prisma } from '@/db/prisma';

export const getAllUsers = async () => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== 'ADMIN') {
      logEvent('Unauthorized access to user list', 'user', {}, 'warning');
      return [];
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    logEvent('Fetched user list for filtering', 'user', { count: users.length }, 'info');

    return users;
  } catch (error) {
    logEvent('Error fetching users for filtering', 'user', {}, 'error', error);
    return [];
  }
};
