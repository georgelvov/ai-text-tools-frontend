import { useState, useRef, useCallback } from 'react';

export const useApiRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const currentRequestRef = useRef(null);

  const makeRequest = useCallback(async (url, options = {}) => {
    // Отменяем предыдущий запрос, если он еще выполняется
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
    }

    setLoading(true);
    setError('');

    try {
      // Создаем AbortController для возможности отмены запроса
      const abortController = new AbortController();
      currentRequestRef.current = abortController;

      const response = await fetch(url, {
        ...options,
        signal: abortController.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // Проверяем, не был ли запрос отменен
      if (abortController.signal.aborted) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Игнорируем ошибку отмены запроса
      if (error.name === 'AbortError') {
        return null;
      }
      setError('An error occurred while processing your request. Please try again later.');
      console.error('Error:', error);
      return null;
    } finally {
      setLoading(false);
      currentRequestRef.current = null;
    }
  }, []);

  const cancelRequest = useCallback(() => {
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
      currentRequestRef.current = null;
    }
  }, []);

  return {
    loading,
    error,
    makeRequest,
    cancelRequest,
  };
}; 