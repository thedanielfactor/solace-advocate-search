import React from "react";

interface ViewTabGroupProps {
  currentView: "grid" | "table";
  onViewChange: (view: "grid" | "table") => void;
  disabled?: boolean;
}

export const ViewTabGroup: React.FC<ViewTabGroupProps> = ({ currentView, onViewChange, disabled }) => {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      marginBottom: "1.5rem"
    }}>
      <div style={{
        display: "flex",
        gap: "0.25rem"
      }}>
      <button
        type="button"
        onClick={() => onViewChange("grid")}
        disabled={disabled}
        style={{
          padding: "0.75rem 2rem",
          border: currentView === "grid" 
            ? "2px solid #265B4E" 
            : "1px solid #dee2e6",
          borderBottom: currentView === "grid" 
            ? "2px solid #265B4E" 
            : "1px solid #dee2e6",
          borderTopLeftRadius: "8px",
          borderTopRightRadius: "8px",
          borderBottomLeftRadius: "0px",
          borderBottomRightRadius: "0px",
          background: currentView === "grid" ? "white" : "#f8f9fa",
          color: currentView === "grid" ? "#265B4E" : "#6c757d",
          fontWeight: currentView === "grid" ? 700 : 500,
          fontSize: "1.1rem",
          cursor: disabled ? "not-allowed" : "pointer",
          outline: "none",
          transition: "all 0.2s ease",
          position: "relative",
          zIndex: currentView === "grid" ? 2 : 1
        }}
        aria-selected={currentView === "grid"}
        aria-controls="advocate-grid-panel"
      >
        Grid
      </button>
      <button
        type="button"
        onClick={() => onViewChange("table")}
        disabled={disabled}
        style={{
          padding: "0.75rem 2rem",
          border: currentView === "table" 
            ? "2px solid #265B4E" 
            : "1px solid #dee2e6",
          borderBottom: currentView === "table" 
            ? "2px solid #265B4E" 
            : "1px solid #dee2e6",
          borderTopLeftRadius: "8px",
          borderTopRightRadius: "8px",
          borderBottomLeftRadius: "0px",
          borderBottomRightRadius: "0px",
          background: currentView === "table" ? "white" : "#f8f9fa",
          color: currentView === "table" ? "#265B4E" : "#6c757d",
          fontWeight: currentView === "table" ? 700 : 500,
          fontSize: "1.1rem",
          cursor: disabled ? "not-allowed" : "pointer",
          outline: "none",
          transition: "all 0.2s ease",
          position: "relative",
          zIndex: currentView === "table" ? 2 : 1
        }}
        aria-selected={currentView === "table"}
        aria-controls="advocate-table-panel"
      >
        Table
      </button>
      </div>
      <div style={{
        borderBottom: "2px solid #dee2e6",
        marginTop: "-1px"
      }} />
    </div>
  );
}; 