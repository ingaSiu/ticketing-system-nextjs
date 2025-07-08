/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import bcrypt from 'bcryptjs';
import { getCurrentUser } from '@/lib/current-user';
import { logEvent } from '@/utils/sentry';
import { prisma } from '@/db/prisma';
import { revalidatePath } from 'next/cache';

type ResponseResult = {
  success: boolean;
  message: string;
};

export const getUserById = async (userId: string) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      logEvent('Unauthorized access to user details', 'user', { userId }, 'warning');
      return null;
    }

    // Only allow users to view their own profile or admins to view any profile
    if (currentUser.id !== userId && currentUser.role !== 'ADMIN') {
      logEvent('Unauthorized access to user profile', 'user', { userId, currentUserId: currentUser.id }, 'warning');
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tickets: {
          orderBy: { createdAt: 'desc' },
          take: 50, // Limit to recent 50 tickets
        },
      },
    });

    if (!user) {
      logEvent('User not found', 'user', { userId }, 'warning');
      return null;
    }

    // Don't return password
    const { password, ...userWithoutPassword } = user;

    logEvent('User profile accessed', 'user', { userId, ticketCount: user.tickets.length }, 'info');

    return userWithoutPassword;
  } catch (error) {
    logEvent('Error fetching user details', 'user', { userId }, 'error', error);
    return null;
  }
};

export const getUserStats = async (userId: string) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return null;
    }

    if (currentUser.id !== userId && currentUser.role !== 'ADMIN') {
      return null;
    }

    const stats = await prisma.ticket.groupBy({
      by: ['status', 'priority'],
      where: { userId },
      _count: {
        id: true,
      },
    });

    const totalTickets = await prisma.ticket.count({
      where: { userId },
    });

    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat.status] = (acc[stat.status] || 0) + stat._count.id;
      return acc;
    }, {} as Record<string, number>);

    const priorityCounts = stats.reduce((acc, stat) => {
      acc[stat.priority] = (acc[stat.priority] || 0) + stat._count.id;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalTickets,
      statusCounts,
      priorityCounts,
    };
  } catch (error) {
    logEvent('Error fetching user stats', 'user', { userId }, 'error', error);
    return null;
  }
};

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

export async function updateUserProfile(prevState: ResponseResult, formData: FormData): Promise<ResponseResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: 'Unauthorized' };
  }
  const name = formData.get('name') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (password && password !== confirmPassword) {
    return { success: false, message: 'Passwords do not match' };
  }

  const isNameChanged = name && name !== user.name;
  const isPasswordChanged = password.length > 0;

  if (!isNameChanged && !isPasswordChanged) {
    return { success: false, message: 'No changes to update' };
  }

  const updateData: { name?: string; password?: string } = {};

  if (isNameChanged) updateData.name = name;
  if (isPasswordChanged) updateData.password = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });

  revalidatePath('/profile');
  return { success: true, message: 'Profile updated successfully' };
}
