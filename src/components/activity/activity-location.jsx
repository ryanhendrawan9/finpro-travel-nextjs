"use client";

import { motion } from "framer-motion";
import { FiMapPin } from "react-icons/fi";

export default function ActivityLocation({ address, locationMaps }) {
  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-gray-800">Location</h2>

      <div className="flex items-start mb-4">
        <FiMapPin className="flex-shrink-0 mt-1 mr-2 text-primary-500" />
        <p className="text-gray-700">{address}</p>
      </div>

      <div className="mt-4 rounded-xl overflow-hidden h-[400px] shadow-md">
        {locationMaps ? (
          <div
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: locationMaps }}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-200">
            <p className="text-gray-500">Map not available</p>
          </div>
        )}
      </div>
    </div>
  );
}
