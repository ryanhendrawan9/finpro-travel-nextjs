"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiUsers,
  FiShoppingBag,
  FiTag,
  FiGrid,
  FiImage,
  FiExternalLink,
  FiActivity,
  FiPercent,
} from "react-icons/fi";

import { useAuth } from "@/context/AuthContext";
import {
  activityService,
  categoryService,
  bannerService,
  promoService,
  transactionService,
  authService,
} from "@/lib/api";

export default function AdminDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Dashboard stats
  const [stats, setStats] = useState({
    users: 0,
    transactions: 0,
    categories: 0,
    pendingOrders: 0,
    activities: 0,
    promos: 0,
    banners: 0,
  });

  // Recent transactions
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    // Redirect if not authenticated or not an admin
    if (!loading && (!isAuthenticated || (user && user.role !== "admin"))) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, user, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (isAuthenticated && user?.role === "admin") {
        try {
          setDataLoading(true);

          // Fetch data in parallel
          const [users, transactions, categories, activities, promos, banners] =
            await Promise.all([
              authService.getAllUsers(),
              transactionService.getAllTransactions(),
              categoryService.getAll(),
              activityService.getAll(),
              promoService.getAll(),
              bannerService.getAll(),
            ]);

          console.log("Dashboard data loaded");

          // Process data
          const pendingTransactions =
            transactions.data.data?.filter(
              (t) =>
                t.status === "waiting-for-payment" ||
                t.status === "waiting-for-confirmation"
            ) || [];

          // Update stats
          setStats({
            users: users.data.data?.length || 0,
            transactions: transactions.data.data?.length || 0,
            categories: categories.data.data?.length || 0,
            pendingOrders: pendingTransactions.length || 0,
            activities: activities.data.data?.length || 0,
            promos: promos.data.data?.length || 0,
            banners: banners.data.data?.length || 0,
          });

          // Get recent transactions - latest 5
          const sortedTransactions = [...(transactions.data.data || [])]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

          // Process transactions to ensure they have valid amounts
          const processedTransactions = sortedTransactions.map(
            (transaction) => {
              // If amount is missing or zero, calculate from cart items
              if (!transaction.amount || transaction.amount === 0) {
                if (transaction.cart && transaction.cart.length > 0) {
                  let calculatedTotal = 0;

                  transaction.cart.forEach((item) => {
                    if (item.activity) {
                      const price =
                        item.activity.price_discount ||
                        item.activity.price ||
                        0;
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

          setRecentTransactions(processedTransactions);
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setDataLoading(false);
        }
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, user]);

  if (loading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-bold animate-pulse text-primary-600">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (user && user.role !== "admin")) {
    return null; // Will redirect in useEffect
  }

  // Format date
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    try {
      return `Rp ${parseInt(amount).toLocaleString("id-ID")}`;
    } catch (e) {
      return "Rp 0";
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          Admin Dashboard
        </h1>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="p-6 bg-white shadow-sm rounded-xl dashboard-stat-card"
          >
            <div className="flex items-center">
              <div className="p-3 mr-4 rounded-lg bg-primary-100">
                <FiUsers className="text-xl text-primary-600" />
              </div>
              <div>
                <h3 className="text-sm text-gray-500">Total Users</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.users}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="p-6 bg-white shadow-sm rounded-xl dashboard-stat-card"
          >
            <div className="flex items-center">
              <div className="p-3 mr-4 bg-green-100 rounded-lg">
                <FiShoppingBag className="text-xl text-green-600" />
              </div>
              <div>
                <h3 className="text-sm text-gray-500">Total Orders</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.transactions}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="p-6 bg-white shadow-sm rounded-xl dashboard-stat-card"
          >
            <div className="flex items-center">
              <div className="p-3 mr-4 bg-blue-100 rounded-lg">
                <FiTag className="text-xl text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm text-gray-500">Pending Orders</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendingOrders}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="p-6 bg-white shadow-sm rounded-xl dashboard-stat-card"
          >
            <div className="flex items-center">
              <div className="p-3 mr-4 bg-orange-100 rounded-lg">
                <FiImage className="text-xl text-orange-600" />
              </div>
              <div>
                <h3 className="text-sm text-gray-500">Banners</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.banners}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="p-6 bg-white shadow-sm rounded-xl dashboard-stat-card"
          >
            <div className="flex items-center">
              <div className="p-3 mr-4 bg-purple-100 rounded-lg">
                <FiGrid className="text-xl text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm text-gray-500">Categories</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.categories}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="p-6 bg-white shadow-sm rounded-xl dashboard-stat-card"
          >
            <div className="flex items-center">
              <div className="p-3 mr-4 bg-indigo-100 rounded-lg">
                <FiActivity className="text-xl text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm text-gray-500">Activities</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.activities}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="p-6 bg-white shadow-sm rounded-xl dashboard-stat-card"
          >
            <div className="flex items-center">
              <div className="p-3 mr-4 bg-pink-100 rounded-lg">
                <FiPercent className="text-xl text-pink-600" />
              </div>
              <div>
                <h3 className="text-sm text-gray-500">Promos</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.promos}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 mb-8 bg-white shadow-sm rounded-xl">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Manage</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <Link
              href="/admin/users"
              className="flex flex-col items-center justify-center p-4 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100"
            >
              <FiUsers className="mb-2 text-2xl text-gray-700" />
              <span className="text-sm text-gray-700">Users</span>
            </Link>
            <Link
              href="/admin/transactions"
              className="flex flex-col items-center justify-center p-4 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100"
            >
              <FiShoppingBag className="mb-2 text-2xl text-gray-700" />
              <span className="text-sm text-gray-700">Orders</span>
            </Link>
            <Link
              href="/admin/banners"
              className="flex flex-col items-center justify-center p-4 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100"
            >
              <FiImage className="mb-2 text-2xl text-gray-700" />
              <span className="text-sm text-gray-700">Banners</span>
            </Link>
            <Link
              href="/admin/categories"
              className="flex flex-col items-center justify-center p-4 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100"
            >
              <FiGrid className="mb-2 text-2xl text-gray-700" />
              <span className="text-sm text-gray-700">Categories</span>
            </Link>
            <Link
              href="/admin/activities"
              className="flex flex-col items-center justify-center p-4 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100"
            >
              <FiActivity className="mb-2 text-2xl text-gray-700" />
              <span className="text-sm text-gray-700">Activities</span>
            </Link>
            <Link
              href="/admin/promos"
              className="flex flex-col items-center justify-center p-4 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100"
            >
              <FiPercent className="mb-2 text-2xl text-gray-700" />
              <span className="text-sm text-gray-700">Promos</span>
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="p-6 bg-white shadow-sm rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <Link
              href="/admin/transactions"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              View All
            </Link>
          </div>

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
                {recentTransactions.map((transaction) => {
                  // Determine status style
                  let statusClass = "bg-gray-100 text-gray-800";
                  if (transaction.status === "success") {
                    statusClass = "bg-green-100 text-green-800";
                  } else if (
                    transaction.status === "waiting-for-payment" ||
                    transaction.status === "waiting-for-confirmation"
                  ) {
                    statusClass = "bg-yellow-100 text-yellow-800";
                  } else if (
                    transaction.status === "failed" ||
                    transaction.status === "canceled"
                  ) {
                    statusClass = "bg-red-100 text-red-800";
                  }

                  return (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        #{transaction.id.substring(0, 8)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {transaction.user?.name ||
                          transaction.user?.email ||
                          "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${statusClass}`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        <Link
                          href={`/transaction/${transaction.id}`}
                          className="p-2 text-blue-600 transition-colors rounded-full hover:bg-blue-50"
                        >
                          <FiExternalLink size={16} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}

                {recentTransactions.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-sm text-center text-gray-500"
                    >
                      No recent transactions found.
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
