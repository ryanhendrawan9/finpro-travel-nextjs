"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiArrowLeft,
  FiMapPin,
  FiStar,
  FiSearch,
  FiFilter,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { activityService, categoryService } from "@/lib/api";
import { toast } from "react-toastify";
import debounce from "lodash/debounce";

export default function AdminActivities() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [formData, setFormData] = useState({
    categoryId: "",
    title: "",
    description: "",
    imageUrls: [""],
    price: 0,
    price_discount: 0,
    rating: 4,
    total_reviews: 0,
    facilities: "",
    address: "",
    province: "",
    city: "",
    location_maps: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const activitiesPerPage = 10;

  // Debounce search function
  const debouncedSetSearch = useCallback(
    debounce((value) => {
      setDebouncedSearchQuery(value);
    }, 300),
    []
  );

  // Auth check
  useEffect(() => {
    if (!loading && (!isAuthenticated || (user && user.role !== "admin"))) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, user, router]);

  // Fetch activities and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [activitiesRes, categoriesRes] = await Promise.all([
          activityService.getAll(),
          categoryService.getAll(),
        ]);
        const activitiesData = activitiesRes.data.data || [];
        const categoriesData = categoriesRes.data.data || [];

        setActivities(activitiesData);
        setFilteredActivities(activitiesData);
        setCategories(categoriesData);
      } catch (err) {
        setError("Failed to load data. Please try again.");
        console.error("Error fetching data:", err);
        toast.error("Failed to load activities. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user?.role === "admin") {
      fetchData();
    }
  }, [isAuthenticated, user]);

  // Filter activities when search or category filter changes
  useEffect(() => {
    const filterActivities = () => {
      return activities.filter((activity) => {
        // Category filter
        if (
          categoryFilter !== "all" &&
          activity.categoryId !== categoryFilter
        ) {
          return false;
        }

        // Search query filter
        if (debouncedSearchQuery) {
          const query = debouncedSearchQuery.toLowerCase();
          const title = activity.title?.toLowerCase() || "";
          const description = activity.description?.toLowerCase() || "";
          const city = activity.city?.toLowerCase() || "";
          const province = activity.province?.toLowerCase() || "";

          return (
            title.includes(query) ||
            description.includes(query) ||
            city.includes(query) ||
            province.includes(query)
          );
        }

        return true;
      });
    };

    // Apply the filters
    const filtered = filterActivities();
    setFilteredActivities(filtered);

    // Reset to first page when filters change
    setCurrentPage(1);
  }, [debouncedSearchQuery, categoryFilter, activities]);

  // Handle edit activity
  const handleEdit = (activity) => {
    setCurrentActivity(activity);
    setFormData({
      categoryId: activity.categoryId || "",
      title: activity.title || "",
      description: activity.description || "",
      imageUrls: activity.imageUrls || [""],
      price: activity.price || 0,
      price_discount: activity.price_discount || 0,
      rating: activity.rating || 4,
      total_reviews: activity.total_reviews || 0,
      facilities: activity.facilities || "",
      address: activity.address || "",
      province: activity.province || "",
      city: activity.city || "",
      location_maps: activity.location_maps || "",
    });
    setIsFormOpen(true);
  };

  // Handle delete activity
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this activity?")) return;

    try {
      await activityService.delete(id);

      // Update both activities and filtered activities
      const updatedActivities = activities.filter(
        (activity) => activity.id !== id
      );
      setActivities(updatedActivities);

      // Apply filters to the updated activities
      const updatedFilteredActivities = updatedActivities.filter(
        (activity) =>
          categoryFilter === "all" || activity.categoryId === categoryFilter
      );
      setFilteredActivities(updatedFilteredActivities);

      toast.success("Activity deleted successfully");

      // Check if we need to adjust the current page after deletion
      const totalPages = Math.ceil(
        updatedFilteredActivities.length / activitiesPerPage
      );
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    } catch (err) {
      console.error("Error deleting activity:", err);
      toast.error("Failed to delete activity. Please try again.");
    }
  };

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (
      name.includes("price") ||
      name === "rating" ||
      name === "total_reviews"
    ) {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle image URL change
  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...formData.imageUrls];
    newImageUrls[index] = value;
    setFormData({ ...formData, imageUrls: newImageUrls });
  };

  // Add more image URL field
  const addImageUrlField = () => {
    setFormData({
      ...formData,
      imageUrls: [...formData.imageUrls, ""],
    });
  };

  // Remove image URL field
  const removeImageUrlField = (index) => {
    if (formData.imageUrls.length > 1) {
      const newImageUrls = formData.imageUrls.filter((_, i) => i !== index);
      setFormData({ ...formData, imageUrls: newImageUrls });
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    // Filter out empty image URLs
    const filteredImageUrls = formData.imageUrls.filter(
      (url) => url.trim() !== ""
    );
    const dataToSubmit = {
      ...formData,
      imageUrls:
        filteredImageUrls.length > 0
          ? filteredImageUrls
          : ["https://via.placeholder.com/800x600"],
    };

    try {
      if (currentActivity) {
        // Update existing activity
        const response = await activityService.update(
          currentActivity.id,
          dataToSubmit
        );

        // Update main activities list
        const updatedActivities = activities.map((a) =>
          a.id === currentActivity.id ? response.data.data : a
        );
        setActivities(updatedActivities);

        // Re-apply filters
        const updatedFilteredActivities = updatedActivities.filter(
          (activity) =>
            categoryFilter === "all" || activity.categoryId === categoryFilter
        );
        setFilteredActivities(updatedFilteredActivities);

        toast.success("Activity updated successfully");
      } else {
        // Create new activity
        const response = await activityService.create(dataToSubmit);

        // Add to main activities list
        const updatedActivities = [...activities, response.data.data];
        setActivities(updatedActivities);

        // Re-apply filters
        const updatedFilteredActivities = updatedActivities.filter(
          (activity) =>
            categoryFilter === "all" || activity.categoryId === categoryFilter
        );
        setFilteredActivities(updatedFilteredActivities);

        toast.success("Activity created successfully");
      }
      setIsFormOpen(false);
      setCurrentActivity(null);
      resetForm();
    } catch (err) {
      console.error("Error saving activity:", err);
      toast.error("Failed to save activity. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      categoryId: "",
      title: "",
      description: "",
      imageUrls: [""],
      price: 0,
      price_discount: 0,
      rating: 4,
      total_reviews: 0,
      facilities: "",
      address: "",
      province: "",
      city: "",
      location_maps: "",
    });
  };

  // Retry fetching data
  const retryFetchData = async () => {
    if (isAuthenticated && user?.role === "admin") {
      try {
        setIsLoading(true);
        setError(null);
        const [activitiesRes, categoriesRes] = await Promise.all([
          activityService.getAll(),
          categoryService.getAll(),
        ]);
        const activitiesData = activitiesRes.data.data || [];
        const categoriesData = categoriesRes.data.data || [];

        setActivities(activitiesData);
        setFilteredActivities(activitiesData);
        setCategories(categoriesData);
        toast.success("Data loaded successfully");
      } catch (err) {
        setError("Failed to load data. Please try again.");
        console.error("Error retrying data fetch:", err);
        toast.error("Failed to load activities. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Pagination logic
  const indexOfLastActivity = currentPage * activitiesPerPage;
  const indexOfFirstActivity = indexOfLastActivity - activitiesPerPage;
  const currentActivities = filteredActivities.slice(
    indexOfFirstActivity,
    indexOfLastActivity
  );
  const totalPages = Math.ceil(filteredActivities.length / activitiesPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-bold animate-pulse text-primary-600">
          Loading activities...
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
          <h1 className="text-2xl font-bold text-gray-900">
            Manage Activities
          </h1>
          <button
            onClick={() => {
              setCurrentActivity(null);
              resetForm();
              setIsFormOpen(true);
            }}
            className="flex items-center px-4 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
          >
            <FiPlus className="mr-2" />
            Add Activity
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 mb-6 text-red-700 bg-red-100 border border-red-300 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
            <button
              onClick={retryFetchData}
              className="px-4 py-2 mt-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col mb-6 space-y-4 md:space-y-0 md:space-x-4 md:flex-row md:items-center">
          <div className="relative flex-grow">
            <FiSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search by title, location..."
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                debouncedSetSearch(e.target.value);
              }}
            />
          </div>

          <div className="flex items-center space-x-2">
            <FiFilter className="text-gray-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Activity list */}
        <div className="overflow-hidden bg-white shadow-sm rounded-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Image
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Location
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentActivities.map((activity) => {
                  // Find category name
                  const category = categories.find(
                    (c) => c.id === activity.categoryId
                  );
                  return (
                    <tr key={activity.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-16 h-12 overflow-hidden rounded-lg">
                          <img
                            src={
                              activity.imageUrls?.[0] ||
                              "/images/placeholders/activity-placeholder.jpg"
                            }
                            alt={activity.title}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "/images/placeholders/activity-placeholder.jpg";
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        <div className="font-medium">{activity.title}</div>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <FiStar className="mr-1 text-yellow-400" />
                          {activity.rating} ({activity.total_reviews} reviews)
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {category?.name || "No category"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {activity.price_discount ? (
                          <div>
                            <div className="text-sm text-gray-500 line-through">
                              Rp {activity.price?.toLocaleString("id-ID")}
                            </div>
                            <div className="font-medium text-green-600">
                              Rp{" "}
                              {activity.price_discount?.toLocaleString("id-ID")}
                            </div>
                          </div>
                        ) : (
                          <div className="font-medium">
                            Rp {activity.price?.toLocaleString("id-ID")}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiMapPin className="mr-1 text-gray-400" />
                          {activity.city}, {activity.province}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(activity)}
                            className="p-2 text-blue-600 transition-colors rounded-full hover:bg-blue-50"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(activity.id)}
                            className="p-2 text-red-600 transition-colors rounded-full hover:bg-red-50"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {currentActivities.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-sm text-center text-gray-500"
                    >
                      {debouncedSearchQuery || categoryFilter !== "all"
                        ? "No activities found matching your search criteria."
                        : "No activities found. Click 'Add Activity' to create one."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-6 space-x-2">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Previous
            </button>

            {/* Logic for showing limited page numbers */}
            {Array.from({ length: totalPages }, (_, i) => {
              const pageNumber = i + 1;
              // Show first page, last page, current page, and pages adjacent to current page
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
              ) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => paginate(pageNumber)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === pageNumber
                        ? "bg-primary-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              }

              // Show ellipsis for skipped pages
              if (
                (pageNumber === currentPage - 3 && pageNumber > 1) ||
                (pageNumber === currentPage + 3 && pageNumber < totalPages)
              ) {
                return (
                  <span key={pageNumber} className="px-3 py-1">
                    ...
                  </span>
                );
              }

              return null;
            })}

            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Activity form modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-4xl p-6 bg-white rounded-xl max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              {currentActivity ? "Edit Activity" : "Add Activity"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Category select */}
                <div>
                  <label
                    htmlFor="categoryId"
                    className="block mb-1 text-sm font-medium text-gray-700"
                  >
                    Category
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label
                    htmlFor="title"
                    className="block mb-1 text-sm font-medium text-gray-700"
                  >
                    Activity Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Description */}
                <div className="col-span-1 md:col-span-2">
                  <label
                    htmlFor="description"
                    className="block mb-1 text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  ></textarea>
                </div>

                {/* Image URLs */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Image URLs
                  </label>
                  {formData.imageUrls.map((url, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) =>
                          handleImageUrlChange(index, e.target.value)
                        }
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="https://example.com/image.jpg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImageUrlField(index)}
                        className="p-2 ml-2 text-red-600 transition-colors rounded-lg hover:bg-red-50"
                        disabled={formData.imageUrls.length <= 1}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addImageUrlField}
                    className="px-3 py-1 mt-1 text-sm transition-colors border rounded-lg text-primary-600 border-primary-600 hover:bg-primary-50"
                  >
                    Add Another Image
                  </button>
                </div>

                {/* Price */}
                <div>
                  <label
                    htmlFor="price"
                    className="block mb-1 text-sm font-medium text-gray-700"
                  >
                    Price (Rp)
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Discount Price */}
                <div>
                  <label
                    htmlFor="price_discount"
                    className="block mb-1 text-sm font-medium text-gray-700"
                  >
                    Discount Price (Rp)
                  </label>
                  <input
                    type="number"
                    id="price_discount"
                    name="price_discount"
                    value={formData.price_discount}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label
                    htmlFor="rating"
                    className="block mb-1 text-sm font-medium text-gray-700"
                  >
                    Rating (0-5)
                  </label>
                  <input
                    type="number"
                    id="rating"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    min="0"
                    max="5"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Total Reviews */}
                <div>
                  <label
                    htmlFor="total_reviews"
                    className="block mb-1 text-sm font-medium text-gray-700"
                  >
                    Total Reviews
                  </label>
                  <input
                    type="number"
                    id="total_reviews"
                    name="total_reviews"
                    value={formData.total_reviews}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Facilities */}
                <div className="col-span-1 md:col-span-2">
                  <label
                    htmlFor="facilities"
                    className="block mb-1 text-sm font-medium text-gray-700"
                  >
                    Facilities
                  </label>
                  <textarea
                    id="facilities"
                    name="facilities"
                    rows="3"
                    value={formData.facilities}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="<p>HTML content allowed</p>"
                  ></textarea>
                </div>

                {/* Address */}
                <div className="col-span-1 md:col-span-2">
                  <label
                    htmlFor="address"
                    className="block mb-1 text-sm font-medium text-gray-700"
                  >
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Province & City */}
                <div>
                  <label
                    htmlFor="province"
                    className="block mb-1 text-sm font-medium text-gray-700"
                  >
                    Province
                  </label>
                  <input
                    type="text"
                    id="province"
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="block mb-1 text-sm font-medium text-gray-700"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Location Maps */}
                <div className="col-span-1 md:col-span-2">
                  <label
                    htmlFor="location_maps"
                    className="block mb-1 text-sm font-medium text-gray-700"
                  >
                    Location Maps (Embed HTML)
                  </label>
                  <textarea
                    id="location_maps"
                    name="location_maps"
                    rows="3"
                    value={formData.location_maps}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="<iframe src='...'></iframe>"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end mt-6 space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setCurrentActivity(null);
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
