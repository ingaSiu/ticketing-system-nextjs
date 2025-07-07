import bcrypt from 'bcryptjs';
import { getCurrentUser } from '@/lib/current-user';
import { logEvent } from '@/utils/sentry';
import { prisma } from '@/db/prisma';
import { revalidatePath } from 'next/cache';

type ResponseResult = {
  success: boolean;
  message: string;
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
