import React, { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export function Layout({ children, title = "Solace Health" }: LayoutProps): JSX.Element {
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
          backgroundColor: "#265B4E",
          borderBottom: "1px solid #1a4539",
          padding: "1rem 0",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
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
            className="header-title"
            style={{
              margin: 0
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
          backgroundColor: "#265B4E",
          borderTop: "1px solid #1a4539",
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
            color: "white",
            fontSize: "0.875rem"
          }}
        >
          © 2024 Solace Health. Built with Next.js and TypeScript.
        </div>
      </footer>
    </div>
  );
} 