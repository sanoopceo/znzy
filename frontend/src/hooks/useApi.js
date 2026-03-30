import { useState, useCallback } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (config) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api(config);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.detail || err.response?.data?.message || err.message || 'An error occurred';
      setError(message);
      // Don't show toast for 401 as we might want silent refresh
      if (err.response?.status !== 401) {
        toast.error(message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, request };
};
