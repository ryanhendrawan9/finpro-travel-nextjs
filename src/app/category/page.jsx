"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiChevronRight, FiMap } from "react-icons/fi";
import { categoryService } from "@/lib/api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAll();
        setCategories(response.data.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-bold animate-pulse text-primary-600">
          Loading categories...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="mb-4 text-2xl font-bold text-red-600">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-900 font-heading">
          Explore Categories
        </h1>
        <p className="max-w-3xl mx-auto mb-12 text-gray-600">
          Discover a variety of amazing travel experiences and activities by
          category. From adventurous outdoor activities to relaxing cultural
          tours, we have something for everyone.
        </p>

        <motion.div
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {categories.map((category) => (
            <motion.div
              key={category.id}
              variants={itemVariants}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <Link href={`/category/${category.id}`}>
                <div className="relative h-64 overflow-hidden transition-shadow duration-300 shadow-lg group rounded-2xl hover:shadow-xl">
                  <img
                    src={
                      category.imageUrl ||
                      "/images/placeholders/category-placeholder.jpg"
                    }
                    alt={category.name}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "/images/placeholders/category-placeholder.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="mb-2 text-2xl font-bold text-white">
                        {category.name}
                      </h3>
                      <div className="flex items-center justify-center w-10 h-10 transition-transform rounded-full bg-white/20 group-hover:translate-x-2">
                        <FiChevronRight className="text-white" size={20} />
                      </div>
                    </div>
                    <div className="flex items-center font-medium text-white/90">
                      <span>Explore Activities</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Featured category section */}
        {categories.length > 0 && (
          <div className="pt-8 mt-16 border-t border-gray-200">
            <h2 className="mb-6 text-2xl font-bold text-gray-900 font-heading">
              Featured Category
            </h2>

            <motion.div
              className="overflow-hidden bg-white shadow-lg rounded-3xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative h-64 lg:h-auto">
                  <img
                    src={
                      categories[0]?.imageUrl ||
                      "/images/placeholders/category-placeholder.jpg"
                    }
                    alt={categories[0]?.name || "Featured Category"}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "/images/placeholders/category-placeholder.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent lg:hidden" />
                </div>

                <div className="flex flex-col justify-center p-8 lg:p-12">
                  <h3 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">
                    {categories[0]?.name || "Featured Category"}
                  </h3>

                  <p className="mb-6 text-gray-600">
                    Experience the best of{" "}
                    {categories[0]?.name || "our featured category"} with our
                    curated selection of activities. From beginner-friendly
                    options to expert-level adventures, there's something for
                    everyone.
                  </p>

                  <div className="flex flex-wrap gap-4 mb-8">
                    <div className="flex items-center px-4 py-2 rounded-full bg-primary-50 text-primary-700">
                      <FiMap className="mr-2" />
                      <span>Multiple Locations</span>
                    </div>
                    <div className="flex items-center px-4 py-2 text-green-700 rounded-full bg-green-50">
                      <span>20+ Activities</span>
                    </div>
                  </div>

                  <Link
                    href={`/category/${categories[0]?.id}`}
                    className="inline-flex items-center self-start px-6 py-3 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
                  >
                    Explore Now <FiChevronRight className="ml-2" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
