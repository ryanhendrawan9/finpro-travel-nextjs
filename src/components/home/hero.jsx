"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiSearch, FiMapPin, FiCalendar, FiUsers } from "react-icons/fi";

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(1);
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();

    if (searchQuery) queryParams.append("q", searchQuery);
    if (location) queryParams.append("location", location);
    if (date) queryParams.append("date", date);
    if (guests) queryParams.append("guests", guests);

    router.push(`/search?${queryParams.toString()}`);
  };

  const heroVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.2,
        duration: 0.6,
      },
    },
  };

  const formVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        delay: 0.4,
        duration: 0.6,
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <motion.div
      className="relative h-[100vh] bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80')",
      }}
      variants={heroVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Hero content */}
      <div className="relative flex flex-col items-center justify-center h-full px-4 text-white md:px-8 lg:px-16">
        <h1 className="mb-6 text-4xl font-bold text-center md:text-5xl lg:text-6xl font-heading">
          Discover Your Next Adventure
        </h1>
        <p className="max-w-3xl mb-12 text-lg text-center text-gray-100 md:text-xl">
          Explore extraordinary destinations, create unforgettable memories, and
          experience the world like never before!
        </p>

        {/* Search form */}
        <motion.div
          className="w-full max-w-5xl p-4 bg-white shadow-xl rounded-2xl md:p-6"
          variants={formVariants}
        >
          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-4 md:flex-row"
          >
            <div className="flex-1">
              <label className="block mb-1 text-sm text-gray-700">
                What are you looking for?
              </label>
              <div className="relative">
                <FiSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Activities, attractions, or experiences"
                  className="w-full py-3 pl-10 pr-4 text-gray-700 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="md:w-52">
              <label className="block mb-1 text-sm text-gray-700">Where</label>
              <div className="relative">
                <FiMapPin className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Destination"
                  className="w-full py-3 pl-10 pr-4 text-gray-700 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="md:w-48">
              <label className="block mb-1 text-sm text-gray-700">When</label>
              <div className="relative">
                <FiCalendar className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="date"
                  className="w-full py-3 pl-10 pr-4 text-gray-700 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="md:w-36">
              <label className="block mb-1 text-sm text-gray-700">Guests</label>
              <div className="relative">
                <FiUsers className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="number"
                  min="1"
                  className="w-full py-3 pl-10 pr-4 text-gray-700 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <div className="mt-auto md:self-end">
              <button
                type="submit"
                className="w-full px-8 py-3 font-medium text-white transition-colors duration-300 md:w-auto bg-primary-600 hover:bg-primary-700 rounded-xl"
              >
                Search
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}
