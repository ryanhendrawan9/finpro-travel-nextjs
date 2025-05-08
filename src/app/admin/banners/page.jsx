// src/app/admin/banners/page.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiEdit, FiTrash2, FiPlus, FiArrowLeft, FiImage } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { bannerService } from "@/lib/api";
import { toast } from "react-toastify";

export default function AdminBanners() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    imageUrl: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  // Auth check
  useEffect(() => {
    if (!loading && (!isAuthenticated || (user && user.role !== "admin"))) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, user, router]);

  // Fetch banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await bannerService.getAll();
        setBanners(response.data.data || []);
      } catch (err) {
        setError("Failed to load banners. Please try again.");
        console.error("Error fetching banners:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user?.role === "admin") {
      fetchBanners();
    }
  }, [isAuthenticated, user]);

  // Handle edit banner
  const handleEdit = (banner) => {
    setCurrentBanner(banner);
    setFormData({
      name: banner.name || "",
      imageUrl: banner.imageUrl || "",
    });
    setIsFormOpen(true);
  };

  // Handle delete banner
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    try {
      await bannerService.delete(id);
      setBanners(banners.filter((banner) => banner.id !== id));
      toast.success("Banner deleted successfully");
    } catch (err) {
      console.error("Error deleting banner:", err);
      toast.error("Failed to delete banner. Please try again.");
    }
  };

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (currentBanner) {
        // Update existing banner
        const response = await bannerService.update(currentBanner.id, formData);
        setBanners(
          banners.map((b) =>
            b.id === currentBanner.id ? response.data.data : b
          )
        );
        toast.success("Banner updated successfully");
      } else {
        // Create new banner
        const response = await bannerService.create(formData);
        setBanners([...banners, response.data.data]);
        toast.success("Banner created successfully");
      }
      setIsFormOpen(false);
      setCurrentBanner(null);
      setFormData({ name: "", imageUrl: "" });
    } catch (err) {
      console.error("Error saving banner:", err);
      toast.error("Failed to save banner. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-bold animate-pulse text-primary-600">
          Loading banners...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/admin/dashboard"
            className="flex items-center text-gray-600 transition-colors hover:text-primary-600"
          >
            <FiArrowLeft className="mr-2" /> Back to Dashboard
          </Link>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Banners</h1>
          <button
            onClick={() => {
              setCurrentBanner(null);
              setFormData({ name: "", imageUrl: "" });
              setIsFormOpen(true);
            }}
            className="flex items-center px-4 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
          >
            <FiPlus className="mr-2" />
            Add Banner
          </button>
        </div>

        {/* Banner grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="overflow-hidden bg-white shadow rounded-xl"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={
                    banner.imageUrl ||
                    "/images/placeholders/banner-placeholder.jpg"
                  }
                  alt={banner.name}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "/images/placeholders/banner-placeholder.jpg";
                  }}
                />
                <div className="absolute top-0 right-0 flex p-2 space-x-1">
                  <button
                    onClick={() => handleEdit(banner)}
                    className="p-2 text-white transition-colors bg-blue-600 rounded-full hover:bg-blue-700"
                  >
                    <FiEdit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-2 text-white transition-colors bg-red-600 rounded-full hover:bg-red-700"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900">{banner.name}</h3>
              </div>
            </div>
          ))}

          {banners.length === 0 && (
            <div className="p-8 text-center bg-white shadow col-span-full rounded-xl">
              <FiImage className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="mb-2 text-xl font-medium text-gray-900">
                No banners found
              </h3>
              <p className="mb-4 text-gray-600">
                Create a new banner to display on the homepage.
              </p>
              <button
                onClick={() => {
                  setCurrentBanner(null);
                  setFormData({ name: "", imageUrl: "" });
                  setIsFormOpen(true);
                }}
                className="px-4 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
              >
                Add First Banner
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Banner form modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-xl">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              {currentBanner ? "Edit Banner" : "Add Banner"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  Banner Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="imageUrl"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  Image URL
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="object-cover w-full h-32 rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "/images/placeholders/banner-placeholder.jpg";
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6 space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setCurrentBanner(null);
                  }}
                  className="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400"
                >
                  {formLoading ? (
                    <div className="flex items-center">
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
                      Saving...
                    </div>
                  ) : (
                    <>Save</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
