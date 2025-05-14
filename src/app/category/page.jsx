"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronRight,
  FiChevronLeft,
  FiSearch,
  FiX,
  FiMap,
} from "react-icons/fi";
import { categoryService } from "@/lib/api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // View control states like in banner page
  const [isGridView, setIsGridView] = useState(true);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryService.getAll();
        setCategories(response.data.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories. Please try again later.");
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 300); // Small delay for smoother transitions
      }
    };

    fetchCategories();
  }, []);

  // Filtered categories using useMemo - only search functionality (like in banner page)
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;

    return categories.filter((category) => {
      return category.name?.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [categories, searchTerm]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  // Calculate pagination values
  const totalItems = filteredCategories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCategories.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
  };

  // Page change handlers
  const goToPage = (pageNumber) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate page buttons for pagination
  const getPageButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;

    // Calculate range of visible page buttons
    let startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisibleButtons / 2)
    );
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    // First page button
    if (startPage > 1) {
      buttons.push(
        <motion.button
          key="first"
          onClick={() => goToPage(1)}
          className="px-3 py-1 text-sm font-medium text-gray-700 transition-colors rounded-md hover:bg-gray-100"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          1
        </motion.button>
      );

      // Ellipsis if needed
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis1" className="px-2 text-gray-500">
            ...
          </span>
        );
      }
    }

    // Page buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <motion.button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-1 text-sm font-medium rounded-md ${
            currentPage === i
              ? "bg-primary-600 text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            backgroundColor:
              currentPage === i ? "rgb(79, 70, 229)" : "transparent",
            color: currentPage === i ? "white" : "rgb(55, 65, 81)",
          }}
        >
          {i}
        </motion.button>
      );
    }

    // Ellipsis if needed
    if (endPage < totalPages - 1) {
      buttons.push(
        <span key="ellipsis2" className="px-2 text-gray-500">
          ...
        </span>
      );
    }

    // Last page button
    if (endPage < totalPages) {
      buttons.push(
        <motion.button
          key="last"
          onClick={() => goToPage(totalPages)}
          className="px-3 py-1 text-sm font-medium text-gray-700 transition-colors rounded-md hover:bg-gray-100"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {totalPages}
        </motion.button>
      );
    }

    return buttons;
  };

  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants = isGridView
    ? {
        hidden: { opacity: 0, y: 50 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 12,
          },
        },
        exit: {
          opacity: 0,
          y: 30,
          transition: {
            type: "tween",
            ease: "easeInOut",
            duration: 0.3,
          },
        },
        hover: {
          y: -10,
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 15,
          },
        },
      }
    : {
        hidden: { opacity: 0, x: -50 },
        visible: {
          opacity: 1,
          x: 0,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 12,
          },
        },
        exit: {
          opacity: 0,
          x: 50,
          transition: {
            type: "tween",
            ease: "easeInOut",
            duration: 0.3,
          },
        },
        hover: {
          scale: 1.02,
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 15,
          },
        },
      };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.1,
      },
    },
  };

  // Loading Animation
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: 1,
            scale: [1, 1.05, 1],
            transition: {
              scale: {
                repeat: Infinity,
                duration: 1.5,
                repeatType: "reverse",
              },
            },
          }}
          className="flex flex-col items-center text-2xl font-bold text-primary-600"
        >
          <svg
            className="w-10 h-10 mb-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading categories...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-2xl font-bold text-red-600"
        >
          {error}
        </motion.div>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.reload()}
          className="px-6 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
        >
          Try Again
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mb-8 text-center"
          variants={headerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl font-heading"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{
              repeat: 0,
              duration: 1.5,
            }}
          >
            Explore Our Categories
          </motion.h1>
          <motion.p
            className="max-w-3xl mx-auto text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Discover a variety of amazing travel experiences and activities by
            category
          </motion.p>
        </motion.div>

        {/* Search and View Controls */}
        {categories.length > 0 && (
          <>
            {/* Search Bar */}
            <motion.div
              className="p-4 mb-6 bg-white shadow-sm rounded-xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full py-3 pl-10 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Search categories by name..."
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    <FiX />
                  </button>
                )}
              </div>
            </motion.div>

            {/* View Controls */}
            <motion.div
              className="flex flex-wrap items-center justify-between gap-4 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center space-x-4">
                <motion.button
                  onClick={() => setIsGridView(true)}
                  className={`p-2 rounded-md border ${
                    isGridView
                      ? "bg-primary-50 border-primary-200"
                      : "border-gray-200"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </motion.button>
                <motion.button
                  onClick={() => setIsGridView(false)}
                  className={`p-2 rounded-md border ${
                    !isGridView
                      ? "bg-primary-50 border-primary-200"
                      : "border-gray-200"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                </motion.button>
              </div>

              <div className="flex items-center">
                <label
                  htmlFor="items-per-page"
                  className="mr-2 text-sm text-gray-700"
                >
                  Show:
                </label>
                <motion.select
                  id="items-per-page"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  whileHover={{ scale: 1.02 }}
                >
                  <option value={3}>3</option>
                  <option value={6}>6</option>
                  <option value={9}>9</option>
                  <option value={12}>12</option>
                </motion.select>
              </div>
            </motion.div>
          </>
        )}

        {/* Results count if searching */}
        {searchTerm && (
          <motion.div
            className="mb-6 text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Found {totalItems} {totalItems !== 1 ? "categories" : "category"}{" "}
            matching "{searchTerm}"
          </motion.div>
        )}

        {totalItems > 0 ? (
          <>
            <AnimatePresence mode="wait">
              {isGridView ? (
                <motion.div
                  key="grid-view"
                  className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {currentItems.map((category) => (
                    <motion.div
                      key={category.id}
                      variants={itemVariants}
                      whileHover="hover"
                      className="overflow-hidden transition-shadow bg-white shadow-sm rounded-xl"
                    >
                      <Link href={`/category/${category.id}`}>
                        <div className="relative overflow-hidden">
                          <motion.img
                            src={
                              category.imageUrl ||
                              "/images/placeholders/category-placeholder.jpg"
                            }
                            alt={category.name}
                            className="object-cover w-full h-48"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "/images/placeholders/category-placeholder.jpg";
                            }}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>

                        <div className="p-6">
                          <h3 className="mb-2 text-lg font-bold text-gray-900">
                            {category.name}
                          </h3>
                          <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                            Explore amazing activities in this category
                          </p>

                          <motion.div
                            className="flex items-center text-primary-600"
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <span className="font-medium">View Activities</span>
                            <FiChevronRight className="ml-1" />
                          </motion.div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="list-view"
                  className="flex flex-col gap-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {currentItems.map((category) => (
                    <motion.div
                      key={category.id}
                      variants={itemVariants}
                      whileHover="hover"
                      className="flex overflow-hidden bg-white shadow-sm rounded-xl"
                    >
                      <Link
                        href={`/category/${category.id}`}
                        className="flex w-full"
                      >
                        <div className="relative w-48 overflow-hidden">
                          <motion.img
                            src={
                              category.imageUrl ||
                              "/images/placeholders/category-placeholder.jpg"
                            }
                            alt={category.name}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "/images/placeholders/category-placeholder.jpg";
                            }}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>

                        <div className="flex flex-col justify-between flex-1 p-6">
                          <div>
                            <h3 className="mb-2 text-lg font-bold text-gray-900">
                              {category.name}
                            </h3>
                            <p className="mb-4 text-sm text-gray-600">
                              Explore amazing activities in this category
                            </p>
                          </div>

                          <motion.div
                            className="flex items-center self-end text-primary-600"
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <span className="font-medium">View Activities</span>
                            <FiChevronRight className="ml-1" />
                          </motion.div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <motion.div
                className="flex flex-col items-center justify-between mt-10 space-y-3 sm:flex-row sm:space-y-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, totalItems)}
                  </span>{" "}
                  of <span className="font-medium">{totalItems}</span>{" "}
                  categories
                </div>

                <div className="flex items-center space-x-1">
                  {/* Previous page button */}
                  <motion.button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md ${
                      currentPage === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    aria-label="Previous page"
                    whileHover={currentPage !== 1 ? { scale: 1.1 } : {}}
                    whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
                  >
                    <FiChevronLeft className="w-5 h-5" />
                  </motion.button>

                  {/* Page number buttons */}
                  <div className="flex items-center">{getPageButtons()}</div>

                  {/* Next page button */}
                  <motion.button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md ${
                      currentPage === totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    aria-label="Next page"
                    whileHover={
                      currentPage !== totalPages ? { scale: 1.1 } : {}
                    }
                    whileTap={currentPage !== totalPages ? { scale: 0.95 } : {}}
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            className="p-8 text-center bg-white shadow-sm rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
            }}
          >
            <motion.div
              className="w-16 h-16 mx-auto mb-4 text-gray-300"
              animate={{
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </motion.div>
            <motion.h3
              className="mb-2 text-xl font-bold text-gray-900"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {searchTerm
                ? "No categories match your search"
                : "No categories found"}
            </motion.h3>
            <motion.p
              className="mb-6 text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {searchTerm
                ? "Try different keywords or clear your search."
                : "There are currently no active categories. Check back later for new content!"}
            </motion.p>
            {searchTerm ? (
              <motion.button
                onClick={clearSearch}
                className="inline-block px-6 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear Search
              </motion.button>
            ) : (
              <Link href="/">
                <motion.div
                  className="inline-block px-6 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Back to Home
                </motion.div>
              </Link>
            )}
          </motion.div>
        )}

        {/* Featured category section */}
        {categories.length > 0 && (
          <motion.div
            className="pt-8 mt-16 border-t border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="mb-6 text-2xl font-bold text-center text-gray-900 font-heading">
              Featured Category
            </h2>

            <motion.div
              className="overflow-hidden bg-white shadow-lg rounded-3xl"
              whileHover={{
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative h-64 lg:h-auto">
                  <motion.img
                    src={
                      categories[0]?.imageUrl ||
                      "/images/placeholders/category-placeholder.jpg"
                    }
                    alt={categories[0]?.name || "Featured Category"}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "/images/placeholders/category-placeholder.jpg";
                    }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent lg:hidden" />
                </div>

                <div className="flex flex-col justify-center p-8 lg:p-12">
                  <h3 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">
                    {categories[0]?.name || "Featured Category"}
                  </h3>

                  <p className="mb-6 text-gray-600">
                    Experience the best of{" "}
                    {categories[0]?.name || "our featured category"} with our
                    curated selection of activities. From beginner-friendly
                    options to expert-level adventures, there's something for
                    everyone.
                  </p>

                  <div className="flex flex-wrap gap-4 mb-8">
                    <motion.div
                      className="flex items-center px-4 py-2 rounded-full bg-primary-50 text-primary-700"
                      whileHover={{ scale: 1.05, backgroundColor: "#EEF2FF" }}
                    >
                      <FiMap className="mr-2" />
                      <span>Multiple Locations</span>
                    </motion.div>
                    <motion.div
                      className="flex items-center px-4 py-2 text-green-700 rounded-full bg-green-50"
                      whileHover={{ scale: 1.05, backgroundColor: "#ECFDF5" }}
                    >
                      <span>20+ Activities</span>
                    </motion.div>
                  </div>

                  <Link
                    href={`/category/${categories[0]?.id}`}
                    className="inline-flex items-center self-start px-6 py-3 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
                  >
                    <motion.div
                      className="flex items-center"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      Explore Now <FiChevronRight className="ml-2" />
                    </motion.div>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
