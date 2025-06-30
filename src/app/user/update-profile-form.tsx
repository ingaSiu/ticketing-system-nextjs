'use client';

import { useActionState, useEffect } from 'react';

import { toast } from 'sonner';
import { updateUserProfile } from '@/actions/auth.actions';
import { useRouter } from 'next/navigation';

const UpdateProfileForm = ({ user }: { user: { name?: string | null; email: string } }) => {
  const router = useRouter();

  const initialState = {
    success: false,
    message: '',
  };

  const [state, formAction] = useActionState(updateUserProfile, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success('Profile update successful!');
      router.refresh();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8 border border-gray-200">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Update profile</h1>

        <form action={formAction} className="space-y-4 text-gray-700">
          <input
            className="w-full border border-gray-200 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="text"
            name="name"
            autoComplete="name"
            defaultValue={user.name ?? ''}
          />

          <input
            className="w-full border border-gray-200 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="email"
            name="email"
            value={user.email}
            autoComplete="email"
            readOnly
          />

          <input
            className="w-full border border-gray-200 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="password"
            name="password"
            placeholder="Password"
            autoComplete="new-password"
          />

          <input
            className="w-full border border-gray-200 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            autoComplete="confirm-password"
          />

          <button
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition disabled:opacity-50"
            type="submit"
          >
            Update
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfileForm;
