import { useState, useEffect, useCallback, useMemo } from "react";
import type { Advocate, ApiResponse, PaginationInfo } from "@/types";

interface UseAdvocatesReturn {
  advocates: Advocate[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  resetSearch: () => void;
  retry: () => void;
  pagination: PaginationInfo | null;
  loadMore: () => void;
  hasMore: boolean;
  totalCount: number;
  currentPage: number;
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

export function useAdvocates(options: UseAdvocatesOptions = {}): UseAdvocatesReturn {
  const { pageSize = 20, debounceMs = 300 } = options;
  
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  
  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);
  
  const fetchAdvocates = useCallback(async (
    page: number = 1,
    search: string = "",
    append: boolean = false
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
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
  }, [pageSize]);

  // Load more data
  const loadMore = useCallback(() => {
    if (!isLoading && pagination?.hasNext) {
      fetchAdvocates(currentPage + 1, debouncedSearchTerm, true);
    }
  }, [currentPage, pagination?.hasNext, isLoading, debouncedSearchTerm, fetchAdvocates]);

  // Search effect
  useEffect(() => {
    setCurrentPage(1);
    fetchAdvocates(1, debouncedSearchTerm, false);
  }, [debouncedSearchTerm, fetchAdvocates]);

  // Initial data fetch
  useEffect(() => {
    fetchAdvocates(1, "", false);
  }, [fetchAdvocates]);

  const resetSearch = useCallback((): void => {
    setSearchTerm("");
  }, []);

  const retry = useCallback((): void => {
    fetchAdvocates(currentPage, debouncedSearchTerm, false);
  }, [fetchAdvocates, currentPage, debouncedSearchTerm]);

  return {
    advocates,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    resetSearch,
    retry,
    pagination,
    loadMore,
    hasMore: pagination?.hasNext || false,
    totalCount,
    currentPage,
  };
} 