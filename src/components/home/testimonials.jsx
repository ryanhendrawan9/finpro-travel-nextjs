"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import {
  FiChevronLeft,
  FiChevronRight,
  FiStar,
  FiHeart,
  FiMessageCircle,
  FiTrendingUp,
} from "react-icons/fi";

// Sample testimonials data - in a real app this would come from an API
const TESTIMONIALS = [
  {
    id: 1,
    name: "Sarah Johnson",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    title: "Travel Enthusiast",
    content:
      "The service was exceptional! I found amazing activities for my family vacation and the booking process was seamless. Will definitely use this platform again for all our future trips.",
    rating: 5,
    location: "Bali, Indonesia",
    date: "2 weeks ago",
  },
  {
    id: 2,
    name: "Michael Chen",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    title: "Adventure Seeker",
    content:
      "I was able to discover hidden gems that I wouldn't have found otherwise. The detailed descriptions and genuine reviews helped me make the right choices for my adventure trip.",
    rating: 4,
    location: "Lombok, Indonesia",
    date: "1 month ago",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    title: "Solo Traveler",
    content:
      "As a solo traveler, safety is my top priority. This platform provided all the information I needed to feel secure about my bookings. The customer support team was also incredibly helpful.",
    rating: 5,
    location: "Jakarta, Indonesia",
    date: "3 days ago",
  },
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(1); // 1 for right, -1 for left

  const controls = useAnimation();
  const backgroundControls = useAnimation();
  const starControls = useAnimation();

  // Auto-play testimonials with animation
  useEffect(() => {
    let interval;

    if (isAutoPlaying) {
      interval = setInterval(() => {
        setActiveIndex((prev) =>
          prev === TESTIMONIALS.length - 1 ? 0 : prev + 1
        );
        setDirection(1);
      }, 6000);
    }

    // Animate floating background elements
    backgroundControls.start({
      y: [0, -15, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      },
    });

    // Animate stars
    starControls.start({
      scale: [1, 1.2, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      },
    });

    return () => clearInterval(interval);
  }, [isAutoPlaying, backgroundControls, starControls]);

  const nextTestimonial = () => {
    setIsAutoPlaying(false);
    setDirection(1);
    setActiveIndex((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  const prevTestimonial = () => {
    setIsAutoPlaying(false);
    setDirection(-1);
    setActiveIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  const currentTestimonial = TESTIMONIALS[activeIndex];

  const testimonialVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: (direction) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.5,
      },
    }),
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="relative py-20 overflow-hidden">
      {/* Decorative background elements */}
      <motion.div
        className="absolute w-64 h-64 bg-blue-400 rounded-full top-10 right-10 opacity-10 blur-3xl"
        animate={backgroundControls}
      />
      <motion.div
        className="absolute bg-purple-400 rounded-full bottom-20 left-20 w-80 h-80 opacity-10 blur-3xl"
        animate={{
          y: [0, 20, 0],
          transition: {
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: 1,
          },
        }}
      />

      <div className="relative z-10">
        <motion.div
          className="text-center mb-14"
          initial="hidden"
          animate="visible"
          variants={staggerChildren}
        >
          <motion.span
            className="inline-block px-4 py-1.5 mb-3 text-sm font-medium text-purple-700 bg-purple-100 rounded-full"
            variants={fadeInUp}
          >
            <FiMessageCircle className="inline-block mr-1.5" /> Real Travelers
          </motion.span>

          <motion.h2
            className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl font-heading"
            variants={fadeInUp}
          >
            What Our <span className="text-purple-600">Explorers</span> Say
          </motion.h2>

          <motion.p
            className="max-w-3xl mx-auto text-lg text-gray-600"
            variants={fadeInUp}
          >
            Discover authentic experiences shared by travelers who have embarked
            on memorable Indonesian adventures with us
          </motion.p>

          <motion.div
            className="flex justify-center mt-8 space-x-1"
            variants={fadeInUp}
          >
            {TESTIMONIALS.map((_, index) => (
              <motion.button
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? "bg-purple-600 w-12"
                    : "bg-gray-300 w-3 hover:bg-gray-400"
                }`}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setDirection(index > activeIndex ? 1 : -1);
                  setActiveIndex(index);
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </motion.div>
        </motion.div>

        <div className="relative max-w-5xl px-4 mx-auto">
          {/* Tombol navigasi kiri dengan warna yang lebih terlihat */}
          <div className="absolute z-20 -translate-y-1/2 top-1/2 -left-5 md:left-0">
            <motion.button
              onClick={prevTestimonial}
              className="p-3 text-white transition-all border-2 border-purple-600 rounded-full shadow-lg bg-purple-600 hover:bg-purple-700 hover:border-purple-700"
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              aria-label="Previous testimonial"
            >
              <FiChevronLeft size={24} />
            </motion.button>
          </div>

          {/* Tombol navigasi kanan dengan warna yang lebih terlihat */}
          <div className="absolute z-20 -translate-y-1/2 top-1/2 -right-5 md:right-0">
            <motion.button
              onClick={nextTestimonial}
              className="p-3 text-white transition-all border-2 border-purple-600 rounded-full shadow-lg bg-purple-600 hover:bg-purple-700 hover:border-purple-700"
              whileHover={{ scale: 1.1, x: 5 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              aria-label="Next testimonial"
            >
              <FiChevronRight size={24} />
            </motion.button>
          </div>

          <div className="relative p-1 overflow-hidden bg-white shadow-xl rounded-3xl">
            {/* Colored border effect */}
            <div className="absolute inset-0 opacity-50 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-3xl blur-xl"></div>

            <div className="relative z-10 bg-white rounded-3xl">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentTestimonial.id}
                  custom={direction}
                  variants={testimonialVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="p-8 md:p-12"
                >
                  <div className="flex flex-col gap-8 md:flex-row md:items-center">
                    <div className="flex flex-col items-center md:w-1/3 md:items-start">
                      <div className="relative">
                        <div className="absolute inset-0 transform -translate-x-1 -translate-y-1 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 opacity-30 blur-lg"></div>
                        <img
                          src={currentTestimonial.avatar}
                          alt={currentTestimonial.name}
                          className="relative z-10 object-cover border-4 border-white rounded-full shadow-xl w-28 h-28"
                        />

                        {/* Trending badge for highest ratings */}
                        {currentTestimonial.rating === 5 && (
                          <motion.div
                            className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full p-1.5 shadow-lg"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              delay: 0.3,
                            }}
                          >
                            <FiTrendingUp size={14} />
                          </motion.div>
                        )}
                      </div>

                      <div className="mt-6 mb-8 text-center md:mb-0 md:text-left">
                        <div className="text-xl font-bold text-gray-900">
                          {currentTestimonial.name}
                        </div>
                        <div className="font-medium text-purple-600">
                          {currentTestimonial.title}
                        </div>
                        <div className="flex items-center justify-center mt-1 text-sm text-gray-500 md:justify-start">
                          <span className="inline-block w-2 h-2 mr-2 bg-green-500 rounded-full"></span>
                          {currentTestimonial.location}
                        </div>

                        <div className="flex items-center justify-center mt-4 md:justify-start">
                          {[...Array(5)].map((_, i) => (
                            <motion.div
                              key={i}
                              animate={
                                i < currentTestimonial.rating
                                  ? starControls
                                  : {}
                              }
                            >
                              <FiStar
                                className={
                                  i < currentTestimonial.rating
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }
                                size={18}
                              />
                            </motion.div>
                          ))}
                          <span className="ml-2 text-sm text-gray-600">
                            {currentTestimonial.rating}.0
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="md:w-2/3">
                      <div className="mb-3 text-3xl text-purple-300">"</div>
                      <blockquote className="mb-6 text-lg leading-relaxed text-gray-700 md:text-xl">
                        {currentTestimonial.content}
                      </blockquote>
                      <div className="text-3xl text-right text-purple-300">
                        "
                      </div>

                      <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
                        <div className="text-sm text-gray-500">
                          Posted {currentTestimonial.date}
                        </div>

                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="flex items-center text-gray-500 hover:text-purple-600"
                          >
                            <FiHeart className="mr-1" size={16} />
                            <span className="text-sm">Helpful</span>
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <a
            href="#all-testimonials"
            className="inline-flex items-center px-6 py-3 font-medium text-white transition-all rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-xl hover:from-purple-700 hover:to-blue-700"
          >
            Read All Reviews
          </a>
        </motion.div>
      </div>
    </div>
  );
}
