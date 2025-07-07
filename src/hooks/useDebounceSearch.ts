'use client';

import { useCallback, useEffect, useState } from 'react';

type UseDebounceSearchProps = {
  initialValue?: string;
  delay?: number;
  onSearch: (value: string) => void;
};

type UseDebounceSearchReturn = {
  searchValue: string;
  setSearchValue: (value: string) => void;
  isSearching: boolean;
  clearSearch: () => void;
};

const useDebounceSearch = ({
  initialValue = '',
  delay = 300,
  onSearch,
}: UseDebounceSearchProps): UseDebounceSearchReturn => {
  const [searchValue, setSearchValue] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setSearchValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (searchValue === initialValue) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const timer = setTimeout(() => {
      onSearch(searchValue);
      setIsSearching(false);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [searchValue, delay, onSearch, initialValue]);

  const clearSearch = useCallback(() => {
    setSearchValue('');
    setIsSearching(false);
  }, []);

  return {
    searchValue,
    setSearchValue,
    isSearching,
    clearSearch,
  };
};

export default useDebounceSearch;
