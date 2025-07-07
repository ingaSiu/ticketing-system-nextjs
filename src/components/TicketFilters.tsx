'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { useCallback } from 'react';
import useDebounceSearch from '@/hooks/useDebounceSearch';

const TicketFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { searchValue, setSearchValue, isSearching, clearSearch } = useDebounceSearch({
    initialValue: searchParams.get('search') || '',
    delay: 300,
    onSearch: (value) => handleFilterChange('search', value),
  });

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

  const clearFilters = () => {
    clearSearch();
    router.push(window.location.pathname);
  };

  const currentPriority = searchParams.get('priority') || '';
  const currentStatus = searchParams.get('status') || '';
  const currentSearch = searchParams.get('search') || '';

  const hasActiveFilters = currentPriority || currentStatus || currentSearch;
  return (
    <div className="space-y-4">
      <div className="w-full">
        <label className="text-sm font-medium text-gray-700 mb-1 block">Search Tickets</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by subject or description..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchValue && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        {isSearching && (
          <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
            <span className="animate-pulse">🔍</span>
            Searching...
          </p>
        )}
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

        {hasActiveFilters && (
          <div className="flex flex-col justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="text-gray-600">Active filters:</span>
          {currentSearch && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Search: "{currentSearch}"</span>
          )}
          {currentPriority && (
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Priority: {currentPriority}</span>
          )}
          {currentStatus && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">Status: {currentStatus}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketFilters;
