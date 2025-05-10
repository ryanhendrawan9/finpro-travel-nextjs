"use client";

// Ini adalah file context/LoadingContext.jsx yang dimodifikasi
import { createContext, useContext, useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import loading screen with no SSR to avoid hydration issues
const ModernLoadingScreen = dynamic(
  () => import("@/components/ui/loading-screen"),
  { ssr: false }
);

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
    // Mark document as JS loaded to hide initial loader
    document.documentElement.classList.add("js-loaded");

    // Mark as mounted on client
    setIsMounted(true);

    // Auto hide loading after max timeout (prevents infinite loading)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 8000); // Maximum 8 seconds of loading

    return () => clearTimeout(timer);
  }, []);

  // Show fancy loading screen only after component is mounted
  // Before that, initial-loader from CSS will be shown
  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {/* The loading overlay - positioned above everything */}
      {isLoading && isMounted && (
        <div
          className="fixed inset-0 z-[9999]"
          style={{ pointerEvents: "all" }}
        >
          <ModernLoadingScreen />
        </div>
      )}

      {/* Regular content - hidden visually while loading but still rendered */}
      <div
        className="transition-opacity duration-500"
        style={{
          opacity: isLoading ? 0 : 1,
          visibility: isLoading ? "hidden" : "visible",
        }}
      >
        {children}
      </div>
    </LoadingContext.Provider>
  );
}
