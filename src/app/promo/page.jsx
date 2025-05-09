"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiClock, FiChevronRight, FiTag, FiChevronLeft } from "react-icons/fi";
import { promoService } from "@/lib/api";

export default function PromosPage() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const response = await promoService.getAll();
        setPromos(response.data.data || []);
      } catch (err) {
        console.error("Error fetching promos:", err);
        setError("Failed to load promos. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPromos();
  }, []);

  // No need to paginate the featured promo (first one)
  const normalPromos = promos.length > 0 ? promos.slice(1) : [];

  // Calculate pagination values for the normal promos grid
  const totalItems = normalPromos.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = normalPromos.slice(indexOfFirstItem, indexOfLastItem);

  // Page change handlers
  const goToPage = (pageNumber) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
    // Scroll to the promos grid section, not all the way to the top
    document
      .getElementById("promos-grid")
      .scrollIntoView({ behavior: "smooth" });
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
          Loading amazing promos...
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
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl font-heading">
            Exclusive Deals & Promos
          </h1>
          <p className="max-w-3xl mx-auto text-gray-600">
            Discover our latest promotions and special offers to make your
            travel experiences even more amazing. Don't miss out on these
            limited-time deals!
          </p>
        </div>

        {/* Featured promo */}
        {promos.length > 0 && (
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="overflow-hidden bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative h-64 lg:h-auto">
                  <img
                    src={
                      promos[0]?.imageUrl ||
                      "/images/placeholders/promo-placeholder.jpg"
                    }
                    alt={promos[0]?.title || "Featured Promo"}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "/images/placeholders/promo-placeholder.jpg";
                    }}
                  />
                  <div className="absolute px-3 py-1 text-sm font-bold text-white rounded-full top-4 left-4 bg-accent-500">
                    HOT DEAL
                  </div>
                </div>

                <div className="p-8 text-white lg:p-12">
                  <h2 className="mb-4 text-2xl font-bold md:text-3xl">
                    {promos[0]?.title || "Featured Promo"}
                  </h2>

                  <p className="mb-6 text-white/90">
                    {promos[0]?.description ||
                      "Limited time offer on our most popular activities. Book now and save!"}
                  </p>

                  <div className="flex items-center mb-6">
                    <div className="flex items-center px-4 py-2 mr-4 rounded-lg bg-white/20">
                      <FiTag className="mr-2" />
                      <span>{promos[0]?.promo_code || "TRAVEL10"}</span>
                    </div>

                    <div className="flex items-center px-4 py-2 rounded-lg bg-white/20">
                      <FiClock className="mr-2" />
                      <span>Limited Time</span>
                    </div>
                  </div>

                  <Link
                    href={`/promo/${promos[0]?.id}`}
                    className="inline-flex items-center px-6 py-3 font-medium transition-colors bg-white rounded-lg text-primary-600 hover:bg-white/90"
                  >
                    View Details <FiChevronRight className="ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Items per page selector */}
        {normalPromos.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900" id="promos-grid">
              More Promotions
            </h2>
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

        {/* Promos grid */}
        {normalPromos.length > 0 ? (
          <>
            <motion.div
              className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {currentItems.map((promo) => (
                <motion.div
                  key={promo.id}
                  variants={itemVariants}
                  className="overflow-hidden transition-shadow bg-white shadow-sm rounded-xl hover:shadow-md"
                >
                  <Link href={`/promo/${promo.id}`}>
                    <div className="relative">
                      <img
                        src={
                          promo.imageUrl ||
                          "/images/placeholders/promo-placeholder.jpg"
                        }
                        alt={promo.title}
                        className="object-cover w-full h-48"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "/images/placeholders/promo-placeholder.jpg";
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute px-3 py-1 text-sm font-bold text-white rounded-full top-4 right-4 bg-accent-500">
                        {Math.floor(Math.random() * 70) + 10}% OFF
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="mb-2 text-lg font-bold text-gray-900">
                        {promo.title}
                      </h3>
                      <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                        {promo.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="px-3 py-1 text-sm font-medium rounded-lg bg-primary-50 text-primary-600">
                          {promo.promo_code}
                        </div>

                        <span className="flex items-center text-sm text-gray-500">
                          <FiClock className="mr-1" size={14} />
                          Limited Time
                        </span>
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
                  of <span className="font-medium">{totalItems}</span>{" "}
                  promotions
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
          </>
        ) : (
          promos.length === 0 && (
            <div className="p-8 text-center bg-white shadow-sm rounded-xl">
              <FiTag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                No promos found
              </h3>
              <p className="mb-6 text-gray-600">
                There are currently no active promotions. Check back later for
                exciting deals!
              </p>
              <Link
                href="/activity"
                className="inline-block px-6 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
              >
                Browse Activities
              </Link>
            </div>
          )
        )}

        {/* Newsletter section */}
        <div className="pt-8 mt-16 border-t border-gray-200">
          <div className="p-8 bg-gray-100 rounded-2xl md:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">
                Get Exclusive Deals
              </h2>
              <p className="mb-6 text-gray-600">
                Subscribe to our newsletter and be the first to receive our
                latest promotions and special offers.
              </p>

              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-grow max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button className="px-6 py-3 font-medium text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700">
                  Subscribe Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
