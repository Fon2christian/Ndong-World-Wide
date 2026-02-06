import { useEffect, useRef, useCallback } from 'react';

interface UseInactivityTimeoutOptions {
  timeout: number; // in milliseconds
  onTimeout: () => void;
  enabled: boolean;
}

/**
 * Custom hook to track user inactivity and trigger a callback after a specified timeout
 * @param timeout - Time in milliseconds before calling onTimeout
 * @param onTimeout - Callback function to execute when timeout is reached
 * @param enabled - Whether the inactivity tracking is enabled
 */
export function useInactivityTimeout({ timeout, onTimeout, enabled }: UseInactivityTimeoutOptions) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastResetRef = useRef<number>(0);

  const resetTimer = useCallback(() => {
    // Throttle: only reset at most once per second to reduce overhead from high-frequency events
    const now = Date.now();
    if (now - lastResetRef.current < 1000) {
      return;
    }
    lastResetRef.current = now;

    // Clear existing timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timer
    timeoutRef.current = setTimeout(() => {
      onTimeout();
    }, timeout);
  }, [timeout, onTimeout]);

  useEffect(() => {
    if (!enabled) {
      // Clear timer if disabled
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    // Activity events to track
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, resetTimer);
    });

    // Start initial timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, resetTimer]);
}
