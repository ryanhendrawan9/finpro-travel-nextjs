// src/app/admin/users/page.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiEdit,
  FiUser,
  FiMail,
  FiPhone,
  FiSearch,
  FiFilter,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/lib/api";
import { toast } from "react-toastify";
import debounce from "lodash/debounce";

export default function AdminUsers() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    role: "user",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Debounce search function
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

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await authService.getAllUsers();
        const userData = response.data.data || [];
        setUsers(userData);
        setFilteredUsers(userData);
      } catch (err) {
        setError("Failed to load users. Please try again.");
        console.error("Error fetching users:", err);
        toast.error("Failed to load users. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user?.role === "admin") {
      fetchUsers();
    }
  }, [isAuthenticated, user]);

  // Filter users when search or role filter changes
  useEffect(() => {
    const filterUsers = () => {
      return users.filter((userData) => {
        // Role filter
        if (roleFilter !== "all" && userData.role !== roleFilter) {
          return false;
        }

        // Search query filter
        if (debouncedSearchQuery) {
          const query = debouncedSearchQuery.toLowerCase();
          const name = userData.name?.toLowerCase() || "";
          const email = userData.email?.toLowerCase() || "";
          const phone = userData.phoneNumber?.toLowerCase() || "";

          return (
            name.includes(query) ||
            email.includes(query) ||
            phone.includes(query)
          );
        }

        return true;
      });
    };

    // Apply the filters
    const filtered = filterUsers();
    setFilteredUsers(filtered);

    // Reset to first page when filters change
    setCurrentPage(1);
  }, [debouncedSearchQuery, roleFilter, users]);

  // Handle edit user role
  const handleEditRole = (userData) => {
    setCurrentUser(userData);
    setFormData({
      role: userData.role || "user",
    });
    setIsFormOpen(true);
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle update role
  const handleUpdateRole = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      await authService.updateRole(currentUser.id, formData);

      // Update user in local state
      const updatedUsers = users.map((u) =>
        u.id === currentUser.id ? { ...u, role: formData.role } : u
      );

      setUsers(updatedUsers);

      // Re-apply filters to the updated users
      const updatedFilteredUsers = updatedUsers.filter(
        (u) => roleFilter === "all" || u.role === roleFilter
      );

      setFilteredUsers(updatedFilteredUsers);

      toast.success("User role updated successfully");
      setIsFormOpen(false);
    } catch (err) {
      console.error("Error updating user role:", err);
      toast.error("Failed to update user role");
    } finally {
      setFormLoading(false);
    }
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Retry fetching users
  const retryFetchUsers = async () => {
    if (isAuthenticated && user?.role === "admin") {
      try {
        setIsLoading(true);
        setError(null);
        const response = await authService.getAllUsers();
        const userData = response.data.data || [];
        setUsers(userData);
        setFilteredUsers(userData);
        toast.success("Users loaded successfully");
      } catch (err) {
        setError("Failed to load users. Please try again.");
        console.error("Error retrying user fetch:", err);
        toast.error("Failed to load users. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-bold animate-pulse text-primary-600">
          Loading users...
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

        <h1 className="mb-6 text-2xl font-bold text-gray-900">Manage Users</h1>

        {/* Error message */}
        {error && (
          <div className="p-4 mb-6 text-red-700 bg-red-100 border border-red-300 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
            <button
              onClick={retryFetchUsers}
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
              placeholder="Search by name, email or phone..."
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
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>

        {/* Users list */}
        <div className="overflow-hidden bg-white shadow-sm rounded-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Phone
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    Role
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
                {currentUsers.map((userData) => (
                  <tr key={userData.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10">
                          <img
                            className="object-cover w-10 h-10 rounded-full"
                            src={
                              userData.profilePictureUrl ||
                              "/images/placeholders/user-placeholder.jpg"
                            }
                            alt={userData.name || "User"}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "/images/placeholders/user-placeholder.jpg";
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {userData.name || "Unnamed User"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {userData.email || "No email"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {userData.phoneNumber || "No phone"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          userData.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {userData.role || "user"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      <button
                        onClick={() => handleEditRole(userData)}
                        className="p-2 text-blue-600 transition-colors rounded-full hover:bg-blue-50"
                      >
                        <FiEdit size={16} />
                      </button>
                    </td>
                  </tr>
                ))}

                {currentUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-sm text-center text-gray-500"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
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

      {/* User role edit modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-xl">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Update User Role
            </h2>
            <form onSubmit={handleUpdateRole}>
              <div className="mb-4">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 w-12 h-12">
                    <img
                      className="object-cover w-12 h-12 rounded-full"
                      src={
                        currentUser?.profilePictureUrl ||
                        "/images/placeholders/user-placeholder.jpg"
                      }
                      alt={currentUser?.name || "User"}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "/images/placeholders/user-placeholder.jpg";
                      }}
                    />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {currentUser?.name || currentUser?.email || "User"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {currentUser?.email}
                    </p>
                  </div>
                </div>

                <label
                  htmlFor="role"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end mt-6 space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setCurrentUser(null);
                  }}
                  className="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400"
                >
                  {formLoading ? (
                    <div className="flex items-center">
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
                      Updating...
                    </div>
                  ) : (
                    <>Save</>
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
