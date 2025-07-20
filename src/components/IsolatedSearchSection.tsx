import React, { memo, useState, useCallback, useEffect } from "react";
import { SearchBar } from "./SearchBar";

interface IsolatedSearchSectionProps {
  onSearchChange: (searchTerm: string) => void;
  initialSearchTerm?: string;
}

export const IsolatedSearchSection = memo(function IsolatedSearchSection({
  onSearchChange,
  initialSearchTerm = ""
}: IsolatedSearchSectionProps): JSX.Element {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearchChange]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleReset = useCallback(() => {
    setSearchTerm("");
  }, []);

  return (
    <SearchBar
      searchTerm={searchTerm}
      onSearchChange={handleSearchChange}
      onReset={handleReset}
      placeholder="Search advocates..."
    />
  );
}); 