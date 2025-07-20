import React, { memo, useMemo } from "react";
import type { Advocate } from "@/types";
import { AdvocateTable } from "./AdvocateTable";
import { AdvocateGrid } from "./AdvocateGrid";
import { ErrorState } from "./ErrorState";

interface AdvocateListSectionProps {
  advocates: Advocate[];
  isLoading: boolean;
  error: string | null;
  viewMode: "table" | "grid";
  onLoadMore: () => void;
  hasMore: boolean;
  onRetry: () => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
}

// Skeleton component for loading states
const ListSkeleton = memo(function ListSkeleton(): JSX.Element {
  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
        gap: "1rem" 
      }}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              border: "1px solid #dee2e6",
              padding: "1rem",
              height: "120px",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem"
            }}
          >
            <div style={{
              height: "20px",
              backgroundColor: "#f8f9fa",
              borderRadius: "4px",
              width: "60%",
              animation: "pulse 1.5s ease-in-out infinite"
            }} />
            <div style={{
              height: "16px",
              backgroundColor: "#f8f9fa",
              borderRadius: "4px",
              width: "40%",
              animation: "pulse 1.5s ease-in-out infinite"
            }} />
            <div style={{
              height: "14px",
              backgroundColor: "#f8f9fa",
              borderRadius: "4px",
              width: "80%",
              animation: "pulse 1.5s ease-in-out infinite"
            }} />
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
});

// Memoized components
const MemoizedAdvocateTable = memo(AdvocateTable);
const MemoizedAdvocateGrid = memo(AdvocateGrid);
const MemoizedErrorState = memo(ErrorState);

export const AdvocateListSection = memo(function AdvocateListSection({
  advocates,
  isLoading,
  error,
  viewMode,
  onLoadMore,
  hasMore,
  onRetry,
  pageSize,
  onPageSizeChange
}: AdvocateListSectionProps): JSX.Element {
  // Memoized props to prevent unnecessary re-renders
  const tableProps = useMemo(() => ({
    advocates,
    isLoading,
    error
  }), [advocates, isLoading, error]);

  const gridProps = useMemo(() => ({
    advocates,
    isLoading,
    error,
    onLoadMore,
    hasMore,
    pageSize: pageSize === undefined ? undefined : pageSize,
    onPageSizeChange: onPageSizeChange === undefined ? undefined : onPageSizeChange
  }), [advocates, isLoading, error, onLoadMore, hasMore, pageSize, onPageSizeChange]);

  const errorStateProps = useMemo(() => ({
    title: "Failed to load advocates",
    message: error || "An unknown error occurred",
    onRetry,
    showRetry: true
  }), [error, onRetry]);

  // Render content based on state
  let content: JSX.Element;

  if (isLoading && advocates.length === 0) {
    // Initial loading state with skeleton
    content = <ListSkeleton />;
  } else if (error && !isLoading) {
    // Error state
    content = <MemoizedErrorState {...errorStateProps} />;
  } else if (!isLoading && !error) {
    // Data loaded successfully
    if (viewMode === "table") {
      content = <MemoizedAdvocateTable {...tableProps} />;
    } else {
      content = <MemoizedAdvocateGrid {...gridProps} />;
    }
  } else {
    // Loading more data (keep existing content visible)
    if (viewMode === "table") {
      content = <MemoizedAdvocateTable {...tableProps} />;
    } else {
      content = <MemoizedAdvocateGrid {...gridProps} />;
    }
  }

  return (
    <div style={{ minHeight: "400px" }}>
      {content}
      
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
    </div>
  );
}); 