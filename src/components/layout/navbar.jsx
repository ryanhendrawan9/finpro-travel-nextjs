"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMenu,
  FiX,
  FiUser,
  FiShoppingCart,
  FiChevronDown,
  FiLogOut,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { cartItems, getCartTotals } = useCart();
  const { totalItems } = getCartTotals();

  // Check if we're on the homepage
  const isHomepage = pathname === "/";

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getNavbarClass = () => {
    if (isHomepage && !scrolled) {
      return "bg-transparent text-white";
    } else {
      return "bg-white text-gray-800 shadow-md";
    }
  };

  return (
    <motion.nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${getNavbarClass()}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span
                className={`font-bold text-2xl ${
                  isHomepage && !scrolled ? "text-white" : "text-primary-600"
                }`}
              >
                TravelBright
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="items-center hidden space-x-8 md:flex">
            <Link
              href="/"
              className={`font-medium hover:text-primary-500 transition-colors ${
                pathname === "/" ? "text-primary-500" : ""
              }`}
            >
              Home
            </Link>
            <Link
              href="/banner"
              className={`font-medium hover:text-primary-500 transition-colors ${
                pathname.startsWith("/banner") ? "text-primary-500" : ""
              }`}
            >
              Banners
            </Link>
            <Link
              href="/category"
              className={`font-medium hover:text-primary-500 transition-colors ${
                pathname.startsWith("/category") ? "text-primary-500" : ""
              }`}
            >
              Categories
            </Link>
            <Link
              href="/activity"
              className={`font-medium hover:text-primary-500 transition-colors ${
                pathname.startsWith("/activity") ? "text-primary-500" : ""
              }`}
            >
              Activities
            </Link>
            <Link
              href="/promo"
              className={`font-medium hover:text-primary-500 transition-colors ${
                pathname.startsWith("/promo") ? "text-primary-500" : ""
              }`}
            >
              Promos
            </Link>
          </div>

          {/* User actions */}
          <div className="items-center hidden space-x-6 md:flex">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 transition-colors rounded-full hover:bg-gray-100"
            >
              <FiShoppingCart
                size={22}
                className={
                  isHomepage && !scrolled ? "text-white" : "text-gray-700"
                }
              />
              {isAuthenticated && totalItems > 0 && (
                <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full -top-1 -right-1 bg-primary-600">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Profile */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  className="flex items-center space-x-1 focus:outline-none"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <div className="overflow-hidden border-2 rounded-full w-9 h-9 border-primary-500">
                    <img
                      src={
                        user.profilePictureUrl ||
                        "/images/placeholders/user-placeholder.jpg"
                      }
                      alt="Profile"
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "/images/placeholders/user-placeholder.jpg";
                      }}
                    />
                  </div>
                  <FiChevronDown
                    size={16}
                    className={
                      isHomepage && !scrolled ? "text-white" : "text-gray-700"
                    }
                  />
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      className="absolute right-0 z-10 w-48 py-1 mt-2 bg-white rounded-md shadow-lg"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                        <p className="font-medium">{user.name || user.email}</p>
                        <p className="text-xs text-gray-500">{user.role}</p>
                      </div>

                      {/* Menu items for all users */}
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Profile
                      </Link>

                      {/* User-specific menu items */}
                      {user.role === "user" && (
                        <Link
                          href="/transaction"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          My Orders
                        </Link>
                      )}

                      {/* Admin-specific menu items */}
                      {user.role === "admin" && (
                        <>
                          <Link
                            href="/admin/dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            Dashboard
                          </Link>
                          <Link
                            href="/transaction"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            Transactions
                          </Link>
                        </>
                      )}

                      <button
                        className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
                        onClick={() => {
                          setIsProfileOpen(false);
                          logout();
                        }}
                      >
                        <div className="flex items-center">
                          <FiLogOut className="mr-2" />
                          Logout
                        </div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className={`px-3 py-2 rounded-lg font-medium ${
                    isHomepage && !scrolled
                      ? "text-white hover:bg-white hover:bg-opacity-20"
                      : "text-primary-600 hover:bg-primary-50"
                  } transition-colors`}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 font-medium text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              className="p-2 rounded-md focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <FiX
                  size={24}
                  className={
                    isHomepage && !scrolled ? "text-white" : "text-gray-700"
                  }
                />
              ) : (
                <FiMenu
                  size={24}
                  className={
                    isHomepage && !scrolled ? "text-white" : "text-gray-700"
                  }
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="bg-white md:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 shadow-lg">
              <Link
                href="/"
                className="block px-3 py-2 font-medium text-gray-700 rounded-md hover:bg-primary-50 hover:text-primary-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/banner"
                className="block px-3 py-2 font-medium text-gray-700 rounded-md hover:bg-primary-50 hover:text-primary-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Banners
              </Link>
              <Link
                href="/category"
                className="block px-3 py-2 font-medium text-gray-700 rounded-md hover:bg-primary-50 hover:text-primary-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                href="/activity"
                className="block px-3 py-2 font-medium text-gray-700 rounded-md hover:bg-primary-50 hover:text-primary-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Activities
              </Link>
              <Link
                href="/promo"
                className="block px-3 py-2 font-medium text-gray-700 rounded-md hover:bg-primary-50 hover:text-primary-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Promos
              </Link>
              <div className="pt-3 border-t border-gray-200">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center px-3 py-2">
                      <div className="w-8 h-8 overflow-hidden border-2 rounded-full border-primary-500">
                        <img
                          src={
                            user.profilePictureUrl ||
                            "/images/placeholders/user-placeholder.jpg"
                          }
                          alt="Profile"
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "/images/placeholders/user-placeholder.jpg";
                          }}
                        />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-700">
                          {user.name || user.email}
                        </p>
                        <p className="text-xs text-gray-500">{user.role}</p>
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-3 py-2 font-medium text-gray-700 rounded-md hover:bg-primary-50 hover:text-primary-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/cart"
                      className="block px-3 py-2 font-medium text-gray-700 rounded-md hover:bg-primary-50 hover:text-primary-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Cart ({totalItems})
                    </Link>

                    {/* User-specific mobile menu items */}
                    {user.role === "user" && (
                      <Link
                        href="/transaction"
                        className="block px-3 py-2 font-medium text-gray-700 rounded-md hover:bg-primary-50 hover:text-primary-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        My Orders
                      </Link>
                    )}

                    {/* Admin-specific mobile menu items */}
                    {user.role === "admin" && (
                      <>
                        <Link
                          href="/admin/dashboard"
                          className="block px-3 py-2 font-medium text-gray-700 rounded-md hover:bg-primary-50 hover:text-primary-600"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/transaction"
                          className="block px-3 py-2 font-medium text-gray-700 rounded-md hover:bg-primary-50 hover:text-primary-600"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Transactions
                        </Link>
                      </>
                    )}

                    <button
                      className="flex items-center w-full px-3 py-2 font-medium text-left text-red-600 rounded-md hover:bg-primary-50 hover:text-red-700"
                      onClick={() => {
                        setIsMenuOpen(false);
                        logout();
                      }}
                    >
                      <FiLogOut className="mr-2" /> Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col px-3 space-y-2">
                    <Link
                      href="/login"
                      className="px-4 py-2 font-medium text-center transition-colors rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="px-4 py-2 font-medium text-center text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
