import React, { memo, useCallback } from "react";
import { SearchBar } from "./SearchBar";

interface SearchSectionProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onReset: () => void;
}

export const SearchSection = memo(function SearchSection({
  searchTerm,
  onSearchChange,
  onReset
}: SearchSectionProps): JSX.Element {
  const handleSearchChange = useCallback((value: string) => {
    onSearchChange(value);
  }, [onSearchChange]);

  const handleReset = useCallback(() => {
    onReset();
  }, [onReset]);

  return (
    <SearchBar
      searchTerm={searchTerm}
      onSearchChange={handleSearchChange}
      onReset={handleReset}
      placeholder="Search advocates..."
    />
  );
}); 