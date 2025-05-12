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
  FiRefreshCw,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { useTransaction } from "@/hooks/useTransaction";
import FileUploader from "@/components/upload/FileUploader";
import { toast } from "react-toastify";

export default function TransactionsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const {
    transactions,
    isLoading,
    error,
    isUploading,
    fetchUserTransactions,
    uploadPaymentProof,
    cancelTransaction,
    filterTransactionsByStatus,
  } = useTransaction();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !authLoading && !isLoading) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, isLoading, router]);

  // Fetch transactions
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserTransactions();
    }
  }, [isAuthenticated, fetchUserTransactions]);

  // Filter transactions based on search and status
  useEffect(() => {
    // First filter by status
    let filtered =
      statusFilter === "all"
        ? transactions
        : filterTransactionsByStatus(statusFilter);

    // Then filter by search query if needed
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((transaction) => {
        // Search by ID
        const id = transaction.id?.toLowerCase() || "";
        if (id.includes(query)) return true;

        // Search by activity titles
        const activities = transaction.cart
          ?.map((item) => item.activity?.title?.toLowerCase() || "")
          .join(" ");

        return activities.includes(query);
      });
    }

    setFilteredTransactions(filtered);
  }, [searchQuery, statusFilter, transactions, filterTransactionsByStatus]);

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
    const statusLower = status.toLowerCase();

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
    setShowUploadModal(true);
  };

  // Handle file upload completed
  const handleFileUploaded = async (fileData) => {
    if (fileData && fileData.imageUrl) {
      try {
        // Use our hook to upload the proof
        await uploadPaymentProof(selectedTransactionId, fileData.imageUrl);
        setShowUploadModal(false);
      } catch (err) {
        console.error("Error updating proof payment:", err);
        toast.error("Failed to upload payment proof. Please try again.");
      }
    }
  };

  // Handle cancel transaction
  const handleCancelTransaction = async (id) => {
    if (!confirm("Are you sure you want to cancel this transaction?")) {
      return;
    }

    await cancelTransaction(id);
  };

  if (authLoading || isLoading) {
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
          onClick={() => fetchUserTransactions()}
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

          <div className="flex items-center space-x-4">
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

            <button
              onClick={() => fetchUserTransactions()}
              className="flex items-center px-3 py-2 text-gray-600 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              title="Refresh transactions"
            >
              <FiRefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* Status summary */}
        <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-5">
          <div
            className="p-4 transition-shadow bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md"
            onClick={() => setStatusFilter("all")}
          >
            <div className="text-sm text-gray-500">All</div>
            <div className="text-2xl font-bold text-gray-900">
              {transactions.length}
            </div>
          </div>

          <div
            className="p-4 transition-shadow bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md"
            onClick={() => setStatusFilter("waiting-for-payment")}
          >
            <div className="text-sm text-yellow-600">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">
              {filterTransactionsByStatus("waiting-for-payment").length}
            </div>
          </div>

          <div
            className="p-4 transition-shadow bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md"
            onClick={() => setStatusFilter("waiting-for-confirmation")}
          >
            <div className="text-sm text-blue-600">Waiting Confirmation</div>
            <div className="text-2xl font-bold text-blue-600">
              {filterTransactionsByStatus("waiting-for-confirmation").length}
            </div>
          </div>

          <div
            className="p-4 transition-shadow bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md"
            onClick={() => setStatusFilter("success")}
          >
            <div className="text-sm text-green-600">Successful</div>
            <div className="text-2xl font-bold text-green-600">
              {filterTransactionsByStatus("success").length}
            </div>
          </div>

          <div
            className="p-4 transition-shadow bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md"
            onClick={() => setStatusFilter("failed")}
          >
            <div className="text-sm text-red-600">Failed/Canceled</div>
            <div className="text-2xl font-bold text-red-600">
              {filterTransactionsByStatus("failed").length +
                filterTransactionsByStatus("canceled").length}
            </div>
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

                        {/* Payment proof preview if available */}
                        {transaction.proofPaymentUrl && (
                          <div className="mt-3">
                            <h4 className="mb-2 text-sm font-medium text-gray-500">
                              Payment Proof
                            </h4>
                            <div className="w-full h-20 overflow-hidden rounded-lg">
                              <img
                                src={transaction.proofPaymentUrl}
                                alt="Payment Proof"
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "/images/placeholders/payment-placeholder.jpg";
                                }}
                              />
                            </div>
                          </div>
                        )}
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
              {searchQuery || statusFilter !== "all"
                ? "No transactions match your filters"
                : "No transactions yet"}
            </h3>
            <p className="mb-6 text-gray-600">
              {searchQuery || statusFilter !== "all"
                ? "Try changing your search terms or filters"
                : "You haven't made any transactions yet. Start exploring activities and book your next adventure!"}
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
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg p-6 bg-white rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Upload Payment Proof
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 text-gray-500 transition-colors rounded-full hover:bg-gray-100"
              >
                <FiXCircle size={20} />
              </button>
            </div>

            <FileUploader onFileUploaded={handleFileUploaded} />
          </div>
        </div>
      )}
    </div>
  );
}
