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
  FiDownload,
  FiInfo,
  FiDollarSign,
  FiUser,
  FiEye,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { useTransaction } from "@/hooks/useTransaction";
import ImageViewer from "@/components/ui/ImageViewer";
import { toast } from "react-toastify";

export default function AdminTransactionDetailPage({ params }) {
  const id = use(params).id;
  const { isAuthenticated, user } = useAuth();
  const {
    transaction,
    isLoading,
    error,
    updatingTransaction,
    fetchTransaction,
    updateTransactionStatus,
  } = useTransaction();
  const [showImageViewer, setShowImageViewer] = useState(false);
  const router = useRouter();

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user && user.role !== "admin"))) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Fetch transaction data
  useEffect(() => {
    if (id && isAuthenticated && user?.role === "admin") {
      fetchTransaction(id);
    }
  }, [id, isAuthenticated, user, fetchTransaction]);

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
          description: "Customer needs to complete payment and upload proof",
        };
      case "waiting-for-confirmation":
        return {
          color: "text-blue-600 bg-blue-100",
          icon: <FiInfo className="mr-2" />,
          text: "Waiting for Confirmation",
          description:
            "Payment proof has been uploaded. Review and approve/reject payment.",
        };
      case "success":
      case "completed":
        return {
          color: "text-green-600 bg-green-100",
          icon: <FiCheckCircle className="mr-2" />,
          text: "Success",
          description: "Transaction has been completed successfully",
        };
      case "failed":
        return {
          color: "text-red-600 bg-red-100",
          icon: <FiXCircle className="mr-2" />,
          text: "Failed",
          description: "Payment was not approved",
        };
      case "canceled":
        return {
          color: "text-gray-600 bg-gray-100",
          icon: <FiXCircle className="mr-2" />,
          text: "Canceled",
          description: "Transaction has been canceled",
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

  // Handle approve/reject payment
  const handleUpdateStatus = async (status) => {
    try {
      await updateTransactionStatus(id, status);

      // Toast notification based on action
      if (status === "success") {
        toast.success("Payment approved successfully");
      } else if (status === "failed") {
        toast.error("Payment rejected");
      }

      // Force refresh data after short delay
      setTimeout(() => {
        fetchTransaction(id);
      }, 500);
    } catch (error) {
      console.error("Error updating transaction status:", error);
      toast.error("Failed to update transaction status");
    }
  };

  if (isLoading) {
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
          onClick={() => router.push("/admin/transactions")}
          className="flex items-center px-6 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
        >
          <FiArrowLeft className="mr-2" /> Back to Transactions
        </button>
      </div>
    );
  }

  // Destructure transaction data
  const {
    id: transactionId,
    amount,
    status,
    createdAt,
    updatedAt,
    proofPaymentUrl,
    paymentMethod = {},
    cart = [],
    user: transactionUser,
    promoDiscount = 0,
    promoCode = null,
  } = transaction;

  const statusInfo = getStatusInfo(status);

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-4xl px-4 pt-8 mx-auto sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/admin/transactions"
            className="flex items-center text-gray-600 transition-colors hover:text-primary-600"
          >
            <FiArrowLeft className="mr-2" /> Back to Transactions
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-900 font-heading">
            Admin: Transaction Details
          </h1>
          <p className="mt-2 text-gray-600">
            Review and manage this transaction
          </p>
        </div>

        <motion.div
          className="overflow-hidden bg-white shadow-md rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Action Bar - Quick Status Update */}
          {status === "waiting-for-confirmation" && (
            <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
              <div className="flex flex-col justify-between space-y-4 md:space-y-0 md:flex-row md:items-center">
                <div className="flex items-center">
                  <FiInfo className="w-5 h-5 mr-2 text-blue-600" />
                  <span className="font-medium text-blue-800">
                    Payment proof has been uploaded and awaiting your review
                  </span>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleUpdateStatus("failed")}
                    disabled={updatingTransaction === transactionId}
                    className={`px-4 py-2 text-white rounded-lg ${
                      updatingTransaction === transactionId
                        ? "bg-red-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {updatingTransaction === transactionId ? (
                      <span className="flex items-center">
                        <span className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></span>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <FiXCircle className="mr-2" />
                        Reject Payment
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => handleUpdateStatus("success")}
                    disabled={updatingTransaction === transactionId}
                    className={`px-4 py-2 text-white rounded-lg ${
                      updatingTransaction === transactionId
                        ? "bg-green-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {updatingTransaction === transactionId ? (
                      <span className="flex items-center">
                        <span className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></span>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <FiCheckCircle className="mr-2" />
                        Approve Payment
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

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

                  {proofPaymentUrl ? (
                    <div className="p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          Payment proof uploaded
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setShowImageViewer(true)}
                            className="flex items-center text-blue-600 hover:text-blue-700"
                          >
                            <FiEye className="mr-1" />
                            View
                          </button>
                          <a
                            href={proofPaymentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-600 hover:text-blue-700"
                          >
                            <FiDownload className="mr-1" />
                            Download
                          </a>
                        </div>
                      </div>
                      <div
                        className="w-full h-32 overflow-hidden rounded-lg cursor-pointer"
                        onClick={() => setShowImageViewer(true)}
                      >
                        <img
                          src={proofPaymentUrl}
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
                  ) : (
                    <div className="p-3 text-sm italic text-gray-500 rounded-lg bg-gray-50">
                      No payment proof uploaded yet
                    </div>
                  )}
                </div>
              </div>
            </div>

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

            {/* Actions for different statuses */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              {/* Action for waiting-for-confirmation */}
              {status === "waiting-for-confirmation" && (
                <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex items-start">
                    <FiInfo className="text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-800">
                        Payment Review Required
                      </h4>
                      <p className="mt-1 text-sm text-blue-700">
                        The customer has uploaded payment proof. Please review
                        and either approve or reject this payment.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={() => handleUpdateStatus("failed")}
                      disabled={updatingTransaction === transactionId}
                      className={`px-4 py-2 text-white transition-colors rounded-lg ${
                        updatingTransaction === transactionId
                          ? "bg-red-400 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {updatingTransaction === transactionId ? (
                        <>
                          <span className="inline-block w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <FiXCircle className="inline-block mr-2" />
                          Reject Payment
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleUpdateStatus("success")}
                      disabled={updatingTransaction === transactionId}
                      className={`px-4 py-2 text-white transition-colors rounded-lg ${
                        updatingTransaction === transactionId
                          ? "bg-green-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {updatingTransaction === transactionId ? (
                        <>
                          <span className="inline-block w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <FiCheckCircle className="inline-block mr-2" />
                          Approve Payment
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Status messages for other statuses */}
              {status === "success" && (
                <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                  <div className="flex items-start">
                    <FiCheckCircle className="text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-green-800">
                        Payment Completed
                      </h4>
                      <p className="mt-1 text-sm text-green-700">
                        This transaction has been successfully completed.
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
                        This transaction's payment was rejected.
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
                        This transaction has been canceled by the customer.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {status === "waiting-for-payment" && (
                <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                  <div className="flex items-start">
                    <FiClock className="text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-yellow-800">
                        Awaiting Payment
                      </h4>
                      <p className="mt-1 text-sm text-yellow-700">
                        The customer still needs to complete payment and upload
                        payment proof.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Image Viewer Modal */}
      {showImageViewer && proofPaymentUrl && (
        <ImageViewer
          imageUrl={proofPaymentUrl}
          onClose={() => setShowImageViewer(false)}
          title="Payment Proof"
        />
      )}
    </div>
  );
}
