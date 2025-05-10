"use client";

import { useState, useRef } from "react";
import {
  motion,
  useInView,
  useAnimation,
  AnimatePresence,
} from "framer-motion";
import Link from "next/link";
import {
  FiArrowRight,
  FiMapPin,
  FiCompass,
  FiStar,
  FiSend,
} from "react-icons/fi";

export default function CallToAction() {
  const [hoverActivity, setHoverActivity] = useState(false);
  const [hoverContact, setHoverContact] = useState(false);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });
  const controls = useAnimation();

  // Start animations when in view
  if (isInView && !controls.isAnimating) {
    controls.start("visible");
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
      },
    },
  };

  const decorationVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 60,
        delay: 0.3,
      },
    },
  };

  const buttonVariants = {
    initial: { scale: 1, boxShadow: "0 0 0 rgba(255, 255, 255, 0)" },
    hover: {
      scale: 1.05,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 20,
      },
    },
    tap: { scale: 0.95 },
  };

  const arrowVariants = {
    initial: { x: 0 },
    hover: {
      x: 5,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 20,
        repeat: Infinity,
        repeatType: "reverse",
      },
    },
  };

  const particleVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: {
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatDelay: Math.random() * 2,
      },
    },
  };

  // Generate random particles
  const particles = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 6 + 4,
    delay: Math.random() * 2,
  }));

  return (
    <motion.div
      className="relative mx-4 my-16 overflow-hidden rounded-3xl"
      ref={containerRef}
      initial="hidden"
      animate={controls}
      variants={containerVariants}
    >
      {/* Background with animated gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 opacity-90"
        animate={{
          background: [
            "linear-gradient(to right, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%)",
            "linear-gradient(to right, var(--tw-gradient-to) 0%, var(--tw-gradient-from) 100%)",
            "linear-gradient(to right, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%)",
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      {/* Animated particle overlay */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute bg-white rounded-full opacity-50"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
            variants={particleVariants}
            initial="initial"
            animate="animate"
            transition={{
              delay: particle.delay,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl px-4 py-16 mx-auto text-center">
        <motion.div className="mb-2" variants={itemVariants}>
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-white/20 backdrop-blur-sm"
            animate={{
              rotate: [0, 5, 0, -5, 0],
              transition: { duration: 6, repeat: Infinity },
            }}
          >
            <FiCompass className="w-8 h-8 text-white" />
          </motion.div>
        </motion.div>

        <motion.h2
          className="mb-6 text-3xl font-bold text-white md:text-4xl lg:text-5xl font-heading"
          variants={itemVariants}
        >
          <motion.span
            className="inline-block"
            animate={{
              y: [0, -5, 0],
              transition: {
                duration: 2.5,
                repeat: Infinity,
                delay: 0.1,
              },
            }}
          >
            Ready
          </motion.span>{" "}
          <motion.span
            className="inline-block"
            animate={{
              y: [0, -5, 0],
              transition: {
                duration: 2.5,
                repeat: Infinity,
                delay: 0.2,
              },
            }}
          >
            for
          </motion.span>{" "}
          <motion.span
            className="inline-block"
            animate={{
              y: [0, -5, 0],
              transition: {
                duration: 2.5,
                repeat: Infinity,
                delay: 0.3,
              },
            }}
          >
            Your
          </motion.span>{" "}
          <motion.span
            className="inline-block"
            animate={{
              y: [0, -5, 0],
              transition: {
                duration: 2.5,
                repeat: Infinity,
                delay: 0.4,
              },
            }}
          >
            Next
          </motion.span>{" "}
          <motion.span
            className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-100"
            animate={{
              y: [0, -5, 0],
              transition: {
                duration: 2.5,
                repeat: Infinity,
                delay: 0.5,
              },
            }}
          >
            Adventure?
          </motion.span>
        </motion.h2>

        <motion.p
          className="max-w-2xl mx-auto mb-10 text-lg text-white/90"
          variants={itemVariants}
        >
          Discover amazing destinations, create unforgettable memories, and
          experience the journey of a lifetime. Start planning your dream trip
          today!
        </motion.p>

        {/* Animated icons row */}
        <motion.div
          className="flex justify-center mb-10 space-x-12"
          variants={itemVariants}
        >
          {[
            {
              icon: <FiMapPin className="w-5 h-5" />,
              label: "Top Destinations",
            },
            {
              icon: <FiStar className="w-5 h-5" />,
              label: "5-Star Activities",
            },
            { icon: <FiSend className="w-5 h-5" />, label: "Instant Booking" },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center"
              whileHover={{ scale: 1.1 }}
            >
              <motion.div
                className="flex items-center justify-center w-12 h-12 mb-2 rounded-full bg-white/20 backdrop-blur-sm"
                animate={{
                  scale: [1, 1.1, 1],
                  transition: {
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.3,
                  },
                }}
              >
                {item.icon}
              </motion.div>
              <span className="text-xs font-medium text-white/80">
                {item.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          variants={itemVariants}
        >
          <motion.div
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            onHoverStart={() => setHoverActivity(true)}
            onHoverEnd={() => setHoverActivity(false)}
          >
            <Link
              href="/activity"
              className="relative inline-flex items-center px-8 py-4 overflow-hidden font-medium transition-colors bg-white rounded-full shadow-xl text-primary-600 hover:bg-white/95"
            >
              Explore Activities
              <motion.span
                className="relative ml-2"
                variants={arrowVariants}
                animate={hoverActivity ? "hover" : "initial"}
              >
                <FiArrowRight />
              </motion.span>
              {/* Button shine effect */}
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-100 to-transparent"
                initial={{ x: "-100%", opacity: 0.7 }}
                animate={{ x: "100%", opacity: 0.7 }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "linear",
                  repeatDelay: 0.5,
                }}
                style={{ mixBlendMode: "overlay" }}
              />
            </Link>
          </motion.div>

          <motion.div
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            onHoverStart={() => setHoverContact(true)}
            onHoverEnd={() => setHoverContact(false)}
          >
            <Link
              href="#contact"
              className="relative overflow-hidden bg-transparent text-white border-2 border-white hover:bg-white/10 px-8 py-3.5 rounded-full font-medium transition-colors inline-flex items-center"
            >
              Contact Us
              {/* Button glow effect on hover */}
              <AnimatePresence>
                {hoverContact && (
                  <motion.span
                    className="absolute inset-0 rounded-full bg-white/20"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </AnimatePresence>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Enhanced decorative elements */}
      <motion.div
        className="absolute top-0 left-0 w-64 h-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10"
        variants={decorationVariants}
        animate={{
          scale: [1, 1.1, 1],
          transition: { duration: 8, repeat: Infinity, repeatType: "reverse" },
        }}
      />

      <motion.div
        className="absolute right-0 w-40 h-40 -translate-y-1/2 rounded-full top-1/2 bg-white/10 translate-x-1/3"
        variants={decorationVariants}
        animate={{
          scale: [1, 1.2, 1],
          transition: {
            duration: 6,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1,
          },
        }}
      />

      <motion.div
        className="absolute bottom-0 right-0 rounded-full w-80 h-80 bg-white/10 translate-x-1/3 translate-y-1/3"
        variants={decorationVariants}
        animate={{
          scale: [1, 1.15, 1],
          transition: {
            duration: 7,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 2,
          },
        }}
      />

      <motion.div
        className="absolute bottom-0 w-32 h-32 translate-y-1/2 rounded-full left-1/3 bg-white/10"
        variants={decorationVariants}
        animate={{
          scale: [1, 1.3, 1],
          transition: {
            duration: 5,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 3,
          },
        }}
      />
    </motion.div>
  );
}
