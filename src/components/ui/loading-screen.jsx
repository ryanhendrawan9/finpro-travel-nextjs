"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiMapPin,
  FiSun,
  FiUmbrella,
  FiCamera,
  FiCompass,
} from "react-icons/fi";

export default function ModernLoadingScreen() {
  // Gunakan useState untuk mengelola posisi dots agar sama antara server dan client
  const [dots, setDots] = useState([]);

  // Hanya jalankan di client side untuk menghindari hydration mismatch
  useEffect(() => {
    // Generate random positions only on client-side
    const newDots = Array(20)
      .fill(0)
      .map(() => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        duration: 3 + Math.random() * 5,
        delay: Math.random() * 2,
      }));
    setDots(newDots);
  }, []);

  // Animasi untuk logo dan ikon-ikon travel
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.3,
        delayChildren: 0.3,
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
        damping: 12,
        stiffness: 100,
      },
    },
  };

  const pulseVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        yoyo: Infinity,
        duration: 2,
        ease: "easeInOut",
      },
    },
  };

  const spinnerVariants = {
    hidden: { opacity: 0, rotate: 0 },
    visible: {
      opacity: 1,
      rotate: 360,
      transition: {
        duration: 2,
        ease: "linear",
        repeat: Infinity,
      },
    },
  };

  const globeVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 0.7,
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: "reverse",
      },
    },
  };

  const planeVariants = {
    hidden: { x: -200, y: 100, opacity: 0 },
    visible: {
      x: 200,
      y: -100,
      opacity: 1,
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "loop",
        repeatDelay: 1,
      },
    },
  };

  const iconVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: i * 0.2,
        type: "spring",
        stiffness: 200,
        damping: 10,
      },
    }),
  };

  // Array ikon dengan warna yang berbeda
  const travelIcons = [
    { Icon: FiMapPin, color: "#60A5FA", customKey: 0 }, // blue
    { Icon: FiSun, color: "#F59E0B", customKey: 1 }, // yellow
    { Icon: FiUmbrella, color: "#EC4899", customKey: 2 }, // pink
    { Icon: FiCamera, color: "#10B981", customKey: 3 }, // green
    { Icon: FiCompass, color: "#8B5CF6", customKey: 4 }, // purple
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-900">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Globe effect */}
        <motion.div
          className="absolute bg-blue-400 rounded-full w-96 h-96 opacity-10 blur-3xl"
          style={{
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
          variants={globeVariants}
          initial="hidden"
          animate="visible"
        />

        {/* Airplane path */}
        <motion.div
          className="absolute w-8 h-8 text-white"
          style={{ top: "30%", left: "30%" }}
          variants={planeVariants}
          initial="hidden"
          animate="visible"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
          </svg>
        </motion.div>

        {/* Floating dots - Render only on client-side to avoid hydration mismatch */}
        {dots.map((dot, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              top: dot.top,
              left: dot.left,
            }}
            animate={{
              opacity: [0.1, 0.7, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: dot.duration,
              repeat: Infinity,
              delay: dot.delay,
            }}
          />
        ))}
      </div>

      {/* Main content container */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo container with pulsing effect */}
        <motion.div
          className="relative flex items-center justify-center w-32 h-32 mb-8 overflow-hidden"
          variants={pulseVariants}
        >
          {/* Spinner behind logo */}
          <motion.div
            className="absolute inset-0 border-4 rounded-full border-t-blue-400 border-r-transparent border-b-blue-400 border-l-transparent"
            variants={spinnerVariants}
          />

          {/* Logo */}
          <motion.div
            className="flex items-center justify-center w-24 h-24 overflow-hidden bg-white rounded-full shadow-xl"
            variants={itemVariants}
          >
            <img
              src="/images/logo.png"
              alt="Logo"
              className="object-contain w-full h-full"
            />
          </motion.div>
        </motion.div>

        {/* Travel icons */}
        <motion.div
          className="flex items-center justify-center gap-4 mb-8"
          variants={itemVariants}
        >
          {travelIcons.map(({ Icon, color, customKey }) => (
            <motion.div
              key={customKey}
              custom={customKey}
              variants={iconVariants}
              className="flex items-center justify-center w-10 h-10 rounded-full backdrop-blur-sm bg-white/10"
              style={{ color }}
            >
              <Icon size={20} />
            </motion.div>
          ))}
        </motion.div>

        {/* Loading text with gradient effect */}
        <motion.div
          className="flex flex-col items-center"
          variants={itemVariants}
        >
          <h2 className="mb-3 text-2xl font-bold text-white">
            Discovering amazing destinations...
          </h2>

          <div className="w-64 h-2 mb-4 overflow-hidden rounded-full bg-white/20">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-400 to-indigo-500"
              animate={{
                width: ["0%", "100%"],
                transition: { duration: 2, repeat: Infinity },
              }}
            />
          </div>

          <p className="text-sm text-blue-200">
            Preparing your dream vacation experience
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
