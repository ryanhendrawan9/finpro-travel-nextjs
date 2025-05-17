"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import {
  bannerService,
  categoryService,
  activityService,
  promoService,
} from "@/lib/api";
import { useLoading } from "@/context/LoadingContext";

// Core components - loaded immediately
import Hero from "@/components/home/hero";
import BannerSlider from "@/components/home/banner-slider";

// Lazy loaded components - only loaded when they come into view
const CategoryShowcase = lazy(() =>
  import("@/components/home/category-showcase")
);
const PopularActivities = lazy(() =>
  import("@/components/home/popular-activities")
);
const PromoSection = lazy(() => import("@/components/home/promo-section"));
const FeaturedDestinations = lazy(() =>
  import("@/components/home/featured-destinations")
);
const Testimonials = lazy(() => import("@/components/home/testimonials"));
const Newsletter = lazy(() => import("@/components/home/newsletter"));
const CallToAction = lazy(() => import("@/components/home/call-to-action"));

// Simple loading fallback component
const SectionLoading = () => (
  <div className="flex items-center justify-center py-16">
    <div className="w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
  </div>
);

export default function HomePage() {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activities, setActivities] = useState([]);
  const [promos, setPromos] = useState([]);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [loadedSections, setLoadedSections] = useState({
    banners: false,
    categories: false,
    activities: false,
    promos: false,
  });

  // Get loading functions from context
  const { setIsLoading } = useLoading();

  // Set mounted state after initial render
  useEffect(() => {
    setIsMounted(true);

    // Prefetch critical images (hero background, logo)
    const prefetchImages = [
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1920&q=80",
    ];

    prefetchImages.forEach((url) => {
      const img = new Image();
      img.src = url;
    });

    // Start data fetching immediately
    fetchData();

    return () => {
      // Cleanup
    };
  }, []);

  const fetchData = async () => {
    try {
      // Prioritize the data needed for visible sections first
      const bannersPromise = bannerService.getAll().then((res) => {
        setBanners(res.data.data || []);
        setLoadedSections((prev) => ({ ...prev, banners: true }));
      });

      // Fetch other data with Promise.all
      const otherDataPromise = Promise.all([
        categoryService.getAll().then((res) => {
          setCategories(res.data.data || []);
          setLoadedSections((prev) => ({ ...prev, categories: true }));
        }),
        activityService.getAll().then((res) => {
          setActivities(res.data.data || []);
          setLoadedSections((prev) => ({ ...prev, activities: true }));
        }),
        promoService.getAll().then((res) => {
          setPromos(res.data.data || []);
          setLoadedSections((prev) => ({ ...prev, promos: true }));
        }),
      ]);

      // Wait for both immediate and secondary data
      await Promise.all([bannersPromise, otherDataPromise]);

      // After all data is loaded, stop the loader
      setTimeout(() => {
        setIsLoading(false);
      }, 500); // Reduced loading time
    } catch (err) {
      console.error("Error fetching homepage data:", err);
      setError("Failed to load content. Please try again later.");
      setIsLoading(false);
    }
  };

  // Animation variants
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
    hidden: { y: 20, opacity: 0 },
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

  // Error UI with animated elements - kept simple for performance
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-md p-8 mx-4 text-center bg-white shadow-xl rounded-xl">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 text-red-500 rounded-full bg-red-50">
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
          </div>

          <h2 className="mb-3 text-2xl font-bold text-center text-gray-900">
            Oops! Something went wrong
          </h2>

          <p className="mb-6 text-center text-gray-600">{error}</p>

          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center w-full px-4 py-3 font-medium text-white transition-all rounded-lg bg-primary-600 hover:bg-primary-700 hover:shadow-lg"
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
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-white"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Hero - Full width, no container needed */}
      <Hero />

      {/* Banner Slider - Clean white with subtle pattern */}
      {banners.length > 0 && (
        <motion.section
          variants={itemVariants}
          className="relative py-12 overflow-hidden bg-white"
        >
          <BannerSlider banners={banners} />
        </motion.section>
      )}

      {/* Category Showcase - Light gray background with white cards */}
      {categories.length > 0 && (
        <Suspense fallback={<SectionLoading />}>
          <motion.section
            variants={itemVariants}
            className="relative py-20 bg-gray-50"
          >
            <div className="container relative z-10 px-4 mx-auto md:px-8 lg:px-16">
              <CategoryShowcase categories={categories} />
            </div>
          </motion.section>
        </Suspense>
      )}

      {/* Popular Activities */}
      {activities.length > 0 && (
        <Suspense fallback={<SectionLoading />}>
          <motion.section
            variants={itemVariants}
            className="relative py-20 bg-white"
          >
            {/* Subtle horizontal line separators */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

            <div className="container relative z-10 px-4 mx-auto md:px-8 lg:px-16">
              <PopularActivities activities={activities.slice(0, 6)} />
            </div>
          </motion.section>
        </Suspense>
      )}

      {/* Featured Destinations - Light blue-gray gradient */}
      <Suspense fallback={<SectionLoading />}>
        <motion.section
          variants={itemVariants}
          className="relative py-20 bg-gradient-to-b from-gray-50 to-blue-50"
        >
          {/* Subtle circular pattern */}
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "radial-gradient(circle at 25% 25%, #E1F5FE 1%, transparent 1%), radial-gradient(circle at 75% 75%, #E1F5FE 1%, transparent 1%)",
              backgroundSize: "60px 60px",
            }}
          ></div>
          <div className="container relative z-10 px-4 mx-auto md:px-8 lg:px-16">
            <FeaturedDestinations activities={activities.slice(0, 3)} />
          </div>
        </motion.section>
      </Suspense>

      {/* Promo Section - White with thin border */}
      {promos.length > 0 && (
        <Suspense fallback={<SectionLoading />}>
          <motion.section
            variants={itemVariants}
            className="relative py-20 bg-white"
          >
            <div className="container relative z-10 px-4 mx-auto md:px-8 lg:px-16">
              <PromoSection promos={promos} />
            </div>
          </motion.section>
        </Suspense>
      )}

      {/* Testimonials - Light gray with quote marks */}
      <Suspense fallback={<SectionLoading />}>
        <motion.section
          variants={itemVariants}
          className="relative py-20 bg-gray-50"
        >
          {/* Large quote marks decoration */}
          <div className="absolute opacity-5 text-black text-[250px] font-serif top-10 left-10">
            "
          </div>
          <div className="absolute opacity-5 text-black text-[250px] font-serif bottom-10 right-10">
            "
          </div>
          <Testimonials />
        </motion.section>
      </Suspense>

      {/* Newsletter - White with subtle shadow */}
      <Suspense fallback={<SectionLoading />}>
        <motion.section
          variants={itemVariants}
          className="relative py-20 overflow-hidden bg-white shadow-sm"
        >
          {/* Subtle radial gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-white to-gray-50"></div>

          <div className="container relative z-10 px-4 mx-auto md:px-8 lg:px-16">
            <Newsletter />
          </div>
        </motion.section>
      </Suspense>

      {/* Call To Action - Light gradient with elegant border */}
      <Suspense fallback={<SectionLoading />}>
        <motion.section
          variants={itemVariants}
          className="relative py-20 bg-gradient-to-r from-gray-50 via-white to-gray-50"
        >
          <div className="container relative z-10 px-4 mx-auto md:px-8 lg:px-16">
            <CallToAction />
          </div>
        </motion.section>
      </Suspense>
    </motion.div>
  );
}
