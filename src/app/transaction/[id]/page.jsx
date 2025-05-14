"use client";

import { useState, useEffect, use } from "react";
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
  FiAlertCircle,
  FiDollarSign,
  FiUser,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { transactionService } from "@/lib/api";
import { toast } from "react-toastify";

export default function TransactionDetailPage({ params }) {
  const id = use(params).id;
  const [transaction, setTransaction] = useState(null);
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [proofPaymentUrl, setProofPaymentUrl] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const { isAuthenticated, user } = useAuth();
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

        let transactionData = response.data.data;

        // Handle different response structures
        // Compatibility with both response formats
        const cartItems =
          transactionData.transaction_items || transactionData.cart || [];

        // Normalize transaction items structure
        const normalizedItems = cartItems.map((item) => {
          // If item already has an activity property, use it
          if (item.activity) return item;

          // Otherwise, construct an activity object from the item itself
          return {
            id: item.id,
            quantity: item.quantity || 1,
            activity: {
              id: item.id,
              title: item.title || "Unnamed Activity",
              price: item.price || 0,
              price_discount: item.price_discount || null,
              imageUrls: Array.isArray(item.imageUrls)
                ? item.imageUrls
                : item.imageUrl
                ? [item.imageUrl]
                : [],
              description: item.description || "",
              city: item.city || "",
              province: item.province || "",
            },
          };
        });

        // Update the transaction object with the normalized items
        transactionData = {
          ...transactionData,
          cart: normalizedItems,
          // Ensure other essential fields exist
          status: transactionData.status || "pending",
          proofPaymentUrl: transactionData.proofPaymentUrl || null,
          amount: transactionData.amount || transactionData.totalAmount || 0,
          paymentMethod:
            transactionData.payment_method ||
            transactionData.paymentMethod ||
            {},
        };

        // Calculate amount from items if needed
        if (!transactionData.amount || transactionData.amount === 0) {
          let calculatedTotal = 0;

          normalizedItems.forEach((item) => {
            let price = 0;
            if (item.activity) {
              price = item.activity.price_discount || item.activity.price || 0;
            } else {
              price = item.price_discount || item.price || 0;
            }

            // Convert price to number if it's a string
            const numericPrice =
              typeof price === "string" ? parseFloat(price) : price;

            // Get quantity (default to 1)
            const quantity = parseInt(item.quantity) || 1;

            // Add to total
            calculatedTotal += numericPrice * quantity;
          });

          console.log("Calculated amount from items:", calculatedTotal);
          setCalculatedAmount(calculatedTotal);

          // Only update if we calculated something positive
          if (calculatedTotal > 0) {
            transactionData.amount = calculatedTotal;
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

      // Update transaction status
      const updatedTransaction = {
        ...transaction,
        proofPaymentUrl,
        status: "waiting-for-confirmation",
      };
      setTransaction(updatedTransaction);

      toast.success("Payment proof uploaded successfully!");
    } catch (err) {
      console.error("Error uploading proof payment:", err);
      setUploadError("Failed to upload payment proof. Please try again.");
    } finally {
      setUploadLoading(false);
    }
  };

  // Handle cancel transaction
  const handleCancelTransaction = async () => {
    if (!confirm("Are you sure you want to cancel this transaction?")) {
      return;
    }

    try {
      await transactionService.cancel(id);

      // Update transaction state
      setTransaction({ ...transaction, status: "canceled" });

      toast.success("Transaction canceled successfully");
    } catch (err) {
      console.error("Error canceling transaction:", err);
      toast.error("Failed to cancel transaction");
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

  // Get status color and icon
  const getStatusInfo = (status) => {
    if (!status) {
      return {
        color: "text-gray-600 bg-gray-100",
        icon: <FiInfo className="mr-2" />,
        text: "Unknown",
        description: "Status unknown",
      };
    }

    // Convert to lowercase to handle case inconsistencies
    const statusLower = status.toLowerCase();

    switch (statusLower) {
      case "waiting-for-payment":
      case "pending":
        return {
          color: "text-yellow-600 bg-yellow-100",
          icon: <FiClock className="mr-2" />,
          text: "Waiting for Payment",
          description:
            "Please complete your payment and upload proof of payment",
        };
      case "waiting-for-confirmation":
        return {
          color: "text-blue-600 bg-blue-100",
          icon: <FiInfo className="mr-2" />,
          text: "Waiting for Confirmation",
          description:
            "We're reviewing your payment. This may take 1-2 business days.",
        };
      case "success":
      case "completed":
        return {
          color: "text-green-600 bg-green-100",
          icon: <FiCheckCircle className="mr-2" />,
          text: "Success",
          description: "Your transaction has been completed successfully",
        };
      case "failed":
        return {
          color: "text-red-600 bg-red-100",
          icon: <FiXCircle className="mr-2" />,
          text: "Failed",
          description:
            "Your payment was not approved. Please contact support for assistance.",
        };
      case "canceled":
        return {
          color: "text-gray-600 bg-gray-100",
          icon: <FiXCircle className="mr-2" />,
          text: "Canceled",
          description: "This transaction has been canceled",
        };
      default:
        return {
          color: "text-gray-600 bg-gray-100",
          icon: <FiInfo className="mr-2" />,
          text: status,
          description: "Transaction status: " + status,
        };
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

  // Destructure with fallbacks for all fields
  const {
    id: transactionId = id,
    amount = calculatedAmount,
    status = "pending",
    createdAt,
    updatedAt,
    proofPaymentUrl: currentProofUrl = null,
    paymentMethod = {},
    cart = [],
    user: transactionUser = {},
    promoDiscount = 0,
    promoCode = null,
  } = transaction;

  const statusInfo = getStatusInfo(status);

  // Check if current user is admin
  const isAdmin = user?.role === "admin";

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
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}
                >
                  {statusInfo.icon} {statusInfo.text}
                </span>
              </div>
            </div>
          </div>

          {/* Status message */}
          <div className={`mx-6 my-4 p-4 rounded-lg ${statusInfo.color}`}>
            <div className="flex items-start">
              {statusInfo.icon}
              <div>
                <p className="font-medium">{statusInfo.text}</p>
                <p className="text-sm">{statusInfo.description}</p>
              </div>
            </div>
          </div>

          {/* Transaction details */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="flex items-center mb-4 text-lg font-bold text-gray-900">
                  <FiDollarSign className="mr-2 text-primary-600" />
                  Transaction Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-1/3 text-sm text-gray-500">Amount</div>
                    <div className="w-2/3 text-xl font-bold text-primary-600">
                      {formatCurrency(amount)}
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
                <h3 className="flex items-center mb-4 text-lg font-bold text-gray-900">
                  <FiUser className="mr-2 text-primary-600" />
                  Customer Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-1/3 text-sm text-gray-500">Name</div>
                    <div className="w-2/3 font-medium text-gray-900">
                      {transactionUser?.name || "N/A"}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-1/3 text-sm text-gray-500">Email</div>
                    <div className="w-2/3 font-medium text-gray-900">
                      {transactionUser?.email || "N/A"}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-1/3 text-sm text-gray-500">Phone</div>
                    <div className="w-2/3 font-medium text-gray-900">
                      {transactionUser?.phoneNumber || "N/A"}
                    </div>
                  </div>
                </div>

                {/* Payment proof section */}
                <div className="pt-6 mt-6 border-t border-gray-100">
                  <h4 className="mb-3 font-medium text-gray-900">
                    Payment Proof
                  </h4>

                  {currentProofUrl ? (
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
                  ) : (
                    <div className="p-3 text-sm italic text-gray-500 rounded-lg bg-gray-50">
                      No payment proof uploaded yet
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment proof upload - Only show if status is waiting for payment */}
            {(status === "waiting-for-payment" || status === "pending") && (
              <div className="p-6 mt-6 border-t border-gray-200 rounded-lg bg-gray-50">
                <h3 className="flex items-center mb-4 text-lg font-bold text-gray-900">
                  <FiUpload className="mr-2 text-primary-600" />
                  Upload Payment Proof
                </h3>

                <div className="p-4 mb-4 border border-yellow-200 rounded-lg bg-yellow-50">
                  <div className="flex items-start">
                    <FiInfo className="text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-yellow-800">
                        Payment Instructions
                      </h4>
                      <p className="mt-1 text-sm text-yellow-700">
                        Please complete your payment to the account details
                        below, then upload your payment proof.
                      </p>
                    </div>
                  </div>
                </div>

                {paymentMethod && (
                  <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      {paymentMethod.imageUrl && (
                        <img
                          src={paymentMethod.imageUrl}
                          alt={paymentMethod.name}
                          className="h-8 mr-3"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "/images/placeholders/payment-placeholder.jpg";
                          }}
                        />
                      )}
                      <h4 className="font-medium text-gray-800">
                        {paymentMethod.name}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Account Number:{" "}
                      <span className="font-medium">
                        {paymentMethod.virtual_account_number ||
                          "1234-5678-9012-3456"}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Account Name:{" "}
                      <span className="font-medium">
                        {paymentMethod.virtual_account_name || "TravelBright"}
                      </span>
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                      Amount to Pay:{" "}
                      <span className="font-medium text-primary-600">
                        {formatCurrency(amount)}
                      </span>
                    </p>
                  </div>
                )}

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
                      Upload your payment proof to an image hosting service and
                      paste the URL here
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
              </div>
            )}

            {/* Transaction items */}
            <div className="px-6 py-6 mt-6 border-t border-gray-200">
              <h3 className="mb-4 text-lg font-bold text-gray-900">
                Items ({cart?.length || 0})
              </h3>

              <div className="space-y-4">
                {cart &&
                  cart.map((item, index) => {
                    // Get activity data from the item or the item itself
                    const activityData = item.activity || item;

                    // Safely calculate price
                    const itemPrice =
                      activityData.price_discount || activityData.price || 0;
                    const quantity = item.quantity || 1;
                    const totalPrice = itemPrice * quantity;

                    return (
                      <div
                        key={item.id || `item-${index}`}
                        className="flex flex-col py-3 border-b border-gray-100 md:flex-row md:items-center"
                      >
                        <div className="w-full h-32 mb-3 overflow-hidden rounded-lg md:w-16 md:h-16 md:mb-0 md:mr-4">
                          <img
                            src={
                              (Array.isArray(activityData.imageUrls)
                                ? activityData.imageUrls[0]
                                : activityData.imageUrl) ||
                              "/images/placeholders/activity-placeholder.jpg"
                            }
                            alt={activityData.title || "Activity"}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "/images/placeholders/activity-placeholder.jpg";
                            }}
                          />
                        </div>

                        <div className="flex-grow">
                          <h4 className="font-medium text-gray-900">
                            {activityData.title || "Unnamed Activity"}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {activityData.city ? `${activityData.city}, ` : ""}
                            {activityData.province || ""}
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
              {(status === "waiting-for-payment" || status === "pending") && (
                <div className="flex justify-between">
                  <button
                    className="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-100"
                    onClick={handleCancelTransaction}
                  >
                    Cancel Transaction
                  </button>

                  <Link
                    href="/activity"
                    className="px-4 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
                  >
                    Browse More Activities
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
                      <h4 className="font-medium text-red-800">
                        Payment Failed
                      </h4>
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

              {status === "waiting-for-confirmation" && (
                <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex items-start">
                    <FiInfo className="text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-800">
                        Payment Under Review
                      </h4>
                      <p className="mt-1 text-sm text-blue-700">
                        Your payment is being verified. This usually takes 1-2
                        business days. We'll notify you once the verification is
                        complete.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin actions */}
              {isAdmin && status === "waiting-for-confirmation" && (
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={async () => {
                      await transactionService.updateStatus(transactionId, {
                        status: "failed",
                      });
                      setTransaction({ ...transaction, status: "failed" });
                      toast.success("Transaction marked as failed");
                    }}
                    className="px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    <FiXCircle className="inline-block mr-2" />
                    Reject Payment
                  </button>
                  <button
                    onClick={async () => {
                      await transactionService.updateStatus(transactionId, {
                        status: "success",
                      });
                      setTransaction({ ...transaction, status: "success" });
                      toast.success("Transaction marked as successful");
                    }}
                    className="px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    <FiCheckCircle className="inline-block mr-2" />
                    Approve Payment
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
