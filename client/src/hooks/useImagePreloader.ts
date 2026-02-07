import { useEffect } from 'react';

/**
 * Preloads images to improve tab switching performance
 * @param imageUrls Array of image URLs to preload
 * @param enabled Whether preloading is enabled
 */
export function useImagePreloader(imageUrls: string[], enabled = true) {
  useEffect(() => {
    if (!enabled || imageUrls.length === 0) return;

    // Create image preloader
    const preloadImages = () => {
      imageUrls.forEach((url) => {
        const img = new Image();
        img.src = url;
      });
    };

    // Preload with a small delay to not block initial render
    const timeoutId = setTimeout(preloadImages, 100);

    return () => clearTimeout(timeoutId);
  }, [imageUrls, enabled]);
}

/**
 * Extracts first image URL from each item
 */
export function extractFirstImages<T extends { images: string[] }>(items: T[]): string[] {
  return items
    .map((item) => item.images[0])
    .filter((url): url is string => Boolean(url));
}
