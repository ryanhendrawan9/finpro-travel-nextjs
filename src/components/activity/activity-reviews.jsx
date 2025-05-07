"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FiStar, FiUser, FiCalendar, FiMessageSquare } from "react-icons/fi";

export default function ActivityReviews({
  activityId,
  rating = 0,
  totalReviews = 0,
}) {
  const [reviewForm, setReviewForm] = useState({
    name: "",
    email: "",
    rating: 5,
    comment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Sample reviews data - in a real app this would come from an API
  const reviews = [
    {
      id: 1,
      name: "John D.",
      date: "2025-04-01",
      rating: 5,
      comment:
        "Amazing experience! The staff was incredibly friendly and the activity exceeded all my expectations. Would highly recommend to anyone visiting the area.",
    },
    {
      id: 2,
      name: "Sarah M.",
      date: "2025-03-15",
      rating: 4,
      comment:
        "Really enjoyed this activity. The views were breathtaking and everything was well organized. Just a bit crowded, but that's to be expected for such a popular destination.",
    },
    {
      id: 3,
      name: "Michael T.",
      date: "2025-03-05",
      rating: 5,
      comment:
        "One of the highlights of our trip! The entire experience was smooth from booking to completion. Our guide was knowledgeable and made sure everyone had a great time.",
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (newRating) => {
    setReviewForm((prev) => ({ ...prev, rating: newRating }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessMessage(true);

      // Reset form
      setReviewForm({
        name: "",
        email: "",
        rating: 5,
        comment: "",
      });

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    }, 1500);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-gray-800">
        Reviews ({totalReviews})
      </h2>

      {/* Overall rating */}
      <div className="p-6 mb-8 bg-gray-50 rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="flex items-center mb-4 md:mb-0 md:mr-8">
            <div className="mr-4 text-5xl font-bold text-primary-600">
              {rating.toFixed(1)}
            </div>
            <div>
              <div className="flex items-center mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar
                    key={star}
                    className={`${
                      star <= rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    } w-5 h-5`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600">
                {totalReviews} reviews
              </div>
            </div>
          </div>

          <div className="grid flex-grow grid-cols-2 gap-2 md:grid-cols-5">
            {[5, 4, 3, 2, 1].map((star) => {
              // Calculate percentage (using mock data)
              const percentage =
                star === 5
                  ? 70
                  : star === 4
                  ? 20
                  : star === 3
                  ? 8
                  : star === 2
                  ? 2
                  : 0;

              return (
                <div key={star} className="flex items-center text-sm">
                  <span className="mr-2 text-gray-600">{star}</span>
                  <FiStar className="w-4 h-4 mr-2 text-yellow-400 fill-current" />
                  <div className="flex-grow h-2 overflow-hidden bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-yellow-400"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-xs text-gray-600">
                    {percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Review list */}
      <div className="mb-12 space-y-6">
        {reviews.map((review) => (
          <motion.div
            key={review.id}
            className="pb-6 border-b border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center mb-2">
              <div className="flex items-center justify-center w-10 h-10 mr-3 text-gray-600 bg-gray-200 rounded-full">
                <FiUser size={20} />
              </div>
              <div>
                <div className="font-medium text-gray-900">{review.name}</div>
                <div className="flex items-center text-sm text-gray-500">
                  <FiCalendar className="mr-1" size={14} />
                  {formatDate(review.date)}
                </div>
              </div>
            </div>

            <div className="flex items-center mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={`${
                    star <= review.rating
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  } w-4 h-4`}
                />
              ))}
            </div>

            <p className="text-gray-700">{review.comment}</p>
          </motion.div>
        ))}
      </div>

      {/* Write a review */}
      <div className="p-6 bg-gray-50 rounded-xl">
        <h3 className="flex items-center mb-4 text-lg font-bold text-gray-900">
          <FiMessageSquare className="mr-2" />
          Write a Review
        </h3>

        {showSuccessMessage ? (
          <motion.div
            className="p-4 mb-4 text-green-800 rounded-lg bg-green-50"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            Thank you for your review! It will be published after moderation.
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={reviewForm.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  Your Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={reviewForm.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Your Rating
              </label>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-1 focus:outline-none"
                    onClick={() => handleRatingChange(star)}
                  >
                    <FiStar
                      className={`${
                        star <= reviewForm.rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      } w-6 h-6 transition-colors hover:text-yellow-400`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="comment"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Your Review
              </label>
              <textarea
                id="comment"
                name="comment"
                rows="4"
                required
                value={reviewForm.comment}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Share your experience with this activity..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                isSubmitting
                  ? "bg-primary-400 cursor-not-allowed"
                  : "bg-primary-600 hover:bg-primary-700"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 -ml-1 text-white animate-spin"
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
                  Submitting...
                </span>
              ) : (
                "Submit Review"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
