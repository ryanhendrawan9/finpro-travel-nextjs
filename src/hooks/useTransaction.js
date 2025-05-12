// src/hooks/useTransaction.js
import { useState, useCallback } from "react";
import { transactionService, uploadService } from "@/lib/api";
import { toast } from "react-toastify";
import {
  normalizeTransaction,
  normalizeStatus,
} from "@/lib/transaction-helpers";

export const useTransaction = () => {
  const [transaction, setTransaction] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatingTransaction, setUpdatingTransaction] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch a single transaction by ID
  const fetchTransaction = useCallback(async (id) => {
    if (!id) return null;

    setIsLoading(true);
    setError(null);

    try {
      const response = await transactionService.getById(id);
      const transactionData = response.data.data;

      // Normalize transaction data
      const normalizedTransaction = normalizeTransaction(transactionData);
      setTransaction(normalizedTransaction);

      return normalizedTransaction;
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to load transaction details";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch user's transactions
  const fetchUserTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await transactionService.getMyTransactions();
      const transactionsData = response.data.data || [];

      // Normalize all transactions
      const normalizedTransactions = transactionsData.map((transaction) =>
        normalizeTransaction(transaction)
      );
      setTransactions(normalizedTransactions);

      return normalizedTransactions;
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to load transactions";
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch all transactions (for admin)
  const fetchAllTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await transactionService.getAllTransactions();
      const transactionsData = response.data.data || [];

      // Normalize all transactions
      const normalizedTransactions = transactionsData.map((transaction) =>
        normalizeTransaction(transaction)
      );
      setTransactions(normalizedTransactions);

      return normalizedTransactions;
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to load transactions";
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update transaction status
  const updateTransactionStatus = useCallback(
    async (id, status) => {
      if (!id || !status) return false;

      setUpdatingTransaction(id);

      try {
        await transactionService.updateStatus(id, { status });

        // Update local state if we have transaction lists
        setTransactions((prev) =>
          prev.map((trans) => (trans.id === id ? { ...trans, status } : trans))
        );

        // Update current transaction if it matches the ID
        if (transaction && transaction.id === id) {
          setTransaction((prev) => ({ ...prev, status }));
        }

        toast.success(`Transaction status updated to ${status}`);
        return true;
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to update transaction status";
        toast.error(message);
        return false;
      } finally {
        setUpdatingTransaction(null);
      }
    },
    [transaction]
  );

  // Upload payment proof (image file or URL)
  const uploadPaymentProof = useCallback(
    async (id, fileOrUrl) => {
      if (!id || !fileOrUrl) return false;

      setIsUploading(true);

      try {
        // Check if we're dealing with a file object or URL string
        if (typeof fileOrUrl === "object" && fileOrUrl instanceof File) {
          // It's a file, so we need to upload it first
          const formData = new FormData();
          formData.append("image", fileOrUrl);

          // Upload the file
          const uploadResponse = await uploadService.uploadImage(formData);
          const imageUrl = uploadResponse.data.data.imageUrl;

          // Then update the transaction with the image URL
          await transactionService.updateProofPayment(id, {
            proofPaymentUrl: imageUrl,
          });

          // Update local state
          if (transaction && transaction.id === id) {
            setTransaction((prev) => ({
              ...prev,
              proofPaymentUrl: imageUrl,
              status: "waiting-for-confirmation",
            }));
          }

          // Update in transactions list if present
          setTransactions((prev) =>
            prev.map((trans) =>
              trans.id === id
                ? {
                    ...trans,
                    proofPaymentUrl: imageUrl,
                    status: "waiting-for-confirmation",
                  }
                : trans
            )
          );

          toast.success("Payment proof uploaded successfully");
          return true;
        } else if (typeof fileOrUrl === "string") {
          // It's already a URL, just update the transaction
          await transactionService.updateProofPayment(id, {
            proofPaymentUrl: fileOrUrl,
          });

          // Update local state
          if (transaction && transaction.id === id) {
            setTransaction((prev) => ({
              ...prev,
              proofPaymentUrl: fileOrUrl,
              status: "waiting-for-confirmation",
            }));
          }

          // Update in transactions list if present
          setTransactions((prev) =>
            prev.map((trans) =>
              trans.id === id
                ? {
                    ...trans,
                    proofPaymentUrl: fileOrUrl,
                    status: "waiting-for-confirmation",
                  }
                : trans
            )
          );

          toast.success("Payment proof uploaded successfully");
          return true;
        } else {
          throw new Error("Invalid payment proof format");
        }
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to upload payment proof";
        toast.error(message);
        return false;
      } finally {
        setIsUploading(false);
      }
    },
    [transaction]
  );

  // Cancel transaction
  const cancelTransaction = useCallback(
    async (id) => {
      if (!id) return false;

      setUpdatingTransaction(id);

      try {
        await transactionService.cancel(id);

        // Update local state
        setTransactions((prev) =>
          prev.map((trans) =>
            trans.id === id ? { ...trans, status: "canceled" } : trans
          )
        );

        // Update current transaction if it matches the ID
        if (transaction && transaction.id === id) {
          setTransaction((prev) => ({ ...prev, status: "canceled" }));
        }

        toast.success("Transaction canceled successfully");
        return true;
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to cancel transaction";
        toast.error(message);
        return false;
      } finally {
        setUpdatingTransaction(null);
      }
    },
    [transaction]
  );

  // Filter transactions by status
  const filterTransactionsByStatus = useCallback(
    (status) => {
      if (!status || status === "all") return transactions;

      return transactions.filter((transaction) => {
        const normalizedStatus = normalizeStatus(transaction.status);
        return normalizedStatus === status;
      });
    },
    [transactions]
  );

  return {
    transaction,
    transactions,
    isLoading,
    error,
    updatingTransaction,
    isUploading,
    fetchTransaction,
    fetchUserTransactions,
    fetchAllTransactions,
    updateTransactionStatus,
    uploadPaymentProof,
    cancelTransaction,
    filterTransactionsByStatus,
  };
};
