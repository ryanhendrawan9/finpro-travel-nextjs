// src/hooks/useFileUpload.js
import { useState, useCallback } from "react";
import { uploadService } from "@/lib/api";
import { toast } from "react-toastify";

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [error, setError] = useState(null);

  // Function to handle file selection and create preview
  const handleFileSelect = useCallback((file) => {
    // Reset states
    setError(null);
    setUploadedFile(null);

    // Validate file
    if (!file) {
      setFilePreview(null);
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      setFilePreview(null);
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size should be less than 5MB");
      setFilePreview(null);
      return;
    }

    // Create file preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(file);

    return file;
  }, []);

  // Upload file to server
  const uploadFile = useCallback(async (file) => {
    if (!file) {
      setError("No file selected");
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      // Set up a progress handler using our custom onUploadProgress
      const progressHandler = (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(percentage);
        }
      };

      // Create upload request with progress tracking
      const response = await uploadService.uploadImage(
        formData,
        progressHandler
      );

      // Set the uploaded file response
      setUploadedFile(response.data.data);
      setUploadProgress(100);

      toast.success("File uploaded successfully");
      return response.data.data;
    } catch (err) {
      const message = err.response?.data?.message || "File upload failed";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  // Reset all states
  const resetUpload = useCallback(() => {
    setIsUploading(false);
    setUploadProgress(0);
    setUploadedFile(null);
    setFilePreview(null);
    setError(null);
  }, []);

  return {
    isUploading,
    uploadProgress,
    uploadedFile,
    filePreview,
    error,
    handleFileSelect,
    uploadFile,
    resetUpload,
  };
};
