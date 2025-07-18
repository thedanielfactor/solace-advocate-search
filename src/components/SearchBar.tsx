import React from "react";
import type { InputChangeHandler, ButtonClickHandler } from "@/types";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onReset: () => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string | null;
}

export function SearchBar({
  searchTerm,
  onSearchChange,
  onReset,
  placeholder = "Search advocates...",
  disabled = false,
  error
}: SearchBarProps): JSX.Element {
  const handleInputChange: InputChangeHandler = (e) => {
    onSearchChange(e.target.value);
  };

  const handleReset: ButtonClickHandler = () => {
    onReset();
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            aria-label="Search advocates"
            style={{
              width: "100%",
              padding: "0.75rem",
              border: error ? "1px solid #dc3545" : "1px solid #ced4da",
              borderRadius: "4px",
              fontSize: "1rem",
              backgroundColor: disabled ? "#f8f9fa" : "white",
              color: disabled ? "#6c757d" : "#212529"
            }}
          />
          {error && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                color: "#dc3545",
                fontSize: "0.875rem",
                marginTop: "0.25rem"
              }}
            >
              {error}
            </div>
          )}
        </div>
        <button
          onClick={handleReset}
          disabled={disabled || !searchTerm}
          style={{
            padding: "0.75rem 1rem",
            backgroundColor: disabled || !searchTerm ? "#6c757d" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: disabled || !searchTerm ? "not-allowed" : "pointer",
            fontSize: "1rem",
            opacity: disabled || !searchTerm ? 0.6 : 1
          }}
          aria-label="Reset search"
        >
          Reset
        </button>
      </div>
      
      {searchTerm && (
        <p style={{ margin: "0.5rem 0 0 0", color: "#6c757d", fontSize: "0.875rem" }}>
          Searching for: <strong>{searchTerm}</strong>
        </p>
      )}
    </div>
  );
} 