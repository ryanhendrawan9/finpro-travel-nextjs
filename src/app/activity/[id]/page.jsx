"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { use } from "react";
import {
  FiArrowLeft,
  FiStar,
  FiMapPin,
  FiUser,
  FiCalendar,
  FiShoppingCart,
  FiHeart,
  FiShare2,
} from "react-icons/fi";
import { activityService } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import ActivityGallery from "@/components/activity/activity-gallery";
import ActivityLocation from "@/components/activity/activity-location";
import ActivityFacilities from "@/components/activity/activity-facilities";
import ActivityReviews from "@/components/activity/activity-reviews";
import RelatedActivities from "@/components/activity/related-activities";

export default function ActivityDetailPage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;

  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await activityService.getById(id);
        setActivity(response.data.data);
      } catch (err) {
        console.error("Error fetching activity:", err);
        setError("Failed to load activity details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchActivity();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      // Add to cart multiple times based on quantity
      for (let i = 0; i < quantity; i++) {
        await addToCart(id);
      }
      router.push("/cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    setQuantity(Math.max(1, newQuantity));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-bold animate-pulse text-primary-600">
          Loading activity details...
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="mb-4 text-2xl font-bold text-red-600">
          {error || "Activity not found"}
        </div>
        <button
          onClick={() => router.back()}
          className="flex items-center px-6 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
        >
          <FiArrowLeft className="mr-2" /> Go Back
        </button>
      </div>
    );
  }

  const {
    title,
    description,
    imageUrls,
    price,
    price_discount,
    rating,
    total_reviews,
    facilities,
    address,
    province,
    city,
    location_maps,
    categoryId,
  } = activity;

  // Calculate discount percentage
  const discountPercentage =
    price_discount && price
      ? Math.round(((price - price_discount) / price) * 100)
      : 0;

  return (
    <div className="pb-16 bg-gray-50 pt-28">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Back button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 transition-colors hover:text-primary-600"
          >
            <FiArrowLeft className="mr-2" /> Back to Activities
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            <ActivityGallery images={imageUrls} title={title} />

            <motion.div
              className="p-6 mt-8 bg-white shadow-md rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl font-bold text-gray-900 font-heading">
                {title}
              </h1>

              <div className="flex items-center mt-3 mb-6">
                <div className="flex items-center mr-6">
                  <FiStar className="mr-1 text-yellow-400" />
                  <span className="font-medium text-gray-700">{rating}</span>
                  <span className="ml-1 text-gray-500">
                    ({total_reviews} reviews)
                  </span>
                </div>
                <div className="flex items-center">
                  <FiMapPin className="mr-1 text-gray-500" />
                  <span className="text-gray-700">
                    {city}, {province}
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h2 className="mb-4 text-xl font-bold text-gray-800">
                  Description
                </h2>
                <p className="leading-relaxed text-gray-700">{description}</p>
              </div>
            </motion.div>

            <motion.div
              className="p-6 mt-8 bg-white shadow-md rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ActivityFacilities facilities={facilities} />
            </motion.div>

            <motion.div
              className="p-6 mt-8 bg-white shadow-md rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <ActivityLocation
                address={address}
                locationMaps={location_maps}
              />
            </motion.div>

            {/* Removed duplicate ActivityLocation component */}

            <motion.div
              className="p-6 mt-8 bg-white shadow-md rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <ActivityReviews
                activityId={id}
                rating={rating}
                totalReviews={total_reviews}
              />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              className="sticky p-6 bg-white shadow-md rounded-2xl top-28"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Price */}
              <div className="mb-6">
                {price_discount ? (
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-3xl font-bold text-primary-600">
                        Rp {price_discount.toLocaleString("id-ID")}
                      </span>
                      <span className="px-2 py-1 text-xs font-bold text-white rounded bg-accent-500">
                        {discountPercentage}% OFF
                      </span>
                    </div>
                    <div className="text-gray-500 line-through">
                      Rp {price.toLocaleString("id-ID")}
                    </div>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-primary-600">
                    Rp {price.toLocaleString("id-ID")}
                  </div>
                )}
              </div>

              {/* Booking form */}
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="date"
                      className="w-full py-3 pl-10 pr-4 text-gray-700 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Guests
                  </label>
                  <div className="relative">
                    <FiUser className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <select className="w-full py-3 pl-10 pr-4 text-gray-700 border border-gray-300 appearance-none rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="1">1 Person</option>
                      <option value="2">2 People</option>
                      <option value="3">3 People</option>
                      <option value="4">4 People</option>
                      <option value="5">5 People</option>
                      <option value="6+">6+ People</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <div className="flex items-center overflow-hidden border border-gray-300 rounded-xl">
                    <button
                      className="px-4 py-3 text-gray-700 transition-colors bg-gray-100 hover:bg-gray-200"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) =>
                        handleQuantityChange(parseInt(e.target.value) || 1)
                      }
                      className="w-full px-4 py-3 text-center focus:outline-none"
                    />
                    <button
                      className="px-4 py-3 text-gray-700 transition-colors bg-gray-100 hover:bg-gray-200"
                      onClick={() => handleQuantityChange(quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex items-center justify-center w-full py-3 font-medium text-white transition-colors bg-primary-600 hover:bg-primary-700 rounded-xl"
                >
                  <FiShoppingCart className="mr-2" />
                  Add to Cart
                </button>

                <div className="flex items-center pt-2 space-x-2">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`flex-1 flex items-center justify-center py-3 rounded-xl font-medium border transition-colors ${
                      isFavorite
                        ? "bg-red-50 text-red-600 border-red-200"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <FiHeart
                      className={
                        isFavorite ? "text-red-500 fill-current mr-2" : "mr-2"
                      }
                    />
                    Favorite
                  </button>
                  <button className="flex items-center justify-center flex-1 py-3 font-medium text-gray-700 transition-colors bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
                    <FiShare2 className="mr-2" />
                    Share
                  </button>
                </div>
              </div>

              {/* Additional information */}
              <div className="pt-6 mt-6 border-t border-gray-200">
                <h3 className="mb-2 font-medium text-gray-900">
                  Activity Highlights
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="w-5 h-5 mr-2 text-green-500">✓</span>
                    <span className="text-gray-700">Instant Confirmation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-5 h-5 mr-2 text-green-500">✓</span>
                    <span className="text-gray-700">Flexible Cancellation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-5 h-5 mr-2 text-green-500">✓</span>
                    <span className="text-gray-700">Skip the line access</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-5 h-5 mr-2 text-green-500">✓</span>
                    <span className="text-gray-700">Duration: Full day</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related activities */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <RelatedActivities categoryId={categoryId} currentActivityId={id} />
        </motion.div>
      </div>
    </div>
  );
}
