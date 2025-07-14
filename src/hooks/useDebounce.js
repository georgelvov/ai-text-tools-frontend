import { useCallback, useRef, useEffect } from 'react';

export const useDebounce = (callback, delay = 1500) => {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      callback();
    }, delay);
  }, [callback, delay]);

  const cancelDebounce = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { debouncedCallback, cancelDebounce };
}; 