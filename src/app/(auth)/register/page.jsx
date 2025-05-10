"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiLock, FiPhone, FiArrowRight } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

// Background animated particles component with beach theme
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

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordRepeat: "",
    phoneNumber: "",
    profilePictureUrl:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8dXNlcnxlbnwwfHwwfHw%3D&w=1000&q=80",
    role: "user",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.passwordRepeat) {
      setError("Please fill in all required fields");
      return false;
    }

    if (formData.password !== formData.passwordRepeat) {
      setError("Passwords do not match");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await register(formData);
      if (result.success) {
        router.push("/login?registered=true");
      } else {
        setError(result.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Registration error:", err);
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
        staggerChildren: 0.1,
        duration: 0.5,
      },
    },
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
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

      {/* Registration form */}
      <div className="relative z-10 flex items-center justify-center w-full p-4 md:w-1/2">
        <motion.div
          className="w-full max-w-lg p-6 space-y-4 border shadow-xl bg-white/20 backdrop-blur-xl border-white/30 rounded-2xl"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <div>
            <Link
              href="/"
              className="flex items-center mb-4 text-blue-900 hover:text-blue-700"
            >
              <FiArrowRight className="mr-2 rotate-180" /> Back
            </Link>
            <motion.h2
              className="text-2xl font-bold text-blue-900 font-heading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Register an account
            </motion.h2>
            <motion.p
              className="mt-2 text-sm text-blue-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Start your journey with one click, explore the beautiful world!
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
            className="space-y-4"
            onSubmit={handleSubmit}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
          >
            {/* Role selection */}
            <motion.div variants={formVariants}>
              <label className="block mb-1 text-sm font-medium text-blue-900">
                Looking for?
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label
                  className={`flex items-center justify-center border rounded-xl p-3 cursor-pointer transition-colors ${
                    formData.role === "user"
                      ? "border-blue-500 bg-blue-50/50"
                      : "border-blue-300/30 bg-white/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={formData.role === "user"}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <div className="flex items-center">
                    <FiUser
                      className={`mr-2 ${
                        formData.role === "user"
                          ? "text-blue-600"
                          : "text-blue-400"
                      }`}
                    />
                    <span
                      className={
                        formData.role === "user"
                          ? "text-blue-600"
                          : "text-blue-700"
                      }
                    >
                      User
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-center justify-center border rounded-xl p-3 cursor-pointer transition-colors ${
                    formData.role === "admin"
                      ? "border-blue-500 bg-blue-50/50"
                      : "border-blue-300/30 bg-white/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={formData.role === "admin"}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <div className="flex items-center">
                    <FiUser
                      className={`mr-2 ${
                        formData.role === "admin"
                          ? "text-blue-600"
                          : "text-blue-400"
                      }`}
                    />
                    <span
                      className={
                        formData.role === "admin"
                          ? "text-blue-600"
                          : "text-blue-700"
                      }
                    >
                      Admin
                    </span>
                  </div>
                </label>
              </div>
            </motion.div>

            <motion.div variants={formVariants}>
              <label
                htmlFor="email"
                className="block mb-1 text-sm font-medium text-blue-900"
              >
                Email Address <span className="text-red-500">*</span>
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
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full py-3 pl-10 pr-3 text-blue-900 border bg-white/50 border-blue-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Email"
                />
              </div>
            </motion.div>

            <motion.div variants={formVariants}>
              <label
                htmlFor="name"
                className="block mb-1 text-sm font-medium text-blue-900"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiUser className="w-5 h-5 text-blue-600" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full py-3 pl-10 pr-3 text-blue-900 border bg-white/50 border-blue-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Name"
                />
              </div>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <motion.div variants={formVariants}>
                <label
                  htmlFor="password"
                  className="block mb-1 text-sm font-medium text-blue-900"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiLock className="w-5 h-5 text-blue-600" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full py-3 pl-10 pr-3 text-blue-900 border bg-white/50 border-blue-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Password"
                  />
                </div>
              </motion.div>

              <motion.div variants={formVariants}>
                <label
                  htmlFor="passwordRepeat"
                  className="block mb-1 text-sm font-medium text-blue-900"
                >
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiLock className="w-5 h-5 text-blue-600" />
                  </div>
                  <input
                    id="passwordRepeat"
                    name="passwordRepeat"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.passwordRepeat}
                    onChange={handleChange}
                    className="block w-full py-3 pl-10 pr-3 text-blue-900 border bg-white/50 border-blue-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Confirm Password"
                  />
                </div>
              </motion.div>
            </div>

            <motion.div variants={formVariants}>
              <label
                htmlFor="phoneNumber"
                className="block mb-1 text-sm font-medium text-blue-900"
              >
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiPhone className="w-5 h-5 text-blue-600" />
                </div>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="block w-full py-3 pl-10 pr-3 text-blue-900 border bg-white/50 border-blue-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="+62812-3456-7890"
                />
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
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center">
                  Register
                  <FiArrowRight className="ml-2" />
                </span>
              )}
            </motion.button>
          </motion.form>

          <motion.div
            className="mt-4 text-sm text-center"
            variants={formVariants}
          >
            <p className="text-blue-800">
              By clicking continue, you agree to our{" "}
              <Link
                href="#"
                className="font-medium text-blue-700 hover:text-blue-900"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="#"
                className="font-medium text-blue-700 hover:text-blue-900"
              >
                Privacy Policy
              </Link>
            </p>
          </motion.div>

          <motion.div className="text-center" variants={formVariants}>
            <p className="text-sm text-blue-800">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-blue-700 hover:text-blue-900"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
