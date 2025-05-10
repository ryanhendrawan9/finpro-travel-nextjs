"use client";

import { useState, useRef } from "react";
import {
  motion,
  useInView,
  useAnimation,
  AnimatePresence,
} from "framer-motion";
import {
  FiMail,
  FiCheckCircle,
  FiSend,
  FiGift,
  FiStar,
  FiAward,
  FiX,
  FiInfo,
  FiAlertCircle,
} from "react-icons/fi";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState("success"); // success, error, info
  const [notificationMessage, setNotificationMessage] = useState("");

  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });
  const controls = useAnimation();

  // Start animations when in view
  if (isInView && !controls.isAnimating) {
    controls.start("visible");
  }

  // Show notification helper
  const showNotif = (type, message) => {
    setNotificationType(type);
    setNotificationMessage(message);
    setShowNotification(true);

    // Auto hide after 5 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate email
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address");
      showNotif("error", "Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    setError("");

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubscribed(true);
      setEmail("");
      showNotif("success", "Thanks for subscribing! Check your inbox soon.");
    }, 1500);
  };

  // Main container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1,
      },
    },
  };

  // Items animation
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
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

  // Success animation - fixed to use only 2 keyframes for spring
  const successVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 100,
      },
    },
  };

  // Background decoration variants
  const decorationVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delay: 0.3 },
    },
  };

  // Icon pulse animation
  const iconPulseVariants = {
    pulse: {
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut", // Using easeInOut instead of spring for this animation
      },
    },
  };

  // Form input focus animation
  const inputFocusVariants = {
    unfocused: {
      scale: 1,
      boxShadow: "0 0 0 rgba(14, 165, 233, 0)",
    },
    focused: {
      scale: 1.02,
      boxShadow: "0 0 15px rgba(14, 165, 233, 0.3)",
    },
  };

  // Notification variants
  const notificationVariants = {
    hidden: {
      opacity: 0,
      y: -50,
      x: "-50%",
    },
    visible: {
      opacity: 1,
      y: 0,
      x: "-50%",
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      x: "-50%",
    },
  };

  // Colors for notification types
  const notificationColors = {
    success: {
      bg: "bg-green-50",
      border: "border-green-500",
      text: "text-green-800",
      icon: <FiCheckCircle className="w-5 h-5 text-green-500" />,
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-500",
      text: "text-red-800",
      icon: <FiAlertCircle className="w-5 h-5 text-red-500" />,
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-500",
      text: "text-blue-800",
      icon: <FiInfo className="w-5 h-5 text-blue-500" />,
    },
  };

  return (
    <motion.div
      className="relative py-16 overflow-hidden"
      ref={containerRef}
      initial="hidden"
      animate={controls}
      variants={containerVariants}
    >
      {/* Notification toast */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            className={`fixed top-6 left-1/2 z-50 flex items-center px-4 py-3 border rounded-lg shadow-lg ${notificationColors[notificationType].bg} ${notificationColors[notificationType].border}`}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={notificationVariants}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {notificationColors[notificationType].icon}
              </div>
              <div
                className={`ml-3 ${notificationColors[notificationType].text} font-medium`}
              >
                {notificationMessage}
              </div>
            </div>
            <button
              className="ml-4 text-gray-400 hover:text-gray-500"
              onClick={() => setShowNotification(false)}
            >
              <FiX className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background decorations */}
      <motion.div
        className="absolute inset-0 pointer-events-none -z-10"
        variants={decorationVariants}
      >
        <motion.div
          className="absolute w-64 h-64 rounded-full opacity-50 top-20 left-1/4 bg-primary-100 blur-3xl"
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            transition: {
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            },
          }}
        />
        <motion.div
          className="absolute rounded-full bottom-10 right-1/4 w-72 h-72 bg-secondary-100 opacity-40 blur-3xl"
          animate={{
            y: [0, 30, 0],
            x: [0, -20, 0],
            transition: {
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: 1,
            },
          }}
        />
      </motion.div>

      <div className="max-w-4xl px-4 mx-auto">
        <div className="mb-12 text-center">
          <motion.div
            className="inline-block mb-4"
            variants={iconPulseVariants}
            animate="pulse"
          >
            <span className="inline-flex items-center justify-center w-16 h-16 text-white rounded-full bg-gradient-to-r from-primary-500 to-secondary-400">
              <FiMail className="w-8 h-8" />
            </span>
          </motion.div>

          <motion.h2
            className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl font-heading"
            variants={itemVariants}
          >
            Subscribe to Our Newsletter
          </motion.h2>

          <motion.p
            className="max-w-2xl mx-auto text-gray-600 md:text-lg"
            variants={itemVariants}
          >
            Stay updated with our latest travel deals, destination guides, and
            exclusive offers. Be the first to know about special promotions!
          </motion.p>
        </div>

        <motion.div variants={itemVariants} className="max-w-md mx-auto">
          <AnimatePresence mode="wait">
            {isSubscribed ? (
              <motion.div
                className="p-8 text-center border-2 border-green-200 shadow-lg bg-gradient-to-b from-green-50 to-green-100 rounded-2xl"
                key="success"
                initial="hidden"
                animate="visible"
                variants={successVariants}
                exit={{ opacity: 0, y: 20 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }} // Fixed: using only 2 keyframes for spring
                  transition={{ type: "spring", duration: 0.5, delay: 0.2 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-green-400 rounded-full opacity-20 blur-xl"></div>
                  <FiCheckCircle className="w-20 h-20 mx-auto mb-6 text-green-500" />
                </motion.div>

                <motion.h3
                  className="mb-3 text-xl font-bold text-green-800"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Thank You for Subscribing!
                </motion.h3>

                <motion.p
                  className="mb-6 text-green-700"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  You have successfully subscribed to our newsletter. Get ready
                  for some amazing travel inspiration in your inbox!
                </motion.p>

                <motion.div
                  className="flex justify-center gap-4 mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm">
                    <FiGift className="w-5 h-5 mb-1 text-green-500" />
                    <span className="text-xs font-medium text-gray-600">
                      Special Offers
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm">
                    <FiStar className="w-5 h-5 mb-1 text-green-500" />
                    <span className="text-xs font-medium text-gray-600">
                      Travel Tips
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm">
                    <FiAward className="w-5 h-5 mb-1 text-green-500" />
                    <span className="text-xs font-medium text-gray-600">
                      Exclusive Deals
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative"
              >
                {/* Paper effect decorations */}
                <motion.div
                  className="absolute h-full bg-white shadow-sm -top-1 left-4 right-4 rounded-xl -z-10"
                  initial={{ rotate: -1, y: 5 }}
                  animate={{ rotate: -1, y: 5 }}
                />
                <motion.div
                  className="absolute h-full bg-white shadow-sm -top-2 left-8 right-8 rounded-xl -z-20"
                  initial={{ rotate: 1, y: 8 }}
                  animate={{ rotate: 1, y: 8 }}
                />

                <motion.form
                  onSubmit={handleSubmit}
                  className="relative p-8 bg-white border border-gray-100 shadow-lg rounded-xl"
                  variants={itemVariants}
                >
                  <div className="mb-6">
                    <motion.label
                      htmlFor="email"
                      className="block mb-2 text-sm font-medium text-gray-700"
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      Email Address
                    </motion.label>
                    <motion.div
                      className="relative"
                      variants={inputFocusVariants}
                      animate={focused ? "focused" : "unfocused"}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FiMail
                          className={`${
                            focused ? "text-primary-500" : "text-gray-400"
                          } transition-colors duration-300`}
                        />
                      </div>
                      <input
                        type="email"
                        id="email"
                        className="w-full py-3.5 pl-10 pr-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                      />
                    </motion.div>
                    <AnimatePresence>
                      {error && (
                        <motion.p
                          className="flex items-center mt-2 text-sm text-red-600"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3.5 px-4 rounded-lg text-white font-medium transition-all overflow-hidden relative ${
                      isSubmitting
                        ? "bg-primary-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-md hover:shadow-lg"
                    }`}
                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="w-5 h-5 mr-3 -ml-1 text-white animate-spin"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Subscribing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        Subscribe Now
                        <FiSend className="ml-2" />
                      </span>
                    )}

                    {/* Button shine effect */}
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                      initial={{ x: "-100%", opacity: 0.5 }}
                      animate={{ x: "100%", opacity: 0.5 }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "linear",
                        repeatDelay: 0.5,
                      }}
                      style={{ mixBlendMode: "overlay" }}
                    />
                  </motion.button>

                  <motion.p
                    className="mt-4 text-xs text-center text-gray-500"
                    variants={itemVariants}
                  >
                    By subscribing, you agree to our{" "}
                    <a href="#" className="text-primary-600 hover:underline">
                      Privacy Policy
                    </a>{" "}
                    and consent to receive travel-related emails.
                  </motion.p>
                </motion.form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Benefits section */}
        <motion.div
          className="flex flex-wrap justify-center gap-6 mt-12"
          variants={itemVariants}
        >
          {[
            {
              icon: <FiGift />,
              title: "Exclusive Offers",
              desc: "Members-only deals",
            },
            {
              icon: <FiStar />,
              title: "Travel Inspiration",
              desc: "Curated destinations",
            },
            {
              icon: <FiAward />,
              title: "Priority Updates",
              desc: "Early access to deals",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="flex items-center w-64 p-4 bg-white border border-gray-100 shadow-sm rounded-xl"
              whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <div className="flex items-center justify-center w-10 h-10 mr-4 text-white rounded-full bg-gradient-to-br from-primary-500 to-primary-600">
                {item.icon}
              </div>
              <div>
                <h3 className="font-medium text-gray-800">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
