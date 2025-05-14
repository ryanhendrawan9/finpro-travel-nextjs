// app/admin/transactions/[id]/page.jsx - Versi lengkap yang dioptimalkan
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react"; // Import use dari React
import {
  FiArrowLeft,
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiUser,
  FiCalendar,
  FiClock,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { transactionService } from "@/lib/api";
import { toast } from "react-toastify";

export default function AdminTransactionDetail({ params }) {
  // Gunakan React.use() untuk mengakses params.id
  const transactionId = use(params).id;

  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [transaction, setTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Auth check
  useEffect(() => {
    if (!loading && (!isAuthenticated || (user && user.role !== "admin"))) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, user, router]);

  // Fetch transaction
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await transactionService.getById(transactionId);
        console.log("Transaction detail data:", response.data);

        if (!response.data || !response.data.data) {
          throw new Error("Invalid response format from server");
        }

        let transactionData = response.data.data;

        // Simpan status asli
        const originalStatus = transactionData.status || "pending";

        // Proses cart items jika diperlukan
        const cartItems =
          transactionData.cart || transactionData.transaction_items || [];

        // Normalize cart items structure
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
            },
          };
        });

        // Hitung amount jika tidak ada
        if (!transactionData.amount || transactionData.amount === 0) {
          let calculatedTotal = 0;
          normalizedItems.forEach((item) => {
            const activityData = item.activity || {};
            const price =
              activityData.price_discount || activityData.price || 0;
            const quantity = item.quantity || 1;
            calculatedTotal += parseInt(price) * parseInt(quantity);
          });

          if (calculatedTotal > 0) {
            transactionData.amount = calculatedTotal;
          } else if (
            transactionData.totalAmount &&
            transactionData.totalAmount > 0
          ) {
            transactionData.amount = transactionData.totalAmount;
          }
        }

        // Ensure payment method has proper structure
        const paymentMethod =
          transactionData.paymentMethod || transactionData.payment_method || {};

        // Create the processed transaction object
        const processedTransaction = {
          ...transactionData,
          cart: normalizedItems,
          status: originalStatus, // Gunakan status asli
          paymentMethod: {
            id: paymentMethod.id || "",
            name: paymentMethod.name || "Unknown Payment Method",
            imageUrl: paymentMethod.imageUrl || null,
            virtual_account_number:
              paymentMethod.virtual_account_number || "1234-5678-0012345678",
            virtual_account_name:
              paymentMethod.virtual_account_name || "dibimbing",
          },
          user: transactionData.user || {
            id: "unknown",
            name: "Unknown User",
            email: "No email",
          },
          // Generate invoice ID if missing
          invoiceId:
            transactionData.invoiceId ||
            `INV/${
              transactionData.createdAt
                ? new Date(transactionData.createdAt)
                    .toISOString()
                    .slice(0, 10)
                    .replace(/-/g, "")
                : "00000000"
            }/${transactionData.id?.substring(0, 6) || "000000"}`,
        };

        console.log("Processed transaction:", processedTransaction);
        setTransaction(processedTransaction);
        setSelectedStatus(processedTransaction.status);
      } catch (err) {
        console.error("Error fetching transaction:", err);
        setError("Failed to load transaction details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && transactionId) {
      fetchTransaction();
    }
  }, [isAuthenticated, transactionId]);

  // Handle status update
  const handleUpdateStatus = async () => {
    if (!selectedStatus || selectedStatus === transaction.status) {
      return;
    }

    try {
      setUpdating(true);

      // Log data yang dikirim untuk debugging
      console.log("Sending status update:", {
        id: transactionId,
        status: selectedStatus,
      });

      // Kirim format yang sesuai dengan API (berdasarkan Postman collection)
      await transactionService.updateStatus(transactionId, {
        status: selectedStatus, // Kirim status apa adanya
      });

      // Update local state
      setTransaction({
        ...transaction,
        status: selectedStatus,
      });

      toast.success(`Transaction status updated to ${selectedStatus}`);
      setIsDropdownOpen(false);
    } catch (err) {
      // Log detail error untuk debugging
      console.error("Error updating transaction status:", err);
      console.error("Error response data:", err.response?.data);
      toast.error(
        "Failed to update transaction status: " +
          (err.message || "Unknown error")
      );
    } finally {
      setUpdating(false);
    }
  };

  // Handle transaction cancellation
  const handleCancelTransaction = async () => {
    if (!confirm("Are you sure you want to cancel this transaction?")) {
      return;
    }

    try {
      setUpdating(true);
      await transactionService.cancel(transactionId);

      // Update local state
      setTransaction({
        ...transaction,
        status: "canceled",
      });
      setSelectedStatus("canceled");

      toast.success("Transaction canceled successfully");
    } catch (err) {
      console.error("Error canceling transaction:", err);
      toast.error(
        "Failed to cancel transaction: " + (err.message || "Unknown error")
      );
    } finally {
      setUpdating(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(date);
    } catch (e) {
      console.error("Date formatting error:", e);
      return "Invalid date";
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "Rp 0";
    try {
      // Make sure value is a number
      const numValue = typeof value === "string" ? parseFloat(value) : value;
      return `Rp ${numValue.toLocaleString("id-ID")}`;
    } catch (e) {
      return "Rp 0";
    }
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return {
          color: "bg-yellow-100 text-yellow-800",
          text: "PENDING",
        };
      case "waiting-for-confirmation":
        return {
          color: "bg-blue-100 text-blue-800",
          text: "WAITING FOR CONFIRMATION",
        };
      case "success":
        return {
          color: "bg-green-100 text-green-800",
          text: "SUCCESS",
        };
      case "failed":
        return {
          color: "bg-red-100 text-red-800",
          text: "FAILED",
        };
      case "canceled":
        return {
          color: "bg-gray-100 text-gray-800",
          text: "CANCELED",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          text: status.toUpperCase(),
        };
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-gray-50">
        <div className="max-w-5xl px-4 mx-auto sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-xl font-bold animate-pulse text-primary-600">
              Loading transaction details...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-gray-50">
        <div className="max-w-5xl px-4 mx-auto sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/admin/transactions"
              className="flex items-center text-gray-600 transition-colors hover:text-primary-600"
            >
              <FiArrowLeft className="mr-2" /> Back to Transactions
            </Link>
          </div>

          <div className="p-8 mb-6 bg-white rounded-lg shadow">
            <div className="flex flex-col items-center justify-center">
              <FiXCircle className="w-16 h-16 mb-4 text-red-500" />
              <h2 className="mb-2 text-2xl font-bold text-gray-800">
                Error Loading Transaction
              </h2>
              <p className="mb-6 text-gray-600">
                {error || "Transaction not found"}
              </p>
              <Link
                href="/admin/transactions"
                className="px-6 py-3 font-medium text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
              >
                Return to Transactions
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get the status badge
  const statusBadge = getStatusBadge(transaction.status);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-5xl px-4 mx-auto sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/admin/transactions"
            className="flex items-center text-gray-600 transition-colors hover:text-primary-600"
          >
            <FiArrowLeft className="mr-2" /> Back to Transactions
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col mb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center mb-2">
              <FiFileText className="mr-2 text-gray-500" />
              <h1 className="text-xl font-bold text-gray-900">
                {transaction.invoiceId}
              </h1>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <FiUser className="mr-1" />
              <p>ID User: {transaction.user?.id || "Unknown"}</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <span
              className={`inline-flex px-3 py-1 font-medium text-sm rounded-full ${statusBadge.color}`}
            >
              {statusBadge.text}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Order Details */}
          <div className="md:col-span-2">
            <div className="p-6 mb-6 bg-white shadow-sm rounded-xl">
              <h2 className="mb-4 text-lg font-bold text-gray-900">
                Detail Pesanan
              </h2>

              {transaction.cart &&
                transaction.cart.map((item, index) => {
                  const activity = item.activity || {};
                  const itemPrice =
                    activity.price_discount || activity.price || 0;
                  const quantity = item.quantity || 1;
                  const totalPrice = itemPrice * quantity;

                  return (
                    <div key={index} className="py-4 border-b border-gray-100">
                      <h3 className="mb-2 font-medium text-gray-900">
                        {activity.title || "Unnamed Activity"}
                      </h3>
                      <p className="mb-1 text-sm text-gray-500">
                        ID: {activity.id || item.id || "Unknown"}
                      </p>
                      <p className="mb-2 text-sm text-gray-600">
                        {activity.description ||
                          item.description ||
                          "No description"}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Jumlah: {quantity}</span>
                        <span className="text-lg font-medium text-orange-500">
                          {formatCurrency(totalPrice)}
                        </span>
                      </div>
                    </div>
                  );
                })}

              {(!transaction.cart || transaction.cart.length === 0) && (
                <p className="py-4 text-center text-gray-500">
                  No items found in this transaction
                </p>
              )}
            </div>

            <div className="p-6 bg-white shadow-sm rounded-xl">
              <h2 className="mb-4 text-lg font-bold text-gray-900">
                Informasi Transaksi
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-start">
                  <FiCalendar className="mt-1 mr-2 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Order Date:</p>
                    <p className="font-medium">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FiClock className="mt-1 mr-2 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Expired Date:</p>
                    <p className="font-medium">
                      {transaction.expiredDate
                        ? formatDate(transaction.expiredDate)
                        : formatDate(
                            new Date(
                              new Date(transaction.createdAt).getTime() +
                                24 * 60 * 60 * 1000
                            )
                          )}{" "}
                      {/* Default to 24h expiry */}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FiInfo className="mt-1 mr-2 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Create:</p>
                    <p className="font-medium">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FiInfo className="mt-1 mr-2 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Updated:</p>
                    <p className="font-medium">
                      {formatDate(transaction.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment & Status Update */}
          <div className="md:col-span-1">
            <div className="p-6 mb-6 bg-white shadow-sm rounded-xl">
              <h2 className="mb-4 text-lg font-bold text-gray-900">
                Metode Pembayaran
              </h2>

              <div className="flex items-center mb-4">
                {transaction.paymentMethod?.imageUrl && (
                  <img
                    src={transaction.paymentMethod.imageUrl}
                    alt={transaction.paymentMethod.name}
                    className="w-auto h-8 mr-3"
                  />
                )}
                <div>
                  <p className="font-medium">
                    {transaction.paymentMethod.name}
                  </p>
                </div>
              </div>

              <p className="mb-1 text-sm text-gray-500">
                Nama Akun: {transaction.paymentMethod.virtual_account_name}
              </p>
              <p className="mb-4 text-sm text-gray-500">
                Nomor VA: {transaction.paymentMethod.virtual_account_number}
              </p>

              {/* Payment Proof */}
              {transaction.proofPaymentUrl && (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    Bukti Pembayaran:
                  </p>
                  <a
                    href={transaction.proofPaymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:underline"
                  >
                    <FiFileText className="mr-1" /> Lihat Bukti Pembayaran
                  </a>
                </div>
              )}
            </div>

            <div className="p-6 bg-white shadow-sm rounded-xl">
              <h2 className="mb-4 text-lg font-bold text-gray-900">
                Ringkasan Pembayaran
              </h2>
              <div className="py-2 border-b border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Pembayaran</span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatCurrency(
                      transaction.amount || transaction.totalAmount
                    )}
                  </span>
                </div>
              </div>

              {/* Status Update */}
              <div className="mt-6">
                <p className="mb-2 font-medium">Update Status</p>

                {/* Status dropdown */}
                <div className="relative">
                  <button
                    className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <span>
                      {selectedStatus === "pending"
                        ? "Pending"
                        : selectedStatus === "waiting-for-confirmation"
                        ? "Waiting for Confirmation"
                        : selectedStatus === "success"
                        ? "Success"
                        : selectedStatus === "failed"
                        ? "Failed"
                        : selectedStatus === "canceled"
                        ? "Canceled"
                        : "Select new status"}
                    </span>
                    <svg
                      className="absolute w-5 h-5 right-2 top-3"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                      <ul>
                        <li>
                          <button
                            className="w-full px-4 py-2 text-left hover:bg-gray-100"
                            onClick={() => {
                              setSelectedStatus("success");
                              setIsDropdownOpen(false);
                            }}
                          >
                            Success
                          </button>
                        </li>
                        <li>
                          <button
                            className="w-full px-4 py-2 text-left hover:bg-gray-100"
                            onClick={() => {
                              setSelectedStatus("failed");
                              setIsDropdownOpen(false);
                            }}
                          >
                            Failed
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleUpdateStatus}
                  disabled={updating || selectedStatus === transaction.status}
                  className={`w-full px-4 py-2 mt-4 font-medium text-white transition-colors rounded-lg ${
                    updating || selectedStatus === transaction.status
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-orange-500 hover:bg-orange-600"
                  }`}
                >
                  {updating ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="w-5 h-5 mr-2 animate-spin"
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
                    </span>
                  ) : (
                    "Update Status"
                  )}
                </button>

                <button
                  onClick={handleCancelTransaction}
                  disabled={updating || transaction.status === "canceled"}
                  className={`w-full px-4 py-2 mt-4 font-medium text-red-600 transition-colors bg-white border border-red-300 rounded-lg ${
                    updating || transaction.status === "canceled"
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-red-50"
                  }`}
                >
                  {updating ? "Processing..." : "Batalkan Transaksi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
