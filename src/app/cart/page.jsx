"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiShoppingCart,
  FiMapPin,
  FiCreditCard,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
  paymentMethodService,
  transactionService,
  promoService,
} from "@/lib/api";
import CartItem from "@/components/cart/cart-item";
import EmptyCart from "@/components/cart/empty-cart";
import { toast } from "react-toastify";

export default function CartPage() {
  const {
    cartItems,
    loading: cartLoading,
    getCartTotals,
    isEmpty,
    fetchCartItems,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [validPromos, setValidPromos] = useState({});
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !cartLoading) {
      router.push("/login");
    }
  }, [isAuthenticated, cartLoading, router]);

  // Fetch payment methods and promos
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch payment methods
        const paymentResponse = await paymentMethodService.getAll();
        const methods = paymentResponse?.data?.data || [];
        setPaymentMethods(methods);
        if (methods.length > 0) {
          setSelectedPaymentMethod(methods[0].id);
        }

        // Fetch available promos for validation
        const promoResponse = await promoService.getAll();
        const promos = promoResponse?.data?.data || [];

        // Create a map of promo codes to discount values
        const promoMap = {};
        promos.forEach((promo) => {
          if (promo.promo_code && promo.promo_discount_price) {
            promoMap[promo.promo_code.toUpperCase()] = {
              discount: promo.promo_discount_price,
              minPurchase: promo.minimum_claim_price || 0,
            };
          }
        });

        // Add our test promo code
        promoMap["TRAVEL10"] = {
          discount: 0.1, // 10%
          isPercentage: true,
          minPurchase: 0,
        };

        setValidPromos(promoMap);
        console.log("Available promos:", promoMap);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load payment options. Please refresh the page.");
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // Get cart totals
  const { totalItems, subtotal } = getCartTotals();

  // Make sure subtotal is valid
  const validSubtotal = !isNaN(subtotal) ? subtotal : 0;

  // Calculate final amounts
  const taxAmount = validSubtotal * 0.1; // 10% tax
  const totalAmount = validSubtotal + taxAmount - promoDiscount;

  // Handle apply promo code
  const handleApplyPromoCode = (e) => {
    e.preventDefault();

    if (!promoCode) {
      toast.error("Please enter a promo code");
      return;
    }

    console.log("Attempting to apply promo code:", promoCode);

    const upperCasePromo = promoCode.toUpperCase();
    const promoInfo = validPromos[upperCasePromo];

    if (promoInfo) {
      // Check if minimum purchase requirement is met
      if (validSubtotal < promoInfo.minPurchase) {
        toast.error(
          `This promo requires a minimum purchase of Rp ${promoInfo.minPurchase.toLocaleString(
            "id-ID"
          )}`
        );
        setPromoDiscount(0);
        return;
      }

      // Calculate discount
      let discount = 0;
      if (promoInfo.isPercentage) {
        // Percentage-based discount
        discount = validSubtotal * promoInfo.discount;
      } else {
        // Fixed amount discount
        discount = promoInfo.discount;
      }

      setPromoDiscount(discount);
      toast.success(
        `Promo code applied! Discount: Rp ${discount.toLocaleString("id-ID")}`
      );
    } else {
      setPromoDiscount(0);
      toast.error('Invalid promo code. Try "TRAVEL10" for 10% off.');
    }
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (!selectedPaymentMethod) {
      setCheckoutError("Please select a payment method");
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      setCheckoutError("Your cart is empty");
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      // Extract cart IDs safely
      const cartIds = cartItems.map((item) => item?.id).filter(Boolean);

      if (cartIds.length === 0) {
        throw new Error("No valid items in cart");
      }

      // Create transaction data
      const transactionData = {
        cartIds,
        paymentMethodId: selectedPaymentMethod,
      };

      // Add promo if applicable
      if (promoDiscount > 0 && promoCode) {
        transactionData.promoCode = promoCode;
        transactionData.promoDiscount = promoDiscount;
      }

      console.log("Sending transaction data:", transactionData);

      const response = await transactionService.create(transactionData);
      console.log("Transaction created:", response.data);

      // Refresh cart
      await fetchCartItems();

      // Redirect to transaction detail
      if (response.data?.data?.id) {
        router.push(`/transaction/${response.data.data.id}`);
      } else {
        router.push("/transaction");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setCheckoutError(
        error.response?.data?.message ||
          error.message ||
          "Failed to process your order. Please try again."
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-bold animate-pulse text-primary-600">
          Loading your cart...
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return <EmptyCart />;
  }

  return (
    <div className="py-20 bg-gray-50">
      <div className="px-4 pt-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/activity"
            className="flex items-center text-gray-600 transition-colors hover:text-primary-600"
          >
            <FiArrowLeft className="mr-2" /> Continue Shopping
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-900 font-heading">
            Your Shopping Cart
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItems &&
                cartItems.map((item, index) => (
                  <CartItem key={item.id || index} item={item} index={index} />
                ))}
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <motion.div
              className="sticky p-6 bg-white shadow-sm rounded-xl top-28"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                Order Summary
              </h2>

              <div className="mb-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Subtotal ({totalItems} items)
                  </span>
                  <span className="font-medium text-gray-800">
                    Rp {validSubtotal.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-medium text-gray-800">
                    Rp {taxAmount.toLocaleString("id-ID")}
                  </span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Promo Discount</span>
                    <span>- Rp {promoDiscount.toLocaleString("id-ID")}</span>
                  </div>
                )}
                <div className="pt-3 mt-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      Total
                    </span>
                    <span className="text-lg font-bold text-primary-600">
                      Rp {totalAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Promo code */}
              <form onSubmit={handleApplyPromoCode} className="mb-6">
                <div className="flex">
                  <input
                    type="text"
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-white transition-colors rounded-r-lg bg-primary-600 hover:bg-primary-700"
                  >
                    Apply
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Try "TRAVEL10" for 10% off your order
                </p>
              </form>

              {/* Payment methods */}
              <div className="mb-6">
                <h3 className="mb-3 font-medium text-gray-800">
                  Payment Method
                </h3>
                <div className="space-y-2">
                  {paymentMethods.length > 0 ? (
                    paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedPaymentMethod === method.id
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={selectedPaymentMethod === method.id}
                          onChange={() => setSelectedPaymentMethod(method.id)}
                          className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                        />
                        <div className="flex items-center ml-3">
                          <img
                            src={
                              method.imageUrl ||
                              "/images/placeholders/payment-placeholder.jpg"
                            }
                            alt={method.name}
                            className="object-contain w-10 h-6 mr-2"
                          />
                          <span className="text-gray-700">{method.name}</span>
                        </div>
                      </label>
                    ))
                  ) : (
                    <div className="p-3 text-sm italic text-gray-500 border border-gray-200 rounded-lg">
                      No payment methods available
                    </div>
                  )}
                </div>
              </div>

              {/* Checkout error */}
              {checkoutError && (
                <div className="flex items-start p-3 mb-4 text-red-800 rounded-lg bg-red-50">
                  <FiAlertCircle className="mt-0.5 mr-2 flex-shrink-0" />
                  <span>{checkoutError}</span>
                </div>
              )}

              {/* Checkout button */}
              <button
                onClick={handleCheckout}
                disabled={
                  isCheckingOut ||
                  !cartItems ||
                  cartItems.length === 0 ||
                  !selectedPaymentMethod
                }
                className={`w-full flex items-center justify-center py-3 px-4 rounded-xl text-white font-medium transition-colors ${
                  isCheckingOut ||
                  !cartItems ||
                  cartItems.length === 0 ||
                  !selectedPaymentMethod
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-primary-600 hover:bg-primary-700"
                }`}
              >
                {isCheckingOut ? (
                  <>
                    <svg
                      className="w-5 h-5 mr-3 -ml-1 text-white animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <FiCreditCard className="mr-2" />
                    Proceed to Checkout
                  </>
                )}
              </button>

              {/* Security note */}
              <div className="flex items-center justify-center mt-4 text-xs text-gray-500">
                <FiCheck className="mr-1 text-green-500" />
                <span>Secure checkout. Your data is protected.</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
