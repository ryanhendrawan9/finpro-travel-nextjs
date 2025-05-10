"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

// Create a separate component that uses useSearchParams
function RegisteredCheck() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const registered = searchParams.get("registered");
    if (registered === "true") {
      // Could add a success message here
    }
  }, [searchParams]);

  return null;
}

// Background animated particles component
// Using predefined values to avoid hydration errors
const ParticlesBackground = () => {
  // Predefined positions to avoid hydration mismatch - beach themed
  const particlePositions = [
    { x: 15, y: 10, scale: 0.6, duration: 15, color: "bg-white/20" },
    { x: 25, y: 30, scale: 0.7, duration: 18, color: "bg-blue-100/20" },
    { x: 35, y: 70, scale: 0.4, duration: 20, color: "bg-cyan-100/20" },
    { x: 45, y: 40, scale: 0.3, duration: 25, color: "bg-white/30" },
    { x: 55, y: 60, scale: 0.5, duration: 22, color: "bg-blue-100/30" },
    { x: 65, y: 20, scale: 0.4, duration: 19, color: "bg-white/30" },
    { x: 75, y: 80, scale: 0.5, duration: 21, color: "bg-cyan-100/30" },
    { x: 85, y: 50, scale: 0.6, duration: 17, color: "bg-white/20" },
    { x: 10, y: 85, scale: 0.5, duration: 23, color: "bg-white/20" },
    { x: 30, y: 15, scale: 0.5, duration: 18, color: "bg-blue-100/30" },
    { x: 50, y: 35, scale: 0.3, duration: 16, color: "bg-cyan-100/30" },
    { x: 70, y: 75, scale: 0.4, duration: 24, color: "bg-white/20" },
    { x: 90, y: 25, scale: 0.5, duration: 20, color: "bg-blue-50/30" },
    { x: 20, y: 65, scale: 0.5, duration: 22, color: "bg-cyan-200/30" },
    { x: 40, y: 90, scale: 0.4, duration: 19, color: "bg-white/20" },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particlePositions.map((pos, index) => (
        <motion.div
          key={index}
          className={`absolute rounded-full ${pos.color}`}
          style={{
            width: `${pos.scale * 15}px`,
            height: `${pos.scale * 15}px`,
          }}
          initial={{
            x: `${pos.x}%`,
            y: `${pos.y}%`,
          }}
          animate={{
            x: [`${pos.x}%`, `${(pos.x + 5) % 100}%`, `${pos.x}%`],
            y: [`${pos.y}%`, `${(pos.y - 10) % 100}%`, `${pos.y}%`],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: pos.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login({ email, password });
      if (result.success) {
        // Important: Add a small delay before redirecting to ensure auth state is updated
        setTimeout(() => {
          // Redirect based on user role - using optional chaining to avoid the error
          if (result.user?.role === "admin") {
            window.location.href = "/admin/dashboard";
          } else {
            window.location.href = "/";
          }
        }, 300);
      } else {
        setError(
          result.message || "Login failed. Please check your credentials."
        );
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Variants for animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2,
        duration: 1,
      },
    },
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 1.05 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 1.2, ease: "easeOut" },
    },
  };

  // Add wave effects to background
  const renderWaves = () => {
    return (
      <>
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-20 transform translate-y-10 rounded-t-full bg-cyan-200/20 opacity-30"
          animate={{ y: [10, 8, 10] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-16 transform translate-y-8 rounded-t-full bg-cyan-300/20 opacity-40"
          animate={{ y: [8, 6, 8] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-12 transform translate-y-6 rounded-t-full opacity-50 bg-cyan-400/20"
          animate={{ y: [6, 4, 6] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-8 rounded-t-full bg-cyan-500/30 opacity-60"
          animate={{ y: [4, 0, 4] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
      </>
    );
  };

  return (
    <motion.div
      className="relative flex min-h-screen overflow-hidden bg-gradient-to-b from-blue-500 via-blue-400 to-cyan-300"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Wrap the component using useSearchParams in Suspense */}
      <Suspense fallback={null}>
        <RegisteredCheck />
      </Suspense>

      {/* Beach elements and background effects */}
      {renderWaves()}

      {/* Gradient overlay for improved ocean feel */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-blue-400/0 via-blue-300/5 to-cyan-200/20"></div>

      {/* Animated beach/ocean particles */}
      <ParticlesBackground />

      {/* Left side - Full image with overlay */}
      <motion.div
        className="relative hidden overflow-hidden md:block md:w-1/2"
        variants={imageVariants}
      >
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          <img
            src="/images/travel-bg.jpg"
            alt="Travel"
            className="object-cover w-full h-full"
          />
        </motion.div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-blue-500/70 to-transparent" />

        {/* Text content with animation */}
        <motion.div
          className="absolute inset-0 z-20 flex flex-col justify-center p-12"
          variants={{
            hidden: { opacity: 0, x: -20 },
            visible: {
              opacity: 1,
              x: 0,
              transition: { delay: 0.5, duration: 0.8 },
            },
          }}
        >
          <div className="text-white">
            <motion.h1
              className="mb-6 text-5xl font-bold font-heading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              Let's Travel The Beautiful World Together
            </motion.h1>
            <motion.p
              className="text-lg text-white/90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              We always make our customer happy by providing as many choices as
              possible
            </motion.p>
          </div>
        </motion.div>
      </motion.div>

      {/* Login form */}
      <div className="relative z-10 flex items-center justify-center w-full p-6 md:w-1/2">
        <motion.div
          className="w-full max-w-md p-8 space-y-6 border shadow-xl bg-white/20 backdrop-blur-xl border-white/30 rounded-2xl"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <div>
            <Link
              href="/"
              className="flex items-center mb-6 text-blue-900 hover:text-blue-700"
            >
              <FiArrowRight className="mr-2 rotate-180" /> Back
            </Link>
            <motion.h2
              className="text-3xl font-bold text-blue-900 font-heading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Welcome back!
            </motion.h2>
            <motion.p
              className="mt-2 text-sm text-blue-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Start your journey with one click, explore the beautiful world!
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-blue-700 hover:text-blue-900"
              >
                Register
              </Link>
            </motion.p>
          </div>

          {error && (
            <motion.div
              className="p-4 text-sm text-red-800 rounded-lg bg-red-100/70"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}

          <motion.form
            className="space-y-6"
            onSubmit={handleSubmit}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
          >
            <motion.div variants={formVariants}>
              <label
                htmlFor="email"
                className="block mb-1 text-sm font-medium text-blue-900"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiMail className="w-5 h-5 text-blue-600" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full py-3 pl-10 pr-3 text-blue-900 border bg-white/50 border-blue-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Email"
                />
              </div>
            </motion.div>

            <motion.div variants={formVariants}>
              <label
                htmlFor="password"
                className="block mb-1 text-sm font-medium text-blue-900"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiLock className="w-5 h-5 text-blue-600" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full py-3 pl-10 pr-3 text-blue-900 border bg-white/50 border-blue-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </motion.div>

            <motion.div
              className="flex items-center justify-between"
              variants={formVariants}
            >
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="w-4 h-4 text-blue-600 rounded bg-white/50 border-blue-300/50 focus:ring-blue-500"
                />
                <label
                  htmlFor="remember-me"
                  className="block ml-2 text-sm text-blue-800"
                >
                  Remember me?
                </label>
              </div>

              <div className="text-sm">
                <Link
                  href="#"
                  className="font-medium text-blue-700 hover:text-blue-900"
                >
                  Forgot Password?
                </Link>
              </div>
            </motion.div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-white font-medium ${
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300`}
              variants={formVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <span className="flex items-center">
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
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  Login
                  <FiArrowRight className="ml-2" />
                </span>
              )}
            </motion.button>
          </motion.form>
        </motion.div>
      </div>
    </motion.div>
  );
}
