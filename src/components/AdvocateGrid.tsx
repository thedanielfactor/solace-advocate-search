import React, { memo } from "react";
import type { Advocate } from "@/types";
import { AdvocateCard } from "./AdvocateCard";

interface AdvocateGridProps {
  advocates: Advocate[];
  isLoading?: boolean;
  error?: string | null;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export const AdvocateGrid = memo(function AdvocateGrid({ 
  advocates, 
  isLoading = false, 
  error = null,
  onLoadMore,
  hasMore = false
}: AdvocateGridProps): JSX.Element {
  if (isLoading) {
    return (
      <div 
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.5rem",
          padding: "1rem 0"
        }}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              border: "1px solid #dee2e6",
              padding: "1.5rem",
              height: "200px",
              animation: "pulse 1.5s ease-in-out infinite"
            }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div 
        style={{
          textAlign: "center",
          padding: "2rem",
          color: "#dc3545"
        }}
      >
        Error: {error}
      </div>
    );
  }

  if (advocates.length === 0) {
    return (
      <div 
        style={{
          textAlign: "center",
          padding: "3rem",
          backgroundColor: "white",
          borderRadius: "8px",
          border: "1px solid #dee2e6"
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "1rem", color: "#6c757d" }}>
          📋
        </div>
        <h3 style={{ margin: "0 0 0.5rem 0", color: "#343a40" }}>
          No advocates found
        </h3>
        <p style={{ margin: 0, color: "#6c757d" }}>
          Try adjusting your search criteria or check back later.
        </p>
      </div>
    );
  }

  return (
    <>
      <div 
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.5rem",
          padding: "1rem 0"
        }}
      >
        {advocates.map((advocate, index) => (
          <AdvocateCard
            key={advocate.id || index}
            advocate={advocate}
          />
        ))}
      </div>
      
      {hasMore && onLoadMore && (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.6 : 1,
              fontSize: "1rem",
              fontWeight: "500"
            }}
          >
            {isLoading ? "Loading..." : "Load More Advocates"}
          </button>
        </div>
      )}
    </>
  );
}); 