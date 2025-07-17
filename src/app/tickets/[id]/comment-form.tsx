'use client';

import { createComment } from '@/actions/comment.actions';
import { useActionState } from 'react';
import { useRef } from 'react';

type CommentFormProps = {
  ticketId: string;
};

const CommentForm = ({ ticketId }: CommentFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(createComment, {
    success: false,
    message: '',
  });

  if (state.success && formRef.current) {
    formRef.current.reset();
  }

  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <h3 className="text-lg font-semibold text-blue-800 mb-3">Add Admin Comment</h3>

      <form ref={formRef} action={formAction} className="space-y-4">
        <input type="hidden" name="ticketId" value={ticketId} />

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Comment
          </label>
          <textarea
            id="content"
            name="content"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add your comment here..."
            required
          />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          Add Comment
        </button>
      </form>

      {state.message && (
        <div
          className={`mt-4 p-3 rounded-md ${
            state.success
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}
        >
          {state.message}
        </div>
      )}
    </div>
  );
};

export default CommentForm;
