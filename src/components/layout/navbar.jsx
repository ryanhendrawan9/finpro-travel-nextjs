"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMenu,
  FiX,
  FiUser,
  FiShoppingCart,
  FiChevronDown,
  FiLogOut,
  FiSearch,
  FiMapPin,
  FiBell,
  FiHome,
  FiTag,
  FiLayers,
  FiActivity,
  FiPercent,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function ModernNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Navbar classes based on scroll position and current page
  const getNavbarClass = () => {
    // Use a bright theme for navbar
    return scrolled ? "bg-white shadow-lg shadow-gray-200/50" : "bg-white";
  };

  // Animation variants
  const navbarVariants = {
    initial: { y: -100 },
    animate: {
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.2,
      },
    },
  };

  const dropdownVariants = {
    closed: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      pointerEvents: "none",
    },
    open: {
      opacity: 1,
      y: 0,
      scale: 1,
      pointerEvents: "auto",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  const searchVariants = {
    closed: {
      width: "40px",
      borderColor: "rgba(209, 213, 219, 0)",
    },
    open: {
      width: "240px",
      borderColor: "rgba(209, 213, 219, 1)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  const mobileMenuItemVariants = {
    hidden: {
      opacity: 0,
      y: -10,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.2,
      },
    },
  };

  const linkHoverVariants = {
    initial: {},
    hover: {
      scale: 1.05,
      y: -1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 10,
      },
    },
  };

  // Effect to close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close profile dropdown when clicking outside
      if (isProfileOpen && !event.target.closest(".profile-dropdown")) {
        setIsProfileOpen(false);
      }

      // Close search when clicking outside
      if (searchOpen && !event.target.closest(".search-container")) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileOpen, searchOpen]);

  // Close menu when clicking escape key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setIsProfileOpen(false);
        setSearchOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  const navLinks = [
    { href: "/", label: "Home", icon: FiHome },
    { href: "/banner", label: "Banners", icon: FiTag },
    { href: "/category", label: "Categories", icon: FiLayers },
    { href: "/activity", label: "Activities", icon: FiActivity },
    { href: "/promo", label: "Promos", icon: FiPercent },
  ];

  return (
    <motion.nav
      className={`fixed top-0 w-full z-40 transition-all duration-300 ${getNavbarClass()}`}
      variants={navbarVariants}
      initial="initial"
      animate="animate"
    >
      <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Area */}
          <motion.div
            className="flex items-center flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo.png"
                alt="HealingKuy Logo"
                width={120}
                height={45}
                className="brightness-100" // Normal logo display
                priority
              />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="items-center hidden md:flex">
            <div className="flex items-center space-x-2">
              {navLinks.map((link) => (
                <motion.div
                  key={link.href}
                  className="relative"
                  whileHover="hover"
                  initial="initial"
                >
                  <Link
                    href={link.href}
                    className={`px-5 py-2 font-medium rounded-full transition-colors relative ${
                      pathname === link.href ||
                      pathname.startsWith(link.href + "/")
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                    }`}
                  >
                    <motion.span variants={linkHoverVariants}>
                      {link.label}
                    </motion.span>
                  </Link>

                  {/* Active indicator dot */}
                  {(pathname === link.href ||
                    pathname.startsWith(link.href + "/")) && (
                    <motion.div
                      className="absolute bottom-0 w-1 h-1 transform -translate-x-1/2 bg-blue-500 rounded-full left-1/2"
                      layoutId="navIndicator"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Search and User actions */}
          <div className="items-center hidden space-x-2 md:flex">
            {/* Search Bar */}
            <motion.div
              className="relative search-container"
              variants={searchVariants}
              initial="closed"
              animate={searchOpen ? "open" : "closed"}
            >
              <input
                type="text"
                placeholder="Search..."
                className={`py-2 pr-3 pl-10 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  searchOpen
                    ? "opacity-100 border-gray-300 bg-white text-gray-800"
                    : "opacity-0 border-transparent"
                }`}
              />
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="absolute top-0 bottom-0 left-0 flex items-center justify-center w-10 text-gray-500 hover:text-gray-700"
                aria-label="Search"
              >
                <FiSearch size={18} />
              </button>
            </motion.div>

            {/* Cart */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Link
                href="/cart"
                className="relative flex items-center justify-center w-10 h-10 text-gray-600 rounded-full hover:bg-gray-100 hover:text-blue-600"
                aria-label="Shopping Cart"
              >
                <FiShoppingCart size={20} />
                {isAuthenticated && totalItems > 0 && (
                  <motion.span
                    className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full -top-1 -right-1"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 15,
                    }}
                  >
                    {totalItems}
                  </motion.span>
                )}
              </Link>
            </motion.div>

            {/* User Profile */}
            <div className="relative profile-dropdown">
              {isAuthenticated ? (
                <motion.button
                  className={`flex items-center space-x-2 p-1 rounded-full focus:outline-none text-gray-600 hover:text-blue-600 ${
                    isProfileOpen ? "ring-2 ring-blue-500/50" : ""
                  }`}
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  aria-expanded={isProfileOpen}
                  aria-label="User menu"
                >
                  <div className="overflow-hidden border-2 border-blue-500 rounded-full w-9 h-9">
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
                  <FiChevronDown size={16} />
                </motion.button>
              ) : (
                <div className="flex items-center space-x-2">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 10,
                    }}
                  >
                    <Link
                      href="/login"
                      className="px-4 py-2 font-medium text-gray-700 transition-colors border border-gray-200 rounded-full hover:bg-gray-100 hover:text-blue-600"
                    >
                      Login
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 10,
                    }}
                  >
                    <Link
                      href="/register"
                      className="px-4 py-2 font-medium text-white transition-colors border rounded-full shadow-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-blue-400/20 shadow-blue-500/20"
                    >
                      Register
                    </Link>
                  </motion.div>
                </div>
              )}

              {/* Profile Dropdown */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    className="absolute right-0 z-10 w-64 mt-2 overflow-hidden text-gray-800 bg-white border shadow-xl rounded-xl backdrop-blur-sm border-gray-200/50"
                    variants={dropdownVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                  >
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 overflow-hidden rounded-full ring-2 ring-blue-500/50">
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
                        <div>
                          <p className="font-medium">
                            {user.name || user.email}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {user.role}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 text-sm text-gray-600">
                        <div className="flex items-start">
                          <FiMapPin
                            className="mt-1 mr-2 text-blue-500"
                            size={14}
                          />
                          <span>Banjarmasin, Indonesia</span>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {/* Common menu items */}
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FiUser className="mr-3 text-gray-500" size={16} />
                        Profile
                      </Link>

                      <Link
                        href="/transaction"
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FiShoppingCart
                          className="mr-3 text-gray-500"
                          size={16}
                        />
                        My Orders
                      </Link>

                      {/* Admin-specific menu items */}
                      {user.role === "admin" && (
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <FiBell className="mr-3 text-gray-500" size={16} />
                          Dashboard
                        </Link>
                      )}
                    </div>

                    {/* Logout button */}
                    <div className="pt-2 pb-2 border-t border-gray-100">
                      <button
                        className="flex items-center w-full px-4 py-2.5 text-sm text-left text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setIsProfileOpen(false);
                          logout();
                        }}
                      >
                        <FiLogOut className="mr-3" size={16} />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-3 md:hidden">
            {/* Mobile Cart Button */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-600 hover:text-blue-600"
            >
              <FiShoppingCart size={22} />
              {isAuthenticated && totalItems > 0 && (
                <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full -top-1 -right-1">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <motion.button
              className="p-2 text-gray-600 rounded-full hover:bg-gray-100 hover:text-blue-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FiX size={24} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FiMenu size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu - Improved with fixed position and smoother animations */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-30 pt-20 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsMenuOpen(false);
              }
            }}
          >
            <motion.div
              className="absolute top-20 inset-x-0 max-h-[calc(100vh-5rem)] overflow-y-auto shadow-xl bg-white/95 backdrop-blur-md rounded-b-2xl border-t border-gray-200"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="px-4 py-5 space-y-4">
                {/* Mobile Search */}
                <motion.div
                  className="relative mb-4"
                  variants={mobileMenuItemVariants}
                >
                  <input
                    type="text"
                    placeholder="Search destinations..."
                    className="w-full py-2.5 pl-10 pr-4 bg-gray-50 border border-gray-200 text-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <FiSearch
                    className="absolute text-gray-500 left-3.5 top-3"
                    size={16}
                  />
                </motion.div>

                {/* Navigation Links */}
                <div className="space-y-1">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.href}
                      variants={mobileMenuItemVariants}
                    >
                      <Link
                        href={link.href}
                        className={`flex items-center px-4 py-3 font-medium rounded-lg ${
                          pathname === link.href
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                        } transition-colors`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <link.icon className="mr-3 text-gray-500" size={18} />
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* User Profile Section */}
                <motion.div
                  className="pt-4 mt-4 border-t border-gray-200"
                  variants={mobileMenuItemVariants}
                >
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center p-4 mb-4 bg-gray-50 rounded-xl">
                        <div className="w-12 h-12 overflow-hidden border-2 border-blue-500 rounded-full">
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
                        <div className="ml-4">
                          <p className="font-medium text-gray-800">
                            {user.name || user.email}
                          </p>
                          <p className="text-sm text-gray-500">{user.role}</p>
                        </div>
                      </div>

                      {/* User Actions */}
                      <div className="space-y-1">
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-3 font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-blue-600"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <FiUser className="mr-3 text-gray-500" />
                          Profile
                        </Link>

                        <Link
                          href="/cart"
                          className="flex items-center px-4 py-3 font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-blue-600"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <FiShoppingCart className="mr-3 text-gray-500" />
                          Cart ({totalItems})
                        </Link>

                        {/* Role-specific links */}
                        {user.role === "user" && (
                          <Link
                            href="/transaction"
                            className="flex items-center px-4 py-3 font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-blue-600"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <FiBell className="mr-3 text-gray-500" />
                            My Orders
                          </Link>
                        )}

                        {user.role === "admin" && (
                          <>
                            <Link
                              href="/transaction"
                              className="flex items-center px-4 py-3 font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-blue-600"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <FiBell className="mr-3 text-gray-500" />
                              My Orders
                            </Link>
                            <Link
                              href="/admin/dashboard"
                              className="flex items-center px-4 py-3 font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-blue-600"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <FiBell className="mr-3 text-gray-500" />
                              Dashboard
                            </Link>
                          </>
                        )}

                        <motion.button
                          className="flex items-center w-full px-4 py-3 font-medium text-left text-red-600 rounded-lg hover:bg-red-50"
                          onClick={() => {
                            setIsMenuOpen(false);
                            logout();
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <FiLogOut className="mr-3" />
                          Logout
                        </motion.button>
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 p-2">
                      <Link
                        href="/login"
                        className="flex items-center justify-center px-4 py-3 font-medium text-center text-gray-700 transition-colors border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FiUser className="mr-2" size={18} />
                        Login
                      </Link>
                      <Link
                        href="/register"
                        className="flex items-center justify-center px-4 py-3 font-medium text-center text-white transition-colors rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
