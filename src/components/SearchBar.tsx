import React, { useRef, useEffect } from "react";
import type { InputChangeHandler, ButtonClickHandler } from "@/types";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onReset: () => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string | null;
  isLoading?: boolean;
}

export function SearchBar({
  searchTerm,
  onSearchChange,
  onReset,
  placeholder = "Search advocates...",
  disabled = false,
  error,
  isLoading = false
}: SearchBarProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);

  // Regain focus when search completes (isLoading changes from true to false)
  useEffect(() => {
    if (!isLoading && inputRef.current && searchTerm) {
      // Small delay to ensure the DOM has updated
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, searchTerm]);

  const handleInputChange: InputChangeHandler = (e) => {
    onSearchChange(e.target.value);
  };

  const handleReset: ButtonClickHandler = () => {
    onReset();
    // Focus the input after reset
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <input
            ref={inputRef}
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
          {isLoading ? (
            <>Searching for: <strong>{searchTerm}</strong>...</>
          ) : (
            <>Searching for: <strong>{searchTerm}</strong></>
          )}
        </p>
      )}
    </div>
  );
} 