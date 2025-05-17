"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiSearch,
  FiMapPin,
  FiCalendar,
  FiUsers,
  FiArrowRight,
  FiStar,
  FiAward,
  FiCompass,
  FiCheck,
} from "react-icons/fi";
import OptimizedImage from "@/components/ui/optimized-image";

export default function OptimizedHero() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  // Check screen size for responsive design
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    // Set loaded state to trigger animations
    setIsLoaded(true);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();

    if (searchQuery) queryParams.append("q", searchQuery);
    if (location) queryParams.append("location", location);
    if (date) queryParams.append("date", date);
    if (guests) queryParams.append("guests", guests);

    router.push(`#`);
  };

  // Featured destinations with lower impact animations
  const destinations = [
    { name: "Bali", icon: FiCompass },
    { name: "Jakarta", icon: FiMapPin },
    { name: "Yogyakarta", icon: FiAward },
    { name: "Lombok", icon: FiStar },
    { name: "Raja Ampat", icon: FiCompass },
  ];

  // Hero background image - optimized and preloaded
  const heroBackgroundImage =
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1920&q=80";

  return (
    <div className="relative min-h-screen pt-20 overflow-hidden bg-black md:pt-20">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        {/* Preload the hero image since it's critical */}
        <OptimizedImage
          src={heroBackgroundImage}
          alt="Scenic travel destination"
          fill={true}
          priority={true}
          className="object-cover"
          sizes="100vw"
          quality={80}
        />
        <div className="absolute inset-0 bg-black/25"></div>
      </div>

      {/* Hero content */}
      <div className="relative flex flex-col items-center justify-center pt-6 md:pt-0 min-h-[calc(105vh-5rem)] px-4 text-white md:px-8 lg:px-16 z-10">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-center md:text-5xl lg:text-6xl xl:text-7xl font-heading text-shadow-lg">
          <span className="block">Discover Your Next</span>
          <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            Adventure
          </span>
        </h1>

        <p className="max-w-3xl mb-8 text-lg text-center text-white md:text-xl lg:mb-10 text-shadow">
          Explore extraordinary destinations, create unforgettable memories, and
          experience the world like never before!
        </p>

        {/* Featured tags with icons */}
        {isLoaded && (
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {destinations.map((place, index) => (
              <button
                key={place.name}
                className="flex items-center px-4 py-2 text-sm font-medium transition-colors border rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30"
                style={{
                  transitionDelay: `${index * 50}ms`,
                }}
              >
                <place.icon size={14} className="mr-2 text-blue-200" />
                {place.name}
              </button>
            ))}
          </div>
        )}

        {/* Search form - with lighter colors */}
        {isLoaded && (
          <div className="w-full max-w-5xl overflow-hidden border shadow-xl backdrop-blur-md bg-white/20 border-white/30 rounded-2xl">
            <form
              onSubmit={handleSearch}
              className={`flex flex-col ${
                isSmallScreen
                  ? "p-4 space-y-4"
                  : "p-6 md:flex-row md:items-end md:space-x-4"
              }`}
            >
              <div className={`${isSmallScreen ? "w-full" : "flex-1"}`}>
                <label className="block mb-2 text-sm font-medium text-white">
                  What are you looking for?
                </label>
                <div className="relative">
                  <FiSearch
                    className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Activities, attractions, or experiences"
                    className="w-full py-3 pl-10 pr-4 text-gray-800 placeholder-gray-500 border bg-white/90 border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search for activities"
                  />
                </div>
              </div>

              <div className={`${isSmallScreen ? "w-full" : "md:w-52"}`}>
                <label className="block mb-2 text-sm font-medium text-white">
                  Where
                </label>
                <div className="relative">
                  <FiMapPin
                    className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Destination"
                    className="w-full py-3 pl-10 pr-4 text-gray-800 placeholder-gray-500 border bg-white/90 border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    aria-label="Search destination"
                  />
                </div>
              </div>

              <div className={`${isSmallScreen ? "w-full" : "md:w-48"}`}>
                <label className="block mb-2 text-sm font-medium text-white">
                  When
                </label>
                <div className="relative">
                  <FiCalendar
                    className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
                    size={18}
                  />
                  <input
                    type="date"
                    className="w-full py-3 pl-10 pr-4 text-gray-800 placeholder-gray-500 border bg-white/90 border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    aria-label="Select date"
                  />
                </div>
              </div>

              <div className={`${isSmallScreen ? "w-full" : "md:w-36"}`}>
                <label className="block mb-2 text-sm font-medium text-white">
                  Guests
                </label>
                <div className="relative">
                  <FiUsers
                    className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
                    size={18}
                  />
                  <input
                    type="number"
                    min="1"
                    className="w-full py-3 pl-10 pr-4 text-gray-800 placeholder-gray-500 border bg-white/90 border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                    aria-label="Number of guests"
                  />
                </div>
              </div>

              <div className={`${isSmallScreen ? "w-full" : "md:self-end"}`}>
                <button
                  type="submit"
                  className="flex items-center justify-center w-full px-6 py-3 font-medium text-white transition-all border bg-gradient-to-r from-blue-600 to-indigo-700 border-blue-700/50 md:w-auto rounded-xl hover:shadow-lg hover:shadow-blue-700/20"
                >
                  <span>Search</span>
                  <FiArrowRight className="ml-2" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* IMPROVED: Compact Trusted By Section with better mobile responsiveness */}
        {isLoaded && (
          <div className="flex flex-wrap justify-center gap-2 px-2 mt-6 md:mt-8">
            {/* Rating pill */}
            <div className="flex items-center px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full border border-white/20">
              <div className="flex mr-1.5 text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar key={star} size={14} fill="currentColor" />
                ))}
              </div>
              <span className="text-xs font-medium text-white">4.8/5</span>
            </div>

            {/* Travelers count */}
            <div className="flex items-center px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full border border-white/20">
              <span className="text-xs font-medium text-white">
                3M+ travelers
              </span>
            </div>

            {/* Verified badge */}
            <div className="flex items-center px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full border border-white/20">
              <FiCheck className="w-3.5 h-3.5 mr-1 text-green-400" />
              <span className="text-xs font-medium text-white">Verified</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
