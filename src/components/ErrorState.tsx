import React from "react";
import type { ButtonClickHandler } from "@/types";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export function ErrorState({ 
  title = "Something went wrong", 
  message, 
  onRetry, 
  showRetry = true 
}: ErrorStateProps): JSX.Element {
  const handleRetry: ButtonClickHandler = () => {
    if (onRetry) {
      onRetry();
    }
  };

  return (
    <div 
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        border: "1px solid #dee2e6",
        margin: "1rem 0"
      }}
    >
      <div 
        style={{
          fontSize: "3rem",
          marginBottom: "1rem",
          color: "#dc3545"
        }}
      >
        ⚠️
      </div>
      <h3 
        style={{
          margin: "0 0 0.5rem 0",
          color: "#343a40",
          fontSize: "1.5rem"
        }}
      >
        {title}
      </h3>
      <p 
        style={{
          margin: "0 0 1.5rem 0",
          color: "#6c757d",
          fontSize: "1rem",
          maxWidth: "500px"
        }}
      >
        {message}
      </p>
      {showRetry && onRetry && (
        <button
          onClick={handleRetry}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "500"
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
} 