"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiSearch,
  FiEdit,
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiFilter,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { transactionService } from "@/lib/api";
import { toast } from "react-toastify";
import { normalizeStatus } from "@/lib/transaction-helpers";

export default function AdminTransactions() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [totalCounts, setTotalCounts] = useState({
    pending: 0,
    "waiting-for-confirmation": 0,
    success: 0,
    failed: 0,
    canceled: 0,
    all: 0,
  });

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

        // Process transactions to ensure they have valid data
        const processedTransactions = (response.data.data || []).map(
          (transaction) => {
            // Normalize status to handle inconsistencies
            transaction.status = normalizeStatus(
              transaction.status || "pending"
            );

            // If amount is missing or zero, calculate from cart items
            if (!transaction.amount || transaction.amount === 0) {
              // Check cart field
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
              // Check transaction_items field as an alternative
              else if (
                transaction.transaction_items &&
                transaction.transaction_items.length > 0
              ) {
                let calculatedTotal = 0;

                transaction.transaction_items.forEach((item) => {
                  const price = item.price_discount || item.price || 0;
                  const quantity = item.quantity || 1;
                  calculatedTotal += parseInt(price) * parseInt(quantity);
                });

                if (calculatedTotal > 0) {
                  transaction.amount = calculatedTotal;
                }
              }

              // Check totalAmount field
              if (transaction.totalAmount && transaction.totalAmount > 0) {
                transaction.amount = transaction.totalAmount;
              }
            }

            // Get title from first cart item or set default
            const title =
              transaction.cart &&
              transaction.cart.length > 0 &&
              transaction.cart[0].activity
                ? transaction.cart[0].activity.title
                : transaction.transaction_items &&
                  transaction.transaction_items.length > 0
                ? transaction.transaction_items[0].title || "Unnamed Activity"
                : "Unnamed Activity";

            // Ensure payment method is available
            const paymentMethod =
              transaction.paymentMethod || transaction.payment_method || {};

            return {
              ...transaction,
              title,
              paymentMethodName: paymentMethod.name || "Unknown",
              invoiceId:
                transaction.invoiceId ||
                `INV/${
                  transaction.createdAt
                    ? new Date(transaction.createdAt)
                        .toISOString()
                        .slice(0, 10)
                        .replace(/-/g, "")
                    : "00000000"
                }/${transaction.id?.substring(0, 6) || "000000"}`,
            };
          }
        );

        // Calculate status counts
        const counts = processedTransactions.reduce((acc, transaction) => {
          const status = transaction.status || "pending";
          acc[status] = (acc[status] || 0) + 1;
          acc.all = (acc.all || 0) + 1;
          return acc;
        }, {});

        setTotalCounts(counts);
        setTransactions(processedTransactions);

        // Apply initial filter based on active tab
        filterTransactionsByStatus(processedTransactions, activeTab);
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

  // Filter transactions when tab or search changes
  const filterTransactionsByStatus = (
    allTransactions,
    status,
    query = searchQuery
  ) => {
    const filtered = allTransactions.filter((transaction) => {
      // Status filter (for tab)
      if (status !== "all" && transaction.status !== status) {
        return false;
      }

      // Search query filter - skip if no query
      if (query) {
        const queryLower = query.toLowerCase();
        // Search in ID, invoice ID, title, customer name, etc.
        return (
          (transaction.id || "").toLowerCase().includes(queryLower) ||
          (transaction.invoiceId || "").toLowerCase().includes(queryLower) ||
          (transaction.title || "").toLowerCase().includes(queryLower) ||
          ((transaction.user?.name || "") + (transaction.user?.email || ""))
            .toLowerCase()
            .includes(queryLower)
        );
      }

      return true;
    });

    setFilteredTransactions(filtered);
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    filterTransactionsByStatus(transactions, tab);
  };

  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterTransactionsByStatus(transactions, activeTab, query);
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

  // Go to transaction detail
  const viewTransactionDetail = (id) => {
    router.push(`/admin/transactions/${id}`);
  };

  // Retry loading transactions
  const retryFetchTransactions = () => {
    setIsLoading(true);
    setError(null);
    setActiveTab("pending");
    setSearchQuery("");

    // Re-fetch transactions
    if (isAuthenticated && user?.role === "admin") {
      fetchTransactions();
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

  if (error) {
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

          <div className="p-8 mb-6 bg-white rounded-lg shadow">
            <div className="flex flex-col items-center justify-center">
              <FiXCircle className="w-16 h-16 mb-4 text-red-500" />
              <h2 className="mb-2 text-2xl font-bold text-gray-800">
                Error Loading Transactions
              </h2>
              <p className="mb-6 text-gray-600">{error}</p>
              <button
                onClick={retryFetchTransactions}
                className="px-6 py-3 font-medium text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
              >
                Try Again
              </button>
            </div>
          </div>
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

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Transaction Management
          </h1>
          <p className="text-gray-600">
            Manage and monitor all transactions across different statuses
          </p>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap mb-6 space-x-2">
          <button
            onClick={() => handleTabChange("pending")}
            className={`px-4 py-2 mb-2 rounded-full transition-colors ${
              activeTab === "pending"
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="flex items-center">
              <FiClock className="mr-2" />
              Pending
              {totalCounts.pending > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-white text-orange-600 rounded-full">
                  {totalCounts.pending}
                </span>
              )}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("waiting-for-confirmation")}
            className={`px-4 py-2 mb-2 rounded-full transition-colors ${
              activeTab === "waiting-for-confirmation"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="flex items-center">
              <FiClock className="mr-2" />
              Waiting Confirmation
              {totalCounts["waiting-for-confirmation"] > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-white text-blue-600 rounded-full">
                  {totalCounts["waiting-for-confirmation"]}
                </span>
              )}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("success")}
            className={`px-4 py-2 mb-2 rounded-full transition-colors ${
              activeTab === "success"
                ? "bg-green-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="flex items-center">
              <FiCheckCircle className="mr-2" />
              Success
              {totalCounts.success > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-white text-green-600 rounded-full">
                  {totalCounts.success}
                </span>
              )}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("failed")}
            className={`px-4 py-2 mb-2 rounded-full transition-colors ${
              activeTab === "failed"
                ? "bg-red-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="flex items-center">
              <FiXCircle className="mr-2" />
              Failed
              {totalCounts.failed > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-white text-red-600 rounded-full">
                  {totalCounts.failed}
                </span>
              )}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("canceled")}
            className={`px-4 py-2 mb-2 rounded-full transition-colors ${
              activeTab === "canceled"
                ? "bg-gray-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="flex items-center">
              <FiXCircle className="mr-2" />
              Canceled
              {totalCounts.canceled > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-white text-gray-600 rounded-full">
                  {totalCounts.canceled}
                </span>
              )}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("all")}
            className={`px-4 py-2 mb-2 rounded-full transition-colors ${
              activeTab === "all"
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="flex items-center">
              All
              {totalCounts.all > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-white text-gray-800 rounded-full">
                  {totalCounts.all}
                </span>
              )}
            </span>
          </button>
        </div>

        {/* Panel with title and count */}
        <div className="p-6 mb-6 bg-white shadow-sm rounded-xl">
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            {activeTab === "all"
              ? "All Transactions"
              : activeTab === "pending"
              ? "Pending Transactions"
              : activeTab === "waiting-for-confirmation"
              ? "Waiting for Confirmation"
              : activeTab === "success"
              ? "Successful Transactions"
              : activeTab === "failed"
              ? "Failed Transactions"
              : "Canceled Transactions"}
          </h2>
          <p className="mb-4 text-gray-600">
            Total: {filteredTransactions.length} transactions
          </p>

          {/* Search box */}
          <div className="relative mb-6">
            <FiSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search by ID, title, or customer..."
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          {/* Transaction table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase border-b">
                    Invoice ID
                  </th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase border-b">
                    Title
                  </th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase border-b">
                    Payment Method
                  </th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase border-b">
                    Total Amount
                  </th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase border-b">
                    Order Date
                  </th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase border-b">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase border-b">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => viewTransactionDetail(transaction.id)}
                    >
                      <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {transaction.invoiceId}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate">
                          {transaction.title}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {transaction.paymentMethodName}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                        {formatCurrency(
                          transaction.amount || transaction.totalAmount
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${
                            transaction.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : transaction.status ===
                                "waiting-for-confirmation"
                              ? "bg-blue-100 text-blue-800"
                              : transaction.status === "success"
                              ? "bg-green-100 text-green-800"
                              : transaction.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {transaction.status === "pending"
                            ? "Pending"
                            : transaction.status === "waiting-for-confirmation"
                            ? "Waiting for Confirmation"
                            : transaction.status === "success"
                            ? "Success"
                            : transaction.status === "failed"
                            ? "Failed"
                            : "Canceled"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            viewTransactionDetail(transaction.id);
                          }}
                          className="p-2 text-orange-500 transition-colors rounded-full hover:bg-orange-50"
                        >
                          <FiEdit size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-6 text-sm text-center text-gray-500"
                    >
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
