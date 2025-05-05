"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  bannerService,
  categoryService,
  activityService,
  promoService,
} from "@/lib/api";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
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
      } catch (err) {
        console.error("Error fetching homepage data:", err);
        setError("Failed to load content. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-pulse text-2xl font-bold text-primary-600">
          Discovering amazing destinations for you...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-2xl font-bold text-red-600 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
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
          className="py-12 px-4 md:px-8 lg:px-16 bg-white"
        >
          <CategoryShowcase categories={categories} />
        </motion.section>
      )}

      {activities.length > 0 && (
        <motion.section
          variants={itemVariants}
          className="py-12 px-4 md:px-8 lg:px-16"
        >
          <PopularActivities activities={activities.slice(0, 6)} />
        </motion.section>
      )}

      <motion.section
        variants={itemVariants}
        className="py-12 px-4 md:px-8 lg:px-16 bg-primary-50"
      >
        <FeaturedDestinations activities={activities.slice(0, 3)} />
      </motion.section>

      {promos.length > 0 && (
        <motion.section
          variants={itemVariants}
          className="py-12 px-4 md:px-8 lg:px-16 bg-white"
        >
          <PromoSection promos={promos} />
        </motion.section>
      )}

      <motion.section
        variants={itemVariants}
        className="py-12 px-4 md:px-8 lg:px-16 bg-secondary-50"
      >
        <Testimonials />
      </motion.section>

      <motion.section
        variants={itemVariants}
        className="py-12 px-4 md:px-8 lg:px-16 bg-white"
      >
        <Newsletter />
      </motion.section>

      <motion.section
        variants={itemVariants}
        className="py-16 px-4 md:px-8 lg:px-16 bg-accent-500"
      >
        <CallToAction />
      </motion.section>
    </motion.div>
  );
}
