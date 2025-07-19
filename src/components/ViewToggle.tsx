import React, { memo, useCallback } from "react";
import type { ButtonClickHandler } from "@/types";

type ViewMode = "table" | "grid";

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  disabled?: boolean;
}

export const ViewToggle = memo(function ViewToggle({
  currentView,
  onViewChange,
  disabled = false
}: ViewToggleProps): JSX.Element {
  const handleTableClick: ButtonClickHandler = useCallback(() => {
    if (!disabled) {
      onViewChange("table");
    }
  }, [onViewChange, disabled]);

  const handleGridClick: ButtonClickHandler = useCallback(() => {
    if (!disabled) {
      onViewChange("grid");
    }
  }, [onViewChange, disabled]);

  return (
    <div 
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        marginBottom: "1rem"
      }}
    >
      <span 
        style={{
          fontSize: "0.875rem",
          color: "#6c757d",
          fontWeight: "500"
        }}
      >
        View:
      </span>
      <div 
        style={{
          display: "flex",
          border: "1px solid #dee2e6",
          borderRadius: "4px",
          overflow: "hidden"
        }}
      >
        <button
          onClick={handleTableClick}
          disabled={disabled}
          style={{
            padding: "0.5rem 1rem",
            border: "none",
            backgroundColor: currentView === "table" ? "#007bff" : "white",
            color: currentView === "table" ? "white" : "#6c757d",
            cursor: disabled ? "not-allowed" : "pointer",
            fontSize: "0.875rem",
            fontWeight: "500",
            opacity: disabled ? 0.6 : 1,
            transition: "all 0.2s ease"
          }}
          aria-label="Table view"
          aria-pressed={currentView === "table"}
        >
          📊 Table
        </button>
        <button
          onClick={handleGridClick}
          disabled={disabled}
          style={{
            padding: "0.5rem 1rem",
            border: "none",
            borderLeft: "1px solid #dee2e6",
            backgroundColor: currentView === "grid" ? "#007bff" : "white",
            color: currentView === "grid" ? "white" : "#6c757d",
            cursor: disabled ? "not-allowed" : "pointer",
            fontSize: "0.875rem",
            fontWeight: "500",
            opacity: disabled ? 0.6 : 1,
            transition: "all 0.2s ease"
          }}
          aria-label="Grid view"
          aria-pressed={currentView === "grid"}
        >
          🎴 Grid
        </button>
      </div>
    </div>
  );
}); 