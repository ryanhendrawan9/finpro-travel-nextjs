"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FiMapPin, FiArrowRight } from "react-icons/fi";

export default function FeaturedDestinations({ activities = [] }) {
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
    <div>
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-heading mb-4">
          Featured Destinations
        </h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Explore these handpicked destinations and experience the best of what
          they have to offer
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {activities.length > 0
          ? activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                variants={itemVariants}
                className="relative"
              >
                <div className="relative h-96 rounded-2xl overflow-hidden group">
                  <img
                    src={
                      activity.imageUrls?.[0] ||
                      "/images/placeholders/activity-placeholder.jpg"
                    }
                    alt={activity.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center text-white/80 mb-2">
                      <FiMapPin className="mr-1" />
                      <span>
                        {activity.city}, {activity.province}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3">
                      {activity.title}
                    </h3>

                    <Link
                      href={`/activity/${activity.id}`}
                      className="inline-flex items-center text-white hover:text-primary-300 font-medium transition-colors"
                    >
                      Explore{" "}
                      <FiArrowRight className="ml-1 group-hover:ml-2 transition-all duration-300" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))
          : // Placeholder destinations if no activities are provided
            [1, 2, 3].map((i) => (
              <motion.div key={i} variants={itemVariants} className="relative">
                <div className="relative h-96 rounded-2xl overflow-hidden bg-gray-200 group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center text-white/80 mb-2">
                      <FiMapPin className="mr-1" />
                      <span>Featured Location</span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3">
                      Amazing Destination
                    </h3>

                    <span className="inline-flex items-center text-white font-medium">
                      Explore{" "}
                      <FiArrowRight className="ml-1 group-hover:ml-2 transition-all duration-300" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
      </motion.div>
    </div>
  );
}
