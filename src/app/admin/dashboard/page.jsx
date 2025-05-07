"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FiUsers, FiShoppingBag, FiTag, FiGrid, FiImage } from "react-icons/fi";

export default function AdminDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated or not an admin
    if (!loading && (!isAuthenticated || (user && user.role !== "admin"))) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, user, router]);

  if (loading) {
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

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          Admin Dashboard
        </h1>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-white shadow-sm rounded-xl dashboard-stat-card">
            <div className="flex items-center">
              <div className="p-3 mr-4 rounded-lg bg-primary-100">
                <FiUsers className="text-xl text-primary-600" />
              </div>
              <div>
                <h3 className="text-sm text-gray-500">Total Users</h3>
                <p className="text-2xl font-bold text-gray-900">373</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white shadow-sm rounded-xl dashboard-stat-card">
            <div className="flex items-center">
              <div className="p-3 mr-4 bg-green-100 rounded-lg">
                <FiShoppingBag className="text-xl text-green-600" />
              </div>
              <div>
                <h3 className="text-sm text-gray-500">Total Transactions</h3>
                <p className="text-2xl font-bold text-gray-900">559</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white shadow-sm rounded-xl dashboard-stat-card">
            <div className="flex items-center">
              <div className="p-3 mr-4 bg-orange-100 rounded-lg">
                <FiGrid className="text-xl text-orange-600" />
              </div>
              <div>
                <h3 className="text-sm text-gray-500">Categories</h3>
                <p className="text-2xl font-bold text-gray-900">25</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white shadow-sm rounded-xl dashboard-stat-card">
            <div className="flex items-center">
              <div className="p-3 mr-4 bg-blue-100 rounded-lg">
                <FiTag className="text-xl text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm text-gray-500">Pending Orders</h3>
                <p className="text-2xl font-bold text-gray-900">238</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 mb-8 bg-white shadow-sm rounded-xl">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <button className="flex flex-col items-center justify-center p-4 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100">
              <FiUsers className="mb-2 text-2xl text-gray-700" />
              <span className="text-sm text-gray-700">Manage Users</span>
            </button>

            <button className="flex flex-col items-center justify-center p-4 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100">
              <FiShoppingBag className="mb-2 text-2xl text-gray-700" />
              <span className="text-sm text-gray-700">Orders</span>
            </button>

            <button className="flex flex-col items-center justify-center p-4 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100">
              <FiGrid className="mb-2 text-2xl text-gray-700" />
              <span className="text-sm text-gray-700">Categories</span>
            </button>

            <button className="flex flex-col items-center justify-center p-4 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100">
              <FiImage className="mb-2 text-2xl text-gray-700" />
              <span className="text-sm text-gray-700">Banners</span>
            </button>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="p-6 bg-white shadow-sm rounded-xl">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Recent Orders
          </h2>
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    #123456
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    John Doe
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    Rp 750.000
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full">
                      Completed
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    May 7, 2025
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    #123455
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    Jane Smith
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    Rp 1.200.000
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 text-xs font-semibold leading-5 text-yellow-800 bg-yellow-100 rounded-full">
                      Pending
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    May 6, 2025
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    #123454
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    Mike Johnson
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    Rp 500.000
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 text-xs font-semibold leading-5 text-red-800 bg-red-100 rounded-full">
                      Cancelled
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    May 5, 2025
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
