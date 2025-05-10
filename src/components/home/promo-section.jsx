"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useAnimation } from "framer-motion";
import {
  FiChevronLeft,
  FiChevronRight,
  FiArrowRight,
  FiTag,
  FiClock,
  FiPercent,
} from "react-icons/fi";

export default function PromoSection({ promos = [] }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const controls = useAnimation();

  useEffect(() => {
    if (scrollRef.current) {
      // Initial check for scroll buttons visibility
      checkScrollable();

      // Add scroll event listener to check button visibility during scrolling
      scrollRef.current.addEventListener("scroll", checkScrollable);
    }

    // Start the floating animation for discount badges
    controls.start({
      y: [0, -5, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    });

    return () => {
      // Cleanup event listener
      if (scrollRef.current) {
        scrollRef.current.removeEventListener("scroll", checkScrollable);
      }
    };
  }, [controls]);

  const checkScrollable = () => {
    const { current } = scrollRef;
    if (current) {
      // Check if we can scroll left (not at the beginning)
      setCanScrollLeft(current.scrollLeft > 0);

      // Check if we can scroll right (not at the end)
      setCanScrollRight(
        current.scrollLeft < current.scrollWidth - current.clientWidth - 10
      );
    }
  };

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
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
    hidden: { opacity: 0, y: -15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 20,
      },
    },
  };

  // Generate random expiry days for each promo for demo purposes
  const getRandomExpiryDays = (index) => {
    const days = [3, 5, 7, 10, 14, 21];
    return days[index % days.length] || days[0];
  };

  if (promos.length === 0) {
    return null;
  }

  return (
    <div className="relative py-12 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10 opacity-5">
        <div className="absolute w-64 h-64 bg-blue-300 rounded-full -top-20 -right-20 opacity-20" />
        <div className="absolute bg-yellow-300 rounded-full -bottom-32 -left-20 w-80 h-80 opacity-20" />
      </div>

      <motion.div
        className="flex flex-col justify-between px-4 mb-8 md:flex-row md:items-end"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.div variants={headerVariants}>
          <motion.span
            className="inline-block px-3 py-1 mb-3 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <FiPercent className="inline-block mr-1" /> Limited Time Offers
          </motion.span>

          <h2 className="text-2xl font-bold text-gray-900 md:text-3xl font-heading">
            Special <span className="text-yellow-600">Promos</span> & Deals
          </h2>
          <p className="max-w-xl mt-2 text-gray-600">
            Exclusive discounts and package deals to make your Indonesian
            adventure even more affordable
          </p>
        </motion.div>

        <motion.div
          className="flex items-center mt-4 space-x-2 md:mt-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            onClick={() => scroll("left")}
            className={`p-3 transition-all rounded-full ${
              canScrollLeft
                ? "text-gray-700 bg-white border border-gray-300 shadow-sm hover:bg-gray-50 hover:text-yellow-600 hover:border-yellow-300 hover:shadow"
                : "text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
            }`}
            whileHover={canScrollLeft ? { scale: 1.1 } : {}}
            whileTap={canScrollLeft ? { scale: 0.95 } : {}}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
          >
            <FiChevronLeft size={20} />
          </motion.button>
          <motion.button
            onClick={() => scroll("right")}
            className={`p-3 transition-all rounded-full ${
              canScrollRight
                ? "text-gray-700 bg-white border border-gray-300 shadow-sm hover:bg-gray-50 hover:text-yellow-600 hover:border-yellow-300 hover:shadow"
                : "text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
            }`}
            whileHover={canScrollRight ? { scale: 1.1 } : {}}
            whileTap={canScrollRight ? { scale: 0.95 } : {}}
            disabled={!canScrollRight}
            aria-label="Scroll right"
          >
            <FiChevronRight size={20} />
          </motion.button>
        </motion.div>
      </motion.div>

      <div
        ref={scrollRef}
        className="flex px-4 pb-4 -mx-4 space-x-6 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <motion.div
          className="flex space-x-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {promos.map((promo, index) => (
            <motion.div
              key={promo.id}
              variants={itemVariants}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="flex-shrink-0 w-80"
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
            >
              <Link href={`/promo/${promo.id}`}>
                <div className="flex flex-col h-full overflow-hidden transition-all bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md hover:border-yellow-200">
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
                    <motion.div
                      className="absolute px-3 py-1.5 text-sm font-bold text-white rounded-full top-4 right-4 bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-md"
                      animate={controls}
                    >
                      {Math.floor(Math.random() * 70) + 10}% OFF
                    </motion.div>

                    {/* New badge for certain promos */}
                    {index % 3 === 0 && (
                      <motion.div
                        className="absolute left-0 px-3 py-1 text-xs font-bold text-white bg-blue-600 rounded-r-full top-4"
                        initial={{ x: -100 }}
                        animate={{ x: 0 }}
                        transition={{
                          delay: index * 0.1 + 0.3,
                          type: "spring",
                        }}
                      >
                        NEW DEAL
                      </motion.div>
                    )}
                  </div>

                  <div className="flex flex-col flex-grow p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold leading-tight text-gray-900">
                        {promo.title}
                      </h3>

                      {/* Bookmark icon */}
                      <motion.div
                        className="text-gray-400 hover:text-yellow-500"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
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
                            strokeWidth={2}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                          />
                        </svg>
                      </motion.div>
                    </div>

                    <p className="flex-grow mb-4 text-sm text-gray-600 line-clamp-3">
                      {promo.description}
                    </p>

                    {/* Timer section */}
                    <div className="flex items-center mb-4 text-xs text-gray-500">
                      <FiClock className="mr-1" size={14} />
                      <span>Expires in {getRandomExpiryDays(index)} days</span>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <motion.div
                        className="flex items-center px-3 py-1.5 text-sm font-medium rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-100"
                        whileHover={{ scale: 1.05 }}
                      >
                        <FiTag className="mr-1" size={14} />
                        {promo.promo_code ||
                          `INDO${Math.floor(Math.random() * 1000)}`}
                      </motion.div>

                      <motion.span
                        className="flex items-center text-sm font-medium text-blue-600"
                        animate={{
                          x: hoveredIndex === index ? 5 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        Get Deal
                        <FiArrowRight className="ml-1" size={14} />
                      </motion.span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.div
        className="mt-10 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Link href="/promo">
          <motion.div
            className="inline-flex items-center px-6 py-3 font-medium text-white transition-all rounded-full shadow-md bg-gradient-to-r from-yellow-600 to-yellow-500 hover:shadow-lg hover:from-yellow-500 hover:to-yellow-400 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View All Promotions
            <motion.span
              className="ml-2"
              animate={{
                x: [0, 5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            >
              <FiArrowRight />
            </motion.span>
          </motion.div>
        </Link>
      </motion.div>
    </div>
  );
}
