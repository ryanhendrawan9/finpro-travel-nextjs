"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import { cartService } from "@/lib/api";
import { toast } from "react-toastify";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Fetch cart items when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCartItems();
    } else {
      setCartItems([]);
      setLoading(false); // Set loading to false when not authenticated
    }
  }, [isAuthenticated]);

  // Fetch cart items from API
  const fetchCartItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await cartService.getAll();
      // Properly handle the case when data is an empty array
      const items = response?.data?.data || [];
      console.log("Fetched cart items:", items);
      setCartItems(items);
      return items; // Return the items for potential chaining
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to fetch cart items.";
      setError(message);
      console.error("Error fetching cart items:", err);
      return []; // Return empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (activityId) => {
    if (!isAuthenticated) {
      toast.info("Please log in to add items to your cart.");
      return { success: false, message: "Authentication required" };
    }

    setLoading(true);
    setError(null);
    try {
      await cartService.addToCart({ activityId });
      await fetchCartItems(); // Refresh cart items
      toast.success("Activity added to cart!");
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to add item to cart.";
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Update cart item quantity
  const updateCartItemQuantity = async (cartId, quantity) => {
    setLoading(true);
    setError(null);
    try {
      await cartService.updateCart(cartId, { quantity });
      await fetchCartItems(); // Refresh cart items
      toast.success("Cart updated successfully!");
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update cart.";
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartId) => {
    setLoading(true);
    setError(null);
    try {
      await cartService.deleteCart(cartId);
      await fetchCartItems(); // Refresh cart items
      toast.success("Item removed from cart!");
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to remove item from cart.";
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Calculate cart totals
  const getCartTotals = () => {
    // Handle empty cart case gracefully
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      // Change log level from warn to debug or info
      if (process.env.NODE_ENV === "development") {
        console.log("Cart is empty or not loaded yet");
      }
      return { totalItems: 0, subtotal: 0 };
    }

    try {
      // Calculate total items
      const totalItems = cartItems.reduce((sum, item) => {
        if (!item) return sum;
        const qty = parseInt(item.quantity) || 1;
        return sum + qty;
      }, 0);

      // Calculate subtotal
      const subtotal = cartItems.reduce((sum, item) => {
        // Skip invalid items
        if (!item || !item.activity) return sum;

        // Get the price (use price_discount if available, otherwise regular price)
        let itemPrice = 0;
        if (item.activity.price_discount) {
          itemPrice = parseFloat(item.activity.price_discount);
        } else if (item.activity.price) {
          itemPrice = parseFloat(item.activity.price);
        }

        // Ensure we have a valid number
        if (isNaN(itemPrice)) itemPrice = 0;

        const qty = parseInt(item.quantity) || 1;
        return sum + itemPrice * qty;
      }, 0);

      return { totalItems, subtotal };
    } catch (error) {
      console.warn("Error calculating cart totals:", error);
      return { totalItems: 0, subtotal: 0 };
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        fetchCartItems,
        getCartTotals,
        isEmpty: !loading && cartItems.length === 0, // Only consider empty when not loading
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
