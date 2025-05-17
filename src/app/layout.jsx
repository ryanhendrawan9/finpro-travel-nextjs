"use client";

import { Poppins, Montserrat } from "next/font/google";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { UIProvider } from "@/context/UIContext";
import { LoadingProvider } from "@/context/LoadingContext";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

// Use dynamic imports for components that aren't needed on the first render
const Navbar = dynamic(() => import("@/components/layout/navbar"), {
  ssr: true,
  loading: () => <NavbarSkeleton />,
});

const Footer = dynamic(() => import("@/components/layout/footer"), {
  ssr: true,
  loading: () => <FooterSkeleton />,
});

// Simple skeleton loaders
const NavbarSkeleton = () => (
  <div className="fixed top-0 z-40 w-full h-20 bg-white shadow-sm">
    <div className="flex items-center justify-between h-full px-4 mx-auto max-w-7xl">
      <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
      <div className="flex space-x-4">
        <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  </div>
);

const FooterSkeleton = () => (
  <div className="py-12 bg-gray-900">
    <div className="px-4 mx-auto max-w-7xl">
      <div className="h-40 bg-gray-800 rounded-lg animate-pulse"></div>
    </div>
  </div>
);

// Optimize font loading
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Reduce the number of weights loaded
  variable: "--font-poppins",
  display: "swap", // Use swap to prevent FOIT (Flash of Invisible Text)
  preload: true,
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "700"], // Reduce weights loaded
  variable: "--font-montserrat",
  display: "swap",
  preload: true,
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const [mounted, setMounted] = useState(false);

  // Use this to prevent hydration issues
  useEffect(() => {
    setMounted(true);

    // Add JS loaded class to enable transitions
    document.documentElement.classList.add("js-loaded");

    // Preload critical resources
    const preloadAssets = () => {
      // Preload logo
      const logoLink = document.createElement("link");
      logoLink.rel = "preload";
      logoLink.as = "image";
      logoLink.href = "/images/logo.png";
      document.head.appendChild(logoLink);

      // Add other critical assets as needed
    };

    preloadAssets();

    // Remove inline styles that were causing hydration issues
    const removeInlineStyles = () => {
      const style = document.createElement("style");
      style.innerHTML = `
        html {
          background: linear-gradient(to bottom right, #1e3a8a) !important;
          height: 100% !important;
        }
        body {
          margin: 0;
          height: 100%;
        }
      `;
      document.head.appendChild(style);
    };

    if (typeof window !== "undefined") {
      removeInlineStyles();

      // Add page load event listener to record LCP
      const recordLCP = () => {
        // Use web vitals or your analytics solution here
        if ("PerformanceObserver" in window) {
          const observer = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach((entry) => {
              if (entry.entryType === "largest-contentful-paint") {
                console.log("LCP:", entry.startTime);
                // Send to analytics if needed
              }
            });
          });
          observer.observe({
            type: "largest-contentful-paint",
            buffered: true,
          });
        }
      };

      recordLCP();
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <html lang="en" className={`${poppins.variable} ${montserrat.variable}`}>
      <head>
        {/* Add preconnect for external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://images.unsplash.com" />

        {/* Add preload for critical CSS */}
        <link rel="preload" href="/app/layout.css" as="style" />

        {/* Add meta description for SEO */}
        <meta
          name="description"
          content="Discover extraordinary destinations and create unforgettable memories with HealingKuy. Book your dream vacation today!"
        />

        {/* Add meta viewport tag for mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Add title tag for SEO */}
        <title>HealingKuy</title>

        {/* Add fallback for users with JavaScript disabled */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html: `
              html {
                background: linear-gradient(to bottom right, #1e3a8a) !important;
              }
              body {
                background: white !important;
                opacity: 1 !important;
              }
            `,
            }}
          />
        </noscript>
      </head>
      <body className={`font-sans opacity-0 transition-opacity duration-500`}>
        <AuthProvider>
          <CartProvider>
            <UIProvider>
              <LoadingProvider>
                <div className="flex flex-col min-h-screen">
                  {!isAuthPage && <Navbar />}
                  <main className="flex-grow">{mounted ? children : null}</main>
                  {!isAuthPage && <Footer />}
                </div>
                <ToastContainer
                  position="top-right"
                  autoClose={3000}
                  hideProgressBar={true}
                  newestOnTop
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                />
              </LoadingProvider>
            </UIProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
