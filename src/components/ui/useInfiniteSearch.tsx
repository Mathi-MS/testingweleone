import { useState, useEffect } from "react";

interface UseInfiniteSearchProps<T> {
  fetchFunction: (params: { page: number; size: number; search: string }) => Promise<T[]>;
  pageSize?: number;
  initialSearch?: string;
}

export function useInfiniteSearch<T>({
  fetchFunction,
  pageSize = 10,
  initialSearch = "",
}: UseInfiniteSearchProps<T>) {
  const [data, setData] = useState<T[]>([]); // empty array by default

  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(true);

  const debouncedSearch = useDebounce(search, 350);

  // Fetch data
  const loadData = async (pageNum: number, searchText: string) => {
    setLoading(true);
    try {
      const res = await fetchFunction({ page: pageNum, size: pageSize, search: searchText });
      if (pageNum === 1) {
        setData(res);
      } else {
        setData((prev) => [...prev, ...res]);
      }
      setHasNext(res.length === pageSize); // if less than pageSize, no more pages
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Initial & search effect
  useEffect(() => {
    setPage(1);
    loadData(1, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Load more effect
  useEffect(() => {
    if (page === 1) return;
    loadData(page, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleScrollEnd = (scrollTop: number, clientHeight: number, scrollHeight: number) => {
    if (scrollHeight - scrollTop <= clientHeight + 20 && !loading && hasNext) {
      setPage((p) => p + 1);
    }
  };

  return {
    data,
    loading,
    hasNext,
    search,
    setSearch,
    handleScrollEnd,
  };
}

// Debounce hook
function useDebounce<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
