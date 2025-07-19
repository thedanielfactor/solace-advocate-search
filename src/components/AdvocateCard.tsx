import React, { memo } from "react";
import type { Advocate } from "@/types";

interface AdvocateCardProps {
  advocate: Advocate;
}

export const AdvocateCard = memo(function AdvocateCard({ 
  advocate 
}: AdvocateCardProps): JSX.Element {
  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "8px",
        border: "1px solid #dee2e6",
        padding: "1.5rem",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
      }}
      role="article"
      aria-label={`Advocate ${advocate.firstName} ${advocate.lastName}`}
    >
      {/* Experience Badge */}
      <div
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          backgroundColor: "#007bff",
          color: "white",
          padding: "0.25rem 0.75rem",
          borderRadius: "12px",
          fontSize: "0.75rem",
          fontWeight: "600"
        }}
      >
        {advocate.yearsOfExperience} years
      </div>

      {/* Header */}
      <div style={{ marginBottom: "1rem" }}>
        <h3 
          style={{
            margin: "0 0 0.5rem 0",
            fontSize: "1.25rem",
            fontWeight: "600",
            color: "#343a40"
          }}
        >
          {advocate.firstName} {advocate.lastName}
        </h3>
        <p 
          style={{
            margin: "0 0 0.25rem 0",
            color: "#6c757d",
            fontSize: "0.875rem"
          }}
        >
          📍 {advocate.city}
        </p>
        <p 
          style={{
            margin: 0,
            color: "#007bff",
            fontSize: "0.875rem",
            fontWeight: "500"
          }}
        >
          {advocate.degree}
        </p>
      </div>

      {/* Specialties */}
      <div style={{ marginBottom: "1rem" }}>
        <h4 
          style={{
            margin: "0 0 0.5rem 0",
            fontSize: "0.875rem",
            fontWeight: "600",
            color: "#495057",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}
        >
          Specialties
        </h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {advocate.specialties.map((specialty, specialtyIndex) => (
            <span
              key={specialtyIndex}
              style={{
                backgroundColor: "#e9ecef",
                color: "#495057",
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
                fontSize: "0.75rem",
                fontWeight: "500"
              }}
            >
              {specialty}
            </span>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div 
        style={{
          borderTop: "1px solid #dee2e6",
          paddingTop: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <span 
          style={{
            color: "#6c757d",
            fontSize: "0.875rem"
          }}
        >
          📞 {advocate.phoneNumber}
        </span>
        <button
          style={{
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            fontSize: "0.875rem",
            fontWeight: "500",
            cursor: "pointer",
            transition: "background-color 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#218838";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#28a745";
          }}
          aria-label={`Contact ${advocate.firstName} ${advocate.lastName}`}
        >
          Contact
        </button>
      </div>
    </div>
  );
}); 