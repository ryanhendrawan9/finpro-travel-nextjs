import axios from "axios";

const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Log configuration in browser environment
if (typeof window !== "undefined") {
  console.log("API Configuration:", { API_KEY, BASE_URL });
}

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    apiKey: API_KEY,
    "Content-Type": "application/json",
  },
  // Increased timeout for requests that may take longer
  timeout: 30000,
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "development"
    ) {
      console.log(
        `[API Request] ${config.method?.toUpperCase() || "GET"} ${config.url}`,
        config.data || ""
      );
    }
    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors - MODIFIED FOR PROFILE UPDATE
api.interceptors.response.use(
  (response) => {
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "development"
    ) {
      console.log(
        `[API Response] ${response.config.method?.toUpperCase() || "GET"} ${
          response.config.url
        } - Success`
      );
    }

    // Check response structure but don't show error/warn
    if (response.data && !response.data.data && !response.data.message) {
      // Silent warning, or use custom logger if needed
      // console.warn("API Response doesn't have the expected structure");
    }

    return response;
  },
  (error) => {
    // Fix: Check if error.config exists before accessing properties
    const errorDetails = {
      url: error.config?.url || "unknown",
      method: error.config?.method?.toUpperCase() || "unknown",
      status: error.response?.status || "unknown",
    };

    // Use silent logging without showing error
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[API Request Failed] ${errorDetails.method} ${errorDetails.url} - Status: ${errorDetails.status}`
      );
    }

    // Modified 401 handler to prevent automatic logout during profile updates
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        // Check if this is a profile update request
        const isProfileUpdate = errorDetails.url.includes("update-profile");

        if (!isProfileUpdate) {
          // Only logout for non-profile updates
          localStorage.removeItem("token");

          // Don't force navigation during SSR
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
        }
      }
    }

    // Handle server errors silently
    if (error.response && error.response.status >= 500) {
      // Use more silent approach for logging
      if (process.env.NODE_ENV === "development") {
        console.log("Server error occurred - status 500");
      }
    } else if (!error.response) {
      if (process.env.NODE_ENV === "development") {
        console.log("Network error or server not responding");
      }
    }

    return Promise.reject(error);
  }
);

// Function to create fallback response if API fails to return expected response
const createFallbackResponse = (message = "No data returned from server") => {
  return {
    data: {
      data: null,
      message: message,
      success: false,
    },
  };
};

// Authentication services
export const authService = {
  login: (data) => api.post("/api/v1/login", data),
  register: (data) => api.post("/api/v1/register", data),
  logout: () => api.get("/api/v1/logout"),
  getUser: () => api.get("/api/v1/user"),
  getAllUsers: () => api.get("/api/v1/all-user"),
  updateProfile: (data) => api.post("/api/v1/update-profile", data),
  updateRole: (userId, data) =>
    api.post(`/api/v1/update-user-role/${userId}`, data),
};

// Activity services with silent error handling
export const activityService = {
  getAll: async () => {
    try {
      return await api.get("/api/v1/activities");
    } catch (error) {
      // Use console.warn instead of console.error
      console.warn("Failed to fetch activities:", error.message);
      // Return fallback response with empty array to avoid breaking UI
      return createFallbackResponse("Failed to fetch activities");
    }
  },
  getById: async (id) => {
    try {
      return await api.get(`/api/v1/activity/${id}`);
    } catch (error) {
      console.warn(`Failed to fetch activity with ID ${id}:`, error.message);
      return createFallbackResponse(`Failed to fetch activity with ID ${id}`);
    }
  },
  getByCategory: async (categoryId) => {
    try {
      return await api.get(`/api/v1/activities-by-category/${categoryId}`);
    } catch (error) {
      console.warn(
        `Failed to fetch activities for category ${categoryId}:`,
        error.message
      );
      return createFallbackResponse(
        `Failed to fetch activities for category ${categoryId}`
      );
    }
  },
  create: async (data) => {
    try {
      const response = await api.post("/api/v1/create-activity", data);
      return response;
    } catch (error) {
      console.warn("Failed to create activity:", error.message);
      // Return partial response with form data as fallback
      return {
        data: {
          data: { ...data, id: `temp-${Date.now()}` },
          message: "Created with fallback data due to server error",
        },
      };
    }
  },
  update: async (id, data) => {
    try {
      const response = await api.post(`/api/v1/update-activity/${id}`, data);
      return response;
    } catch (error) {
      console.warn(`Failed to update activity ${id}:`, error.message);
      // Return partial response with form data as fallback
      return {
        data: {
          data: { ...data, id },
          message: "Updated with fallback data due to server error",
        },
      };
    }
  },
  delete: async (id) => {
    try {
      return await api.delete(`/api/v1/delete-activity/${id}`);
    } catch (error) {
      console.warn(`Failed to delete activity ${id}:`, error.message);
      // Return success response to let UI update even if server fails
      return {
        data: {
          message: "Activity marked for deletion",
          success: true,
        },
      };
    }
  },
};

// Category services with better error handling
export const categoryService = {
  getAll: async () => {
    try {
      return await api.get("/api/v1/categories");
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      return createFallbackResponse("Failed to fetch categories");
    }
  },
  getById: async (id) => {
    try {
      return await api.get(`/api/v1/category/${id}`);
    } catch (error) {
      console.error(`Failed to fetch category with ID ${id}:`, error);
      return createFallbackResponse(`Failed to fetch category with ID ${id}`);
    }
  },
  create: async (data) => {
    try {
      return await api.post("/api/v1/create-category", data);
    } catch (error) {
      console.error("Failed to create category:", error);
      throw error;
    }
  },
  update: async (id, data) => {
    try {
      return await api.post(`/api/v1/update-category/${id}`, data);
    } catch (error) {
      console.error(`Failed to update category ${id}:`, error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      return await api.delete(`/api/v1/delete-category/${id}`);
    } catch (error) {
      console.error(`Failed to delete category ${id}:`, error);
      throw error;
    }
  },
};

// Banner services
export const bannerService = {
  getAll: () => api.get("/api/v1/banners"),
  getById: (id) => api.get(`/api/v1/banner/${id}`),
  create: (data) => api.post("/api/v1/create-banner", data),
  update: (id, data) => api.post(`/api/v1/update-banner/${id}`, data),
  delete: (id) => api.delete(`/api/v1/delete-banner/${id}`),
};

// Promo services
export const promoService = {
  getAll: () => api.get("/api/v1/promos"),
  getById: (id) => api.get(`/api/v1/promo/${id}`),
  create: (data) => api.post("/api/v1/create-promo", data),
  update: (id, data) => api.post(`/api/v1/update-promo/${id}`, data),
  delete: (id) => api.delete(`/api/v1/delete-promo/${id}`),
};

// Cart services
export const cartService = {
  getAll: async () => {
    try {
      const response = await api.get("/api/v1/carts");

      // Handle the response - even if empty array
      if (response.data && Array.isArray(response.data.data)) {
        const cartItems = response.data.data;
        console.log(
          "Cart data fetched - Items:",
          cartItems.length,
          "Subtotal:",
          calculateCartTotal(cartItems)
        );
        return response;
      } else {
        console.warn(
          "API returned invalid cart data structure:",
          response.data
        );
        return { data: { data: [], message: "No cart data found" } };
      }
    } catch (error) {
      console.warn("Error fetching cart:", error.message);
      // Return empty cart to prevent errors
      return { data: { data: [], message: "Failed to fetch cart items" } };
    }
  },
  addToCart: (data) => api.post("/api/v1/add-cart", data),
  updateCart: (id, data) => api.post(`/api/v1/update-cart/${id}`, data),
  deleteCart: (id) => api.delete(`/api/v1/delete-cart/${id}`),
};

function calculateCartTotal(cartItems) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) return 0;

  return cartItems.reduce((total, item) => {
    if (!item || !item.activity) return total;

    const price = parseFloat(
      item.activity.price_discount || item.activity.price || 0
    );
    const qty = parseInt(item.quantity) || 1;
    return isNaN(price) ? total : total + price * qty;
  }, 0);
}

// Transaction services
export const transactionService = {
  getById: (id) => {
    console.log(`Getting transaction with ID: ${id}`);
    return api
      .get(`/api/v1/transaction/${id}`)
      .then((response) => {
        console.log("Transaction data received:", response.data);
        return response;
      })
      .catch((error) => {
        console.warn(
          `Failed to fetch transaction with ID ${id}:`,
          error.message
        );
        return createFallbackResponse(
          `Failed to fetch transaction with ID ${id}`
        );
      });
  },

  getMyTransactions: () => {
    console.log("Fetching my transactions");
    return api
      .get("/api/v1/my-transactions")
      .then((response) => {
        console.log("My transactions data received:", response.data);
        return response;
      })
      .catch((error) => {
        console.warn("Failed to fetch my transactions:", error.message);
        return createFallbackResponse("Failed to fetch transaction history");
      });
  },

  getAllTransactions: () => {
    console.log("Fetching all transactions");
    return api.get("/api/v1/all-transactions").catch((error) => {
      console.warn("Failed to fetch all transactions:", error.message);
      return createFallbackResponse("Failed to fetch all transactions");
    });
  },

  create: async (data) => {
    console.log("Creating transaction with data:", data);
    try {
      // Validate data before sending to API
      if (
        !data.cartIds ||
        !Array.isArray(data.cartIds) ||
        data.cartIds.length === 0
      ) {
        throw new Error("No cart items selected for checkout");
      }

      if (!data.paymentMethodId) {
        throw new Error("No payment method selected");
      }

      const response = await api.post("/api/v1/create-transaction", data);
      console.log("Transaction creation response:", response.data);
      return response;
    } catch (error) {
      console.warn("Transaction creation error:", error.message);
      throw error; // Re-throw to let the component handle it
    }
  },

  cancel: (id) => {
    console.log(`Canceling transaction with ID: ${id}`);
    return api.post(`/api/v1/cancel-transaction/${id}`).catch((error) => {
      console.warn(`Failed to cancel transaction ${id}:`, error.message);
      throw error; // Re-throw to let component handle it
    });
  },

  updateProofPayment: (id, data) => {
    console.log(`Updating proof payment for transaction ${id}:`, data);
    // Validate proof payment URL before sending
    if (!data.proofPaymentUrl || !data.proofPaymentUrl.trim()) {
      return Promise.reject(new Error("Payment proof URL is required"));
    }

    return api
      .post(`/api/v1/update-transaction-proof-payment/${id}`, data)
      .catch((error) => {
        console.warn(
          `Failed to update proof payment for transaction ${id}:`,
          error.message
        );
        throw error; // Re-throw to let component handle it
      });
  },

  updateStatus: async (id, data) => {
    console.log(`Updating transaction status for ID: ${id}, data:`, data);

    // Validasi data sebelum dikirim
    if (!data.status) {
      console.error("Missing status in update request");
      return Promise.reject(new Error("Status is required"));
    }

    try {
      // Format status yang sesuai dengan API
      let statusToSend = data.status;

      // Kirim data sesuai format yang diharapkan API
      const response = await api.post(
        `/api/v1/update-transaction-status/${id}`,
        {
          status: statusToSend,
        }
      );

      console.log("Status update response:", response.data);
      return response;
    } catch (error) {
      // Log error secara detail untuk debugging
      console.error("API Error Details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
        },
      });

      throw error;
    }
  },
};

// Payment method services
export const paymentMethodService = {
  getAll: () => api.get("/api/v1/payment-methods"),
  generate: () => api.post("/api/v1/generate-payment-methods"),
};

// Upload service
export const uploadService = {
  uploadImage: (formData) => {
    return api.post("/api/v1/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
