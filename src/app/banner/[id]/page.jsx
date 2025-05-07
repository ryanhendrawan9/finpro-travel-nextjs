"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiArrowLeft, FiCalendar, FiExternalLink } from "react-icons/fi";
import { bannerService, activityService } from "@/lib/api";
import ActivityCard from "@/components/activity/activity-card";

export default function BannerDetailPage({ params }) {
  const { id } = params;
  const [banner, setBanner] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bannerRes = await bannerService.getById(id);
        setBanner(bannerRes.data.data);

        // Fetch some activities to show as recommendations
        const activitiesRes = await activityService.getAll();
        setActivities(activitiesRes.data.data?.slice(0, 3) || []);
      } catch (err) {
        console.error("Error fetching banner details:", err);
        setError("Failed to load banner details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-bold animate-pulse text-primary-600">
          Loading banner details...
        </div>
      </div>
    );
  }

  if (error || !banner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="mb-4 text-2xl font-bold text-red-600">
          {error || "Banner not found"}
        </div>
        <button
          onClick={() => router.push("/banner")}
          className="flex items-center px-6 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
        >
          <FiArrowLeft className="mr-2" /> Back to Banners
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/banner"
            className="flex items-center text-gray-600 transition-colors hover:text-primary-600"
          >
            <FiArrowLeft className="mr-2" /> Back to Banners
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Banner details */}
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
              </div>

              <div className="p-6 md:p-8">
                <h1 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">
                  {banner.name}
                </h1>

                <p className="mb-6 text-gray-700">
                  {banner.description ||
                    "Experience this amazing offer and explore our featured destinations with special discounts."}
                </p>

                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="flex items-center px-4 py-2 rounded-lg bg-primary-50 text-primary-700">
                    <FiCalendar className="mr-2" />
                    <span>Valid until June 30, 2025</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <h2 className="mb-4 text-xl font-bold text-gray-900">
                    Banner Details
                  </h2>

                  <div className="prose text-gray-700 max-w-none">
                    <p>
                      This special banner features exclusive offers and
                      promotions for our valued customers. Explore the
                      highlighted destinations and activities to make the most
                      of your travel experience.
                    </p>
                    <p>
                      Whether you're looking for adventure, relaxation, or
                      cultural experiences, this banner promotion includes
                      something for everyone. Don't miss out on these
                      limited-time offers!
                    </p>
                  </div>

                  {banner.link && (
                    <div className="mt-6">
                      <a
                        href={banner.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 font-medium text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
                      >
                        Explore Offer <FiExternalLink className="ml-2" />
                      </a>
                    </div>
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
                Banner Information
              </h2>

              <div className="mb-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium text-gray-900">
                    {banner.type || "Promotional"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="px-2 py-1 text-xs font-medium text-white bg-green-500 rounded-full">
                    Active
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Placement</span>
                  <span className="font-medium text-gray-900">
                    {banner.placement || "Homepage"}
                  </span>
                </div>
              </div>

              <Link
                href="/activity"
                className="flex items-center justify-center w-full py-3 font-medium text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
              >
                Browse Activities
              </Link>

              <div className="pt-6 mt-6 border-t border-gray-100">
                <h3 className="mb-2 font-medium text-gray-900">Banner Info</h3>
                <ul className="pl-4 space-y-2 text-gray-700 list-disc">
                  <li>Exclusive deals and limited-time offers</li>
                  <li>Special discounts on selected activities</li>
                  <li>Featured experiences and destinations</li>
                  <li>Seasonal promotions and packages</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related activities */}
        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Featured Activities
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity, index) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                index={index}
              />
            ))}
          </div>

          {activities.length === 0 && (
            <div className="p-8 text-center bg-white shadow-sm rounded-xl">
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                No featured activities available
              </h3>
              <p className="mb-6 text-gray-600">
                There are currently no activities associated with this banner.
              </p>
              <Link
                href="/activity"
                className="inline-block px-6 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
              >
                Browse All Activities
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
