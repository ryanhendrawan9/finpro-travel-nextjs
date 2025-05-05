"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";

export default function CategoryShowcase({ categories }) {
  const scrollRef = useRef(null);

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

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-heading">
            Explore Categories
          </h2>
          <p className="text-gray-600 mt-2 max-w-2xl">
            Discover a variety of amazing experiences and activities by category
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-full bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
            aria-label="Scroll left"
          >
            <FiChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-full bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
            aria-label="Scroll right"
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <motion.div
          className="flex space-x-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              variants={itemVariants}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="flex-shrink-0"
            >
              <Link href={`/category/${category.id}`}>
                <div className="relative group w-64 h-72 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                  <img
                    src={
                      category.imageUrl ||
                      "/images/placeholders/category-placeholder.jpg"
                    }
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {category.name}
                    </h3>
                    <div className="flex items-center text-white font-medium">
                      <span>Explore</span>
                      <FiChevronRight className="ml-1 group-hover:ml-2 transition-all duration-300" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
