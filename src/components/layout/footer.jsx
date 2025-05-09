"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  FiMapPin,
  FiMail,
  FiPhone,
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiYoutube,
  FiArrowRight,
  FiSend,
} from "react-icons/fi";

export default function ModernFooter() {
  const [emailValue, setEmailValue] = useState("");
  const [isHovering, setIsHovering] = useState(null);

  // Modern animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const socialIconVariants = {
    hover: (i) => ({
      y: -5,
      color: ["#60A5FA", "#34D399", "#F87171", "#A78BFA"][i % 4],
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 10,
      },
    }),
    initial: {
      y: 0,
      color: "#D1D5DB",
    },
  };

  const linkVariants = {
    hover: {
      x: 6,
      color: "#60A5FA",
      transition: { type: "spring", stiffness: 300, damping: 15 },
    },
  };

  const glowVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: [0.1, 0.3, 0.1],
      scale: 1.2,
      transition: {
        repeat: Infinity,
        repeatType: "mirror",
        duration: 3,
      },
    },
  };

  return (
    <footer className="relative overflow-hidden text-gray-300 bg-gradient-to-b from-gray-900 to-gray-950">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-64 h-64 bg-blue-500 rounded-full top-20 left-10 blur-3xl"
          variants={glowVariants}
          initial="hidden"
          animate="visible"
          style={{ opacity: 0.03 }}
        />
        <motion.div
          className="absolute bg-purple-500 rounded-full bottom-20 right-10 w-96 h-96 blur-3xl"
          variants={glowVariants}
          initial="hidden"
          animate="visible"
          style={{ opacity: 0.03 }}
        />
      </div>

      {/* Main content */}
      <motion.div
        className="relative z-10 px-4 pt-20 pb-12 mx-auto max-w-7xl sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand section - Takes 4 columns on large screens */}
          <motion.div
            className="space-y-6 lg:col-span-4"
            variants={itemVariants}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex md:items-center md:justify-center"
            >
              <Image
                src="/images/logo.png"
                alt="HealingKuy Logo"
                width={160}
                height={60}
                className=""
              />
            </motion.div>

            <p className="max-w-md text-base font-light leading-relaxed text-gray-400 md:hidden">
              Discover extraordinary destinations and create unforgettable
              memories with our curated travel experiences designed for the
              modern explorer.
            </p>

            {/* Social Icons */}
            <div className="mt-8">
              <div className="flex space-x-4 md:justify-center md:items-center">
                {[FiFacebook, FiTwitter, FiInstagram, FiYoutube].map(
                  (Icon, idx) => (
                    <motion.a
                      key={idx}
                      href="#"
                      custom={idx}
                      variants={socialIconVariants}
                      initial="initial"
                      whileHover="hover"
                      className="flex items-center justify-center w-10 h-10 border border-gray-700 rounded-full bg-gray-800/50 backdrop-blur-sm"
                    >
                      <Icon size={18} />
                    </motion.a>
                  )
                )}
              </div>
            </div>
          </motion.div>

          {/* Links Grid - Takes 8 columns on large screens */}
          <div className="grid grid-cols-1 gap-8 lg:col-span-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Quick links */}
            <motion.div variants={itemVariants}>
              <h3 className="mb-6 text-lg font-semibold text-white">
                Quick Links
              </h3>
              <ul className="space-y-4">
                {[
                  { href: "/", label: "Home" },
                  { href: "/banner", label: "Banners" },
                  { href: "/category", label: "Categories" },
                  { href: "/activity", label: "Activities" },
                  { href: "/promo", label: "Promos" },
                ].map(({ href, label }, idx) => (
                  <motion.li key={href}>
                    <motion.div
                      initial={false}
                      onHoverStart={() => setIsHovering(label)}
                      onHoverEnd={() => setIsHovering(null)}
                    >
                      <Link
                        href={href}
                        className="flex items-center text-gray-400 hover:text-white group"
                      >
                        <motion.span
                          variants={linkVariants}
                          animate={isHovering === label ? "hover" : "initial"}
                          className="relative"
                        >
                          {label}
                        </motion.span>
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={
                            isHovering === label
                              ? { opacity: 1, x: 0 }
                              : { opacity: 0, x: -10 }
                          }
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 15,
                          }}
                          className="ml-1"
                        >
                          <FiArrowRight size={14} />
                        </motion.span>
                      </Link>
                    </motion.div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Support */}
            <motion.div variants={itemVariants}>
              <h3 className="mb-6 text-lg font-semibold text-white">Support</h3>
              <ul className="space-y-4">
                {[
                  "FAQ",
                  "Terms & Conditions",
                  "Privacy Policy",
                  "Cancellation Policy",
                  "Help Center",
                ].map((item, idx) => (
                  <motion.li key={idx}>
                    <motion.div
                      initial={false}
                      onHoverStart={() => setIsHovering(item)}
                      onHoverEnd={() => setIsHovering(null)}
                    >
                      <Link
                        href="#"
                        className="flex items-center text-gray-400 hover:text-white group"
                      >
                        <motion.span
                          variants={linkVariants}
                          animate={isHovering === item ? "hover" : "initial"}
                          className="relative"
                        >
                          {item}
                        </motion.span>
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={
                            isHovering === item
                              ? { opacity: 1, x: 0 }
                              : { opacity: 0, x: -10 }
                          }
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 15,
                          }}
                          className="ml-1"
                        >
                          <FiArrowRight size={14} />
                        </motion.span>
                      </Link>
                    </motion.div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Contact */}
            <motion.div variants={itemVariants}>
              <h3 className="mb-6 text-lg font-semibold text-white">
                Contact Us
              </h3>
              <ul className="space-y-4">
                <motion.li
                  className="flex items-start"
                  whileHover={{ x: 3 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <div className="flex items-center justify-center w-8 h-8 mt-1 mr-3 rounded-full bg-blue-500/10">
                    <FiMapPin className="text-blue-400" size={16} />
                  </div>
                  <span className="text-gray-400">
                    Jl. Sultan Adam, Banjarmasin, Indonesia
                  </span>
                </motion.li>
                <motion.li
                  className="flex items-center"
                  whileHover={{ x: 3 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <div className="flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-green-500/10">
                    <FiPhone className="text-green-400" size={16} />
                  </div>
                  <span className="text-gray-400">+62 812 3456 7890</span>
                </motion.li>
                <motion.li
                  className="flex items-center"
                  whileHover={{ x: 3 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <div className="flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-purple-500/10">
                    <FiMail className="text-purple-400" size={16} />
                  </div>
                  <span className="text-gray-400">healingkuy@gmail.com</span>
                </motion.li>
              </ul>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Copyright bar */}
      <motion.div
        className="relative z-10 py-6 border-t border-gray-800 bg-gray-950/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
      >
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between text-sm text-gray-500 md:flex-row">
            <motion.p whileHover={{ scale: 1.01 }}>
              &copy; {new Date().getFullYear()} HealingKuy. All rights reserved.
            </motion.p>
            <div className="flex mt-4 space-x-6 md:mt-0">
              {["Terms", "Privacy", "Cookies"].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -2, color: "#fff" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Link href="#" className="hover:text-gray-400">
                    {item}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
