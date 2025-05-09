"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiChevronRight, FiMap, FiChevronLeft } from "react-icons/fi";
import { categoryService } from "@/lib/api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAll();
        setCategories(response.data.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Calculate pagination values
  const totalItems = categories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = categories.slice(indexOfFirstItem, indexOfLastItem);

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
        <button
          key="first"
          onClick={() => goToPage(1)}
          className="px-3 py-1 text-sm font-medium text-gray-700 transition-colors rounded-md hover:bg-gray-100"
        >
          1
        </button>
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
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-1 text-sm font-medium rounded-md ${
            currentPage === i
              ? "bg-primary-600 text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {i}
        </button>
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
        <button
          key="last"
          onClick={() => goToPage(totalPages)}
          className="px-3 py-1 text-sm font-medium text-gray-700 transition-colors rounded-md hover:bg-gray-100"
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-bold animate-pulse text-primary-600">
          Loading categories...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="mb-4 text-2xl font-bold text-red-600">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-900 font-heading">
          Explore Categories
        </h1>
        <p className="max-w-3xl mx-auto mb-12 text-gray-600">
          Discover a variety of amazing travel experiences and activities by
          category. From adventurous outdoor activities to relaxing cultural
          tours, we have something for everyone.
        </p>

        {/* Items per page selector */}
        {categories.length > 0 && (
          <div className="flex justify-end mb-6">
            <div className="flex items-center">
              <label
                htmlFor="items-per-page"
                className="mr-2 text-sm text-gray-700"
              >
                Show:
              </label>
              <select
                id="items-per-page"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Reset to first page when changing items per page
                }}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={3}>3</option>
                <option value={6}>6</option>
                <option value={9}>9</option>
                <option value={12}>12</option>
              </select>
            </div>
          </div>
        )}

        <motion.div
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {currentItems.map((category) => (
            <motion.div
              key={category.id}
              variants={itemVariants}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <Link href={`/category/${category.id}`}>
                <div className="relative h-64 overflow-hidden transition-shadow duration-300 shadow-lg group rounded-2xl hover:shadow-xl">
                  <img
                    src={
                      category.imageUrl ||
                      "/images/placeholders/category-placeholder.jpg"
                    }
                    alt={category.name}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "/images/placeholders/category-placeholder.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="mb-2 text-2xl font-bold text-white">
                        {category.name}
                      </h3>
                      <div className="flex items-center justify-center w-10 h-10 transition-transform rounded-full bg-white/20 group-hover:translate-x-2">
                        <FiChevronRight className="text-white" size={20} />
                      </div>
                    </div>
                    <div className="flex items-center font-medium text-white/90">
                      <span>Explore Activities</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-between mt-10 space-y-3 sm:flex-row sm:space-y-0">
            <div className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(indexOfLastItem, totalItems)}
              </span>{" "}
              of <span className="font-medium">{totalItems}</span> categories
            </div>

            <div className="flex items-center space-x-1">
              {/* Previous page button */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                aria-label="Previous page"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>

              {/* Page number buttons */}
              <div className="flex items-center">{getPageButtons()}</div>

              {/* Next page button */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                aria-label="Next page"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Featured category section */}
        {categories.length > 0 && (
          <div className="pt-8 mt-16 border-t border-gray-200">
            <h2 className="mb-6 text-2xl font-bold text-gray-900 font-heading">
              Featured Category
            </h2>

            <motion.div
              className="overflow-hidden bg-white shadow-lg rounded-3xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative h-64 lg:h-auto">
                  <img
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
                    <div className="flex items-center px-4 py-2 rounded-full bg-primary-50 text-primary-700">
                      <FiMap className="mr-2" />
                      <span>Multiple Locations</span>
                    </div>
                    <div className="flex items-center px-4 py-2 text-green-700 rounded-full bg-green-50">
                      <span>20+ Activities</span>
                    </div>
                  </div>

                  <Link
                    href={`/category/${categories[0]?.id}`}
                    className="inline-flex items-center self-start px-6 py-3 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
                  >
                    Explore Now <FiChevronRight className="ml-2" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
