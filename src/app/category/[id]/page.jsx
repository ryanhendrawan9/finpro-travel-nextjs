"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft,
  FiCalendar,
  FiExternalLink,
  FiInfo,
  FiChevronDown,
  FiMapPin,
  FiStar,
} from "react-icons/fi";
import { categoryService, activityService } from "@/lib/api";
import ActivityCard from "@/components/activity/activity-card";

export default function CategoryDetailPage({ params }) {
  const id = use(params).id;
  const [category, setCategory] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // UI state for expanded sections
  const [expandedInfo, setExpandedInfo] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const categoryRes = await categoryService.getById(id);
        setCategory(categoryRes.data.data);

        // Add a small delay to make the loading animation visible
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Fetch activities related to this category
        const activitiesRes = await activityService.getByCategory(id);
        setActivities(activitiesRes.data.data || []);
      } catch (err) {
        console.error("Error fetching category details:", err);
        setError("Failed to load category details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2,
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
        stiffness: 80,
        damping: 15,
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 1.1 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
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
    hover: {
      y: -10,
      boxShadow:
        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 15,
      },
    },
  };

  const expandVariants = {
    collapsed: { height: 0, opacity: 0, overflow: "hidden" },
    expanded: {
      height: "auto",
      opacity: 1,
      transition: {
        height: {
          duration: 0.3,
        },
        opacity: {
          duration: 0.25,
          delay: 0.15,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: 1,
            scale: [1, 1.05, 1],
            transition: {
              scale: {
                repeat: Infinity,
                duration: 1.5,
                repeatType: "reverse",
              },
            },
          }}
          className="flex flex-col items-center text-2xl font-bold text-primary-600"
        >
          <svg
            className="w-10 h-10 mb-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading category details...
        </motion.div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-2xl font-bold text-red-600"
        >
          {error || "Category not found"}
        </motion.div>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/category")}
          className="flex items-center px-6 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
        >
          <FiArrowLeft className="mr-2" /> Back to Categories
        </motion.button>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen pt-24 pb-16 bg-gray-50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <motion.div className="mb-6" variants={itemVariants}>
          <Link href="/category">
            <motion.div
              className="flex items-center text-gray-600 transition-colors hover:text-primary-600"
              whileHover={{ x: -5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <FiArrowLeft className="mr-2" /> Back to Categories
            </motion.div>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Category details */}
          <div className="lg:col-span-2">
            <motion.div
              className="overflow-hidden bg-white shadow-sm rounded-xl"
              variants={itemVariants}
            >
              <div className="relative h-64 overflow-hidden md:h-80">
                <motion.img
                  src={
                    category.imageUrl ||
                    "/images/placeholders/category-placeholder.jpg"
                  }
                  alt={category.name}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "/images/placeholders/category-placeholder.jpg";
                  }}
                  variants={imageVariants}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                />

                {/* Category badge with animation */}
                <motion.div
                  className="absolute px-3 py-1 text-sm font-medium text-white rounded-full top-4 left-4 bg-primary-600"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Featured
                </motion.div>
              </div>

              <div className="p-6 md:p-8">
                <motion.h1
                  className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {category.name}
                </motion.h1>

                <motion.p
                  className="mb-6 text-gray-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {category.description ||
                    "Explore amazing activities in this category and discover unforgettable experiences."}
                </motion.p>

                <motion.div
                  className="flex flex-wrap gap-4 mb-8"
                  variants={itemVariants}
                >
                  <motion.div
                    className="flex items-center px-4 py-2 rounded-lg bg-primary-50 text-primary-700"
                    whileHover={{ scale: 1.05, backgroundColor: "#EEF2FF" }}
                  >
                    <FiCalendar className="mr-2" />
                    <span>Available Year-Round</span>
                  </motion.div>

                  <motion.div
                    className="flex items-center px-4 py-2 rounded-lg bg-amber-50 text-amber-700"
                    whileHover={{ scale: 1.05, backgroundColor: "#FEF3C7" }}
                  >
                    <FiStar className="mr-2" />
                    <span>Top Rated</span>
                  </motion.div>

                  <motion.div
                    className="flex items-center px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700"
                    whileHover={{ scale: 1.05, backgroundColor: "#ECFDF5" }}
                  >
                    <FiMapPin className="mr-2" />
                    <span>{category.location || "Multiple Locations"}</span>
                  </motion.div>
                </motion.div>

                <motion.div
                  className="pt-6 border-t border-gray-100"
                  variants={itemVariants}
                >
                  <motion.h2
                    className="mb-4 text-xl font-bold text-gray-900"
                    whileHover={{ x: 2 }}
                  >
                    Category Details
                  </motion.h2>

                  <motion.div
                    className="prose text-gray-700 max-w-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p>
                      This category features a diverse range of activities
                      designed to provide memorable experiences for travelers of
                      all ages and interests. From adrenaline-pumping adventures
                      to cultural immersions, you'll find something to match
                      your preferences.
                    </p>
                    <p>
                      Our experienced guides and partners ensure the highest
                      quality experiences, with safety and enjoyment as our top
                      priorities. Explore the activities below to start planning
                      your perfect adventure.
                    </p>
                  </motion.div>

                  <motion.div
                    className="mt-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Link href="/activity">
                      <motion.div
                        className="inline-flex items-center px-6 py-3 font-medium text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <motion.div
                          className="flex items-center"
                          whileHover={{ x: 5 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          Browse All Activities{" "}
                          <FiChevronDown className="ml-2" />
                        </motion.div>
                      </motion.div>
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              className="sticky p-6 bg-white shadow-sm rounded-xl top-28"
              variants={itemVariants}
              whileHover={{
                boxShadow:
                  "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
            >
              <motion.h2
                className="mb-4 text-xl font-bold text-gray-900"
                whileHover={{ x: 2 }}
              >
                Category Information
              </motion.h2>

              <motion.div className="mb-6 space-y-4">
                <motion.div
                  className="flex items-center justify-between p-3 transition-colors rounded-lg hover:bg-gray-50"
                  whileHover={{ x: 3 }}
                >
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium text-gray-900">
                    {category.type || "Adventure"}
                  </span>
                </motion.div>

                <motion.div
                  className="flex items-center justify-between p-3 transition-colors rounded-lg hover:bg-gray-50"
                  whileHover={{ x: 3 }}
                >
                  <span className="text-gray-600">Status</span>
                  <motion.span
                    className="px-2 py-1 text-xs font-medium text-white bg-green-500 rounded-full"
                    whileHover={{ scale: 1.1 }}
                  >
                    Active
                  </motion.span>
                </motion.div>

                <motion.div
                  className="flex items-center justify-between p-3 transition-colors rounded-lg hover:bg-gray-50"
                  whileHover={{ x: 3 }}
                >
                  <span className="text-gray-600">Activities</span>
                  <span className="font-medium text-gray-900">
                    {activities.length}
                  </span>
                </motion.div>
              </motion.div>

              <Link href="/activity">
                <motion.div
                  className="flex items-center justify-center w-full py-3 font-medium text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  View All Activities
                </motion.div>
              </Link>

              <motion.div className="pt-6 mt-6 border-t border-gray-100">
                <motion.div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedInfo(!expandedInfo)}
                >
                  <h3 className="font-medium text-gray-900">Category Info</h3>
                  <motion.div
                    animate={{ rotate: expandedInfo ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FiChevronDown />
                  </motion.div>
                </motion.div>

                <AnimatePresence>
                  {expandedInfo && (
                    <motion.ul
                      className="pl-4 mt-2 space-y-2 text-gray-700 list-disc"
                      variants={expandVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                    >
                      <motion.li
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        Wide range of activity difficulty levels
                      </motion.li>
                      <motion.li
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        Available for all age groups
                      </motion.li>
                      <motion.li
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        Professional guides and equipment
                      </motion.li>
                      <motion.li
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        Group and private options available
                      </motion.li>
                    </motion.ul>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Extra info card with animation */}
              <motion.div
                className="p-4 mt-6 border rounded-lg bg-primary-50 border-primary-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start">
                  <div className="mt-1 mr-3 text-primary-500">
                    <FiInfo size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-primary-900">
                      Did you know?
                    </h4>
                    <p className="mt-1 text-xs text-primary-800">
                      This category is one of our most popular choices!
                      Travelers who explored this category also enjoyed our
                      cultural experiences.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Related activities with staggered animations */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <motion.h2
            className="mb-6 text-2xl font-bold text-gray-900"
            whileHover={{ x: 3 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Activities in this Category
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.15, delayChildren: 0.2 }}
          >
            {activities.slice(0, 6).map((activity, index) => (
              <motion.div
                key={activity.id}
                variants={cardVariants}
                whileHover="hover"
                custom={index}
              >
                <ActivityCard activity={activity} index={index} />
              </motion.div>
            ))}
          </motion.div>

          {activities.length === 0 && (
            <motion.div
              className="p-8 text-center bg-white shadow-sm rounded-xl"
              variants={itemVariants}
              whileHover={{
                boxShadow:
                  "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
            >
              <motion.div
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                animate={{
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </motion.div>
              <motion.h3
                className="mb-2 text-xl font-bold text-gray-900"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                No activities available
              </motion.h3>
              <motion.p
                className="mb-6 text-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                There are currently no activities in this category.
              </motion.p>
              <Link href="/activity">
                <motion.div
                  className="inline-block px-6 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Browse All Activities
                </motion.div>
              </Link>
            </motion.div>
          )}

          {/* View more button */}
          {activities.length > 6 && (
            <motion.div
              className="flex justify-center mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Link href={`/activity?category=${category.id}`}>
                <motion.div
                  className="px-6 py-3 font-medium transition-colors border-2 rounded-lg text-primary-700 border-primary-500 hover:bg-primary-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View All {activities.length} Activities
                </motion.div>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
