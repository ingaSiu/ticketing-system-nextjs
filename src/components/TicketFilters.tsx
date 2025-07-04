'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { useCallback } from 'react';

const TicketFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === '') {
        params.delete(name);
      } else {
        params.set(name, value);
      }

      return params.toString();
    },
    [searchParams],
  );

  const handleFilterChange = (filterName: string, value: string) => {
    router.push(`?${createQueryString(filterName, value)}`);
  };

  const currentPriority = searchParams.get('priority') || '';
  const currentStatus = searchParams.get('status') || '';
  const currentSearch = searchParams.get('search') || '';
  return (
    <div className="space-y-4">
      <div className="w-full">
        <label className="text-sm font-medium text-gray-700 mb-1 block">Search Tickets</label>
        <input
          type="text"
          placeholder="Search by subject or description..."
          value={currentSearch}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={currentPriority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={currentStatus}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TicketFilters;
