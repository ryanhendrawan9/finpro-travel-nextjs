"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiStar } from "react-icons/fi";

// Sample testimonials data - in a real app this would come from an API
const TESTIMONIALS = [
  {
    id: 1,
    name: "Sarah Johnson",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    title: "Travel Enthusiast",
    content:
      "The service was exceptional! I found amazing activities for my family vacation and the booking process was seamless. Will definitely use this platform again for all our future trips.",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael Chen",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    title: "Adventure Seeker",
    content:
      "I was able to discover hidden gems that I wouldn't have found otherwise. The detailed descriptions and genuine reviews helped me make the right choices for my adventure trip.",
    rating: 4,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    title: "Solo Traveler",
    content:
      "As a solo traveler, safety is my top priority. This platform provided all the information I needed to feel secure about my bookings. The customer support team was also incredibly helpful.",
    rating: 5,
  },
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  const currentTestimonial = TESTIMONIALS[activeIndex];

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-heading mb-4">
          What Our Travelers Say
        </h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Read the experiences of travelers who have used our platform to
          discover and book their dream activities
        </p>
      </div>

      <div className="relative max-w-4xl mx-auto">
        <div className="absolute top-1/2 -translate-y-1/2 left-4 z-10">
          <button
            onClick={prevTestimonial}
            className="p-2 rounded-full bg-white text-gray-700 hover:bg-gray-100 shadow-md transition-colors"
            aria-label="Previous testimonial"
          >
            <FiChevronLeft size={24} />
          </button>
        </div>

        <div className="absolute top-1/2 -translate-y-1/2 right-4 z-10">
          <button
            onClick={nextTestimonial}
            className="p-2 rounded-full bg-white text-gray-700 hover:bg-gray-100 shadow-md transition-colors"
            aria-label="Next testimonial"
          >
            <FiChevronRight size={24} />
          </button>
        </div>

        <motion.div
          key={currentTestimonial.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-md p-8 md:p-12"
        >
          <div className="flex flex-col items-center">
            <img
              src={currentTestimonial.avatar}
              alt={currentTestimonial.name}
              className="w-20 h-20 rounded-full object-cover mb-6"
            />

            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={
                    i < currentTestimonial.rating
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }
                  size={20}
                />
              ))}
            </div>

            <blockquote className="text-center text-gray-700 text-lg md:text-xl italic mb-6">
              "{currentTestimonial.content}"
            </blockquote>

            <div className="text-center">
              <div className="font-bold text-gray-900">
                {currentTestimonial.name}
              </div>
              <div className="text-sm text-gray-600">
                {currentTestimonial.title}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex justify-center mt-6 space-x-2">
          {TESTIMONIALS.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "bg-primary-600 w-6"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
