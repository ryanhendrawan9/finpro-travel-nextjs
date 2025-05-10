"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft,
  FiFilter,
  FiX,
  FiSliders,
  FiMapPin,
  FiActivity,
  FiStar,
  FiChevronRight,
  FiChevronLeft,
} from "react-icons/fi";
import { categoryService, activityService } from "@/lib/api";
import ActivityCard from "@/components/activity/activity-card";

export default function CategoryDetailPage({ params }) {
  const id = use(params).id;
  const [category, setCategory] = useState(null);
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const router = useRouter();

  // Filter states
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("popularity");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryRes, activitiesRes] = await Promise.all([
          categoryService.getById(id),
          activityService.getByCategory(id),
        ]);

        setCategory(categoryRes.data.data);
        setActivities(activitiesRes.data.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load category details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Filter and sort activities whenever filter criteria change
  useEffect(() => {
    if (!activities.length) return;

    const filtered = activities
      .filter((activity) => {
        // Price range filter
        const price = activity.price_discount || activity.price;
        if (price < priceRange[0] || price > priceRange[1]) {
          return false;
        }

        // Rating filter
        if (activity.rating < minRating) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "price-low":
            return (
              (a.price_discount || a.price) - (b.price_discount || b.price)
            );
          case "price-high":
            return (
              (b.price_discount || b.price) - (a.price_discount || a.price)
            );
          case "rating":
            return b.rating - a.rating;
          case "popularity":
          default:
            return b.total_reviews - a.total_reviews;
        }
      });

    setFilteredActivities(filtered);
    setCurrentPage(1); // Reset to first page when filter changes
  }, [activities, priceRange, minRating, sortBy]);

  // Calculate pagination values
  const totalItems = filteredActivities.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredActivities.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Page change handlers
  const goToPage = (pageNumber) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
    // Smooth scroll to top of activities
    document
      .getElementById("activities-grid")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
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
          Loading category details...
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="mb-4 text-2xl font-bold text-red-600">
          {error || "Category not found"}
        </div>
        <button
          onClick={() => router.push("/category")}
          className="flex items-center px-6 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
        >
          <FiArrowLeft className="mr-2" /> Back to Categories
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/category"
            className="flex items-center text-gray-600 transition-colors hover:text-primary-600"
          >
            <FiArrowLeft className="mr-2" /> Back to Categories
          </Link>
        </div>

        {/* Category header with hero image */}
        <div className="relative h-64 mb-8 overflow-hidden sm:h-80 md:h-96 rounded-3xl">
          <img
            src={
              category.imageUrl ||
              "/images/placeholders/category-placeholder.jpg"
            }
            alt={category.name}
            className="object-cover w-full h-full"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/images/placeholders/category-placeholder.jpg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl font-heading">
              {category.name}
            </h1>
            <p className="max-w-2xl text-white/90">
              Explore {filteredActivities.length} activities in this category
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Filters - Desktop */}
          <div className="sticky hidden p-6 bg-white shadow-sm lg:block rounded-xl h-fit top-28">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              <button
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
                onClick={() => {
                  setPriceRange([0, 5000000]);
                  setMinRating(0);
                  setSortBy("popularity");
                }}
              >
                Reset All
              </button>
            </div>

            <div className="space-y-6">
              {/* Price range filter */}
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-700">
                  Price Range
                </h3>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="5000000"
                    step="100000"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([0, parseInt(e.target.value)])
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Rp 0</span>
                    <span className="text-sm font-medium text-primary-600">
                      Rp {priceRange[1].toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rating filter */}
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-700">
                  Minimum Rating
                </h3>
                <div className="flex items-center space-x-2">
                  {[0, 1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                        minRating === rating
                          ? "bg-primary-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      onClick={() => setMinRating(rating)}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort by */}
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-700">
                  Sort By
                </h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="popularity">Popularity</option>
                  <option value="rating">Rating</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

              {/* Items per page */}
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-700">
                  Items Per Page
                </h3>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1); // Reset to first page when changing items per page
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value={6}>6</option>
                  <option value={9}>9</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mobile filter button */}
          <div className="fixed z-30 lg:hidden bottom-6 right-6">
            <button
              className="p-4 text-white transition-colors rounded-full shadow-lg bg-primary-600 hover:bg-primary-700"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              {isFilterOpen ? <FiX size={24} /> : <FiSliders size={24} />}
            </button>
          </div>

          {/* Mobile filters */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                className="fixed inset-0 z-40 flex justify-end bg-black bg-opacity-50 lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full max-w-xs overflow-y-auto bg-white"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold text-gray-900">
                        Filters
                      </h2>
                      <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setIsFilterOpen(false)}
                      >
                        <FiX size={20} />
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Mobile Price range filter */}
                      <div>
                        <h3 className="mb-2 text-sm font-medium text-gray-700">
                          Price Range
                        </h3>
                        <div className="space-y-2">
                          <input
                            type="range"
                            min="0"
                            max="5000000"
                            step="100000"
                            value={priceRange[1]}
                            onChange={(e) =>
                              setPriceRange([0, parseInt(e.target.value)])
                            }
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Rp 0</span>
                            <span className="text-sm font-medium text-primary-600">
                              Rp {priceRange[1].toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Mobile Rating filter */}
                      <div>
                        <h3 className="mb-2 text-sm font-medium text-gray-700">
                          Minimum Rating
                        </h3>
                        <div className="flex items-center space-x-2">
                          {[0, 1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                                minRating === rating
                                  ? "bg-primary-600 text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                              onClick={() => setMinRating(rating)}
                            >
                              {rating}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Mobile Sort by */}
                      <div>
                        <h3 className="mb-2 text-sm font-medium text-gray-700">
                          Sort By
                        </h3>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="popularity">Popularity</option>
                          <option value="rating">Rating</option>
                          <option value="price-low">Price: Low to High</option>
                          <option value="price-high">Price: High to Low</option>
                        </select>
                      </div>

                      {/* Mobile Items per page */}
                      <div>
                        <h3 className="mb-2 text-sm font-medium text-gray-700">
                          Items Per Page
                        </h3>
                        <select
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value={6}>6</option>
                          <option value={9}>9</option>
                          <option value={12}>12</option>
                          <option value={24}>24</option>
                        </select>
                      </div>

                      {/* Apply and Reset buttons */}
                      <div className="flex flex-col pt-4 space-y-2 border-t border-gray-200">
                        <button
                          className="w-full px-4 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
                          onClick={() => setIsFilterOpen(false)}
                        >
                          Apply Filters
                        </button>

                        <button
                          className="w-full px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                          onClick={() => {
                            setPriceRange([0, 5000000]);
                            setMinRating(0);
                            setSortBy("popularity");
                            setCurrentPage(1);
                          }}
                        >
                          Reset Filters
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Activities grid */}
          <div className="lg:col-span-3" id="activities-grid">
            {/* Category description section */}
            <motion.div
              className="p-6 mb-6 bg-white shadow-sm rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 text-blue-600 bg-blue-100 rounded-full">
                  <FiActivity size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  About {category.name}
                </h2>
              </div>

              <p className="text-gray-700">
                {category.description ||
                  `Discover amazing ${category.name} experiences and activities. Whether you're looking for adventure, relaxation, or cultural immersion, we have a wide range of options to make your journey unforgettable.`}
              </p>

              <div className="flex flex-wrap gap-3 mt-4">
                <div className="flex items-center px-3 py-1 text-sm text-blue-700 rounded-full bg-blue-50">
                  <FiMapPin className="mr-1" size={14} />
                  <span>Multiple locations</span>
                </div>
                <div className="flex items-center px-3 py-1 text-sm text-green-700 rounded-full bg-green-50">
                  <FiStar className="mr-1" size={14} />
                  <span>Top rated experiences</span>
                </div>
              </div>
            </motion.div>

            {/* Activities count and sort info */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-700">
                Showing{" "}
                <span className="font-medium">{currentItems.length}</span> of{" "}
                <span className="font-medium">{filteredActivities.length}</span>{" "}
                activities
              </p>

              <div className="hidden md:block">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="popularity">Sort by: Popularity</option>
                  <option value="rating">Sort by: Rating</option>
                  <option value="price-low">
                    Sort by: Price (Low to High)
                  </option>
                  <option value="price-high">
                    Sort by: Price (High to Low)
                  </option>
                </select>
              </div>
            </div>

            {/* Activity cards */}
            {filteredActivities.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {currentItems.map((activity, index) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    index={index}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                className="p-8 text-center bg-white shadow-sm rounded-xl"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
                <FiFilter className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="mb-2 text-xl font-bold text-gray-900">
                  No activities found
                </h3>
                <p className="mb-6 text-gray-600">
                  Try adjusting your filters or check back later for new
                  activities.
                </p>
                <button
                  className="px-6 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
                  onClick={() => {
                    setPriceRange([0, 5000000]);
                    setMinRating(0);
                    setSortBy("popularity");
                    setCurrentPage(1);
                  }}
                >
                  Reset Filters
                </button>
              </motion.div>
            )}

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
                  activities
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
          </div>
        </div>
      </div>
    </div>
  );
}
