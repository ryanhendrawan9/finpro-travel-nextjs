"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiMapPin,
  FiArrowRight,
  FiStar,
  FiCompass,
  FiCamera,
} from "react-icons/fi";

export default function FeaturedDestinations({ activities = [] }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

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

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.1,
      },
    },
  };

  const arrowVariants = {
    rest: { x: 0 },
    hover: { x: 5, transition: { duration: 0.3 } },
  };

  return (
    <div className="py-12 overflow-hidden">
      <motion.div
        className="mb-12 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <motion.span
          className="inline-block px-3 py-1 mb-3 text-xs font-medium text-blue-600 rounded-full bg-blue-50"
          variants={badgeVariants}
        >
          <FiCompass className="inline-block mr-1" /> Explore Indonesia
        </motion.span>

        <motion.h2
          className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl font-heading"
          variants={headerVariants}
        >
          Featured <span className="text-blue-600">Destinations</span>
        </motion.h2>
        <motion.p
          className="max-w-3xl mx-auto text-gray-600"
          variants={headerVariants}
        >
          Explore these handpicked destinations and experience the best of what
          they have to offer
        </motion.p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-8 px-4 md:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {activities.length > 0
          ? activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                variants={itemVariants}
                className="relative"
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
              >
                <div className="relative overflow-hidden shadow-lg h-96 rounded-2xl group">
                  <img
                    src={
                      activity.imageUrls?.[0] ||
                      "/images/placeholders/activity-placeholder.jpg"
                    }
                    alt={activity.title}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "/images/placeholders/activity-placeholder.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  {/* Featured badge */}
                  <motion.div
                    className="absolute px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded-md top-4 left-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    <FiCamera className="inline-block mr-1" size={12} /> Must
                    Visit
                  </motion.div>

                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center mb-2 text-white/80">
                      <FiMapPin className="mr-1" />
                      <span>
                        {activity.city}, {activity.province}
                      </span>
                    </div>

                    <h3 className="mb-3 text-xl font-bold text-white">
                      {activity.title}
                    </h3>

                    {/* Rating display */}
                    {activity.rating && (
                      <div className="flex items-center mb-3 text-white/80">
                        <div className="flex mr-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FiStar
                              key={star}
                              className="text-yellow-400"
                              fill={
                                star <= Math.round(activity.rating)
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          ))}
                        </div>
                        <span className="text-sm">
                          {activity.rating} ({activity.reviewCount || "24"}{" "}
                          reviews)
                        </span>
                      </div>
                    )}

                    <Link
                      href={`/activity/${activity.id}`}
                      className="inline-flex items-center px-3 py-1.5 font-medium text-white bg-white/20 backdrop-blur-sm rounded-lg transition-colors hover:bg-blue-600"
                    >
                      Explore{" "}
                      <motion.span
                        className="ml-1"
                        variants={arrowVariants}
                        initial="rest"
                        animate={hoveredIndex === index ? "hover" : "rest"}
                      >
                        <FiArrowRight />
                      </motion.span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))
          : // Placeholder destinations if no activities are provided
            [1, 2, 3].map((i) => (
              <motion.div key={i} variants={itemVariants} className="relative">
                <div className="relative overflow-hidden bg-gray-200 shadow-lg h-96 rounded-2xl group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  {/* Featured badge for placeholders too */}
                  <motion.div
                    className="absolute px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded-md top-4 left-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 + 0.3 }}
                  >
                    <FiCamera className="inline-block mr-1" size={12} /> Must
                    Visit
                  </motion.div>

                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center mb-2 text-white/80">
                      <FiMapPin className="mr-1" />
                      <span>Featured Location</span>
                    </div>

                    <h3 className="mb-3 text-xl font-bold text-white">
                      Amazing Destination
                    </h3>

                    {/* Rating display for placeholders */}
                    <div className="flex items-center mb-3 text-white/80">
                      <div className="flex mr-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar
                            key={star}
                            className="text-yellow-400"
                            fill={star <= 4 ? "currentColor" : "none"}
                          />
                        ))}
                      </div>
                      <span className="text-sm">4.0 (24 reviews)</span>
                    </div>

                    <span className="inline-flex items-center px-3 py-1.5 font-medium text-white bg-white/20 backdrop-blur-sm rounded-lg">
                      Explore{" "}
                      <motion.span
                        className="ml-1"
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
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
      </motion.div>
    </div>
  );
}
