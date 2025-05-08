"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiCopy,
  FiClock,
  FiCalendar,
  FiCheckSquare,
  FiCheckCircle,
} from "react-icons/fi";
import { promoService, activityService } from "@/lib/api";
import ActivityCard from "@/components/activity/activity-card";

export default function PromoDetailPage({ params }) {
  const id = use(params).id;
  const [promo, setPromo] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const promoRes = await promoService.getById(id);
        setPromo(promoRes.data.data);

        // Fetch some activities to show as recommendations
        const activitiesRes = await activityService.getAll();
        setActivities(activitiesRes.data.data?.slice(0, 6) || []);
      } catch (err) {
        console.error("Error fetching promo details:", err);
        setError("Failed to load promo details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleCopyPromoCode = () => {
    if (promo?.promo_code) {
      navigator.clipboard.writeText(promo.promo_code);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-bold animate-pulse text-primary-600">
          Loading promo details...
        </div>
      </div>
    );
  }

  if (error || !promo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="mb-4 text-2xl font-bold text-red-600">
          {error || "Promo not found"}
        </div>
        <button
          onClick={() => router.push("/promo")}
          className="flex items-center px-6 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
        >
          <FiArrowLeft className="mr-2" /> Back to Promos
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/promo"
            className="flex items-center text-gray-600 transition-colors hover:text-primary-600"
          >
            <FiArrowLeft className="mr-2" /> Back to Promos
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Promo details */}
          <div className="lg:col-span-2">
            <motion.div
              className="overflow-hidden bg-white shadow-sm rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative h-64 md:h-80">
                <img
                  src={
                    promo.imageUrl ||
                    "/images/placeholders/promo-placeholder.jpg"
                  }
                  alt={promo.title}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/placeholders/promo-placeholder.jpg";
                  }}
                />
                <div className="absolute px-3 py-1 text-sm font-bold text-white rounded-full top-4 right-4 bg-accent-500">
                  {Math.floor(Math.random() * 70) + 10}% OFF
                </div>
              </div>

              <div className="p-6 md:p-8">
                <h1 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">
                  {promo.title}
                </h1>

                <p className="mb-6 text-gray-700">{promo.description}</p>

                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="flex items-center px-4 py-2 rounded-lg bg-primary-50 text-primary-700">
                    <FiCalendar className="mr-2" />
                    <span>Valid until May 31, 2025</span>
                  </div>

                  <div className="flex items-center px-4 py-2 rounded-lg bg-primary-50 text-primary-700">
                    <FiClock className="mr-2" />
                    <span>Limited Time Offer</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <h2 className="mb-4 text-xl font-bold text-gray-900">
                    Terms and Conditions
                  </h2>

                  {promo.terms_condition ? (
                    <div
                      className="prose text-gray-700 prose-li:marker:text-primary-500 max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: promo.terms_condition,
                      }}
                    />
                  ) : (
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start">
                        <FiCheckSquare className="flex-shrink-0 mt-1 mr-2 text-primary-500" />
                        <span>
                          Minimum purchase of Rp{" "}
                          {promo.minimum_claim_price?.toLocaleString("id-ID")}{" "}
                          required.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <FiCheckSquare className="flex-shrink-0 mt-1 mr-2 text-primary-500" />
                        <span>
                          Valid for all activities unless otherwise stated.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <FiCheckSquare className="flex-shrink-0 mt-1 mr-2 text-primary-500" />
                        <span>
                          Cannot be combined with other promotions or discounts.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <FiCheckSquare className="flex-shrink-0 mt-1 mr-2 text-primary-500" />
                        <span>
                          Promo subject to availability and may be withdrawn at
                          any time.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <FiCheckSquare className="flex-shrink-0 mt-1 mr-2 text-primary-500" />
                        <span>Other terms and conditions may apply.</span>
                      </li>
                    </ul>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              className="sticky p-6 bg-white shadow-sm rounded-xl top-28"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                Promo Details
              </h2>

              <div className="mb-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount Amount</span>
                  <span className="font-medium text-gray-900">
                    Rp {promo.promo_discount_price?.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Minimum Purchase</span>
                  <span className="font-medium text-gray-900">
                    Rp {promo.minimum_claim_price?.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Validity</span>
                  <span className="font-medium text-gray-900">
                    Until May 31, 2025
                  </span>
                </div>
              </div>

              <div className="pt-6 mb-6 border-t border-gray-100">
                <h3 className="mb-2 font-medium text-gray-900">Promo Code</h3>
                <div className="flex">
                  <div className="flex-grow px-4 py-3 font-medium bg-gray-100 rounded-l-lg text-primary-600">
                    {promo.promo_code}
                  </div>
                  <button
                    className={`px-4 py-3 rounded-r-lg flex items-center justify-center transition-colors ${
                      copied
                        ? "bg-green-600 text-white"
                        : "bg-primary-600 text-white hover:bg-primary-700"
                    }`}
                    onClick={handleCopyPromoCode}
                  >
                    {copied ? (
                      <FiCheckCircle size={20} />
                    ) : (
                      <FiCopy size={20} />
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Copy this code and apply during checkout
                </p>
              </div>

              <Link
                href="/activity"
                className="flex items-center justify-center w-full py-3 font-medium text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
              >
                Browse Activities
              </Link>

              <div className="pt-6 mt-6 border-t border-gray-100">
                <h3 className="mb-2 font-medium text-gray-900">How to Use</h3>
                <ol className="pl-4 space-y-2 text-gray-700 list-decimal">
                  <li>Browse and select your desired activities</li>
                  <li>Add activities to your cart</li>
                  <li>Enter promo code at checkout</li>
                  <li>Enjoy your discounted adventure!</li>
                </ol>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Recommended activities */}
        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Recommended Activities
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activities.slice(0, 3).map((activity, index) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
