// src/app/admin/transactions/page.jsx
"use client";

import { useState, useEffect } from "react";
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
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { transactionService } from "@/lib/api";
import { toast } from "react-toastify";

export default function AdminTransactions() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
        const response = await transactionService.getAllTransactions();
        console.log("Admin transactions:", response.data);

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
        setError("Failed to load transactions. Please try again later.");
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
    const filtered = transactions.filter((transaction) => {
      // Status filter
      if (statusFilter !== "all" && transaction.status !== statusFilter) {
        return false;
      }

      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const id = transaction.id?.toLowerCase() || "";
        const userName = transaction.user?.name?.toLowerCase() || "";
        const userEmail = transaction.user?.email?.toLowerCase() || "";

        return (
          id.includes(query) ||
          userName.includes(query) ||
          userEmail.includes(query)
        );
      }

      return true;
    });

    setFilteredTransactions(filtered);
  }, [searchQuery, statusFilter, transactions]);

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
    try {
      await transactionService.updateStatus(id, { status });

      // Update local state
      setTransactions((prevTransactions) =>
        prevTransactions.map((trans) =>
          trans.id === id ? { ...trans, status } : trans
        )
      );

      toast.success(`Transaction status updated to ${status}`);
    } catch (error) {
      console.error("Error updating transaction status:", error);
      toast.error("Failed to update transaction status");
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

        {/* Filters */}
        <div className="flex flex-col mb-6 space-y-4 md:space-y-0 md:space-x-4 md:flex-row md:items-center">
          <div className="relative flex-grow">
            <FiSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search by ID or customer..."
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
                {filteredTransactions.map((transaction) => {
                  const statusDetails = getStatusDetails(transaction?.status);
                  const shortId = transaction.id.substring(0, 8);

                  return (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        #{shortId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
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
                          <Link
                            href={`/transaction/${transaction.id}`}
                            className="p-1 text-blue-600 transition-colors rounded-md hover:bg-blue-50"
                            title="View details"
                          >
                            <FiExternalLink size={16} />
                          </Link>

                          {transaction.status ===
                            "waiting-for-confirmation" && (
                            <>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(transaction.id, "success")
                                }
                                className="p-1 text-green-600 transition-colors rounded-md hover:bg-green-50"
                                title="Approve payment"
                              >
                                <FiCheckCircle size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(transaction.id, "failed")
                                }
                                className="p-1 text-red-600 transition-colors rounded-md hover:bg-red-50"
                                title="Reject payment"
                              >
                                <FiXCircle size={16} />
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
      </div>
    </div>
  );
}
