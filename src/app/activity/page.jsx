"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiFilter,
  FiX,
  FiSearch,
  FiMapPin,
  FiDollarSign,
  FiStar,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { activityService, categoryService } from "@/lib/api";
import ActivityCard from "@/components/activity/activity-card";

export default function ActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("popularity");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  // Fetch activities and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activitiesRes, categoriesRes] = await Promise.all([
          activityService.getAll(),
          categoryService.getAll(),
        ]);

        setActivities(activitiesRes.data.data || []);
        setCategories(categoriesRes.data.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load activities. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort activities
  const filteredActivities = activities
    .filter((activity) => {
      // Search query filter
      if (
        searchQuery &&
        !activity.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Category filter
      if (
        selectedCategory !== "all" &&
        activity.categoryId !== selectedCategory
      ) {
        return false;
      }

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
          return (a.price_discount || a.price) - (b.price_discount || b.price);
        case "price-high":
          return (b.price_discount || b.price) - (a.price_discount || a.price);
        case "rating":
          return b.rating - a.rating;
        case "popularity":
        default:
          return b.total_reviews - a.total_reviews;
      }
    });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, priceRange, minRating, sortBy]);

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
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-bold animate-pulse text-primary-600">
          Loading amazing activities...
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
        <div className="flex flex-col justify-between mb-8 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-heading">
              Discover Activities
            </h1>
            <p className="mt-2 text-gray-600">
              Explore {filteredActivities.length} amazing experiences and
              adventures
            </p>
          </div>

          <div className="flex items-center mt-4 md:mt-0">
            <div className="relative mr-3">
              <FiSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Search activities..."
                className="py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              className="flex items-center px-4 py-2 transition-colors rounded-lg bg-primary-100 text-primary-700 hover:bg-primary-200"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <FiFilter className="mr-2" />
              Filter
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Filters - Desktop */}
          <div className="sticky hidden p-6 bg-white shadow-sm lg:block rounded-xl h-fit top-28">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Filters</h2>

            <div className="space-y-6">
              {/* Category filter */}
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-700">
                  Category
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="category-all"
                      name="category"
                      type="radio"
                      checked={selectedCategory === "all"}
                      onChange={() => setSelectedCategory("all")}
                      className="w-4 h-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label
                      htmlFor="category-all"
                      className="ml-2 text-sm text-gray-700"
                    >
                      All Categories
                    </label>
                  </div>

                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center">
                      <input
                        id={`category-${category.id}`}
                        name="category"
                        type="radio"
                        checked={selectedCategory === category.id}
                        onChange={() => setSelectedCategory(category.id)}
                        className="w-4 h-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <label
                        htmlFor={`category-${category.id}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

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

              {/* Reset filters */}
              <button
                className="w-full px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
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

          {/* Filters - Mobile */}
          {isFilterOpen && (
            <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-50 lg:hidden">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.3 }}
                className="w-full h-full max-w-xs overflow-y-auto bg-white"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                    <button
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => setIsFilterOpen(false)}
                    >
                      <FiX size={20} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Mobile filters - same as desktop */}
                    {/* Category filter */}
                    <div>
                      <h3 className="mb-2 text-sm font-medium text-gray-700">
                        Category
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            id="mobile-category-all"
                            name="mobile-category"
                            type="radio"
                            checked={selectedCategory === "all"}
                            onChange={() => setSelectedCategory("all")}
                            className="w-4 h-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <label
                            htmlFor="mobile-category-all"
                            className="ml-2 text-sm text-gray-700"
                          >
                            All Categories
                          </label>
                        </div>

                        {categories.map((category) => (
                          <div key={category.id} className="flex items-center">
                            <input
                              id={`mobile-category-${category.id}`}
                              name="mobile-category"
                              type="radio"
                              checked={selectedCategory === category.id}
                              onChange={() => setSelectedCategory(category.id)}
                              className="w-4 h-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <label
                              htmlFor={`mobile-category-${category.id}`}
                              className="ml-2 text-sm text-gray-700"
                            >
                              {category.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

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
                          setSearchQuery("");
                          setSelectedCategory("all");
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
            </div>
          )}

          {/* Activities grid */}
          <div className="lg:col-span-3">
            {filteredActivities.length > 0 ? (
              <>
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

                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div className="flex flex-col items-center justify-between mt-8 space-y-3 sm:flex-row sm:space-y-0">
                    <div className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {indexOfFirstItem + 1}
                      </span>{" "}
                      to{" "}
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
                      >
                        <FiChevronLeft className="w-5 h-5" />
                      </button>

                      {/* Page number buttons */}
                      <div className="flex items-center">
                        {getPageButtons()}
                      </div>

                      {/* Next page button */}
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-md ${
                          currentPage === totalPages
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <FiChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center bg-white shadow-sm rounded-xl">
                <FiSearch className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="mb-2 text-xl font-bold text-gray-900">
                  No activities found
                </h3>
                <p className="mb-6 text-gray-600">
                  Try adjusting your filters or search query to find what you're
                  looking for.
                </p>
                <button
                  className="px-6 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setPriceRange([0, 5000000]);
                    setMinRating(0);
                    setSortBy("popularity");
                    setCurrentPage(1);
                  }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
