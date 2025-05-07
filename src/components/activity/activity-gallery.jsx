"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";

export default function ActivityGallery({
  images = [],
  title = "Activity Images",
}) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Use placeholder if no images
  const galleryImages =
    images && images.length > 0
      ? images
      : ["/images/placeholders/activity-placeholder.jpg"];

  const openLightbox = (index) => {
    setSelectedImageIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "auto";
  };

  const goToPreviousImage = (e) => {
    e.stopPropagation();
    setSelectedImageIndex((prevIndex) =>
      prevIndex === 0 ? galleryImages.length - 1 : prevIndex - 1
    );
  };

  const goToNextImage = (e) => {
    e.stopPropagation();
    setSelectedImageIndex((prevIndex) =>
      prevIndex === galleryImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <>
      <div className="grid grid-cols-12 gap-4 h-[30rem]">
        {/* Main image */}
        <div
          className="h-full col-span-12 overflow-hidden cursor-pointer md:col-span-8 rounded-2xl"
          onClick={() => openLightbox(0)}
        >
          <img
            src={galleryImages[0]}
            alt={`${title} - Main Image`}
            className="object-cover w-full h-full transition-transform duration-700 hover:scale-105"
          />
        </div>

        {/* Side images */}
        <div className="hidden h-full grid-rows-2 gap-4 md:grid md:col-span-4">
          {galleryImages.slice(1, 3).map((image, index) => (
            <div
              key={index}
              className="overflow-hidden cursor-pointer rounded-2xl"
              onClick={() => openLightbox(index + 1)}
            >
              <img
                src={image}
                alt={`${title} - Image ${index + 2}`}
                className="object-cover w-full h-full transition-transform duration-700 hover:scale-105"
              />
            </div>
          ))}

          {/* Show more button if there are more than 3 images */}
          {galleryImages.length > 3 && (
            <div
              className="absolute px-4 py-2 transition-colors rounded-lg cursor-pointer bottom-4 right-4 bg-white/80 backdrop-blur-sm hover:bg-white"
              onClick={() => openLightbox(3)}
            >
              <span className="font-medium text-gray-800">
                +{galleryImages.length - 3} more
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
            onClick={closeLightbox}
          >
            <button
              className="absolute p-2 text-white rounded-full top-4 right-4 bg-black/50"
              onClick={closeLightbox}
            >
              <FiX size={24} />
            </button>

            <div className="flex items-center justify-center w-full h-full">
              {/* Previous button */}
              <button
                className="absolute p-3 text-white rounded-full left-4 bg-black/50"
                onClick={goToPreviousImage}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>

              {/* Image */}
              <motion.img
                key={selectedImageIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                src={galleryImages[selectedImageIndex]}
                alt={`${title} - Image ${selectedImageIndex + 1}`}
                className="max-h-[90vh] max-w-[90vw] object-contain"
                onClick={(e) => e.stopPropagation()}
              />

              {/* Next button */}
              <button
                className="absolute p-3 text-white rounded-full right-4 bg-black/50"
                onClick={goToNextImage}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>

            {/* Image counter */}
            <div className="absolute px-4 py-2 text-white transform -translate-x-1/2 rounded-lg bottom-4 left-1/2 bg-black/50">
              {selectedImageIndex + 1} / {galleryImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
