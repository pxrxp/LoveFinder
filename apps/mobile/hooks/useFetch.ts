import { apiFetch } from '@/services/api';
import { useState, useEffect, useCallback } from 'react';

export function useFetch(endpoint: string) {
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiFetch(endpoint);
      const json = await response.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    loadData();
  }, [loadData]); 

  return { data, loading, error, refetch: loadData };
}
