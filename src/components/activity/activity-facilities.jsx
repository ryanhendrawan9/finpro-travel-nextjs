"use client";

import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";

export default function ActivityFacilities({ facilities }) {
  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-gray-800">
        Facilities & Services
      </h2>

      {facilities ? (
        <div
          className="prose text-gray-700 prose-li:marker:text-primary-500 max-w-none"
          dangerouslySetInnerHTML={{ __html: facilities }}
        />
      ) : (
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-center">
            <FiCheck className="mr-2 text-primary-500" />
            <span>Accessible facilities</span>
          </li>
          <li className="flex items-center">
            <FiCheck className="mr-2 text-primary-500" />
            <span>Free Wi-Fi</span>
          </li>
          <li className="flex items-center">
            <FiCheck className="mr-2 text-primary-500" />
            <span>Restrooms</span>
          </li>
          <li className="flex items-center">
            <FiCheck className="mr-2 text-primary-500" />
            <span>Food & beverages</span>
          </li>
        </ul>
      )}
    </div>
  );
}
