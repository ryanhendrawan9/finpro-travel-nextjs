// src/app/transaction/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiClock,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiUpload,
  FiDownload,
  FiInfo,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { transactionService } from "@/lib/api";
import { toast } from "react-toastify";

export default function TransactionDetailPage({ params }) {
  const { id } = params;
  const [transaction, setTransaction] = useState(null);
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [proofPaymentUrl, setProofPaymentUrl] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  // Fetch transaction data
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await transactionService.getById(id);
        console.log("Transaction data received:", response.data.data);

        const transactionData = response.data.data;

        // Calculate amount from items if needed
        if (!transactionData.amount || transactionData.amount === 0) {
          console.log(
            "Transaction amount missing or zero, calculating from cart items"
          );

          if (transactionData.cart && transactionData.cart.length > 0) {
            let calculatedTotal = 0;

            transactionData.cart.forEach((item) => {
              if (item.activity) {
                const price =
                  item.activity.price_discount || item.activity.price || 0;
                const quantity = item.quantity || 1;
                const itemTotal = parseInt(price) * parseInt(quantity);
                calculatedTotal += itemTotal;
                console.log(
                  `Item: ${item.activity.title}, Price: ${price}, Qty: ${quantity}, Total: ${itemTotal}`
                );
              }
            });

            console.log("Total calculated from items:", calculatedTotal);

            // Set the calculated amount for display
            setCalculatedAmount(calculatedTotal);

            // Update transaction data with calculated amount
            if (calculatedTotal > 0) {
              transactionData.amount = calculatedTotal;
            }
          }
        }

        setTransaction(transactionData);
        setProofPaymentUrl(transactionData?.proofPaymentUrl || "");
      } catch (err) {
        console.error("Error fetching transaction:", err);
        setError("Failed to load transaction details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id && isAuthenticated) {
      fetchTransaction();
    }
  }, [id, isAuthenticated]);

  // Handle proof payment upload
  const handleProofPaymentSubmit = async (e) => {
    e.preventDefault();

    if (!proofPaymentUrl) {
      setUploadError("Please enter a valid payment proof URL");
      return;
    }

    setUploadLoading(true);
    setUploadError(null);

    try {
      await transactionService.updateProofPayment(id, { proofPaymentUrl });

      // Refresh transaction data
      const response = await transactionService.getById(id);
      setTransaction(response.data.data);

      toast.success("Payment proof uploaded successfully!");
    } catch (err) {
      console.error("Error uploading proof payment:", err);
      setUploadError("Failed to upload payment proof. Please try again.");
    } finally {
      setUploadLoading(false);
    }
  };

  // Format date safely
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      return new Date(dateString).toLocaleDateString("en-US", options);
    } catch (e) {
      console.error("Date formatting error:", e);
      return "Invalid date";
    }
  };

  // Safely format currency
  const formatCurrency = (value) => {
    // If value is missing but we have a calculated amount, use that
    if (
      (value === undefined || value === null || value === 0) &&
      calculatedAmount > 0
    ) {
      return `Rp ${calculatedAmount.toLocaleString("id-ID")}`;
    }

    if (value === undefined || value === null) {
      return "Rp 0";
    }

    try {
      // Parse to float if it's a string
      const numValue = typeof value === "string" ? parseFloat(value) : value;
      return `Rp ${numValue.toLocaleString("id-ID")}`;
    } catch (e) {
      console.error("Currency formatting error:", e, "Value:", value);
      return "Rp 0";
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    if (!status) return "text-gray-600 bg-gray-100";

    switch (status) {
      case "waiting-for-payment":
        return "text-yellow-600 bg-yellow-100";
      case "waiting-for-confirmation":
        return "text-blue-600 bg-blue-100";
      case "success":
        return "text-green-600 bg-green-100";
      case "failed":
      case "canceled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    if (!status) return <FiInfo className="mr-2" />;

    switch (status) {
      case "waiting-for-payment":
        return <FiClock className="mr-2" />;
      case "waiting-for-confirmation":
        return <FiInfo className="mr-2" />;
      case "success":
        return <FiCheckCircle className="mr-2" />;
      case "failed":
      case "canceled":
        return <FiXCircle className="mr-2" />;
      default:
        return <FiInfo className="mr-2" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-bold animate-pulse text-primary-600">
          Loading transaction details...
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="mb-4 text-2xl font-bold text-red-600">
          {error || "Transaction not found"}
        </div>
        <button
          onClick={() => router.push("/transaction")}
          className="flex items-center px-6 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
        >
          <FiArrowLeft className="mr-2" /> Back to Transactions
        </button>
      </div>
    );
  }

  const {
    id: transactionId,
    amount,
    status,
    createdAt,
    updatedAt,
    proofPaymentUrl: currentProofUrl,
    paymentMethod,
    cart,
    promoDiscount,
    promoCode,
  } = transaction;

  const statusClass = getStatusColor(status);
  const StatusIcon = getStatusIcon(status);

  // Calculate display amount (use either transaction amount or calculated amount)
  const displayAmount = amount || calculatedAmount;

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-4xl px-4 pt-8 mx-auto sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/transaction"
            className="flex items-center text-gray-600 transition-colors hover:text-primary-600"
          >
            <FiArrowLeft className="mr-2" /> Back to Transactions
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-900 font-heading">
            Transaction Details
          </h1>
        </div>

        <motion.div
          className="overflow-hidden bg-white shadow-md rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Transaction header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col justify-between md:flex-row md:items-center">
              <div>
                <p className="text-sm text-gray-500">Transaction ID</p>
                <p className="font-medium text-gray-800">
                  {transactionId || "N/A"}
                </p>
              </div>
              <div className="mt-2 md:mt-0">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}
                >
                  {StatusIcon} {status || "Unknown"}
                </span>
              </div>
            </div>
          </div>

          {/* Transaction details */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-900">
                  Transaction Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-1/3 text-sm text-gray-500">Amount</div>
                    <div className="w-2/3 font-medium text-gray-900">
                      {formatCurrency(displayAmount)}
                    </div>
                  </div>

                  {promoCode && promoDiscount > 0 && (
                    <div className="flex items-start">
                      <div className="w-1/3 text-sm text-gray-500">
                        Promo Applied
                      </div>
                      <div className="w-2/3">
                        <span className="font-medium text-green-600">
                          {promoCode}
                        </span>
                        <span className="ml-2 text-green-600">
                          (-{formatCurrency(promoDiscount)})
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start">
                    <div className="w-1/3 text-sm text-gray-500">
                      Payment Method
                    </div>
                    <div className="w-2/3 font-medium text-gray-900">
                      {paymentMethod?.name || "Not specified"}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-1/3 text-sm text-gray-500">
                      Transaction Date
                    </div>
                    <div className="flex items-center w-2/3 font-medium text-gray-900">
                      <FiCalendar className="mr-2 text-gray-400" />
                      {formatDate(createdAt)}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-1/3 text-sm text-gray-500">
                      Last Updated
                    </div>
                    <div className="w-2/3 font-medium text-gray-900">
                      {formatDate(updatedAt)}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-900">
                  Payment Information
                </h3>
                {status === "waiting-for-payment" ? (
                  <div className="p-4 mb-4 border border-yellow-200 rounded-lg bg-yellow-50">
                    <div className="flex items-start">
                      <FiInfo className="text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-yellow-800">
                          Payment Instructions
                        </h4>
                        <p className="mt-1 text-sm text-yellow-700">
                          Please complete your payment within 24 hours. After
                          making the payment, upload your payment proof below.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {paymentMethod && (
                  <div className="p-4 mb-4 rounded-lg bg-gray-50">
                    <div className="flex items-center mb-2">
                      {paymentMethod.imageUrl && (
                        <img
                          src={paymentMethod.imageUrl}
                          alt={paymentMethod.name}
                          className="h-8 mr-3"
                        />
                      )}
                      <h4 className="font-medium text-gray-800">
                        {paymentMethod.name}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Account Number:{" "}
                      <span className="font-medium">1234-5678-9012-3456</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Account Name:{" "}
                      <span className="font-medium">TravelBright</span>
                    </p>
                  </div>
                )}

                {/* Payment proof upload */}
                {(status === "waiting-for-payment" ||
                  status === "waiting-for-confirmation") && (
                  <form onSubmit={handleProofPaymentSubmit}>
                    <div className="mb-3">
                      <label
                        htmlFor="proofPaymentUrl"
                        className="block mb-1 text-sm font-medium text-gray-700"
                      >
                        Payment Proof URL
                      </label>
                      <input
                        type="url"
                        id="proofPaymentUrl"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="https://example.com/payment-proof.jpg"
                        value={proofPaymentUrl}
                        onChange={(e) => setProofPaymentUrl(e.target.value)}
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Upload your payment proof to an image hosting service
                        and paste the URL here
                      </p>
                    </div>

                    {uploadError && (
                      <div className="mb-3 text-sm text-red-600">
                        {uploadError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={uploadLoading}
                      className={`flex items-center justify-center w-full py-2 px-4 rounded-lg text-white font-medium transition-colors ${
                        uploadLoading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-primary-600 hover:bg-primary-700"
                      }`}
                    >
                      {uploadLoading ? (
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
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FiUpload className="mr-2" />
                          Upload Payment Proof
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Current proof payment */}
                {currentProofUrl && (
                  <div className="mt-4">
                    <p className="mb-1 text-sm font-medium text-gray-700">
                      Payment Proof
                    </p>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="truncate max-w-[200px]">
                        {currentProofUrl}
                      </div>
                      <a
                        href={currentProofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center ml-2 text-primary-600 hover:text-primary-700"
                      >
                        <FiDownload className="mr-1" />
                        View
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transaction items */}
          <div className="px-6 py-6 border-t border-gray-200">
            <h3 className="mb-4 text-lg font-medium text-gray-900">
              Items ({cart?.length || 0})
            </h3>

            <div className="space-y-4">
              {cart &&
                cart.map((item) => {
                  // Safely calculate price
                  const itemPrice =
                    item.activity?.price_discount || item.activity?.price || 0;
                  const quantity = item.quantity || 1;
                  const totalPrice = itemPrice * quantity;

                  return (
                    <div
                      key={item.id || Math.random().toString(36).substring(7)}
                      className="flex flex-col py-3 border-b border-gray-100 md:flex-row md:items-center"
                    >
                      <div className="w-full h-32 mb-3 overflow-hidden rounded-lg md:w-16 md:h-16 md:mb-0 md:mr-4">
                        <img
                          src={
                            item.activity?.imageUrls?.[0] ||
                            "/images/placeholders/activity-placeholder.jpg"
                          }
                          alt={item.activity?.title || "Activity"}
                          className="object-cover w-full h-full"
                        />
                      </div>

                      <div className="flex-grow">
                        <h4 className="font-medium text-gray-900">
                          {item.activity?.title || "Unnamed Activity"}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {item.activity?.city ? `${item.activity.city}, ` : ""}
                          {item.activity?.province || ""}
                        </p>
                      </div>

                      <div className="mt-2 text-right md:mt-0">
                        <p className="text-sm text-gray-500">
                          Quantity: {quantity}
                        </p>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(totalPrice)}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            {status === "waiting-for-payment" && (
              <div className="flex justify-between">
                <button
                  className="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-100"
                  onClick={() => {
                    if (
                      confirm(
                        "Are you sure you want to cancel this transaction?"
                      )
                    ) {
                      transactionService.cancel(id).then(() => {
                        router.push("/transaction");
                      });
                    }
                  }}
                >
                  Cancel Transaction
                </button>
                <Link
                  href="/cart"
                  className="px-4 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
                >
                  Back to Cart
                </Link>
              </div>
            )}

            {status === "success" && (
              <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                <div className="flex items-start">
                  <FiCheckCircle className="text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-green-800">
                      Payment Completed
                    </h4>
                    <p className="mt-1 text-sm text-green-700">
                      Your transaction has been successfully completed. Thank
                      you for your purchase!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {status === "failed" && (
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-start">
                  <FiXCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-red-800">Payment Failed</h4>
                    <p className="mt-1 text-sm text-red-700">
                      Your transaction has failed. Please try again or contact
                      customer support for assistance.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {status === "canceled" && (
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-start">
                  <FiXCircle className="text-gray-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-800">
                      Transaction Canceled
                    </h4>
                    <p className="mt-1 text-sm text-gray-700">
                      This transaction has been canceled. You can make a new
                      purchase from our activities page.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
