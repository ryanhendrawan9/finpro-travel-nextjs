// Helper functions untuk normalisasi data transaksi

/**
 * Menormalkan data transaksi dari berbagai format response API
 * @param {Object} transaction - Data transaksi dari API
 * @returns {Object} Data transaksi yang sudah dinormalisasi
 */
export const normalizeTransaction = (transaction) => {
  if (!transaction) return null;

  // Handle different possible field names
  const items = transaction.transaction_items || transaction.cart || [];

  // Normalize transaction items structure
  const normalizedItems = items.map(normalizeTransactionItem);

  // Build normalized transaction object
  return {
    ...transaction,
    cart: normalizedItems,
    // Ensure essential fields exist with fallbacks
    id: transaction.id || "",
    status: normalizeStatus(transaction.status || "pending"),
    proofPaymentUrl: transaction.proofPaymentUrl || null,
    amount: transaction.amount || transaction.totalAmount || 0,
    paymentMethod: normalizePaymentMethod(
      transaction.payment_method || transaction.paymentMethod || {}
    ),
    user: transaction.user || {}, // Make sure user is available
  };
};

/**
 * Menormalkan status transaksi ke format yang konsisten
 * @param {string} status - Status dari API
 * @returns {string} Status yang sudah dinormalisasi
 */
export const normalizeStatus = (status) => {
  if (!status) return "pending";

  const statusLower =
    typeof status === "string" ? status.toLowerCase().trim() : "pending";

  // Map ALL possible status values from API to consistent values
  switch (statusLower) {
    case "pending":
    case "menunggu pembayaran":
    case "waiting payment":
    case "unpaid":
      return "waiting-for-payment";

    case "waiting-for-confirmation":
    case "menunggu konfirmasi":
    case "awaiting approval":
    case "waiting confirmation":
    case "verification":
      return "waiting-for-confirmation";

    case "completed":
    case "success":
    case "berhasil":
    case "succeeded":
    case "paid":
    case "selesai":
      return "success";

    case "cancelled":
    case "canceled":
    case "dibatalkan":
      return "canceled";

    case "failed":
    case "failure":
    case "gagal":
    case "rejected":
    case "declined":
      return "failed";

    default:
      // Log unknown status for debugging
      console.warn("Unknown transaction status detected:", status);

      // Try to match key parts of the status string for unknown formats
      if (
        statusLower.includes("wait") ||
        statusLower.includes("pending") ||
        statusLower.includes("tunggu")
      ) {
        if (
          statusLower.includes("confirm") ||
          statusLower.includes("konfirmasi") ||
          statusLower.includes("verif")
        ) {
          return "waiting-for-confirmation";
        } else {
          return "waiting-for-payment";
        }
      } else if (
        statusLower.includes("fail") ||
        statusLower.includes("gagal") ||
        statusLower.includes("reject")
      ) {
        return "failed";
      } else if (
        statusLower.includes("success") ||
        statusLower.includes("berhasil") ||
        statusLower.includes("comple")
      ) {
        return "success";
      } else if (
        statusLower.includes("cancel") ||
        statusLower.includes("batal")
      ) {
        return "canceled";
      }

      // Default to pending if truly unknown
      return "waiting-for-payment";
  }
};

/**
 * Menormalkan data item transaksi
 * @param {Object} item - Item transaksi dari API
 * @returns {Object} Item yang sudah dinormalisasi
 */
export const normalizeTransactionItem = (item) => {
  if (!item) return null;

  // If item already has an activity property, normalize that activity
  if (item.activity) {
    return {
      ...item,
      quantity: parseInt(item.quantity) || 1,
      activity: normalizeActivityData(item.activity),
    };
  }

  // Otherwise, construct an activity object from the item itself
  return {
    id: item.id || "",
    quantity: parseInt(item.quantity) || 1,
    activity: normalizeActivityData(item),
  };
};

/**
 * Menormalkan data aktivitas/produk
 * @param {Object} activity - Data aktivitas dari API
 * @returns {Object} Data aktivitas yang sudah dinormalisasi
 */
export const normalizeActivityData = (activity) => {
  if (!activity) return {};

  // Handle image URLs in different formats
  let imageUrls = [];
  if (Array.isArray(activity.imageUrls) && activity.imageUrls.length > 0) {
    imageUrls = activity.imageUrls;
  } else if (activity.imageUrl) {
    imageUrls = [activity.imageUrl];
  }

  // Normalize price values
  let price = 0;
  if (activity.price) {
    price =
      typeof activity.price === "string"
        ? parseFloat(activity.price)
        : activity.price;
  }

  let priceDiscount = null;
  if (activity.price_discount) {
    priceDiscount =
      typeof activity.price_discount === "string"
        ? parseFloat(activity.price_discount)
        : activity.price_discount;
  }

  // Return normalized activity
  return {
    id: activity.id || "",
    title: activity.title || "Unnamed Activity",
    price: price,
    price_discount: priceDiscount,
    imageUrls: imageUrls,
    description: activity.description || "",
    city: activity.city || "",
    province: activity.province || "",
  };
};

/**
 * Menormalkan data metode pembayaran
 * @param {Object} paymentMethod - Data metode pembayaran dari API
 * @returns {Object} Metode pembayaran yang sudah dinormalisasi
 */
export const normalizePaymentMethod = (paymentMethod) => {
  if (!paymentMethod) return {};

  return {
    id: paymentMethod.id || "",
    name: paymentMethod.name || "Unknown Payment Method",
    imageUrl: paymentMethod.imageUrl || null,
    virtual_account_number:
      paymentMethod.virtual_account_number || "1234-5678-9012-3456",
    virtual_account_name: paymentMethod.virtual_account_name || "TravelBright",
  };
};

/**
 * Menghitung total dari item transaksi
 * @param {Array} items - Array item transaksi
 * @returns {number} Total harga
 */
export const calculateTransactionTotal = (items) => {
  if (!Array.isArray(items) || items.length === 0) return 0;

  return items.reduce((total, item) => {
    // Skip invalid items
    if (!item) return total;

    // Get activity data either from item.activity or from item itself
    const activityData = item.activity || item;

    // Get price (prioritize discounted price)
    let price = 0;
    if (activityData.price_discount) {
      price =
        typeof activityData.price_discount === "string"
          ? parseFloat(activityData.price_discount)
          : activityData.price_discount;
    } else if (activityData.price) {
      price =
        typeof activityData.price === "string"
          ? parseFloat(activityData.price)
          : activityData.price;
    }

    // Handle invalid price
    if (isNaN(price)) price = 0;

    // Get quantity with fallback to 1
    const quantity = parseInt(item.quantity) || 1;

    // Add to total
    return total + price * quantity;
  }, 0);
};
