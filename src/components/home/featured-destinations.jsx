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
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl font-heading">
          Featured Destinations
        </h2>
        <p className="max-w-3xl mx-auto text-gray-600">
          Explore these handpicked destinations and experience the best of what
          they have to offer
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 gap-8 md:grid-cols-3"
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
                <div className="relative overflow-hidden h-96 rounded-2xl group">
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

                    <Link
                      href={`/activity/${activity.id}`}
                      className="inline-flex items-center font-medium text-white transition-colors hover:text-primary-300"
                    >
                      Explore{" "}
                      <FiArrowRight className="ml-1 transition-all duration-300 group-hover:ml-2" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))
          : // Placeholder destinations if no activities are provided
            [1, 2, 3].map((i) => (
              <motion.div key={i} variants={itemVariants} className="relative">
                <div className="relative overflow-hidden bg-gray-200 h-96 rounded-2xl group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center mb-2 text-white/80">
                      <FiMapPin className="mr-1" />
                      <span>Featured Location</span>
                    </div>

                    <h3 className="mb-3 text-xl font-bold text-white">
                      Amazing Destination
                    </h3>

                    <span className="inline-flex items-center font-medium text-white">
                      Explore{" "}
                      <FiArrowRight className="ml-1 transition-all duration-300 group-hover:ml-2" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
      </motion.div>
    </div>
  );
}
