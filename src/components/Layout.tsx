import React, { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export function Layout({ children, title = "Solace Advocates" }: LayoutProps): JSX.Element {
  return (
    <div 
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      <header 
        style={{
          backgroundColor: "white",
          borderBottom: "1px solid #dee2e6",
          padding: "1rem 0",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}
      >
        <div 
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 1rem"
          }}
        >
          <h1 
            style={{
              margin: 0,
              color: "#343a40",
              fontSize: "1.75rem",
              fontWeight: "600"
            }}
          >
            {title}
          </h1>
        </div>
      </header>
      
      <main 
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2rem 1rem"
        }}
      >
        {children}
      </main>
      
      <footer 
        style={{
          backgroundColor: "white",
          borderTop: "1px solid #dee2e6",
          padding: "1rem 0",
          marginTop: "auto"
        }}
      >
        <div 
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 1rem",
            textAlign: "center",
            color: "#6c757d",
            fontSize: "0.875rem"
          }}
        >
          © 2024 Solace Advocates. Built with Next.js and TypeScript.
        </div>
      </footer>
    </div>
  );
} 