import axios from "axios";

const API_KEY =
  process.env.NEXT_PUBLIC_API_KEY || "24405e01-fbc1-45a5-9f5a-be13afcd757c";
const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

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
    if (typeof window !== "undefined") {
      console.log(
        `[API Response] ${response.config.method?.toUpperCase() || "GET"} ${
          response.config.url
        } - Success:`,
        response.data
      );
    }
    return response;
  },
  (error) => {
    // Log detailed error information
    console.error(`[API Response Error]`, {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        // Don't force navigation during SSR
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    // Handle server errors
    if (error.response && error.response.status >= 500) {
      console.error("Server error:", error.response.data);
    }

    return Promise.reject(error);
  }
);

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

// Activity services
export const activityService = {
  getAll: () => api.get("/api/v1/activities"),
  getById: (id) => api.get(`/api/v1/activity/${id}`),
  getByCategory: (categoryId) =>
    api.get(`/api/v1/activities-by-category/${categoryId}`),
  create: (data) => api.post("/api/v1/create-activity", data),
  update: (id, data) => api.post(`/api/v1/update-activity/${id}`, data),
  delete: (id) => api.delete(`/api/v1/delete-activity/${id}`),
};

// Category services
export const categoryService = {
  getAll: () => api.get("/api/v1/categories"),
  getById: (id) => api.get(`/api/v1/category/${id}`),
  create: (data) => api.post("/api/v1/create-category", data),
  update: (id, data) => api.post(`/api/v1/update-category/${id}`, data),
  delete: (id) => api.delete(`/api/v1/delete-category/${id}`),
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
  getAll: () => api.get("/api/v1/carts"),
  addToCart: (data) => api.post("/api/v1/add-cart", data),
  updateCart: (id, data) => api.post(`/api/v1/update-cart/${id}`, data),
  deleteCart: (id) => api.delete(`/api/v1/delete-cart/${id}`),
};

// Transaction services
export const transactionService = {
  getById: (id) => api.get(`/api/v1/transaction/${id}`),
  getMyTransactions: () => api.get("/api/v1/my-transactions"),
  getAllTransactions: () => api.get("/api/v1/all-transactions"),
  create: (data) => api.post("/api/v1/create-transaction", data),
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
