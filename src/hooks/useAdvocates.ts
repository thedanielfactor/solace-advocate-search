import { useState, useEffect, useCallback } from "react";
import type { Advocate, ApiResponse } from "@/types";

interface UseAdvocatesReturn {
  advocates: Advocate[];
  filteredAdvocates: Advocate[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  resetSearch: () => void;
  retry: () => void;
}

export function useAdvocates(): UseAdvocatesReturn {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAdvocates = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("fetching advocates...");
      const response = await fetch("/api/advocates");
      
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
      
      setAdvocates(jsonResponse.data);
      setFilteredAdvocates(jsonResponse.data);
      setIsLoading(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      console.error("Error fetching advocates:", err);
      setError(errorMessage);
      setIsLoading(false);
    }
  }, []);

  // Filter advocates when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAdvocates(advocates);
      return;
    }

    const filtered = advocates.filter((advocate) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        advocate.firstName.toLowerCase().includes(searchLower) ||
        advocate.lastName.toLowerCase().includes(searchLower) ||
        advocate.city.toLowerCase().includes(searchLower) ||
        advocate.degree.toLowerCase().includes(searchLower) ||
        advocate.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchLower)
        ) ||
        advocate.yearsOfExperience.toString().includes(searchTerm)
      );
    });

    setFilteredAdvocates(filtered);
  }, [searchTerm, advocates]);

  // Initial data fetch
  useEffect(() => {
    fetchAdvocates();
  }, [fetchAdvocates]);

  const resetSearch = useCallback((): void => {
    setSearchTerm("");
    setFilteredAdvocates(advocates);
  }, [advocates]);

  const retry = useCallback((): void => {
    fetchAdvocates();
  }, [fetchAdvocates]);

  return {
    advocates,
    filteredAdvocates,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    resetSearch,
    retry,
  };
} 