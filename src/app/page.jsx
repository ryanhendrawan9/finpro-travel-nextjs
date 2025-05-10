"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  bannerService,
  categoryService,
  activityService,
  promoService,
} from "@/lib/api";
import { useLoading } from "@/context/LoadingContext"; // Import loading context
import Hero from "@/components/home/hero";
import BannerSlider from "@/components/home/banner-slider";
import CategoryShowcase from "@/components/home/category-showcase";
import PopularActivities from "@/components/home/popular-activities";
import PromoSection from "@/components/home/promo-section";
import FeaturedDestinations from "@/components/home/featured-destinations";
import Testimonials from "@/components/home/testimonials";
import Newsletter from "@/components/home/newsletter";
import CallToAction from "@/components/home/call-to-action";

export default function HomePage() {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activities, setActivities] = useState([]);
  const [promos, setPromos] = useState([]);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  // Get loading functions from context
  const { setIsLoading } = useLoading();

  // Set mounted state after initial render
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const fetchData = async () => {
      try {
        // Keep loading on until data fetched
        setIsLoading(true);

        const [bannersRes, categoriesRes, activitiesRes, promosRes] =
          await Promise.all([
            bannerService.getAll(),
            categoryService.getAll(),
            activityService.getAll(),
            promoService.getAll(),
          ]);

        setBanners(bannersRes.data.data || []);
        setCategories(categoriesRes.data.data || []);
        setActivities(activitiesRes.data.data || []);
        setPromos(promosRes.data.data || []);

        // Add minimum loading time for a smooth experience
        setTimeout(() => {
          setIsLoading(false);
        }, 2500);
      } catch (err) {
        console.error("Error fetching homepage data:", err);
        setError("Failed to load content. Please try again later.");
        setIsLoading(false);
      }
    };

    if (isMounted) {
      fetchData();
    }
  }, [isMounted, setIsLoading]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  // Error UI with animated elements
  if (error) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-full max-w-md p-8 mx-4 bg-white shadow-xl rounded-xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <motion.div
            className="flex items-center justify-center w-20 h-20 mx-auto mb-6 text-red-500 rounded-full bg-red-50"
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
            transition={{
              delay: 0.4,
              type: "spring",
              stiffness: 200,
              damping: 10,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </motion.div>

          <motion.h2
            className="mb-3 text-2xl font-bold text-center text-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Oops! Something went wrong
          </motion.h2>

          <motion.p
            className="mb-6 text-center text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {error}
          </motion.p>

          <motion.button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center w-full px-4 py-3 font-medium text-white transition-all rounded-lg bg-primary-600 hover:bg-primary-700 hover:shadow-lg"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try Again
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  // Only render content after mounted
  if (!isMounted) {
    return null;
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-50"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Hero />

      {banners.length > 0 && (
        <motion.section variants={itemVariants} className="py-8">
          <BannerSlider banners={banners} />
        </motion.section>
      )}

      {categories.length > 0 && (
        <motion.section
          variants={itemVariants}
          className="px-4 py-12 bg-white md:px-8 lg:px-16"
        >
          <CategoryShowcase categories={categories} />
        </motion.section>
      )}

      {activities.length > 0 && (
        <motion.section
          variants={itemVariants}
          className="px-4 py-12 md:px-8 lg:px-16"
        >
          <PopularActivities activities={activities.slice(0, 6)} />
        </motion.section>
      )}

      <motion.section
        variants={itemVariants}
        className="px-4 py-12 md:px-8 lg:px-16 bg-primary-50"
      >
        <FeaturedDestinations activities={activities.slice(0, 3)} />
      </motion.section>

      {promos.length > 0 && (
        <motion.section
          variants={itemVariants}
          className="px-4 py-12 bg-white md:px-8 lg:px-16"
        >
          <PromoSection promos={promos} />
        </motion.section>
      )}

      <motion.section
        variants={itemVariants}
        className="px-4 py-12 md:px-8 lg:px-16 bg-secondary-50"
      >
        <Testimonials />
      </motion.section>

      <motion.section
        variants={itemVariants}
        className="px-4 py-12 bg-white md:px-8 lg:px-16"
      >
        <Newsletter />
      </motion.section>

      <motion.section
        variants={itemVariants}
        className="px-4 py-16 md:px-8 lg:px-16 bg-accent-500"
      >
        <CallToAction />
      </motion.section>
    </motion.div>
  );
}
