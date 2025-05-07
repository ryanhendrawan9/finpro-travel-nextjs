"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiMapPin, FiStar, FiShoppingCart, FiHeart } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function ActivityCard({ activity, index }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  // Check if activity exists and has all required properties
  if (!activity) {
    return null; // Return nothing if activity doesn't exist
  }

  const {
    id,
    title,
    description,
    imageUrls,
    price,
    price_discount,
    rating,
    total_reviews,
    province,
    city,
  } = activity;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = "/login";
      return;
    }

    try {
      await addToCart(id);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.5,
      },
    },
    hover: {
      y: -10,
      transition: {
        duration: 0.3,
      },
    },
  };

  // Define a guaranteed fallback path
  const FALLBACK_IMAGE = "/images/placeholders/activity-placeholder.jpg";

  // Improved image URL validation
  let imageUrl = FALLBACK_IMAGE;
  if (Array.isArray(imageUrls) && imageUrls.length > 0) {
    const firstImage = imageUrls[0];
    if (typeof firstImage === "string" && firstImage.trim() !== "") {
      imageUrl = firstImage;
    }
  }

  // Calculate discount percentage if there's a discounted price
  const discountPercentage =
    price_discount && price
      ? Math.round(((price - price_discount) / price) * 100)
      : 0;

  return (
    <motion.div
      className="h-full"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link href={`/activity/${id}`}>
        <div className="flex flex-col h-full overflow-hidden transition-shadow bg-white rounded-2xl shadow-card hover:shadow-card-hover">
          {/* Image */}
          <div className="relative w-full h-48 overflow-hidden">
            <img
              src={imageUrl}
              alt={title || "Activity"}
              className="object-cover w-full h-full transition-transform duration-700"
              style={{ transform: isHovered ? "scale(1.1)" : "scale(1)" }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = FALLBACK_IMAGE;
              }}
            />

            {/* Discount badge */}
            {discountPercentage > 0 && (
              <div className="absolute px-2 py-1 text-sm font-bold text-white rounded-lg top-4 left-4 bg-accent-500">
                {discountPercentage}% OFF
              </div>
            )}

            {/* Favorite button */}
            <button
              className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                isFavorite
                  ? "bg-red-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
              onClick={handleToggleFavorite}
            >
              <FiHeart size={18} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col flex-grow p-4">
            {/* Title and rating */}
            <div className="mb-2">
              <h3 className="text-lg font-bold text-gray-800 line-clamp-1">
                {title || "Untitled Activity"}
              </h3>
              <div className="flex items-center mt-1">
                <FiStar className="mr-1 text-yellow-400" size={16} />
                <span className="text-sm font-medium text-gray-700">
                  {rating || "0"}{" "}
                  <span className="text-gray-500">
                    ({total_reviews || "0"} reviews)
                  </span>
                </span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center mb-2 text-sm text-gray-600">
              <FiMapPin size={14} className="mr-1" />
              <span>
                {city || "Unknown city"}, {province || "Unknown province"}
              </span>
            </div>

            {/* Description */}
            <p className="flex-grow mb-4 text-sm text-gray-600 line-clamp-2">
              {description || "No description available"}
            </p>

            {/* Price and CTA */}
            <div className="flex items-center justify-between mt-auto">
              <div>
                {price_discount ? (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 line-through">
                      Rp {(price || 0).toLocaleString("id-ID")}
                    </span>
                    <span className="text-lg font-bold text-primary-600">
                      Rp {(price_discount || 0).toLocaleString("id-ID")}
                    </span>
                  </div>
                ) : (
                  <span className="text-lg font-bold text-primary-600">
                    Rp {(price || 0).toLocaleString("id-ID")}
                  </span>
                )}
              </div>

              <button
                className="flex items-center justify-center px-3 py-2 transition-colors rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-600"
                onClick={handleAddToCart}
              >
                <FiShoppingCart size={18} className="mr-1" />
                <span className="text-sm font-medium">Add</span>
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
