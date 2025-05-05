"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

export default function CallToAction() {
  return (
    <div className="relative overflow-hidden rounded-3xl">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 opacity-90"></div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto text-center py-16 px-4">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-white font-heading mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Ready for Your Next Adventure?
        </motion.h2>

        <motion.p
          className="text-white/90 text-lg mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          Discover amazing destinations, create unforgettable memories, and
          experience the journey of a lifetime. Start planning your dream trip
          today!
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Link
            href="/activity"
            className="bg-white text-primary-600 hover:bg-white/90 px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
          >
            Explore Activities <FiArrowRight className="ml-2" />
          </Link>

          <Link
            href="/contact"
            className="bg-transparent text-white border border-white hover:bg-white/10 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Contact Us
          </Link>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3"></div>
    </div>
  );
}
