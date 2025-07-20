import React, { memo } from "react";

export interface SortOption {
  value: string;
  label: string;
}

export interface SortControlsProps {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  disabled?: boolean;
}

const sortOptions: SortOption[] = [
  { value: 'lastName', label: 'Last Name' },
  { value: 'firstName', label: 'First Name' },
  { value: 'city', label: 'City' },
  { value: 'degree', label: 'Degree' },
  { value: 'yearsOfExperience', label: 'Experience' },
  { value: 'createdAt', label: 'Date Added' }
];

export const SortControls = memo(function SortControls({
  sortBy,
  sortOrder,
  onSortChange,
  disabled = false
}: SortControlsProps): JSX.Element {
  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange(e.target.value, sortOrder);
  };

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange(sortBy, e.target.value as 'asc' | 'desc');
  };

  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(sortBy, newOrder);
  };

  return (
    <div style={{ 
      display: "flex", 
      gap: "0.5rem", 
      alignItems: "center",
      marginBottom: "1rem",
      padding: "1rem",
      backgroundColor: "#f8f9fa",
      borderRadius: "8px",
      border: "1px solid #dee2e6"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <label 
          htmlFor="sort-by"
          style={{
            fontSize: "0.875rem",
            fontWeight: "500",
            color: "#495057",
            whiteSpace: "nowrap"
          }}
        >
          Sort by:
        </label>
        <select
          id="sort-by"
          value={sortBy}
          onChange={handleSortByChange}
          disabled={disabled}
          style={{
            padding: "0.5rem",
            border: "1px solid #ced4da",
            borderRadius: "4px",
            fontSize: "0.875rem",
            backgroundColor: disabled ? "#f8f9fa" : "white",
            color: disabled ? "#6c757d" : "#212529",
            cursor: disabled ? "not-allowed" : "pointer"
          }}
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <label 
          htmlFor="sort-order"
          style={{
            fontSize: "0.875rem",
            fontWeight: "500",
            color: "#495057",
            whiteSpace: "nowrap"
          }}
        >
          Order:
        </label>
        <select
          id="sort-order"
          value={sortOrder}
          onChange={handleSortOrderChange}
          disabled={disabled}
          style={{
            padding: "0.5rem",
            border: "1px solid #ced4da",
            borderRadius: "4px",
            fontSize: "0.875rem",
            backgroundColor: disabled ? "#f8f9fa" : "white",
            color: disabled ? "#6c757d" : "#212529",
            cursor: disabled ? "not-allowed" : "pointer"
          }}
        >
          <option value="asc">Ascending (A-Z)</option>
          <option value="desc">Descending (Z-A)</option>
        </select>
      </div>

      <button
        onClick={toggleSortOrder}
        disabled={disabled}
        style={{
          padding: "0.5rem 0.75rem",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: disabled ? "not-allowed" : "pointer",
          fontSize: "0.875rem",
          opacity: disabled ? 0.6 : 1,
          display: "flex",
          alignItems: "center",
          gap: "0.25rem"
        }}
        title="Toggle sort order"
      >
        {sortOrder === 'asc' ? '↑' : '↓'}
        Toggle
      </button>

      <div style={{ 
        fontSize: "0.75rem", 
        color: "#6c757d",
        marginLeft: "auto"
      }}>
        {sortOptions.find(opt => opt.value === sortBy)?.label} 
        ({sortOrder === 'asc' ? 'A to Z' : 'Z to A'})
      </div>
    </div>
  );
}); 