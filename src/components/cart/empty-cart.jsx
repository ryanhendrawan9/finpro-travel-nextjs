"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FiShoppingCart, FiArrowRight } from "react-icons/fi";

export default function EmptyCart() {
  return (
    <div className="min-h-screen py-20 bg-gray-50">
      <div className="max-w-3xl px-4 pt-16 pb-24 mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-8 bg-white shadow-sm rounded-3xl md:p-16"
        >
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-primary-100">
            <FiShoppingCart className="w-10 h-10 text-primary-600" />
          </div>

          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            Your Cart is Empty
          </h2>
          <p className="max-w-md mx-auto mb-8 text-gray-600">
            Looks like you haven't added any activities to your cart yet. Start
            exploring amazing destinations and experiences!
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/activity"
              className="inline-flex items-center px-6 py-3 text-white transition-colors bg-primary-600 hover:bg-primary-700 rounded-xl"
            >
              Browse Activities <FiArrowRight className="ml-2" />
            </Link>

            <Link
              href="/promo"
              className="inline-flex items-center px-6 py-3 text-gray-700 transition-colors border border-gray-300 hover:border-gray-400 rounded-xl"
            >
              View Promos
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
