"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  FiChevronRight,
  FiChevronLeft,
  FiMapPin,
  FiCamera,
  FiCompass,
  FiMap,
  FiStar,
  FiActivity,
} from "react-icons/fi";

export default function EnhancedCategoryShowcase({ categories }) {
  const scrollRef = useRef(null);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);

  // Enhanced scroll function with smooth animation
  const scroll = (direction) => {
    const { current } = scrollRef;
    if (current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      const newPosition = Math.max(
        0,
        Math.min(
          current.scrollLeft + scrollAmount,
          current.scrollWidth - current.clientWidth
        )
      );

      current.scrollTo({
        left: newPosition,
        behavior: "smooth",
      });

      setScrollPosition(newPosition);
    }
  };

  // Update scroll position and max scroll when scrolling
  const handleScroll = () => {
    if (scrollRef.current) {
      const newPosition = scrollRef.current.scrollLeft;
      const maxScroll =
        scrollRef.current.scrollWidth - scrollRef.current.clientWidth;

      setScrollPosition(newPosition);
      setMaxScroll(maxScroll);
    }
  };

  // Calculate if the scroll buttons should be enabled
  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = scrollPosition < maxScroll;

  // Icons based on category name
  const getCategoryIcon = (name) => {
    const nameToLower = name.toLowerCase();
    if (nameToLower.includes("beach") || nameToLower.includes("island"))
      return FiCompass;
    if (nameToLower.includes("mountain") || nameToLower.includes("nature"))
      return FiMapPin;
    if (nameToLower.includes("city") || nameToLower.includes("urban"))
      return FiMap;
    if (nameToLower.includes("adventure") || nameToLower.includes("sport"))
      return FiActivity;
    if (nameToLower.includes("history") || nameToLower.includes("culture"))
      return FiCamera;
    return FiStar;
  };

  // Animation variants
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

  const headerVariants = {
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

  // Add sample activity counts if not provided
  const enhancedCategories = categories.map((category) => ({
    ...category,
    activityCount: category.activityCount || Math.floor(Math.random() * 20) + 5,
  }));

  return (
    <motion.div
      className="relative py-16"
      ref={containerRef}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
    >
      {/* Enhanced section header */}
      <motion.div
        className="flex flex-col justify-between px-4 mb-10 md:flex-row md:items-end"
        variants={headerVariants}
      >
        <div className="mb-6 md:mb-0">
          <span className="inline-block px-3 py-1 mb-3 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
            Discover Indonesia
          </span>
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl font-heading">
            Explore <span className="text-blue-600">Categories</span>
          </h2>
          <p className="max-w-2xl mt-3 text-gray-600">
            Discover a variety of amazing experiences and activities by category
          </p>
        </div>

        {/* Scroll buttons with enhanced UI */}
        <div className="flex items-center space-x-3">
          <motion.button
            onClick={() => scroll("left")}
            className={`p-3 text-gray-700 transition-all bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md ${
              !canScrollLeft
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
            }`}
            disabled={!canScrollLeft}
            whileHover={canScrollLeft ? { scale: 1.1 } : {}}
            whileTap={canScrollLeft ? { scale: 0.95 } : {}}
            aria-label="Scroll left"
          >
            <FiChevronLeft size={20} />
          </motion.button>
          <motion.button
            onClick={() => scroll("right")}
            className={`p-3 text-gray-700 transition-all bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md ${
              !canScrollRight
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
            }`}
            disabled={!canScrollRight}
            whileHover={canScrollRight ? { scale: 1.1 } : {}}
            whileTap={canScrollRight ? { scale: 0.95 } : {}}
            aria-label="Scroll right"
          >
            <FiChevronRight size={20} />
          </motion.button>
          <Link href="/category">
            <motion.div
              className="items-center hidden px-5 py-2 ml-2 text-sm font-medium transition-all border border-gray-200 rounded-full md:inline-flex hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 group"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              View All
              <FiChevronRight
                className="ml-1 transition-transform group-hover:translate-x-1"
                size={16}
              />
            </motion.div>
          </Link>
        </div>
      </motion.div>

      {/* Scrollable category cards with enhanced styling */}
      <div
        ref={scrollRef}
        className="flex px-4 pb-8 -mx-4 space-x-6 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onScroll={handleScroll}
      >
        {enhancedCategories.map((category, index) => {
          const CategoryIcon = getCategoryIcon(category.name);

          return (
            <motion.div
              key={category.id}
              variants={itemVariants}
              className="flex-shrink-0 w-72 md:w-80"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Link href={`/category/${category.id}`}>
                <div
                  className="relative overflow-hidden transition-all duration-500 bg-white border border-gray-200 shadow-lg h-96 group rounded-2xl hover:shadow-2xl"
                  style={{
                    transform:
                      hoveredIndex === index
                        ? "translateY(-10px)"
                        : "translateY(0)",
                    transition:
                      "transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  }}
                >
                  {/* Image container with enhanced aspect ratio */}
                  <div className="relative overflow-hidden h-72">
                    <img
                      src={
                        category.imageUrl ||
                        "/images/placeholders/category-placeholder.jpg"
                      }
                      alt={category.name}
                      className="object-cover w-full h-full transition-transform duration-1000 ease-out group-hover:scale-110"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "/images/placeholders/category-placeholder.jpg";
                      }}
                    />
                    <div className="absolute inset-0 opacity-60 bg-gradient-to-t from-black via-black/30 to-transparent" />

                    {/* Category info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="mb-1 text-2xl font-bold text-white">
                        {category.name}
                      </h3>
                      <div className="flex items-center text-sm text-white/90">
                        <span>
                          {category.activityCount} activities available
                        </span>
                      </div>
                    </div>

                    {/* Category icon badge */}
                    <div className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
                      <CategoryIcon className="text-blue-600" size={20} />
                    </div>
                  </div>

                  {/* Bottom action area */}
                  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-5 bg-white border-t border-gray-100">
                    <span className="font-medium text-gray-900">
                      Explore Category
                    </span>
                    <motion.div
                      className="flex items-center justify-center w-8 h-8 text-blue-600 bg-blue-100 rounded-full"
                      animate={{
                        x: hoveredIndex === index ? 5 : 0,
                      }}
                    >
                      <FiChevronRight />
                    </motion.div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Mobile view all button */}
      <div className="mt-6 text-center md:hidden">
        <Link href="/category">
          <motion.div
            className="inline-flex items-center px-6 py-3 font-medium text-blue-600 transition-all border border-blue-200 rounded-full bg-blue-50 hover:bg-blue-100"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            View All Categories
            <FiChevronRight className="ml-1" />
          </motion.div>
        </Link>
      </div>

      {/* Scroll progress indicator */}
      {maxScroll > 0 && (
        <div className="relative h-1 max-w-screen-lg mx-auto mt-8 bg-gray-200 rounded-full">
          <motion.div
            className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
            initial={{ width: "0%" }}
            animate={{
              width: `${(scrollPosition / maxScroll) * 100}%`,
            }}
            transition={{ duration: 0.1 }}
          />
        </div>
      )}
    </motion.div>
  );
}
