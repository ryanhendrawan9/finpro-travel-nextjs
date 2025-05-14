"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiArrowRight,
  FiShoppingBag,
  FiUpload,
  FiFilter,
  FiCalendar,
  FiSearch,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { transactionService } from "@/lib/api";
import { toast } from "react-toastify";
import { normalizeStatus } from "@/lib/transaction-helpers"; // Import helper

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [proofPaymentUrl, setProofPaymentUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await transactionService.getMyTransactions();
        console.log("Transactions data:", response.data);

        // Process transactions to ensure they have valid amounts
        const processedTransactions = (response.data.data || []).map(
          (transaction) => {
            // Normalize status to handle inconsistencies
            transaction.status = normalizeStatus(transaction.status);

            // If amount is missing or zero, calculate from cart items
            if (!transaction.amount || transaction.amount === 0) {
              if (transaction.cart && transaction.cart.length > 0) {
                let calculatedTotal = 0;

                transaction.cart.forEach((item) => {
                  if (item.activity) {
                    const price =
                      item.activity.price_discount || item.activity.price || 0;
                    const quantity = item.quantity || 1;
                    calculatedTotal += parseInt(price) * parseInt(quantity);
                  }
                });

                if (calculatedTotal > 0) {
                  transaction.amount = calculatedTotal;
                }
              }

              // Also check if we have totalAmount field (API inconsistency)
              if (transaction.totalAmount && transaction.totalAmount > 0) {
                transaction.amount = transaction.totalAmount;
              }
            }

            return transaction;
          }
        );

        setTransactions(processedTransactions);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Failed to load transactions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchTransactions();
    }
  }, [isAuthenticated]);

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    // Status filter
    if (statusFilter !== "all") {
      const normalizedStatus = normalizeStatus(transaction.status);
      if (normalizedStatus !== statusFilter) {
        return false;
      }
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const id = transaction.id?.toLowerCase() || "";
      const activities = transaction.cart
        ?.map((item) => item.activity?.title?.toLowerCase() || "")
        .join(" ");

      return id.includes(query) || activities.includes(query);
    }

    return true;
  });

  // Format date
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
    if (value === undefined || value === null) return "Rp 0";
    try {
      // Make sure value is a number
      const numValue = typeof value === "string" ? parseFloat(value) : value;
      return `Rp ${numValue.toLocaleString("id-ID")}`;
    } catch (e) {
      console.error("Currency formatting error:", e, "Value:", value);
      return "Rp 0";
    }
  };

  // Get status details
  const getStatusDetails = (status) => {
    if (!status)
      return {
        color: "text-gray-600 bg-gray-100",
        icon: <FiInfo className="mr-2" />,
        text: "Unknown",
        description: "Status unknown",
      };

    // Convert to lowercase to handle case inconsistencies
    const statusLower = normalizeStatus(status).toLowerCase();

    // Map API status values to your application's display values
    if (statusLower === "waiting-for-payment" || statusLower === "pending") {
      return {
        color: "text-yellow-600 bg-yellow-100",
        icon: <FiClock className="mr-2" />,
        text: "Waiting for Payment",
        description: "Please complete your payment and upload proof of payment",
      };
    } else if (statusLower === "waiting-for-confirmation") {
      return {
        color: "text-blue-600 bg-blue-100",
        icon: <FiInfo className="mr-2" />,
        text: "Waiting for Confirmation",
        description:
          "We're reviewing your payment. This may take 1-2 business days.",
      };
    } else if (statusLower === "success" || statusLower === "completed") {
      return {
        color: "text-green-600 bg-green-100",
        icon: <FiCheckCircle className="mr-2" />,
        text: "Success",
        description: "Your transaction has been completed successfully",
      };
    } else if (statusLower === "failed") {
      return {
        color: "text-red-600 bg-red-100",
        icon: <FiXCircle className="mr-2" />,
        text: "Failed",
        description:
          "Your payment was not approved. Please contact support for assistance.",
      };
    } else if (statusLower === "canceled" || statusLower === "cancelled") {
      return {
        color: "text-gray-600 bg-gray-100",
        icon: <FiXCircle className="mr-2" />,
        text: "Canceled",
        description: "This transaction has been canceled",
      };
    } else {
      // Default case for any other status
      return {
        color: "text-gray-600 bg-gray-100",
        icon: <FiInfo className="mr-2" />,
        text: status,
        description: "Transaction status: " + status,
      };
    }
  };

  // Open upload modal
  const openUploadModal = (transactionId) => {
    setSelectedTransactionId(transactionId);

    // Find the transaction to get its current proof URL if any
    const transaction = transactions.find((t) => t.id === transactionId);
    setProofPaymentUrl(transaction?.proofPaymentUrl || "");

    setUploadModalOpen(true);
  };

  // Handle upload payment proof
  const handleUploadProof = async (e) => {
    e.preventDefault();

    if (!proofPaymentUrl) {
      toast.error("Please enter a valid payment proof URL");
      return;
    }

    setIsUploading(true);

    try {
      await transactionService.updateProofPayment(selectedTransactionId, {
        proofPaymentUrl,
      });

      // Update local state
      setTransactions(
        transactions.map((t) =>
          t.id === selectedTransactionId
            ? { ...t, proofPaymentUrl, status: "waiting-for-confirmation" }
            : t
        )
      );

      setUploadModalOpen(false);
      toast.success("Payment proof uploaded successfully!");
    } catch (err) {
      console.error("Error uploading payment proof:", err);
      toast.error("Failed to upload payment proof. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Cancel transaction
  const handleCancelTransaction = async (id) => {
    if (!confirm("Are you sure you want to cancel this transaction?")) {
      return;
    }

    try {
      await transactionService.cancel(id);

      // Update local state
      setTransactions(
        transactions.map((t) =>
          t.id === id ? { ...t, status: "canceled" } : t
        )
      );

      toast.success("Transaction canceled successfully");
    } catch (err) {
      console.error("Error canceling transaction:", err);
      toast.error("Failed to cancel transaction. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-bold animate-pulse text-primary-600">
          Loading your transactions...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="mb-4 text-2xl font-bold text-red-600">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 font-heading">
          My Transactions
        </h1>

        {/* Filters */}
        <div className="flex flex-col mb-6 space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-md">
            <FiSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <FiFilter className="text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="waiting-for-payment">Waiting for Payment</option>
              <option value="waiting-for-confirmation">
                Waiting for Confirmation
              </option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
        </div>

        {filteredTransactions && filteredTransactions.length > 0 ? (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {filteredTransactions.map((transaction) => {
              const statusDetails = getStatusDetails(transaction?.status);
              const id = transaction?.id || "unknown";
              const shortId = id.substring(0, 8);
              const amount =
                transaction?.amount || transaction?.totalAmount || 0;
              const activities =
                transaction?.cart || transaction?.transaction_items || [];

              return (
                <motion.div
                  key={id}
                  className="overflow-hidden bg-white shadow-sm rounded-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-col justify-between md:flex-row md:items-center">
                      <div>
                        <div className="flex flex-col md:flex-row md:items-center md:space-x-3">
                          <h3 className="text-lg font-bold text-gray-900">
                            Transaction #{shortId}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 md:mt-0 ${statusDetails.color}`}
                          >
                            {statusDetails.icon} {statusDetails.text}
                          </span>
                        </div>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <FiCalendar className="mr-2" />
                          {formatDate(transaction?.createdAt)}
                        </div>
                      </div>
                      <div className="mt-3 md:mt-0">
                        <span className="text-lg font-bold text-primary-600">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Status message */}
                    <div
                      className={`p-4 mb-4 rounded-lg ${statusDetails.color}`}
                    >
                      <div className="flex items-start">
                        {statusDetails.icon}
                        <div>
                          <p className="font-medium">{statusDetails.text}</p>
                          <p className="text-sm">{statusDetails.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <h4 className="mb-2 text-sm font-medium text-gray-500">
                          Items
                        </h4>
                        <ul className="space-y-2">
                          {activities.slice(0, 2).map((item, index) => {
                            // Handle different data structures
                            const activityItem = item.activity || item;
                            const imageUrl = activityItem.imageUrls
                              ? activityItem.imageUrls[0]
                              : activityItem.imageUrl ||
                                "/images/placeholders/activity-placeholder.jpg";

                            return (
                              <li key={index} className="flex items-center">
                                <div className="w-10 h-10 mr-3 overflow-hidden rounded-lg">
                                  <img
                                    src={imageUrl}
                                    alt={activityItem.title || "Activity"}
                                    className="object-cover w-full h-full"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src =
                                        "/images/placeholders/activity-placeholder.jpg";
                                    }}
                                  />
                                </div>
                                <div className="flex-grow">
                                  <div className="text-sm font-medium text-gray-900">
                                    {activityItem.title || "Unknown activity"}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Qty: {item.quantity || 1}
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                          {activities.length > 2 && (
                            <li className="text-sm text-gray-500">
                              + {activities.length - 2} more items
                            </li>
                          )}
                          {activities.length === 0 && (
                            <li className="text-sm text-gray-500">No items</li>
                          )}
                        </ul>
                      </div>

                      <div>
                        <h4 className="mb-2 text-sm font-medium text-gray-500">
                          Payment Method
                        </h4>
                        <div className="flex items-center">
                          {(transaction?.paymentMethod?.imageUrl ||
                            transaction?.payment_method?.imageUrl) && (
                            <img
                              src={
                                transaction?.paymentMethod?.imageUrl ||
                                transaction?.payment_method?.imageUrl
                              }
                              alt={
                                transaction?.paymentMethod?.name ||
                                transaction?.payment_method?.name ||
                                "Payment Method"
                              }
                              className="h-6 mr-2"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "/images/placeholders/payment-placeholder.jpg";
                              }}
                            />
                          )}
                          <span className="font-medium text-gray-900">
                            {transaction?.paymentMethod?.name ||
                              transaction?.payment_method?.name ||
                              "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 mt-6">
                      {/* Action buttons based on status */}
                      <div className="flex flex-wrap gap-3">
                        {(transaction.status === "waiting-for-payment" ||
                          transaction.status === "pending") && (
                          <>
                            <button
                              onClick={() => openUploadModal(transaction.id)}
                              className="inline-flex items-center px-4 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
                            >
                              <FiUpload className="mr-2" /> Upload Payment Proof
                            </button>
                            <button
                              onClick={() =>
                                handleCancelTransaction(transaction.id)
                              }
                              className="inline-flex items-center px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-100"
                            >
                              <FiXCircle className="mr-2" /> Cancel
                            </button>
                          </>
                        )}
                      </div>

                      <Link
                        href={`/transaction/${id}`}
                        className="inline-flex items-center font-medium text-primary-600 hover:text-primary-700"
                      >
                        View Details <FiArrowRight className="ml-2" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="p-8 text-center bg-white shadow-sm rounded-xl">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full">
              <FiShoppingBag className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">
              No transactions yet
            </h3>
            <p className="mb-6 text-gray-600">
              You haven't made any transactions yet. Start exploring activities
              and book your next adventure!
            </p>
            <Link
              href="/activity"
              className="inline-flex items-center px-6 py-3 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
            >
              Browse Activities
            </Link>
          </div>
        )}
      </div>

      {/* Upload payment proof modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-xl">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Upload Payment Proof
            </h2>
            <form onSubmit={handleUploadProof}>
              <div className="mb-4">
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

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className={`px-4 py-2 text-white rounded-lg transition-colors ${
                    isUploading
                      ? "bg-primary-400 cursor-not-allowed"
                      : "bg-primary-600 hover:bg-primary-700"
                  }`}
                >
                  {isUploading ? (
                    <span className="flex items-center">
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
                    </span>
                  ) : (
                    "Upload"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
