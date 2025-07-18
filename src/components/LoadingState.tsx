import React from "react";

interface LoadingStateProps {
  message?: string;
  showSkeleton?: boolean;
  skeletonRows?: number;
}

export function LoadingState({ 
  message = "Loading...", 
  showSkeleton = true,
  skeletonRows = 5 
}: LoadingStateProps): JSX.Element {
  if (!showSkeleton) {
    return (
      <div 
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          fontSize: "1.1rem",
          color: "#6c757d"
        }}
      >
        <div 
          style={{
            width: "20px",
            height: "20px",
            border: "2px solid #f3f3f3",
            borderTop: "2px solid #007bff",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginRight: "0.5rem"
          }}
        />
        {message}
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem 0" }}>
      <div 
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1rem",
          fontSize: "1.1rem",
          color: "#6c757d"
        }}
      >
        <div 
          style={{
            width: "20px",
            height: "20px",
            border: "2px solid #f3f3f3",
            borderTop: "2px solid #007bff",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginRight: "0.5rem"
          }}
        />
        {message}
      </div>
      
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>City</th>
            <th>Degree</th>
            <th>Specialties</th>
            <th>Years of Experience</th>
            <th>Phone Number</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: skeletonRows }).map((_, index) => (
            <tr key={index}>
              <td>
                <div 
                  style={{
                    height: "20px",
                    backgroundColor: "#e9ecef",
                    borderRadius: "4px",
                    animation: "pulse 1.5s ease-in-out infinite"
                  }}
                />
              </td>
              <td>
                <div 
                  style={{
                    height: "20px",
                    backgroundColor: "#e9ecef",
                    borderRadius: "4px",
                    animation: "pulse 1.5s ease-in-out infinite"
                  }}
                />
              </td>
              <td>
                <div 
                  style={{
                    height: "20px",
                    backgroundColor: "#e9ecef",
                    borderRadius: "4px",
                    animation: "pulse 1.5s ease-in-out infinite"
                  }}
                />
              </td>
              <td>
                <div 
                  style={{
                    height: "20px",
                    backgroundColor: "#e9ecef",
                    borderRadius: "4px",
                    animation: "pulse 1.5s ease-in-out infinite"
                  }}
                />
              </td>
              <td>
                <div 
                  style={{
                    height: "20px",
                    backgroundColor: "#e9ecef",
                    borderRadius: "4px",
                    animation: "pulse 1.5s ease-in-out infinite"
                  }}
                />
              </td>
              <td>
                <div 
                  style={{
                    height: "20px",
                    backgroundColor: "#e9ecef",
                    borderRadius: "4px",
                    animation: "pulse 1.5s ease-in-out infinite"
                  }}
                />
              </td>
              <td>
                <div 
                  style={{
                    height: "20px",
                    backgroundColor: "#e9ecef",
                    borderRadius: "4px",
                    animation: "pulse 1.5s ease-in-out infinite"
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
} 