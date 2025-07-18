"use client";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { SearchBar } from "@/components/SearchBar";
import { AdvocateTable } from "@/components/AdvocateTable";
import { useAdvocates } from "@/hooks/useAdvocates";

export default function Home() {
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

  return (
    <ErrorBoundary>
      <main style={{ margin: "24px", maxWidth: "1200px", marginInline: "auto" }}>
        <h1 style={{ marginBottom: "2rem", color: "#343a40" }}>Solace Advocates</h1>
        
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onReset={resetSearch}
          disabled={isLoading}
          error={error}
        />

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

        {!isLoading && !error && (
          <AdvocateTable
            advocates={filteredAdvocates}
            isLoading={isLoading}
            error={error}
          />
        )}

        {!isLoading && !error && filteredAdvocates.length > 0 && (
          <div style={{ marginTop: "1rem", textAlign: "center", color: "#6c757d" }}>
            Showing {filteredAdvocates.length} of {advocates.length} advocates
          </div>
        )}
      </main>
    </ErrorBoundary>
  );
}
