"use client";

import React, { useState, useCallback, useMemo } from "react";
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

// Memoized components to prevent unnecessary re-renders
const MemoizedSearchBar = React.memo(SearchBar);
const MemoizedAdvocateStats = React.memo(AdvocateStats);
const MemoizedViewToggle = React.memo(ViewToggle);
const MemoizedAdvocateTable = React.memo(AdvocateTable);
const MemoizedAdvocateGrid = React.memo(AdvocateGrid);
const MemoizedLoadingState = React.memo(LoadingState);
const MemoizedErrorState = React.memo(ErrorState);

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

  // Memoized callbacks to prevent child re-renders
  const handleViewChange = useCallback((view: "table" | "grid") => {
    setViewMode(view);
  }, []);

  const handleLoadMore = useCallback(() => {
    loadMore();
  }, [loadMore]);

  // Memoized props to prevent unnecessary re-renders
  const searchBarProps = useMemo(() => ({
    searchTerm,
    onSearchChange: setSearchTerm,
    onReset: resetSearch,
    disabled: isLoading,
    error,
    isLoading
  }), [searchTerm, setSearchTerm, resetSearch, isLoading, error]);

  const advocateStatsProps = useMemo(() => ({
    advocates,
    filteredCount: advocates.length,
    totalCount: pagination?.total || totalCount
  }), [advocates, pagination?.total, totalCount]);

  const viewToggleProps = useMemo(() => ({
    currentView: viewMode,
    onViewChange: handleViewChange,
    disabled: isLoading
  }), [viewMode, handleViewChange, isLoading]);

  const advocateTableProps = useMemo(() => ({
    advocates,
    isLoading,
    error
  }), [advocates, isLoading, error]);

  const advocateGridProps = useMemo(() => ({
    advocates,
    isLoading,
    error,
    onLoadMore: handleLoadMore,
    hasMore
  }), [advocates, isLoading, error, handleLoadMore, hasMore]);

  const loadingStateProps = useMemo(() => ({
    message: "Loading advocates...",
    showSkeleton: true,
    skeletonRows: 5
  }), []);

  const errorStateProps = useMemo(() => ({
    title: "Failed to load advocates",
    message: error || "An unknown error occurred",
    onRetry: retry,
    showRetry: true
  }), [error, retry]);

  // Memoized content to prevent unnecessary re-renders
  const content = useMemo(() => {
    // Always render search bar
    const searchBar = <MemoizedSearchBar {...searchBarProps} />;

    // Render stats if we have data
    const stats = !isLoading && !error && advocates.length > 0 ? (
      <MemoizedAdvocateStats {...advocateStatsProps} />
    ) : null;

    // Render view toggle if we have data
    const viewToggle = !isLoading && !error && advocates.length > 0 ? (
      <MemoizedViewToggle {...viewToggleProps} />
    ) : null;

    // Render main content based on state
    let mainContent;
    if (isLoading && advocates.length === 0) {
      mainContent = <MemoizedLoadingState {...loadingStateProps} />;
    } else if (error && !isLoading) {
      mainContent = <MemoizedErrorState {...errorStateProps} />;
    } else if (!isLoading && !error) {
      if (viewMode === "table") {
        mainContent = <MemoizedAdvocateTable {...advocateTableProps} />;
      } else {
        mainContent = <MemoizedAdvocateGrid {...advocateGridProps} />;
      }
    }

    // Render load more indicator
    const loadMoreIndicator = isLoading && advocates.length > 0 ? (
      <div style={{ 
        textAlign: "center", 
        padding: "1rem",
        color: "#6c757d"
      }}>
        Loading more advocates...
      </div>
    ) : null;

    // Render pagination info
    const paginationInfo = !isLoading && !error && pagination ? (
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
              onClick={handleLoadMore}
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
    ) : null;

    return {
      searchBar,
      stats,
      viewToggle,
      mainContent,
      loadMoreIndicator,
      paginationInfo
    };
  }, [
    searchBarProps,
    advocateStatsProps,
    viewToggleProps,
    advocateTableProps,
    advocateGridProps,
    loadingStateProps,
    errorStateProps,
    isLoading,
    error,
    advocates.length,
    viewMode,
    pagination,
    handleLoadMore
  ]);

  return (
    <ErrorBoundary>
      <Layout>
        {content.searchBar}
        {content.stats}
        {content.viewToggle}
        {content.mainContent}
        {content.loadMoreIndicator}
        {content.paginationInfo}
      </Layout>
    </ErrorBoundary>
  );
}
