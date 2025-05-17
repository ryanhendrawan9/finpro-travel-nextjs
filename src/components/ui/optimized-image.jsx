"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function OptimizedImage({
  src,
  alt,
  width = 0,
  height = 0,
  fill = false,
  sizes = "100vw",
  className = "",
  priority = false,
  fallbackSrc = "/images/placeholders/activity-placeholder.jpg",
  onLoad = () => {},
  objectFit = "cover",
  quality = 75,
}) {
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);

  // Reset error state if src changes
  useEffect(() => {
    setImgSrc(src);
    setError(false);
  }, [src]);

  const handleError = () => {
    if (!error) {
      setError(true);
      setImgSrc(fallbackSrc);
    }
  };

  const handleLoad = (e) => {
    setIsLoaded(true);
    onLoad(e);
  };

  // For external URLs that Next.js Image component can't optimize
  const isExternalUrl =
    imgSrc &&
    (imgSrc.startsWith("http") || imgSrc.startsWith("data:")) &&
    !imgSrc.includes(process.env.NEXT_PUBLIC_DOMAIN || "localhost");

  const isStaticImage = imgSrc && !isExternalUrl;

  // Determine if image should use placeholder blur
  const usePlaceholder = !priority && isStaticImage;

  // Generate different props based on fill or width/height
  const imageProps = fill
    ? {
        fill: true,
        sizes: sizes,
      }
    : {
        width: width || 1200,
        height: height || 800,
      };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        ...(fill
          ? { position: "relative", width: "100%", height: "100%" }
          : {}),
        backgroundColor: "#f3f4f6", // Light gray placeholder background
      }}
    >
      {isExternalUrl ? (
        // For external URLs, fall back to regular img tag with native lazy loading
        <img
          src={imgSrc}
          alt={alt}
          className={`${className} ${
            objectFit === "cover" ? "object-cover" : "object-contain"
          } w-full h-full transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          onError={handleError}
          onLoad={handleLoad}
          loading={priority ? "eager" : "lazy"}
          width={width || undefined}
          height={height || undefined}
        />
      ) : (
        // For internal images, use Next.js Image component with all its optimizations
        <Image
          src={imgSrc}
          alt={alt || "Image"}
          {...imageProps}
          className={`transition-opacity duration-300 ${
            objectFit === "cover" ? "object-cover" : "object-contain"
          } ${isLoaded ? "opacity-100" : "opacity-0"}`}
          onError={handleError}
          onLoad={handleLoad}
          loading={priority ? "eager" : "lazy"}
          placeholder={usePlaceholder ? "blur" : "empty"}
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEtAJJXIDTiQAAAABJRU5ErkJggg=="
          quality={quality}
        />
      )}
    </div>
  );
}
