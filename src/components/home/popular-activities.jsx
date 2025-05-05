"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiArrowRight } from "react-icons/fi";
import ActivityCard from "@/components/activity/activity-card";

export default function PopularActivities({ activities = [] }) {
  const [startIndex, setStartIndex] = useState(0);
  const itemsPerPage = 3;
  const endIndex = Math.min(startIndex + itemsPerPage, activities.length);
  const canScrollLeft = startIndex > 0;
  const canScrollRight = endIndex < activities.length;

  const scrollLeft = () => {
    if (canScrollLeft) {
      setStartIndex(startIndex - itemsPerPage);
    }
  };

  const scrollRight = () => {
    if (canScrollRight) {
      setStartIndex(startIndex + itemsPerPage);
    }
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

  if (activities.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-heading">
            Popular Activities
          </h2>
          <p className="text-gray-600 mt-2">
            Discover our most booked and highly-rated experiences
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={scrollLeft}
            className={`p-2 rounded-full border transition-colors ${
              canScrollLeft
                ? "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
            disabled={!canScrollLeft}
            aria-label="Previous page"
          >
            <FiChevronLeft size={20} />
          </button>
          <button
            onClick={scrollRight}
            className={`p-2 rounded-full border transition-colors ${
              canScrollRight
                ? "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
            disabled={!canScrollRight}
            aria-label="Next page"
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {activities.slice(startIndex, endIndex).map((activity, index) => (
          <ActivityCard key={activity.id} activity={activity} index={index} />
        ))}
      </motion.div>

      <div className="mt-8 text-center">
        <Link
          href="/activity"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
        >
          View All Activities <FiArrowRight className="ml-2" />
        </Link>
      </div>
    </div>
  );
}
