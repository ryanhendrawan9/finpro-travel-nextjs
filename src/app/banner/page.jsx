"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiChevronRight, FiArrowLeft } from "react-icons/fi";
import { bannerService } from "@/lib/api";

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await bannerService.getAll();
        setBanners(response.data.data || []);
      } catch (err) {
        console.error("Error fetching banners:", err);
        setError("Failed to load banners. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
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
          Loading banners...
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
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/"
            className="flex items-center text-gray-600 transition-colors hover:text-primary-600"
          >
            <FiArrowLeft className="mr-2" /> Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl font-heading">
            Explore Our Banners
          </h1>
          <p className="max-w-3xl mx-auto text-gray-600">
            Discover our latest special offers, promotions, and featured
            experiences
          </p>
        </div>

        {banners.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {banners.map((banner, index) => (
              <motion.div
                key={banner.id}
                variants={itemVariants}
                className="overflow-hidden transition-shadow bg-white shadow-sm rounded-xl hover:shadow-md"
              >
                <Link href={`/banner/${banner.id}`}>
                  <div className="relative">
                    <img
                      src={
                        banner.imageUrl ||
                        "/images/placeholders/banner-placeholder.jpg"
                      }
                      alt={banner.name}
                      className="object-cover w-full h-48"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "/images/placeholders/banner-placeholder.jpg";
                      }}
                    />
                  </div>

                  <div className="p-6">
                    <h3 className="mb-2 text-lg font-bold text-gray-900">
                      {banner.name}
                    </h3>
                    <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                      {banner.description ||
                        "Explore our featured promotions and special offers"}
                    </p>

                    <div className="flex items-center text-primary-600">
                      <span className="font-medium">View Details</span>
                      <FiChevronRight className="ml-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="p-8 text-center bg-white shadow-sm rounded-xl">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">
              No banners found
            </h3>
            <p className="mb-6 text-gray-600">
              There are currently no active banners. Check back later for new
              content!
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
            >
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
