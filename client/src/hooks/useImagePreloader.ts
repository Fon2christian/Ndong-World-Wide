import { useEffect } from 'react';

/**
 * Preloads images to improve tab switching performance
 * Images are loaded immediately without delay for instant availability
 * @param imageUrls Array of image URLs to preload
 * @param enabled Whether preloading is enabled
 */
export function useImagePreloader(imageUrls: string[], enabled = true) {
  useEffect(() => {
    if (!enabled || imageUrls.length === 0) return;

    // Filter out empty/falsy values and deduplicate URLs
    const validUrls = imageUrls.filter((url): url is string => Boolean(url) && typeof url === 'string');
    const uniqueUrls = Array.from(new Set(validUrls));

    // Preload images immediately - no timeout for maximum speed
    const images: HTMLImageElement[] = [];
    uniqueUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
      images.push(img);
    });

    // Cleanup function to abort any pending loads
    return () => {
      images.forEach((img) => {
        img.src = '';
      });
    };
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
