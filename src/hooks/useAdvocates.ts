import { useState, useEffect, useCallback } from "react";
import type { Advocate, ApiResponse, PaginationInfo } from "@/types";

interface UseAdvocatesReturn {
  advocates: Advocate[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
  pagination: PaginationInfo | null;
  loadMore: () => void;
  hasMore: boolean;
  totalCount: number;
  currentPage: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  pageSize: number;
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  setPageSize: (size: number) => void;
}

interface UseAdvocatesOptions {
  pageSize?: number;
  debounceMs?: number;
}

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useAdvocates(searchTerm: string = "", options: UseAdvocatesOptions = {}): UseAdvocatesReturn {
  const { pageSize: initialPageSize = 20, debounceMs = 300 } = options;
  
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState('lastName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [pageSize, setPageSize] = useState(initialPageSize);
  
  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);
  
  const fetchAdvocates = useCallback(async (
    page: number = 1,
    search: string = "",
    append: boolean = false,
    customPageSize?: number
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const limitToUse = customPageSize || pageSize;
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limitToUse.toString(),
        sortBy: sortBy,
        sortOrder: sortOrder,
        ...(search && { search })
      });
      
      console.log("fetching advocates...", params.toString());
      const response = await fetch(`/api/advocates?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch advocates: ${response.status} ${response.statusText}`);
      }
      
      const jsonResponse: ApiResponse<Advocate[]> = await response.json();
      
      if (jsonResponse.error) {
        throw new Error(jsonResponse.error);
      }
      
      if (!jsonResponse.data) {
        throw new Error("No data received from server");
      }
      
      if (append) {
        setAdvocates(prev => [...prev, ...jsonResponse.data]);
      } else {
        setAdvocates(jsonResponse.data);
      }
      
      if (jsonResponse.pagination) {
        setPagination(jsonResponse.pagination);
        setTotalCount(jsonResponse.pagination.total);
      }
      
      setCurrentPage(page);
      setIsLoading(false);
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      console.error("Error fetching advocates:", err);
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [sortBy, sortOrder]); // Removed pageSize from dependencies

  // Load more data
  const loadMore = useCallback(() => {
    if (!isLoading && pagination?.hasNext) {
      fetchAdvocates(currentPage + 1, debouncedSearchTerm, true, pageSize);
    }
  }, [currentPage, pagination?.hasNext, isLoading, debouncedSearchTerm, fetchAdvocates, pageSize]);

  // Search effect
  useEffect(() => {
    setCurrentPage(1);
    fetchAdvocates(1, debouncedSearchTerm, false, pageSize);
  }, [debouncedSearchTerm, fetchAdvocates]);

  // Initial data fetch
  useEffect(() => {
    fetchAdvocates(1, "", false, pageSize);
  }, [fetchAdvocates]);

  const retry = useCallback((): void => {
    fetchAdvocates(currentPage, debouncedSearchTerm, false, pageSize);
  }, [fetchAdvocates, currentPage, debouncedSearchTerm, pageSize]);

  const setSorting = useCallback((newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
    fetchAdvocates(1, debouncedSearchTerm, false, pageSize);
  }, [fetchAdvocates, debouncedSearchTerm, pageSize]);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    // Don't reset current page or clear existing data
    // Just update the page size for future loads
  }, []);

  return {
    advocates,
    isLoading,
    error,
    retry,
    pagination,
    loadMore,
    hasMore: pagination?.hasNext || false,
    totalCount,
    currentPage,
    sortBy,
    sortOrder,
    pageSize,
    setSorting,
    setPageSize: handlePageSizeChange,
  };
} 