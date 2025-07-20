"use client";

import React, { useState, useCallback, useMemo } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { IsolatedSearchSection } from "@/components/IsolatedSearchSection";
import { AdvocateListSection } from "@/components/AdvocateListSection";
import { ViewToggle } from "@/components/ViewToggle";
import { AdvocateStats } from "@/components/AdvocateStats";
import { SortControls } from "@/components/SortControls";
import { Layout } from "@/components/Layout";
import { useAdvocates } from "@/hooks/useAdvocates";

// Memoized components to prevent unnecessary re-renders
const MemoizedIsolatedSearchSection = React.memo(IsolatedSearchSection);
const MemoizedAdvocateStats = React.memo(AdvocateStats);
const MemoizedViewToggle = React.memo(ViewToggle);
const MemoizedAdvocateListSection = React.memo(AdvocateListSection);
const MemoizedSortControls = React.memo(SortControls);

export default function Home() {
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  
  const {
    advocates,
    isLoading,
    error,
    retry,
    pagination,
    loadMore,
    hasMore,
    totalCount,
    sortBy,
    sortOrder,
    setSorting,
  } = useAdvocates(searchTerm, {
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

  const handleSortChange = useCallback((newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    setSorting(newSortBy, newSortOrder);
  }, [setSorting]);



  const advocateStatsProps = useMemo(() => ({
    advocates,
    filteredCount: advocates.length,
    totalCount: pagination?.total || totalCount,
    isLoading
  }), [advocates, pagination?.total, totalCount, isLoading]);

  const viewToggleProps = useMemo(() => ({
    currentView: viewMode,
    onViewChange: handleViewChange,
    disabled: isLoading
  }), [viewMode, handleViewChange, isLoading]);

  const sortControlsProps = useMemo(() => ({
    sortBy,
    sortOrder,
    onSortChange: handleSortChange,
    disabled: isLoading
  }), [sortBy, sortOrder, handleSortChange, isLoading]);

  const advocateListProps = useMemo(() => ({
    advocates,
    isLoading,
    error,
    viewMode,
    onLoadMore: handleLoadMore,
    hasMore,
    onRetry: retry
  }), [advocates, isLoading, error, viewMode, handleLoadMore, hasMore, retry]);

  // Isolated search section that manages its own state
  const searchSection = useMemo(() => (
    <MemoizedIsolatedSearchSection 
      onSearchChange={setSearchTerm}
    />
  ), [setSearchTerm]);

  // Memoized content to prevent unnecessary re-renders
  const content = useMemo(() => {
    // Always render stats to prevent layout shifts
    const stats = <MemoizedAdvocateStats {...advocateStatsProps} />;

    // Render view toggle if we have data
    const viewToggle = !isLoading && !error && advocates.length > 0 ? (
      <MemoizedViewToggle {...viewToggleProps} />
    ) : null;

    // Render sort controls if we have data
    const sortControls = !isLoading && !error && advocates.length > 0 ? (
      <MemoizedSortControls {...sortControlsProps} />
    ) : null;

    // Render the isolated list section
    const listSection = <MemoizedAdvocateListSection {...advocateListProps} />;

    // Render pagination info
    const paginationInfo = !isLoading && !error && pagination ? (
      <div style={{ 
        textAlign: "center", 
        padding: "1rem",
        color: "#6c757d",
        fontSize: "0.875rem"
      }}>
        Showing {advocates.length} of {pagination.total} advocates
      </div>
    ) : null;

    return {
      stats,
      viewToggle,
      sortControls,
      listSection,
      paginationInfo
    };
  }, [
    advocateStatsProps,
    viewToggleProps,
    sortControlsProps,
    advocateListProps,
    isLoading,
    error,
    advocates.length,
    pagination
  ]);

  return (
    <ErrorBoundary>
      <Layout>
        {searchSection}
        {content.stats}
        {content.viewToggle}
        {content.sortControls}
        {content.listSection}
        {content.paginationInfo}
      </Layout>
    </ErrorBoundary>
  );
}
