"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCamera,
  FiSave,
  FiAlertCircle,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { uploadService } from "@/lib/api"; // Import uploadService

export default function ProfilePage() {
  const {
    user,
    isAuthenticated,
    updateProfile,
    loading: authLoading,
  } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    profilePictureUrl: "",
    phoneNumber: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef(null); // Reference to hidden file input

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Initialize form data with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        profilePictureUrl: user.profilePictureUrl || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file selection for profile picture
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsSubmitting(true);
      // Create FormData for image upload
      const formData = new FormData();
      formData.append("image", file);

      // Upload the image
      const response = await uploadService.uploadImage(formData);

      // Update profilePictureUrl with the uploaded image URL
      if (response.data && response.data.data && response.data.data.imageUrl) {
        setFormData((prev) => ({
          ...prev,
          profilePictureUrl: response.data.data.imageUrl,
        }));
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      }
    } catch (err) {
      console.error("Image upload error:", err);
      setError("Failed to upload image. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trigger file input click when camera button is clicked
  const handleCameraClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Make a copy of the form data to avoid token expiration issues
      const dataToSubmit = { ...formData };

      const result = await updateProfile(dataToSubmit);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        setError(
          result.message || "Failed to update profile. Please try again."
        );
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Profile update error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-bold animate-pulse text-primary-600">
          Loading your profile...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 font-heading">
          My Profile
        </h1>

        <motion.div
          className="overflow-hidden bg-white shadow-sm rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-6 border-b border-gray-100 md:p-8">
            <div className="flex flex-col items-center md:flex-row">
              <div className="relative mb-6 md:mb-0 md:mr-8">
                <div className="w-32 h-32 overflow-hidden border-4 rounded-full border-primary-100">
                  <img
                    src={
                      formData.profilePictureUrl ||
                      "/images/placeholders/user-placeholder.jpg"
                    }
                    alt="Profile"
                    className="object-cover w-full h-full"
                  />
                </div>
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  className="absolute bottom-0 right-0 p-2 text-white transition-colors rounded-full bg-primary-600 hover:bg-primary-700"
                  onClick={handleCameraClick}
                  type="button"
                >
                  <FiCamera size={16} />
                </button>
              </div>

              <div>
                <h2 className="mb-1 text-2xl font-bold text-gray-900">
                  {user.name || user.email}
                </h2>
                <p className="mb-2 text-gray-600">{user.email}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <h3 className="mb-6 text-xl font-bold text-gray-900">
              Edit Profile
            </h3>

            {error && (
              <div className="flex items-start p-4 mb-6 text-red-800 rounded-lg bg-red-50">
                <FiAlertCircle className="mt-0.5 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start p-4 mb-6 text-green-800 rounded-lg bg-green-50">
                <FiSave className="mt-0.5 mr-2 flex-shrink-0" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
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
                    className="block w-full py-3 pl-10 pr-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 sm:text-sm"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiMail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full py-3 pl-10 pr-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 sm:text-sm"
                    placeholder="you@example.com"
                    disabled
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Email address cannot be changed
                </p>
              </div>

              <div>
                <label
                  htmlFor="profilePictureUrl"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  Profile Picture URL
                </label>
                <input
                  id="profilePictureUrl"
                  name="profilePictureUrl"
                  type="url"
                  value={formData.profilePictureUrl}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 sm:text-sm"
                  placeholder="https://example.com/profile.jpg"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Or click the camera icon to upload a new image
                </p>
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
                    className="block w-full py-3 pl-10 pr-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 sm:text-sm"
                    placeholder="+62 812 3456 7890"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl text-white font-medium ${
                    isSubmitting
                      ? "bg-primary-400 cursor-not-allowed"
                      : "bg-primary-600 hover:bg-primary-700"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-300`}
                >
                  {isSubmitting ? (
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
                      Updating...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <FiSave className="mr-2" />
                      Save Changes
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
