import React, { memo } from "react";

interface PageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  disabled?: boolean;
}

const pageSizeOptions = [
  { value: 10, label: "10 per page" },
  { value: 20, label: "20 per page" },
  { value: 50, label: "50 per page" },
  { value: 100, label: "100 per page" }
];

export const PageSizeSelector = memo(function PageSizeSelector({
  pageSize,
  onPageSizeChange,
  disabled = false
}: PageSizeSelectorProps): JSX.Element {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    onPageSizeChange(newSize);
  };

  return (
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      gap: "0.5rem",
      padding: "1rem",
      backgroundColor: "#f8f9fa",
      borderRadius: "8px",
      border: "1px solid #dee2e6",
      height: "fit-content"
    }}>
      <label 
        htmlFor="page-size"
        style={{
          fontSize: "0.875rem",
          fontWeight: "500",
          color: "#495057",
          whiteSpace: "nowrap"
        }}
      >
        Results per page:
      </label>
      <select
        id="page-size"
        value={pageSize}
        onChange={handleChange}
        disabled={disabled}
        style={{
          padding: "0.5rem",
          border: "1px solid #ced4da",
          borderRadius: "4px",
          fontSize: "0.875rem",
          backgroundColor: disabled ? "#f8f9fa" : "white",
          color: disabled ? "#6c757d" : "#212529",
          cursor: disabled ? "not-allowed" : "pointer",
          minWidth: "120px"
        }}
      >
        {pageSizeOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}); 