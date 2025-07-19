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
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    resetSearch,
    retry,
    pagination,
    loadMore,
    hasMore,
    totalCount,
  } = useAdvocates({
    pageSize: 20,
    debounceMs: 300
  });

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
            filteredCount={pagination?.total || advocates.length}
            totalCount={totalCount}
          />
        )}

        {!isLoading && !error && advocates.length > 0 && (
          <ViewToggle
            currentView={viewMode}
            onViewChange={handleViewChange}
            disabled={isLoading}
          />
        )}

        {isLoading && advocates.length === 0 && (
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
            advocates={advocates}
            isLoading={isLoading}
            error={error}
          />
        )}

        {!isLoading && !error && viewMode === "grid" && (
          <AdvocateGrid
            advocates={advocates}
            isLoading={isLoading}
            error={error}
            onLoadMore={loadMore}
            hasMore={hasMore}
          />
        )}

        {/* Load more indicator */}
        {isLoading && advocates.length > 0 && (
          <div style={{ 
            textAlign: "center", 
            padding: "1rem",
            color: "#6c757d"
          }}>
            Loading more advocates...
          </div>
        )}

        {/* Pagination info */}
        {!isLoading && !error && pagination && (
          <div style={{ 
            textAlign: "center", 
            padding: "1rem",
            color: "#6c757d",
            fontSize: "0.875rem"
          }}>
            Showing {advocates.length} of {pagination.total} advocates
            {pagination.hasNext && (
              <div style={{ marginTop: "0.5rem" }}>
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.6 : 1
                  }}
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        )}
      </Layout>
    </ErrorBoundary>
  );
}
