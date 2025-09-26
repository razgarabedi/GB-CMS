'use client';

import { useEffect, useState } from 'react';

/**
 * Custom hook to handle hydration issues in Next.js
 * Prevents server/client mismatch by ensuring components only render
 * time-sensitive content after hydration is complete
 */
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

/**
 * Hook specifically for current time that handles hydration properly
 */
export function useCurrentTime(updateInterval: number = 1000) {
  const [value, setValue] = useState<Date | null>(null);
  const isHydrated = useHydration();

  useEffect(() => {
    if (isHydrated) {
      setValue(new Date());
      
      if (updateInterval > 0) {
        const timer = setInterval(() => {
          setValue(new Date());
        }, updateInterval);
        
        return () => clearInterval(timer);
      }
    }
  }, [isHydrated, updateInterval]);

  return { value, isHydrated };
}
