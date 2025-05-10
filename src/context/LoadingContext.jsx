// src/context/LoadingContext.jsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import NoFlashLoader with no SSR to avoid hydration issues
const NoFlashLoader = dynamic(() => import("@/components/ui/no-flash-loader"), {
  ssr: false,
});

// Create a context to manage global loading state
const LoadingContext = createContext({
  isLoading: true,
  setIsLoading: () => {},
});

export const useLoading = () => useContext(LoadingContext);

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);

    // Auto hide loading after max timeout (prevents infinite loading)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 8000); // Maximum 8 seconds of loading

    return () => clearTimeout(timer);
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {/* Only render the NoFlashLoader on the client side */}
      {isMounted && <NoFlashLoader />}

      {/* Regular content - always render but control visibility with CSS */}
      <div className="content-container">{children}</div>
    </LoadingContext.Provider>
  );
}
