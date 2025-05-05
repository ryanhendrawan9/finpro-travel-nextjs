"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiChevronLeft,
  FiChevronRight,
  FiArrowRight,
  FiTag,
} from "react-icons/fi";

export default function PromoSection({ promos = [] }) {
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

  if (promos.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-heading">
            Special Promos & Deals
          </h2>
          <p className="text-gray-600 mt-2">
            Limited-time offers and exclusive discounts for your next adventure
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-full bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 transition-colors"
            aria-label="Scroll left"
          >
            <FiChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-full bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 transition-colors"
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
          whileInView="visible"
          viewport={{ once: true }}
        >
          {promos.map((promo, index) => (
            <motion.div
              key={promo.id}
              variants={itemVariants}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="flex-shrink-0 w-80"
            >
              <Link href={`/promo/${promo.id}`}>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                  <div className="relative">
                    <img
                      src={
                        promo.imageUrl ||
                        "/images/placeholders/promo-placeholder.jpg"
                      }
                      alt={promo.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-accent-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {Math.floor(Math.random() * 70) + 10}% OFF
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {promo.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">
                      {promo.description}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="bg-primary-50 text-primary-600 px-3 py-1 rounded-lg text-sm font-medium flex items-center">
                        <FiTag className="mr-1" size={14} />
                        {promo.promo_code}
                      </div>

                      <span className="text-sm text-gray-500">
                        Limited time
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/promo"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
        >
          View All Promos <FiArrowRight className="ml-2" />
        </Link>
      </div>
    </div>
  );
}
