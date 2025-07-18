import React from "react";
import type { Advocate } from "@/types";

interface AdvocateTableProps {
  advocates: Advocate[];
  isLoading?: boolean;
  error?: string | null;
}

export function AdvocateTable({ 
  advocates, 
  isLoading = false, 
  error = null 
}: AdvocateTableProps): JSX.Element {
  if (isLoading) {
    return (
      <div style={{ padding: "1rem", textAlign: "center", color: "#6c757d" }}>
        Loading advocates...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "1rem", textAlign: "center", color: "#dc3545" }}>
        Error: {error}
      </div>
    );
  }

  if (advocates.length === 0) {
    return (
      <div 
        style={{
          padding: "2rem",
          textAlign: "center",
          backgroundColor: "#f8f9fa",
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
    <div style={{ overflowX: "auto" }}>
      <table 
        style={{ 
          width: "100%", 
          borderCollapse: "collapse",
          border: "1px solid #dee2e6"
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f8f9fa" }}>
            <th style={{ padding: "0.75rem", border: "1px solid #dee2e6", textAlign: "left" }}>
              First Name
            </th>
            <th style={{ padding: "0.75rem", border: "1px solid #dee2e6", textAlign: "left" }}>
              Last Name
            </th>
            <th style={{ padding: "0.75rem", border: "1px solid #dee2e6", textAlign: "left" }}>
              City
            </th>
            <th style={{ padding: "0.75rem", border: "1px solid #dee2e6", textAlign: "left" }}>
              Degree
            </th>
            <th style={{ padding: "0.75rem", border: "1px solid #dee2e6", textAlign: "left" }}>
              Specialties
            </th>
            <th style={{ padding: "0.75rem", border: "1px solid #dee2e6", textAlign: "left" }}>
              Years of Experience
            </th>
            <th style={{ padding: "0.75rem", border: "1px solid #dee2e6", textAlign: "left" }}>
              Phone Number
            </th>
          </tr>
        </thead>
        <tbody>
          {advocates.map((advocate, index) => (
            <tr 
              key={advocate.id || index}
              style={{ 
                backgroundColor: index % 2 === 0 ? "white" : "#f8f9fa",
                borderBottom: "1px solid #dee2e6"
              }}
            >
              <td style={{ padding: "0.75rem", border: "1px solid #dee2e6" }}>
                {advocate.firstName}
              </td>
              <td style={{ padding: "0.75rem", border: "1px solid #dee2e6" }}>
                {advocate.lastName}
              </td>
              <td style={{ padding: "0.75rem", border: "1px solid #dee2e6" }}>
                {advocate.city}
              </td>
              <td style={{ padding: "0.75rem", border: "1px solid #dee2e6" }}>
                {advocate.degree}
              </td>
              <td style={{ padding: "0.75rem", border: "1px solid #dee2e6" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  {advocate.specialties.map((specialty, specialtyIndex) => (
                    <span 
                      key={specialtyIndex}
                      style={{
                        backgroundColor: "#e9ecef",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.875rem",
                        display: "inline-block"
                      }}
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </td>
              <td style={{ padding: "0.75rem", border: "1px solid #dee2e6" }}>
                {advocate.yearsOfExperience}
              </td>
              <td style={{ padding: "0.75rem", border: "1px solid #dee2e6" }}>
                {advocate.phoneNumber}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 