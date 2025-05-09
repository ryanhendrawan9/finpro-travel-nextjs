"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  FiChevronLeft,
  FiChevronRight,
  FiArrowRight,
  FiStar,
  FiTrendingUp,
  FiClock,
} from "react-icons/fi";
import ActivityCard from "@/components/activity/activity-card";

export default function PopularActivities({ activities = [] }) {
  const [startIndex, setStartIndex] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [filteredActivities, setFilteredActivities] = useState(activities);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });
  const itemsPerPage = 3;
  const endIndex = Math.min(
    startIndex + itemsPerPage,
    filteredActivities.length
  );
  const canScrollLeft = startIndex > 0;
  const canScrollRight = endIndex < filteredActivities.length;
  const [transition, setTransition] = useState(true);

  // Filter functions
  const filterOptions = [
    { id: "all", label: "All Activities" },
    { id: "trending", label: "Trending" },
    { id: "top-rated", label: "Top Rated" },
    { id: "new", label: "New" },
  ];

  useEffect(() => {
    // Filter the activities based on the selected filter
    if (selectedFilter === "all") {
      setFilteredActivities(activities);
    } else if (selectedFilter === "trending") {
      setFilteredActivities(
        activities.filter(
          (activity) => activity.trending || activity.bookings > 50
        )
      );
    } else if (selectedFilter === "top-rated") {
      setFilteredActivities(
        activities.filter((activity) => activity.rating >= 4.8)
      );
    } else if (selectedFilter === "new") {
      setFilteredActivities(activities.filter((activity) => activity.isNew));
    }

    // Reset to first page when filter changes
    setStartIndex(0);

    // Temporarily disable transition during filter change
    setTransition(false);
    setTimeout(() => setTransition(true), 50);
  }, [selectedFilter, activities]);

  const scrollLeft = () => {
    if (canScrollLeft) {
      setStartIndex(Math.max(0, startIndex - itemsPerPage));
    }
  };

  const scrollRight = () => {
    if (canScrollRight) {
      setStartIndex(
        Math.min(
          filteredActivities.length - itemsPerPage,
          startIndex + itemsPerPage
        )
      );
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren",
      },
    },
  };

  const sectionHeaderVariants = {
    hidden: { opacity: 0, y: -20 },
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

  const cardContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const pageIndicatorVariants = {
    initial: { width: 10 },
    active: { width: 30 },
  };

  if (activities.length === 0) {
    return null;
  }

  // Calculate page indicators
  const pageCount = Math.ceil(filteredActivities.length / itemsPerPage);
  const currentPage = Math.floor(startIndex / itemsPerPage);

  return (
    <motion.div
      ref={containerRef}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className="py-16"
    >
      {/* Section header with badge */}
      <motion.div
        className="flex flex-col justify-between px-4 mb-8 md:flex-row md:items-end"
        variants={sectionHeaderVariants}
      >
        <div className="mb-6 md:mb-0">
          <span className="inline-block px-3 py-1 mb-3 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full">
            <FiStar className="inline-block mr-1" /> Top Rated
          </span>
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl font-heading">
            Popular <span className="text-blue-600">Activities</span>
          </h2>
          <p className="max-w-2xl mt-2 text-gray-600">
            Discover our most booked and highly-rated experiences across
            Indonesia
          </p>
        </div>

        {/* Filter controls for desktop */}
        <div className="items-center hidden space-x-2 md:flex">
          {filterOptions.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                selectedFilter === filter.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Filter dropdown for mobile */}
      <motion.div
        className="flex mx-4 mb-6 md:hidden"
        variants={sectionHeaderVariants}
      >
        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="w-full py-2.5 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 appearance-none"
          style={{
            backgroundImage:
              "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 1rem center",
            backgroundSize: "1.5em 1.5em",
          }}
        >
          {filterOptions.map((filter) => (
            <option key={filter.id} value={filter.id}>
              {filter.label}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Featured label */}
      {selectedFilter !== "all" && (
        <motion.div
          className="flex items-center px-4 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center text-gray-600">
            {selectedFilter === "trending" && (
              <FiTrendingUp className="mr-2 text-blue-500" />
            )}
            {selectedFilter === "top-rated" && (
              <FiStar className="mr-2 text-yellow-500" />
            )}
            {selectedFilter === "new" && (
              <FiClock className="mr-2 text-green-500" />
            )}
            <span className="text-sm">
              Showing
              <span className="font-medium text-blue-600">
                {" "}
                {filteredActivities.length}{" "}
              </span>
              {selectedFilter === "trending" && "trending activities"}
              {selectedFilter === "top-rated" && "top rated activities"}
              {selectedFilter === "new" && "new activities"}
              {selectedFilter === "all" && "activities"}
            </span>
          </div>
        </motion.div>
      )}

      {/* Activity cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedFilter + startIndex}
          className="grid grid-cols-1 gap-8 px-4 md:grid-cols-2 lg:grid-cols-3"
          variants={cardContainerVariants}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: transition ? 0.4 : 0 }}
        >
          {filteredActivities
            .slice(startIndex, endIndex)
            .map((activity, index) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                index={index}
              />
            ))}
        </motion.div>
      </AnimatePresence>

      {/* Navigation controls */}
      <div className="flex items-center justify-between px-4 mt-12">
        {/* Page indicators */}
        <div className="flex items-center space-x-2">
          {Array.from({ length: pageCount }).map((_, i) => (
            <motion.button
              key={i}
              className={`h-2 rounded-full bg-${
                i === currentPage ? "blue-600" : "gray-300"
              }`}
              variants={pageIndicatorVariants}
              initial="initial"
              animate={i === currentPage ? "active" : "initial"}
              onClick={() => setStartIndex(i * itemsPerPage)}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center space-x-3">
          <motion.button
            onClick={scrollLeft}
            className={`p-3 rounded-full border transition-all ${
              canScrollLeft
                ? "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200"
                : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
            disabled={!canScrollLeft}
            whileHover={canScrollLeft ? { scale: 1.1 } : {}}
            whileTap={canScrollLeft ? { scale: 0.95 } : {}}
            aria-label="Previous page"
          >
            <FiChevronLeft size={20} />
          </motion.button>
          <motion.button
            onClick={scrollRight}
            className={`p-3 rounded-full border transition-all ${
              canScrollRight
                ? "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200"
                : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
            disabled={!canScrollRight}
            whileHover={canScrollRight ? { scale: 1.1 } : {}}
            whileTap={canScrollRight ? { scale: 0.95 } : {}}
            aria-label="Next page"
          >
            <FiChevronRight size={20} />
          </motion.button>
        </div>
      </div>

      {/* View All link */}
      <div className="mt-12 text-center">
        <Link href="/activity" legacyBehavior>
          <motion.a
            className="inline-flex items-center px-8 py-3 font-medium text-white transition-all rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:shadow-blue-500/30 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View All Activities
            <FiArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
          </motion.a>
        </Link>
      </div>
    </motion.div>
  );
}
