import { useState, useEffect } from 'react';
import type { DashboardResponse } from '@cyber-focus-coach/shared';

export function useDashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/dashboard/today');
      if (!res.ok) {
        throw new Error(`Failed to fetch dashboard: ${res.statusText}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return { data, loading, error, refetch: fetchDashboard };
}
