"use client";

import { useState } from "react";
import { FiX, FiArrowLeft, FiDownload } from "react-icons/fi";

export default function ImageViewer({
  imageUrl,
  onClose,
  title = "Image Viewer",
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle download
  const handleDownload = () => {
    // Create a temporary link and simulate click to download the image
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "payment-proof.jpg"; // Default name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black bg-opacity-90">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <button
          onClick={onClose}
          className="flex items-center p-2 transition-colors rounded-full hover:bg-white hover:bg-opacity-20"
          aria-label="Back"
        >
          <FiArrowLeft size={24} />
          <span className="ml-2">{title}</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownload}
            className="p-2 transition-colors rounded-full hover:bg-white hover:bg-opacity-20"
            aria-label="Download"
          >
            <FiDownload size={24} />
          </button>

          <button
            onClick={onClose}
            className="p-2 transition-colors rounded-full hover:bg-white hover:bg-opacity-20"
            aria-label="Close"
          >
            <FiX size={24} />
          </button>
        </div>
      </div>

      {/* Image container */}
      <div className="flex items-center justify-center flex-grow p-4">
        <div
          className={`relative max-h-full ${
            isFullscreen ? "w-full" : "max-w-4xl"
          }`}
        >
          <img
            src={imageUrl}
            alt="Enlarged view"
            className="object-contain w-full h-full mx-auto"
            onClick={() => setIsFullscreen(!isFullscreen)}
            style={{ cursor: "zoom-in" }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/images/placeholders/payment-placeholder.jpg";
            }}
          />
        </div>
      </div>
    </div>
  );
}
