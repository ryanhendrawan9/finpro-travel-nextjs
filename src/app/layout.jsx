"use client";

import { Poppins, Montserrat } from "next/font/google";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { UIProvider } from "@/context/UIContext";
import { LoadingProvider } from "@/context/LoadingContext";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-montserrat",
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  // Add a script to the document without using inline styles
  useEffect(() => {
    // Use a separate stylesheet instead of inline styles to avoid hydration issues
    const style = document.createElement("style");
    style.innerHTML = `
      html {
        background: linear-gradient(to bottom right, #1e3a8a, #312e81) !important;
        height: 100% !important;
      }
      body {
        margin: 0;
        height: 100%;
        background: transparent !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <html lang="en">
      <head>
        {/* Add a noscript tag for users with JavaScript disabled */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html: `
            html {
              background: linear-gradient(to bottom right, #1e3a8a, #312e81) !important;
            }
            body {
              background: transparent !important;
            }
          `,
            }}
          />
        </noscript>
      </head>
      <body className={`${poppins.variable} ${montserrat.variable} font-sans`}>
        <AuthProvider>
          <CartProvider>
            <UIProvider>
              <LoadingProvider>
                <div className="flex flex-col min-h-screen">
                  {!isAuthPage && <Navbar />}
                  <main className="flex-grow">{children}</main>
                  {!isAuthPage && <Footer />}
                </div>
                <ToastContainer position="top-right" autoClose={3000} />
              </LoadingProvider>
            </UIProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
