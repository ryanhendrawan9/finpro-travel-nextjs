// src/components/ui/no-flash-loader.jsx
"use client";

import { useEffect, useState } from "react";
import { useLoading } from "@/context/LoadingContext";
import ModernLoadingScreen from "@/components/ui/loading-screen";

export default function NoFlashLoader() {
  const { isLoading } = useLoading();
  const [isMounted, setIsMounted] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  // Only run client-side code after mounting
  useEffect(() => {
    setIsMounted(true);

    // Add the JS loaded class to enable transitions
    document.documentElement.classList.add("js-loaded");

    // Set a class on the body to prevent flash
    document.body.classList.add("loading");

    // Show loader only if needed after mounting
    if (isLoading) {
      setShowLoader(true);
    }

    // Remove the loading class when the app is ready
    if (!isLoading) {
      // Give a small delay before removing the class for smoother transition
      const timer = setTimeout(() => {
        document.body.classList.remove("loading");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Sync the showLoader state with isLoading after mount
  useEffect(() => {
    if (!isMounted) return;

    if (isLoading) {
      setShowLoader(true);
    } else {
      // Add a slight delay before hiding loader
      const hideTimer = setTimeout(() => {
        setShowLoader(false);
      }, 500);
      return () => clearTimeout(hideTimer);
    }
  }, [isLoading, isMounted]);

  // Only render on client side and when needed
  if (!isMounted || !showLoader) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center">
      <ModernLoadingScreen />
    </div>
  );
}
