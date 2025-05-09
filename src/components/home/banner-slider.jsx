"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
  FiClock,
  FiStar,
  FiArrowRight,
} from "react-icons/fi";
import Link from "next/link";
// Remove Next Image import to avoid domain config issues
// import Image from "next/image";

export default function EnhancedBannerSlider({ banners }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for right, -1 for left
  const [isHovering, setIsHovering] = useState(false);
  const autoplayTimeoutRef = useRef(null);
  const progressBarRef = useRef(null);

  const resetProgressBar = useCallback(() => {
    if (progressBarRef.current) {
      progressBarRef.current.style.transition = "none";
      progressBarRef.current.style.width = "0%";
      // Force reflow to apply the style immediately
      void progressBarRef.current.offsetWidth;
      progressBarRef.current.style.transition = "width 5000ms linear";
      progressBarRef.current.style.width = "100%";
    }
  }, []);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prevIndex) =>
      prevIndex === banners.length - 1 ? 0 : prevIndex + 1
    );
    resetProgressBar();
  }, [banners?.length, resetProgressBar]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    );
    resetProgressBar();
  }, [banners?.length, resetProgressBar]);

  const gotoSlide = useCallback(
    (index) => {
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(index);
      resetProgressBar();
    },
    [currentIndex, resetProgressBar]
  );

  // Auto slide with pause on hover
  useEffect(() => {
    if (isHovering) {
      if (autoplayTimeoutRef.current) {
        clearTimeout(autoplayTimeoutRef.current);
      }
      if (progressBarRef.current) {
        progressBarRef.current.style.animationPlayState = "paused";
      }
    } else {
      resetProgressBar();
      autoplayTimeoutRef.current = setTimeout(() => {
        nextSlide();
      }, 5000);
    }

    return () => {
      if (autoplayTimeoutRef.current) {
        clearTimeout(autoplayTimeoutRef.current);
      }
    };
  }, [isHovering, nextSlide, resetProgressBar]);

  // Initialize progress bar on mount
  useEffect(() => {
    resetProgressBar();
  }, [resetProgressBar]);

  // Animation variants
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 1.05,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 },
        scale: { duration: 0.5 },
      },
    },
    exit: (direction) => ({
      x: direction > 0 ? "-100%" : "100%",
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 },
        scale: { duration: 0.5 },
      },
    }),
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
        delayChildren: 0.2,
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

  if (!banners || banners.length === 0) {
    return null;
  }

  // Add sample data for testing if not provided
  const enhancedBanners = banners.map((banner) => ({
    ...banner,
    location: banner.location || "Indonesia",
    duration: banner.duration || "3 Days",
    price: banner.price || "Rp 1.299.000",
    discount: banner.discount || "Rp 999.000",
    rating: banner.rating || 4.9,
    reviews: banner.reviews || 124,
    featured: banner.featured !== undefined ? banner.featured : true,
  }));

  return (
    <div
      className="relative w-full overflow-hidden shadow-2xl rounded-2xl"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 z-20 h-1 bg-gray-800/10">
        <div
          ref={progressBarRef}
          className="h-full bg-blue-500"
          style={{ width: "0%", transition: "width 5000ms linear" }}
        ></div>
      </div>

      <div className="relative aspect-[21/9] md:aspect-[21/7] w-full">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            <div className="relative w-full h-full">
              {/* Image - using regular img tag instead of Next/Image */}
              <div className="relative w-full h-full overflow-hidden">
                <img
                  src={
                    enhancedBanners[currentIndex].imageUrl ||
                    "/images/placeholders/banner-placeholder.jpg"
                  }
                  alt={enhancedBanners[currentIndex].name}
                  className="absolute inset-0 object-cover w-full h-full transition-transform duration-5000 hover:scale-105"
                  style={{ objectPosition: "center" }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "/images/placeholders/banner-placeholder.jpg";
                  }}
                  loading="eager"
                />

                {/* Modern gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
              </div>

              {/* Enhanced content */}
              <div className="absolute inset-0 flex items-center">
                <motion.div
                  className="max-w-lg pl-8 space-y-6 md:pl-16 lg:pl-24"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {/* Featured badge */}
                  {enhancedBanners[currentIndex].featured && (
                    <motion.div variants={itemVariants}>
                      <span className="inline-block px-3 py-1 mb-4 text-xs font-medium text-white bg-blue-600 rounded-full">
                        Featured
                      </span>
                    </motion.div>
                  )}

                  {/* Banner title */}
                  <motion.h2
                    variants={itemVariants}
                    className="mb-2 text-3xl font-bold text-white md:text-4xl lg:text-5xl font-heading text-shadow-lg"
                  >
                    {enhancedBanners[currentIndex].name}
                  </motion.h2>

                  {/* Location and duration */}
                  <motion.div
                    variants={itemVariants}
                    className="flex flex-wrap items-center gap-4 mb-2"
                  >
                    <div className="flex items-center text-white/90">
                      <FiMapPin className="mr-2 text-blue-400" />
                      <span>{enhancedBanners[currentIndex].location}</span>
                    </div>
                    <div className="flex items-center text-white/90">
                      <FiClock className="mr-2 text-blue-400" />
                      <span>{enhancedBanners[currentIndex].duration}</span>
                    </div>
                    <div className="flex items-center text-white/90">
                      <FiStar
                        className="mr-2 text-yellow-400"
                        fill="currentColor"
                      />
                      <span>
                        {enhancedBanners[currentIndex].rating} (
                        {enhancedBanners[currentIndex].reviews} reviews)
                      </span>
                    </div>
                  </motion.div>

                  {/* Description */}
                  <motion.p
                    variants={itemVariants}
                    className="hidden mb-3 text-lg text-white/90 md:block"
                  >
                    Discover amazing destinations and unforgettable experiences
                  </motion.p>

                  {/* Price with discount */}
                  <motion.div variants={itemVariants} className="mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-white">
                        {enhancedBanners[currentIndex].discount}
                      </span>
                      {enhancedBanners[currentIndex].price && (
                        <span className="text-lg line-through text-white/70">
                          {enhancedBanners[currentIndex].price}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/70">*Price per person</p>
                  </motion.div>

                  {/* Call to action */}
                  <motion.div variants={itemVariants}>
                    <Link
                      href={`/banner/${enhancedBanners[currentIndex].id}`}
                      className="inline-flex items-center px-6 py-3 font-medium text-white transition-all rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:shadow-blue-700/30 group"
                    >
                      <span>Explore Now</span>
                      <FiArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Enhanced controls with hover animations */}
      <motion.button
        className="absolute p-3 text-white transition-all -translate-y-1/2 rounded-full left-4 top-1/2 bg-black/20 hover:bg-blue-600 backdrop-blur-sm hover:scale-110"
        onClick={prevSlide}
        aria-label="Previous banner"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <FiChevronLeft size={24} />
      </motion.button>
      <motion.button
        className="absolute p-3 text-white transition-all -translate-y-1/2 rounded-full right-4 top-1/2 bg-black/20 hover:bg-blue-600 backdrop-blur-sm hover:scale-110"
        onClick={nextSlide}
        aria-label="Next banner"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <FiChevronRight size={24} />
      </motion.button>

      {/* Enhanced indicators with animations */}
      <div className="absolute flex items-center -translate-x-1/2 space-x-2.5 bottom-6 left-1/2">
        {enhancedBanners.map((_, index) => (
          <motion.button
            key={index}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-blue-500 w-8"
                : "bg-white/50 w-2.5 hover:bg-white/80"
            }`}
            onClick={() => gotoSlide(index)}
            aria-label={`Go to banner ${index + 1}`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          />
        ))}
      </div>

      {/* Banner counter */}
      <div className="absolute px-3 py-1 text-xs font-medium text-white rounded-full top-4 right-4 bg-black/30 backdrop-blur-sm">
        {currentIndex + 1} / {enhancedBanners.length}
      </div>
    </div>
  );
}
