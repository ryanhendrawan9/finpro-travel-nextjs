// src/app/(auth)/register/page.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiLock, FiPhone, FiArrowRight } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

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

  return (
    <div className="flex min-h-screen">
      {/* Left side image - visible on medium screens and up */}
      <div className="hidden md:block md:w-1/2">
        <div className="relative h-full opacity-100">
          <img
            src="/images/travel-bg.jpg"
            alt="Travel"
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 flex flex-col justify-center p-12">
            <div className="text-white">
              <h1 className="mb-6 text-4xl font-bold font-heading">
                Let's Travel The Beautiful World Together
              </h1>
              <p className="text-lg text-white/90">
                We always make our customer happy by providing as many choices
                as possible
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Registration form */}
      <div className="flex items-center justify-center w-full p-6 md:w-1/2">
        <motion.div
          className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <Link
              href="/"
              className="flex items-center mb-6 text-gray-600 hover:text-gray-800"
            >
              <FiArrowRight className="mr-2 rotate-180" /> Back
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 font-heading">
              Register an account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Start your journey with one click, explore the beautiful world!
            </p>
          </div>

          {error && (
            <motion.div
              className="p-4 text-sm text-red-800 rounded-lg bg-red-50"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Role selection */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Looking for?
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label
                  className={`flex items-center justify-center border rounded-xl p-3 cursor-pointer transition-colors ${
                    formData.role === "user"
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200"
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
                          ? "text-primary-600"
                          : "text-gray-400"
                      }`}
                    />
                    <span
                      className={
                        formData.role === "user"
                          ? "text-primary-600"
                          : "text-gray-700"
                      }
                    >
                      User
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-center justify-center border rounded-xl p-3 cursor-pointer transition-colors ${
                    formData.role === "admin"
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200"
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
                          ? "text-primary-600"
                          : "text-gray-400"
                      }`}
                    />
                    <span
                      className={
                        formData.role === "admin"
                          ? "text-primary-600"
                          : "text-gray-700"
                      }
                    >
                      Admin
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiMail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full py-3 pl-10 pr-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="e.g. jhondoe@gmail.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="name"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiUser className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full py-3 pl-10 pr-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="e.g. John Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="password"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiLock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full py-3 pl-10 pr-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Password"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="passwordRepeat"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiLock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="passwordRepeat"
                    name="passwordRepeat"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.passwordRepeat}
                    onChange={handleChange}
                    className="block w-full py-3 pl-10 pr-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Confirm Password"
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiPhone className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="block w-full py-3 pl-10 pr-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="e.g. 08111xxx"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-white font-medium ${
                isLoading
                  ? "bg-primary-400 cursor-not-allowed"
                  : "bg-primary-600 hover:bg-primary-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-300`}
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
            </button>
          </form>

          <div className="mt-4 text-sm text-center">
            <p className="text-gray-600">
              By clicking continue, you agree to our{" "}
              <Link
                href="/terms"
                className="text-primary-600 hover:text-primary-500"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-primary-600 hover:text-primary-500"
              >
                Privacy Policy
              </Link>
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
