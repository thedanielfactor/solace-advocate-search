import React, { useRef } from "react";
import type { InputChangeHandler, ButtonClickHandler } from "@/types";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onReset: () => void;
  placeholder?: string;
}

export function SearchBar({
  searchTerm,
  onSearchChange,
  onReset,
  placeholder = "Search advocates..."
}: SearchBarProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);

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
            aria-label="Search advocates"
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ced4da",
              borderRadius: "4px",
              fontSize: "1rem",
              backgroundColor: "white",
              color: "#212529"
            }}
          />
        </div>
        <button
          onClick={handleReset}
          disabled={!searchTerm}
          style={{
            padding: "0.75rem 1rem",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: !searchTerm ? "not-allowed" : "pointer",
            fontSize: "1rem",
            opacity: !searchTerm ? 0.6 : 1
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