// src/app/layout.jsx
"use client";

import { Poppins, Montserrat } from "next/font/google";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { UIProvider } from "@/context/UIContext";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { usePathname } from "next/navigation";
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

  return (
    <html lang="en">
      <body className={`${poppins.variable} ${montserrat.variable} font-sans`}>
        <AuthProvider>
          <CartProvider>
            <UIProvider>
              <div className="flex flex-col min-h-screen">
                {!isAuthPage && <Navbar />}
                <main className="flex-grow">{children}</main>
                {!isAuthPage && <Footer />}
              </div>
              <ToastContainer position="top-right" autoClose={3000} />
            </UIProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
