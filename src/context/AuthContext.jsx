"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/api";
import { toast } from "react-toastify";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await authService.getUser();
          setUser(response.data.data);
        }
      } catch (err) {
        console.error("Authentication error:", err);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      console.log("Login response:", response.data);

      // Handle different response structures
      let token, userData;

      // Try to extract token and user data from various possible response structures
      if (response.data?.data?.token) {
        token = response.data.data.token;
        userData = response.data.data.user || response.data.data;
      } else if (response.data?.token) {
        token = response.data.token;
        userData = response.data.user || response.data;
      } else if (response.data?.data) {
        // If there's no explicit token property, but there is data
        token = response.data.data.token || response.headers?.authorization;
        userData = response.data.data;
      }

      if (!token) {
        console.error("No token found in response", response.data);
        throw new Error("Authentication failed: No token received");
      }

      localStorage.setItem("token", token);
      setUser(userData);
      toast.success("Login successful!");

      return { success: true, user: userData };
    } catch (err) {
      console.error("Login error details:", err);
      const message =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      toast.success("Registration successful! Please login.");
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || "Registration failed. Please try again.";
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      localStorage.removeItem("token");
      setUser(null);
      toast.success("Logged out successfully!");
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
      // Force logout on client side even if API fails
      localStorage.removeItem("token");
      setUser(null);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.updateProfile(profileData);
      setUser(response.data.data);
      toast.success("Profile updated successfully!");
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to update profile. Please try again.";
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
