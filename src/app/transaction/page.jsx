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
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { transactionService } from "@/lib/api";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
        setTransactions(response.data.data || []);
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

  // Format date
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Get status details
  const getStatusDetails = (status) => {
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

        {transactions.length > 0 ? (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {transactions.map((transaction) => {
              const statusDetails = getStatusDetails(transaction.status);

              return (
                <motion.div
                  key={transaction.id}
                  className="overflow-hidden bg-white shadow-sm rounded-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-col justify-between md:flex-row md:items-center">
                      <div>
                        <div className="flex items-center">
                          <h3 className="mr-3 text-lg font-bold text-gray-900">
                            Transaction #{transaction.id.substring(0, 8)}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDetails.color}`}
                          >
                            {statusDetails.icon} {statusDetails.text}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                      <div className="mt-3 md:mt-0">
                        <span className="text-lg font-bold text-primary-600">
                          Rp {transaction.amount.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <h4 className="mb-2 text-sm font-medium text-gray-500">
                          Payment Method
                        </h4>
                        <div className="flex items-center">
                          {transaction.paymentMethod?.imageUrl && (
                            <img
                              src={transaction.paymentMethod.imageUrl}
                              alt={transaction.paymentMethod.name}
                              className="h-6 mr-2"
                            />
                          )}
                          <span className="font-medium text-gray-900">
                            {transaction.paymentMethod?.name || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-2 text-sm font-medium text-gray-500">
                          Items
                        </h4>
                        <div className="text-gray-900">
                          {transaction.cart?.length || 0} item(s)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end mt-6">
                      <Link
                        href={`/transaction/${transaction.id}`}
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
    </div>
  );
}
