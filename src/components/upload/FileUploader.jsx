"use client";

import { useState, useRef } from "react";
import { FiUpload, FiX, FiImage, FiCheck } from "react-icons/fi";
import { useFileUpload } from "@/hooks/useFileUpload";

export default function FileUploader({ onFileUploaded, className = "" }) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const {
    isUploading,
    uploadProgress,
    uploadedFile,
    filePreview,
    error,
    handleFileSelect,
    uploadFile,
    resetUpload,
  } = useFileUpload();

  // Handle file selection
  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validFile = handleFileSelect(file);
    setSelectedFile(validFile);
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) return;

    const result = await uploadFile(selectedFile);
    if (result && onFileUploaded) {
      onFileUploaded(result);
    }
  };

  // Reset the uploader
  const handleReset = () => {
    resetUpload();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex flex-col items-center">
        {/* File selection area */}
        {!filePreview ? (
          <div
            className="flex flex-col items-center justify-center w-full p-6 transition-colors border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-primary-500"
            onClick={triggerFileInput}
          >
            <FiImage className="w-12 h-12 mb-3 text-gray-400" />
            <p className="mb-1 text-gray-700">
              Click or drag to upload an image
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 5MB</p>

            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        ) : (
          <div className="w-full">
            {/* Image preview */}
            <div className="relative w-full h-48 mb-4">
              <img
                src={filePreview}
                alt="Preview"
                className="object-cover w-full h-full rounded-lg"
              />

              <button
                className="absolute p-1 text-white transition-colors bg-red-600 rounded-full top-2 right-2 hover:bg-red-700"
                onClick={handleReset}
              >
                <FiX />
              </button>

              {uploadedFile && (
                <div className="absolute flex items-center p-1 px-2 text-white bg-green-600 rounded-md bottom-2 right-2">
                  <FiCheck className="mr-1" />
                  <span className="text-xs">Uploaded</span>
                </div>
              )}
            </div>

            {/* File name */}
            <p className="mb-2 text-sm text-gray-700 truncate">
              {selectedFile?.name || "Selected image"}
            </p>

            {/* Upload progress */}
            {isUploading && (
              <div className="w-full h-2 mb-4 bg-gray-200 rounded-full">
                <div
                  className="h-2 transition-all duration-300 rounded-full bg-primary-600"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        )}

        {/* Error message */}
        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}

        {/* Action buttons */}
        <div className="flex mt-4 space-x-3">
          {filePreview && !uploadedFile && (
            <>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={isUploading}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUpload}
                className="flex items-center px-4 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <svg
                      className="w-4 h-4 mr-2 -ml-1 text-white animate-spin"
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
                    Uploading...
                  </>
                ) : (
                  <>
                    <FiUpload className="mr-2" /> Upload
                  </>
                )}
              </button>
            </>
          )}

          {uploadedFile && (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 transition-colors border rounded-lg text-primary-600 border-primary-600 hover:bg-primary-50"
            >
              Upload Another
            </button>
          )}

          {!filePreview && (
            <button
              type="button"
              onClick={triggerFileInput}
              className="flex items-center px-4 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
            >
              <FiUpload className="mr-2" /> Select File
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
