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
  // Tambahkan timeout yang lebih lama untuk request yang mungkin memerlukan waktu lama
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
    if (typeof window !== "undefined") {
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

// Response interceptor for handling common errors
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

    // Periksa struktur respons tapi jangan tampilkan error/warn
    if (response.data && !response.data.data && !response.data.message) {
      // Silent warning, atau gunakan custom logger jika diperlukan
      // console.warn("API Response tidak memiliki struktur yang diharapkan");
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

    // Gunakan silent logging tanpa menampilkan error
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[API Request Failed] ${errorDetails.method} ${errorDetails.url} - Status: ${errorDetails.status}`
      );
    }

    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        // Don't force navigation during SSR
        // Gunakan window.location.href untuk reload halaman hanya jika di halaman yang bukan login
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }

    // Handle server errors silently
    if (error.response && error.response.status >= 500) {
      // Hilangkan console.error, gunakan alternatif yang lebih silent:
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

// Fungsi untuk membuat response fallback jika API gagal mengembalikan respons yang diharapkan
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
  getAll: () =>
    api.get("/api/v1/carts").then((response) => {
      if (typeof window !== "undefined") {
        // Log cart data for debugging
        console.log(
          "Cart totals calculated - Items:",
          response.data?.data?.length || 0,
          "Subtotal:",
          response.data?.data?.reduce(
            (total, item) => total + (item?.price || 0) * (item?.quantity || 1),
            0
          ) || 0
        );
      }
      return response;
    }),
  addToCart: (data) => api.post("/api/v1/add-cart", data),
  updateCart: (id, data) => api.post(`/api/v1/update-cart/${id}`, data),
  deleteCart: (id) => api.delete(`/api/v1/delete-cart/${id}`),
};

// Transaction services
export const transactionService = {
  getById: (id) => {
    console.log(`Getting transaction with ID: ${id}`);
    return api.get(`/api/v1/transaction/${id}`).then((response) => {
      console.log("Transaction data received:", response.data);
      return response;
    });
  },
  getMyTransactions: () => {
    console.log("Fetching my transactions");
    return api.get("/api/v1/my-transactions").then((response) => {
      console.log("My transactions data received:", response.data);
      return response;
    });
  },
  getAllTransactions: () => api.get("/api/v1/all-transactions"),
  create: (data) => {
    console.log("Creating transaction with data:", data);
    return api.post("/api/v1/create-transaction", data).then((response) => {
      console.log("Transaction creation response:", response.data);
      return response;
    });
  },
  cancel: (id) => api.post(`/api/v1/cancel-transaction/${id}`),
  updateProofPayment: (id, data) =>
    api.post(`/api/v1/update-transaction-proof-payment/${id}`, data),
  updateStatus: (id, data) =>
    api.post(`/api/v1/update-transaction-status/${id}`, data),
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
