'use client';

import { useActionState, useEffect } from 'react';

import Link from 'next/link';
import { createTicket } from '@/actions/ticket.actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const NewTicketPage = () => {
  const [state, formAction] = useActionState(createTicket, { success: false, message: '' });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success('Ticket submitted successfully');
      router.push('/tickets');
    }
  }, [state.success, router]);

  return <div>hello</div>;
};

export default NewTicketPage;
