"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { cartService } from "@/lib/api";
import { toast } from "react-toastify";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Fetch cart items when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCartItems();
    } else {
      setCartItems([]);
    }
  }, [isAuthenticated]);

  // Fetch cart items from API
  const fetchCartItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await cartService.getAll();
      setCartItems(response.data.data);
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to fetch cart items.";
      setError(message);
      console.error("Error fetching cart items:", err);
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
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cartItems.reduce((sum, item) => {
      // Use discounted price if available, otherwise use regular price
      const itemPrice = item.activity.price_discount || item.activity.price;
      return sum + itemPrice * item.quantity;
    }, 0);

    return { totalItems, subtotal };
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
        isEmpty: cartItems.length === 0,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
