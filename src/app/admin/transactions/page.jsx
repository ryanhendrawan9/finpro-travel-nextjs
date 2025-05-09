"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiSearch,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiExternalLink,
  FiFilter,
  FiEye,
  FiDollarSign,
  FiUser,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { transactionService } from "@/lib/api";
import { toast } from "react-toastify";
import debounce from "lodash/debounce";

export default function AdminTransactions() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [updatingTransaction, setUpdatingTransaction] = useState(null);
  const transactionsPerPage = 10;

  // Debounced search function
  const debouncedSetSearch = useCallback(
    debounce((value) => {
      setDebouncedSearchQuery(value);
    }, 300),
    []
  );

  // Auth check
  useEffect(() => {
    if (!loading && (!isAuthenticated || (user && user.role !== "admin"))) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, user, router]);

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await transactionService.getAllTransactions();
        console.log("Admin transactions data:", response.data);

        if (!response.data || !response.data.data) {
          throw new Error("Invalid response format from server");
        }

        // Process transactions to ensure they have valid amounts
        const processedTransactions = (response.data.data || []).map(
          (transaction) => {
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
            }

            return transaction;
          }
        );

        setTransactions(processedTransactions);
        setFilteredTransactions(processedTransactions);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError(
          `Failed to load transactions: ${err.message || "Unknown error"}`
        );
        toast.error("Failed to load transactions. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user?.role === "admin") {
      fetchTransactions();
    }
  }, [isAuthenticated, user]);

  // Filter transactions when search or status filter changes
  useEffect(() => {
    // Create a function to filter transactions based on filters
    const filterTransactions = () => {
      return transactions.filter((transaction) => {
        // Status filter
        if (statusFilter !== "all" && transaction.status !== statusFilter) {
          return false;
        }

        // Search query filter - only process if there's a search query
        if (debouncedSearchQuery) {
          const query = debouncedSearchQuery.toLowerCase();

          // Early return if ID matches (most specific)
          const id = transaction.id?.toLowerCase() || "";
          if (id.includes(query)) return true;

          // Then check user name and email
          const userName = transaction.user?.name?.toLowerCase() || "";
          const userEmail = transaction.user?.email?.toLowerCase() || "";

          return userName.includes(query) || userEmail.includes(query);
        }

        return true;
      });
    };

    // Apply the filters
    const filtered = filterTransactions();
    setFilteredTransactions(filtered);

    // Always reset to first page when filters change
    setCurrentPage(1);
  }, [debouncedSearchQuery, statusFilter, transactions]);

  // Pagination
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );
  const totalPages = Math.ceil(
    filteredTransactions.length / transactionsPerPage
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const options = {
        year: "numeric",
        month: "short",
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

  // Format currency
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
      };

    switch (status) {
      case "waiting-for-payment":
        return {
          color: "text-yellow-600 bg-yellow-100",
          icon: <FiClock className="mr-2" />,
          text: "Waiting for Payment",
        };
      case "waiting-for-confirmation":
        return {
          color: "text-blue-600 bg-blue-100",
          icon: <FiInfo className="mr-2" />,
          text: "Waiting for Confirmation",
        };
      case "success":
        return {
          color: "text-green-600 bg-green-100",
          icon: <FiCheckCircle className="mr-2" />,
          text: "Success",
        };
      case "failed":
        return {
          color: "text-red-600 bg-red-100",
          icon: <FiXCircle className="mr-2" />,
          text: "Failed",
        };
      case "canceled":
        return {
          color: "text-gray-600 bg-gray-100",
          icon: <FiXCircle className="mr-2" />,
          text: "Canceled",
        };
      default:
        return {
          color: "text-gray-600 bg-gray-100",
          icon: <FiInfo className="mr-2" />,
          text: status,
        };
    }
  };

  // Handle status update
  const handleUpdateStatus = async (id, status) => {
    setUpdatingTransaction(id);
    try {
      await transactionService.updateStatus(id, { status });

      // Update local state
      const updatedTransactions = transactions.map((trans) =>
        trans.id === id ? { ...trans, status } : trans
      );

      setTransactions(updatedTransactions);
      setFilteredTransactions(
        updatedTransactions.filter(
          (trans) => statusFilter === "all" || trans.status === statusFilter
        )
      );

      setIsModalOpen(false);
      setSelectedTransaction(null);

      toast.success(`Transaction status updated to ${status}`);
    } catch (error) {
      console.error("Error updating transaction status:", error);
      toast.error(
        "Failed to update transaction status: " +
          (error.message || "Unknown error")
      );
    } finally {
      setUpdatingTransaction(null);
    }
  };

  // View transaction details
  const viewTransactionDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  // Retry fetching transactions
  const retryFetchTransactions = async () => {
    if (isAuthenticated && user?.role === "admin") {
      setIsLoading(true);
      setError(null);
      try {
        const response = await transactionService.getAllTransactions();

        const processedTransactions = (response.data.data || []).map(
          (transaction) => {
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
            }

            return transaction;
          }
        );

        setTransactions(processedTransactions);
        setFilteredTransactions(processedTransactions);
        toast.success("Transactions loaded successfully");
      } catch (err) {
        console.error("Error retrying transaction fetch:", err);
        setError(
          `Failed to load transactions: ${err.message || "Unknown error"}`
        );
        toast.error("Failed to load transactions. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-bold animate-pulse text-primary-600">
          Loading transactions...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/admin/dashboard"
            className="flex items-center text-gray-600 transition-colors hover:text-primary-600"
          >
            <FiArrowLeft className="mr-2" /> Back to Dashboard
          </Link>
        </div>

        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          Manage Transactions
        </h1>

        {/* Error message */}
        {error && (
          <div className="p-4 mb-6 text-red-700 bg-red-100 border border-red-300 rounded-lg">
            <div className="flex items-center">
              <FiXCircle className="mr-2" />
              <span>{error}</span>
            </div>
            <button
              onClick={retryFetchTransactions}
              className="px-4 py-2 mt-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col mb-6 space-y-4 md:space-y-0 md:space-x-4 md:flex-row md:items-center">
          <div className="relative flex-grow">
            <FiSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search by ID or customer..."
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                debouncedSetSearch(e.target.value);
              }}
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

        {/* Transaction list */}
        <div className="overflow-hidden bg-white shadow-sm rounded-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Customer
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentTransactions.map((transaction) => {
                  const statusDetails = getStatusDetails(transaction?.status);
                  const shortId = transaction.id?.substring(0, 8) || "unknown";

                  return (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        #{shortId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 mr-3 overflow-hidden rounded-full">
                            <img
                              src={
                                transaction.user?.profilePictureUrl ||
                                "/images/placeholders/user-placeholder.jpg"
                              }
                              alt={transaction.user?.name || "User"}
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "/images/placeholders/user-placeholder.jpg";
                              }}
                            />
                          </div>
                          <div>
                            <div className="font-medium">
                              {transaction.user?.name || "Unknown user"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {transaction.user?.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDetails.color}`}
                        >
                          {statusDetails.icon} {statusDetails.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => viewTransactionDetails(transaction)}
                            className="p-1 text-blue-600 transition-colors rounded-md hover:bg-blue-50"
                            title="View details"
                          >
                            <FiEye size={18} />
                          </button>

                          <Link
                            href={`/transaction/${transaction.id}`}
                            className="p-1 text-green-600 transition-colors rounded-md hover:bg-green-50"
                            title="View transaction page"
                          >
                            <FiExternalLink size={18} />
                          </Link>

                          {transaction.status ===
                            "waiting-for-confirmation" && (
                            <>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(transaction.id, "success")
                                }
                                disabled={
                                  updatingTransaction === transaction.id
                                }
                                className={`p-1 text-green-600 transition-colors rounded-md ${
                                  updatingTransaction === transaction.id
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-green-50"
                                }`}
                                title="Approve payment"
                              >
                                {updatingTransaction === transaction.id ? (
                                  <span className="inline-block w-4 h-4 border-2 border-green-600 rounded-full border-t-transparent animate-spin"></span>
                                ) : (
                                  <FiCheckCircle size={18} />
                                )}
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(transaction.id, "failed")
                                }
                                disabled={
                                  updatingTransaction === transaction.id
                                }
                                className={`p-1 text-red-600 transition-colors rounded-md ${
                                  updatingTransaction === transaction.id
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-red-50"
                                }`}
                                title="Reject payment"
                              >
                                {updatingTransaction === transaction.id ? (
                                  <span className="inline-block w-4 h-4 border-2 border-red-600 rounded-full border-t-transparent animate-spin"></span>
                                ) : (
                                  <FiXCircle size={18} />
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredTransactions.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-sm text-center text-gray-500"
                    >
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Improved Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-6 space-x-2">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Previous
            </button>

            {/* Logic for showing limited page numbers */}
            {Array.from({ length: totalPages }, (_, i) => {
              const pageNumber = i + 1;
              // Show first page, last page, current page, and pages adjacent to current page
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
              ) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => paginate(pageNumber)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === pageNumber
                        ? "bg-primary-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              }

              // Show ellipsis for skipped pages
              if (
                (pageNumber === currentPage - 3 && pageNumber > 1) ||
                (pageNumber === currentPage + 3 && pageNumber < totalPages)
              ) {
                return (
                  <span key={pageNumber} className="px-3 py-1">
                    ...
                  </span>
                );
              }

              return null;
            })}

            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Transaction details modal */}
      {isModalOpen && selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-4xl p-6 bg-white rounded-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Transaction Details
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedTransaction(null);
                }}
                className="p-2 text-gray-500 transition-colors rounded-full hover:bg-gray-100"
              >
                <FiXCircle size={20} />
              </button>
            </div>

            <div className="p-4 mb-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <div className="text-sm text-gray-500">Transaction ID</div>
                  <div className="font-medium">{selectedTransaction.id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Date</div>
                  <div className="font-medium">
                    {formatDate(selectedTransaction.createdAt)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getStatusDetails(selectedTransaction.status).color
                      }`}
                    >
                      {getStatusDetails(selectedTransaction.status).icon}
                      {getStatusDetails(selectedTransaction.status).text}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Customer info */}
              <div className="p-4 border rounded-lg">
                <h3 className="flex items-center mb-3 text-lg font-medium text-gray-900">
                  <FiUser className="mr-2" />
                  Customer Information
                </h3>
                <div className="space-y-2">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Name</span>
                    <span className="font-medium">
                      {selectedTransaction.user?.name || "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Email</span>
                    <span className="font-medium">
                      {selectedTransaction.user?.email || "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Phone</span>
                    <span className="font-medium">
                      {selectedTransaction.user?.phoneNumber || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment details */}
              <div className="p-4 border rounded-lg">
                <h3 className="flex items-center mb-3 text-lg font-medium text-gray-900">
                  <FiDollarSign className="mr-2" />
                  Payment Details
                </h3>
                <div className="space-y-2">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Amount</span>
                    <span className="text-xl font-bold text-primary-600">
                      {formatCurrency(selectedTransaction.amount)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">
                      Payment Method
                    </span>
                    <span className="font-medium">
                      {selectedTransaction.paymentMethod?.name || "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">
                      Proof of Payment
                    </span>
                    {selectedTransaction.proofPaymentUrl ? (
                      <a
                        href={selectedTransaction.proofPaymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:underline"
                      >
                        View Payment Proof <FiExternalLink className="ml-1" />
                      </a>
                    ) : (
                      <span className="text-red-500">No proof uploaded</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="mt-6">
              <h3 className="mb-3 text-lg font-medium text-gray-900">
                Items ({selectedTransaction.cart?.length || 0})
              </h3>
              <div className="overflow-hidden border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                      >
                        Item
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                      >
                        Price
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                      >
                        Quantity
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                      >
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedTransaction.cart &&
                      selectedTransaction.cart.map((item, index) => {
                        const price =
                          item.activity?.price_discount ||
                          item.activity?.price ||
                          0;
                        const quantity = item.quantity || 1;
                        const itemTotal = price * quantity;

                        return (
                          <tr key={item.id || index}>
                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 mr-3 overflow-hidden rounded-lg">
                                  <img
                                    src={
                                      item.activity?.imageUrls?.[0] ||
                                      "/images/placeholders/activity-placeholder.jpg"
                                    }
                                    alt={item.activity?.title || "Activity"}
                                    className="object-cover w-full h-full"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src =
                                        "/images/placeholders/activity-placeholder.jpg";
                                    }}
                                  />
                                </div>
                                <div className="font-medium">
                                  {item.activity?.title || "Unknown Activity"}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                              {formatCurrency(price)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                              {quantity}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                              {formatCurrency(itemTotal)}
                            </td>
                          </tr>
                        );
                      })}

                    {(!selectedTransaction.cart ||
                      selectedTransaction.cart.length === 0) && (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-6 py-4 text-sm text-center text-gray-500"
                        >
                          No items found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            {selectedTransaction.status === "waiting-for-confirmation" && (
              <div className="flex justify-end mt-6 space-x-4">
                <button
                  onClick={() =>
                    handleUpdateStatus(selectedTransaction.id, "failed")
                  }
                  disabled={updatingTransaction === selectedTransaction.id}
                  className={`px-4 py-2 text-white transition-colors rounded-lg ${
                    updatingTransaction === selectedTransaction.id
                      ? "bg-red-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {updatingTransaction === selectedTransaction.id ? (
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
                  onClick={() =>
                    handleUpdateStatus(selectedTransaction.id, "success")
                  }
                  disabled={updatingTransaction === selectedTransaction.id}
                  className={`px-4 py-2 text-white transition-colors rounded-lg ${
                    updatingTransaction === selectedTransaction.id
                      ? "bg-green-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {updatingTransaction === selectedTransaction.id ? (
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}
