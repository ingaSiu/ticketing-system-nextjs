'use server';

import { getCurrentUser } from '@/lib/current-user';
import { logEvent } from '@/utils/sentry';
import { prisma } from '@/db/prisma';
import { revalidatePath } from 'next/cache';

export const createComment = async (
  prevState: { success: boolean; message: string },
  formData: FormData,
): Promise<{ success: boolean; message: string }> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      logEvent('Unauthorized comment creation attempt', 'comment', {}, 'warning');
      return {
        success: false,
        message: 'You must be logged in to create a comment',
      };
    }

    if (user.role !== 'ADMIN') {
      logEvent('Non-admin comment creation attempt', 'comment', { userId: user.id }, 'warning');
      return {
        success: false,
        message: 'Only administrators can create comments',
      };
    }

    const content = formData.get('content') as string;
    const ticketId = formData.get('ticketId') as string;

    if (!content || !ticketId) {
      logEvent('Validation Error: Missing comment fields', 'comment', { content, ticketId }, 'warning');
      return { success: false, message: 'Content and ticket ID are required' };
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: Number(ticketId) },
    });

    if (!ticket) {
      logEvent('Comment creation failed: Ticket not found', 'comment', { ticketId }, 'warning');
      return { success: false, message: 'Ticket not found' };
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        ticketId: Number(ticketId),
        userId: user.id,
      },
    });

    logEvent(`Comment created successfully: ${comment.id}`, 'comment', { commentId: comment.id, ticketId }, 'info');

    revalidatePath(`/tickets/${ticketId}`);

    return { success: true, message: 'Comment added successfully' };
  } catch (error) {
    logEvent(
      'An error occurred while creating the comment',
      'comment',
      {
        formData: Object.fromEntries(formData.entries()),
      },
      'error',
      error,
    );
    return {
      success: false,
      message: 'An error occurred while creating the comment',
    };
  }
};

export const getCommentsByTicketId = async (ticketId: string) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { ticketId: Number(ticketId) },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    logEvent('Fetched comments for ticket', 'comment', { ticketId, count: comments.length }, 'info');
    return comments;
  } catch (error) {
    logEvent('Error fetching comments', 'comment', { ticketId }, 'error', error);
    return [];
  }
};
