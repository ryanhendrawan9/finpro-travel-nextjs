"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiMapPin,
  FiMail,
  FiPhone,
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiYoutube,
} from "react-icons/fi";

export default function Footer() {
  const footerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.2,
        duration: 0.5,
      },
    },
  };

  return (
    <motion.footer
      className="text-gray-300 bg-gray-900"
      variants={footerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {/* Main footer content */}
      <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company info */}
          <div>
            <h3 className="mb-4 text-xl font-bold text-white">TravelBright</h3>
            <p className="mb-4">
              Discover extraordinary destinations and create unforgettable
              memories with our curated travel experiences.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 transition-colors hover:text-white"
              >
                <FiFacebook size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 transition-colors hover:text-white"
              >
                <FiTwitter size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 transition-colors hover:text-white"
              >
                <FiInstagram size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 transition-colors hover:text-white"
              >
                <FiYoutube size={20} />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="transition-colors hover:text-primary-400"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/banner"
                  className="transition-colors hover:text-primary-400"
                >
                  Banners
                </Link>
              </li>
              <li>
                <Link
                  href="/category"
                  className="transition-colors hover:text-primary-400"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/activity"
                  className="transition-colors hover:text-primary-400"
                >
                  Activities
                </Link>
              </li>
              <li>
                <Link
                  href="/promo"
                  className="transition-colors hover:text-primary-400"
                >
                  Promos
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="transition-colors hover:text-primary-400"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="transition-colors hover:text-primary-400"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="transition-colors hover:text-primary-400"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="transition-colors hover:text-primary-400"
                >
                  Cancellation Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="transition-colors hover:text-primary-400"
                >
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FiMapPin className="flex-shrink-0 mt-1 mr-3 text-primary-400" />
                <span>Jl. Sudirman No. 123, Jakarta Pusat, Indonesia</span>
              </li>
              <li className="flex items-center">
                <FiPhone className="flex-shrink-0 mr-3 text-primary-400" />
                <span>+62 812 3456 7890</span>
              </li>
              <li className="flex items-center">
                <FiMail className="flex-shrink-0 mr-3 text-primary-400" />
                <span>info@travelbright.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom footer */}
      <div className="py-6 bg-gray-950">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} TravelBright. All rights
              reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <div className="flex space-x-6 text-sm text-gray-500">
                <Link
                  href="#"
                  className="transition-colors hover:text-gray-400"
                >
                  Terms
                </Link>
                <Link
                  href="#"
                  className="transition-colors hover:text-gray-400"
                >
                  Privacy
                </Link>
                <Link
                  href="#"
                  className="transition-colors hover:text-gray-400"
                >
                  Cookies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
