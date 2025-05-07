"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { activityService } from "@/lib/api";
import ActivityCard from "@/components/activity/activity-card";

export default function RelatedActivities({ categoryId, currentActivityId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRelatedActivities = async () => {
      try {
        // Fetch activities in the same category
        const response = await activityService.getByCategory(categoryId);

        // Filter out the current activity and limit to 3
        const filteredActivities =
          response.data.data
            ?.filter((activity) => activity.id !== currentActivityId)
            .slice(0, 3) || [];

        setActivities(filteredActivities);
      } catch (err) {
        console.error("Error fetching related activities:", err);
        setError("Failed to load related activities.");
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchRelatedActivities();
    }
  }, [categoryId, currentActivityId]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  if (loading) {
    return (
      <div className="py-4">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          Related Activities
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-200 animate-pulse rounded-xl h-72"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return null; // Don't show anything if there's an error
  }

  if (activities.length === 0) {
    return null; // Don't show section if no related activities
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        You May Also Like
      </h2>

      <motion.div
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {activities.map((activity, index) => (
          <ActivityCard key={activity.id} activity={activity} index={index} />
        ))}
      </motion.div>
    </div>
  );
}
