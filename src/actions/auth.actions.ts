'use server';

import { removeAuthCookie, setAuthCookie, signAuthToken } from '@/lib/auth';

import bcrypt from 'bcryptjs';
import { logEvent } from '@/utils/sentry';
import { prisma } from '@/db/prisma';

type ResponseResult = {
  success: boolean;
  message: string;
};

// Register new user

export async function registerUser(prevState: ResponseResult, formData: FormData): Promise<ResponseResult> {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !password) {
      logEvent('Validation error: Missing register fields', 'auth', { name, email }, 'warning');

      return { success: false, message: 'All fields are required' };
    }

    // Check if user exists

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      logEvent(`Registration failed: User already exists - ${email}`, 'auth', { email }, 'warning');
      return { success: false, message: 'User already exists' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const isAdmin = email === process.env.ADMIN_EMAIL;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: isAdmin ? 'ADMIN' : 'USER',
      },
    });

    // Sign and set auth token

    const token = await signAuthToken({ userId: user.id, role: user.role });
    await setAuthCookie(token);

    logEvent(`User registered succcessfully: ${email}`, 'auth', { userId: user.id, email }, 'info');

    return { success: true, message: 'Registration' };
  } catch (error) {
    logEvent('Unexpected error during registration', 'auth', {}, 'error', error);

    return {
      success: false,
      message: 'Something went wrong, please try again',
    };
  }
}

// Log user out and remove auth cookie

export async function logoutUser(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    await removeAuthCookie();

    logEvent('User logged out successfully', 'auth', {}, 'info');

    return { success: true, message: 'Logout successfull' };
  } catch (error) {
    logEvent('Unexpected error during logout', 'auth', {}, 'error', error);
    return { success: false, message: 'Logout failed. Please try again.' };
  }
}

// Log user in

export async function loginUser(prevState: ResponseResult, formData: FormData): Promise<ResponseResult> {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      logEvent('Validation error: Missing login fields', 'auth', { email }, 'warning');
      return { success: false, message: 'Email and password are required' };
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      logEvent(`Login Failed: User not found - ${email}`, 'auth', { email }, 'warning');
      return { success: false, message: 'Invalid email or password' };
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      logEvent('Login Failed: Incorrect password', 'auth', { email }, 'warning');
      return { success: false, message: 'Invalid email or password' };
    }

    const token = await signAuthToken({ userId: user.id, role: user.role });
    await setAuthCookie(token);

    return { success: true, message: 'Login successful' };
  } catch (error) {
    logEvent('Unexpected error during login', 'auth', {}, 'error', error);
    return { success: false, message: 'Error during log in' };
  }
}
