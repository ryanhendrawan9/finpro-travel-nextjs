"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiEdit, FiTrash2, FiPlus, FiArrowLeft, FiTag } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { promoService } from "@/lib/api";
import { toast } from "react-toastify";

export default function AdminPromos() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [promos, setPromos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPromo, setCurrentPromo] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    terms_condition: "",
    promo_code: "",
    promo_discount_price: 0,
    minimum_claim_price: 0,
  });
  const [formLoading, setFormLoading] = useState(false);

  // Auth check
  useEffect(() => {
    if (!loading && (!isAuthenticated || (user && user.role !== "admin"))) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, user, router]);

  // Fetch promos
  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const response = await promoService.getAll();
        setPromos(response.data.data || []);
      } catch (err) {
        setError("Failed to load promos. Please try again.");
        console.error("Error fetching promos:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user?.role === "admin") {
      fetchPromos();
    }
  }, [isAuthenticated, user]);

  // Handle edit promo
  const handleEdit = (promo) => {
    setCurrentPromo(promo);
    setFormData({
      title: promo.title || "",
      description: promo.description || "",
      imageUrl: promo.imageUrl || "",
      terms_condition: promo.terms_condition || "",
      promo_code: promo.promo_code || "",
      promo_discount_price: promo.promo_discount_price || 0,
      minimum_claim_price: promo.minimum_claim_price || 0,
    });
    setIsFormOpen(true);
  };

  // Handle delete promo
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this promo?")) return;

    try {
      await promoService.delete(id);
      setPromos(promos.filter((promo) => promo.id !== id));
      toast.success("Promo deleted successfully");
    } catch (err) {
      console.error("Error deleting promo:", err);
      toast.error("Failed to delete promo. Please try again.");
    }
  };

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("price") ? parseInt(value) || 0 : value,
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (currentPromo) {
        // Update existing promo
        const response = await promoService.update(currentPromo.id, formData);
        setPromos(
          promos.map((p) => (p.id === currentPromo.id ? response.data.data : p))
        );
        toast.success("Promo updated successfully");
      } else {
        // Create new promo
        const response = await promoService.create(formData);
        setPromos([...promos, response.data.data]);
        toast.success("Promo created successfully");
      }
      setIsFormOpen(false);
      setCurrentPromo(null);
      setFormData({
        title: "",
        description: "",
        imageUrl: "",
        terms_condition: "",
        promo_code: "",
        promo_discount_price: 0,
        minimum_claim_price: 0,
      });
    } catch (err) {
      console.error("Error saving promo:", err);
      toast.error("Failed to save promo. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-bold animate-pulse text-primary-600">
          Loading promos...
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
          <h1 className="text-2xl font-bold text-gray-900">Manage Promos</h1>
          <button
            onClick={() => {
              setCurrentPromo(null);
              setFormData({
                title: "",
                description: "",
                imageUrl: "",
                terms_condition: "",
                promo_code: "",
                promo_discount_price: 0,
                minimum_claim_price: 0,
              });
              setIsFormOpen(true);
            }}
            className="flex items-center px-4 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
          >
            <FiPlus className="mr-2" />
            Add Promo
          </button>
        </div>

        {/* Promo list */}
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
                    Promo Code
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Discount
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
                {promos.map((promo) => (
                  <tr key={promo.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-12 h-12 overflow-hidden rounded-lg">
                        <img
                          src={
                            promo.imageUrl ||
                            "/images/placeholders/promo-placeholder.jpg"
                          }
                          alt={promo.title}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "/images/placeholders/promo-placeholder.jpg";
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {promo.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      <span className="px-3 py-1 text-sm font-medium rounded-lg bg-primary-50 text-primary-600">
                        {promo.promo_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      Rp {promo.promo_discount_price?.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(promo)}
                          className="p-2 text-blue-600 transition-colors rounded-full hover:bg-blue-50"
                        >
                          <FiEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(promo.id)}
                          className="p-2 text-red-600 transition-colors rounded-full hover:bg-red-50"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {promos.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-sm text-center text-gray-500"
                    >
                      No promos found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Promo form modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-3xl p-6 bg-white rounded-xl">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              {currentPromo ? "Edit Promo" : "Add Promo"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="title"
                    className="block mb-1 text-sm font-medium text-gray-700"
                  >
                    Promo Title
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

                <div>
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
                </div>

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

                <div className="col-span-1 md:col-span-2">
                  <label
                    htmlFor="terms_condition"
                    className="block mb-1 text-sm font-medium text-gray-700"
                  >
                    Terms & Conditions
                  </label>
                  <textarea
                    id="terms_condition"
                    name="terms_condition"
                    rows="3"
                    value={formData.terms_condition}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="<p>HTML content allowed</p>"
                  ></textarea>
                </div>

                <div>
                  <label
                    htmlFor="promo_code"
                    className="block mb-1 text-sm font-medium text-gray-700"
                  >
                    Promo Code
                  </label>
                  <input
                    type="text"
                    id="promo_code"
                    name="promo_code"
                    value={formData.promo_code}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. SUMMER2025"
                  />
                </div>

                <div>
                  <label
                    htmlFor="promo_discount_price"
                    className="block mb-1 text-sm font-medium text-gray-700"
                  >
                    Discount Amount (Rp)
                  </label>
                  <input
                    type="number"
                    id="promo_discount_price"
                    name="promo_discount_price"
                    value={formData.promo_discount_price}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="minimum_claim_price"
                    className="block mb-1 text-sm font-medium text-gray-700"
                  >
                    Minimum Purchase (Rp)
                  </label>
                  <input
                    type="number"
                    id="minimum_claim_price"
                    name="minimum_claim_price"
                    value={formData.minimum_claim_price}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6 space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setCurrentPromo(null);
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
