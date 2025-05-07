"use client";

import { motion } from "framer-motion";
import { FiTrash2, FiMinus, FiPlus } from "react-icons/fi";
import { useCart } from "@/context/CartContext";

export default function CartItem({ item, index }) {
  const { updateCartItemQuantity, removeFromCart } = useCart();

  const { id, activity, quantity } = item;

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity >= 1) {
      await updateCartItemQuantity(id, newQuantity);
    }
  };

  const handleRemove = async () => {
    await removeFromCart(id);
  };

  const itemPrice = activity.price_discount || activity.price;
  const totalPrice = itemPrice * quantity;

  return (
    <motion.div
      className="p-4 mb-4 bg-white shadow-sm rounded-xl md:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="flex flex-col items-start gap-4 md:flex-row">
        {/* Activity image */}
        <div className="w-full h-32 overflow-hidden rounded-lg md:w-48">
          <img
            src={
              activity.imageUrls?.[0] ||
              "/images/placeholders/activity-placeholder.jpg"
            }
            alt={activity.title}
            className="object-cover w-full h-full"
          />
        </div>

        {/* Activity details */}
        <div className="flex-grow">
          <h3 className="mb-1 text-lg font-bold text-gray-800">
            {activity.title}
          </h3>
          <p className="mb-2 text-sm text-gray-600">
            {activity.city}, {activity.province}
          </p>

          <div className="flex flex-col justify-between mt-4 md:flex-row md:items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <button
                className="p-2 text-gray-600 transition-colors border border-gray-300 rounded-l-lg hover:bg-gray-100"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                <FiMinus size={16} />
              </button>
              <div className="px-4 py-1 border-t border-b border-gray-300 flex items-center justify-center min-w-[40px]">
                {quantity}
              </div>
              <button
                className="p-2 text-gray-600 transition-colors border border-gray-300 rounded-r-lg hover:bg-gray-100"
                onClick={() => handleQuantityChange(quantity + 1)}
              >
                <FiPlus size={16} />
              </button>

              <button
                className="p-2 ml-4 text-red-500 transition-colors rounded-lg hover:text-red-700 hover:bg-red-50"
                onClick={handleRemove}
              >
                <FiTrash2 size={18} />
              </button>
            </div>

            <div className="text-right">
              <div className="flex flex-col">
                {activity.price_discount && (
                  <span className="text-xs text-gray-500 line-through">
                    Rp {activity.price.toLocaleString("id-ID")}
                  </span>
                )}
                <div className="flex items-center">
                  <span className="text-lg font-bold text-primary-600">
                    Rp {itemPrice.toLocaleString("id-ID")}
                  </span>
                  <span className="mx-2 text-gray-500">×</span>
                  <span className="text-gray-700">{quantity}</span>
                </div>
                <span className="mt-1 text-lg font-bold text-gray-800">
                  Rp {totalPrice.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
