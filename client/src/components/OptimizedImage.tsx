import { useState, useEffect, KeyboardEvent } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderIcon?: string;
  placeholderLabel?: string;
  placeholderClassName?: string;
  onClick?: () => void;
  /**
   * Optional wrapper className. When provided, wraps the image and skeleton in a container div.
   * If not provided, image and skeleton are rendered as siblings - the parent element must have
   * `position: relative` for the skeleton overlay to position correctly.
   */
  wrapperClassName?: string;
  /**
   * Loading strategy for the image. Defaults to "eager" for immediate loading.
   */
  loading?: "lazy" | "eager";
  /**
   * Fetch priority hint for the browser. Defaults to "high" for prioritized loading.
   */
  fetchPriority?: "high" | "low" | "auto";
}

export default function OptimizedImage({
  src,
  alt,
  className = "",
  placeholderIcon,
  placeholderLabel,
  placeholderClassName = "business-card__placeholder",
  onClick,
  wrapperClassName,
  loading = "eager",
  fetchPriority = "high",
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Check if image is already cached and skip loading state
  useEffect(() => {
    const img = new Image();
    img.src = src;

    // If image is already cached/complete, don't show loading state
    if (img.complete) {
      setIsLoading(false);
      setHasError(false);
    } else {
      setIsLoading(true);
      setHasError(false);
    }
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLImageElement>) => {
    if (onClick && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onClick();
    }
  };

  // Show placeholder when image fails to load
  if (hasError) {
    return (
      <div
        className={placeholderClassName}
        role="img"
        aria-label={placeholderLabel || alt}
      >
        {placeholderIcon || "⚠️"}
      </div>
    );
  }

  // Common image element used in both wrapped and unwrapped modes
  const imageElement = (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      onLoad={handleLoad}
      onError={handleError}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
    />
  );

  // Common skeleton element
  const skeletonElement = isLoading && (
    <div className="image-skeleton" aria-hidden="true">
      <div className="image-skeleton__shimmer"></div>
    </div>
  );

  // If wrapper className is provided, wrap everything
  if (wrapperClassName) {
    return (
      <div className={wrapperClassName}>
        {skeletonElement}
        {imageElement}
      </div>
    );
  }

  // Otherwise, just return the img with skeleton sibling
  return (
    <>
      {skeletonElement}
      {imageElement}
    </>
  );
}
