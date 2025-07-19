"use client";

import { useState, useCallback } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { SearchBar } from "@/components/SearchBar";
import { AdvocateTable } from "@/components/AdvocateTable";
import { AdvocateGrid } from "@/components/AdvocateGrid";
import { ViewToggle } from "@/components/ViewToggle";
import { AdvocateStats } from "@/components/AdvocateStats";
import { Layout } from "@/components/Layout";
import { useAdvocates } from "@/hooks/useAdvocates";

export default function Home() {
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  
  const {
    advocates,
    filteredAdvocates,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    resetSearch,
    retry,
  } = useAdvocates();

  const handleViewChange = useCallback((view: "table" | "grid") => {
    setViewMode(view);
  }, []);

  return (
    <ErrorBoundary>
      <Layout>
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onReset={resetSearch}
          disabled={isLoading}
          error={error}
        />

        {!isLoading && !error && advocates.length > 0 && (
          <AdvocateStats
            advocates={advocates}
            filteredCount={filteredAdvocates.length}
          />
        )}

        {!isLoading && !error && advocates.length > 0 && (
          <ViewToggle
            currentView={viewMode}
            onViewChange={handleViewChange}
            disabled={isLoading}
          />
        )}

        {isLoading && (
          <LoadingState 
            message="Loading advocates..." 
            showSkeleton={true}
            skeletonRows={5}
          />
        )}

        {error && !isLoading && (
          <ErrorState
            title="Failed to load advocates"
            message={error}
            onRetry={retry}
            showRetry={true}
          />
        )}

        {!isLoading && !error && viewMode === "table" && (
          <AdvocateTable
            advocates={filteredAdvocates}
            isLoading={isLoading}
            error={error}
          />
        )}

        {!isLoading && !error && viewMode === "grid" && (
          <AdvocateGrid
            advocates={filteredAdvocates}
            isLoading={isLoading}
            error={error}
          />
        )}
      </Layout>
    </ErrorBoundary>
  );
}
