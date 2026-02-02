import { useState, KeyboardEvent } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderIcon?: string;
  placeholderLabel?: string;
  placeholderClassName?: string;
  onClick?: () => void;
  wrapperClassName?: string;
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
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

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

  // If wrapper className is provided, wrap everything
  if (wrapperClassName) {
    return (
      <div className={wrapperClassName}>
        {isLoading && (
          <div className="image-skeleton" aria-hidden="true">
            <div className="image-skeleton__shimmer"></div>
          </div>
        )}
        <img
          src={src}
          alt={alt}
          className={className}
          loading="lazy"
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          onClick={onClick}
          onKeyDown={handleKeyDown}
          tabIndex={onClick ? 0 : undefined}
          role={onClick ? "button" : undefined}
        />
      </div>
    );
  }

  // Otherwise, just return the img with skeleton sibling
  return (
    <>
      {isLoading && (
        <div className="image-skeleton" aria-hidden="true">
          <div className="image-skeleton__shimmer"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        tabIndex={onClick ? 0 : undefined}
        role={onClick ? "button" : undefined}
      />
    </>
  );
}
