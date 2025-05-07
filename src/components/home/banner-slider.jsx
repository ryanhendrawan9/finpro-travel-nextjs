"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function BannerSlider({ banners }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for right, -1 for left

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prevIndex) =>
      prevIndex === banners.length - 1 ? 0 : prevIndex + 1
    );
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    );
  }, [banners.length]);

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [nextSlide]);

  // Animation variants
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.7,
        ease: "easeInOut",
      },
    },
    exit: (direction) => ({
      x: direction > 0 ? "-100%" : "100%",
      opacity: 0,
      transition: {
        duration: 0.7,
        ease: "easeInOut",
      },
    }),
  };

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full overflow-hidden">
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
              <img
                src={
                  banners[currentIndex].imageUrl ||
                  "/images/placeholders/banner-placeholder.jpg"
                }
                alt={banners[currentIndex].name}
                className="object-cover w-full h-full"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/placeholders/banner-placeholder.jpg";
                }}
              />
              <div className="absolute inset-0 flex items-center bg-gradient-to-r from-black/60 to-transparent">
                <div className="max-w-lg pl-8 md:pl-16 lg:pl-24">
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
                    className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl font-heading"
                  >
                    {banners[currentIndex].name}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
                    className="hidden mb-6 text-lg text-white/90 md:block"
                  >
                    Discover amazing destinations and unforgettable experiences
                  </motion.p>
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.7 } }}
                    className="px-6 py-3 font-medium text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
                  >
                    Explore Now
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <button
        className="absolute p-2 text-white transition-colors -translate-y-1/2 rounded-full left-4 top-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
        onClick={prevSlide}
        aria-label="Previous banner"
      >
        <FiChevronLeft size={24} />
      </button>
      <button
        className="absolute p-2 text-white transition-colors -translate-y-1/2 rounded-full right-4 top-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
        onClick={nextSlide}
        aria-label="Next banner"
      >
        <FiChevronRight size={24} />
      </button>

      {/* Indicators */}
      <div className="absolute flex space-x-2 -translate-x-1/2 bottom-4 left-1/2">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-white w-6" : "bg-white/50"
            }`}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            aria-label={`Go to banner ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
