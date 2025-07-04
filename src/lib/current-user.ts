import { getAuthCookie, verifyAuthToken } from './auth';

import { prisma } from '@/db/prisma';

type AuthPayload = {
  userId: string;
  role?: 'USER' | 'ADMIN';
};

export async function getCurrentUser() {
  try {
    const token = await getAuthCookie();

    if (!token) return null;

    const payload = (await verifyAuthToken(token)) as AuthPayload;

    if (!payload?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) return null;
    const finalUser = {
      ...user,
      role: payload.role || user.role,
    };

    return finalUser;
  } catch (error) {
    console.log('Error getting current user', error);
    return null;
  }
}
