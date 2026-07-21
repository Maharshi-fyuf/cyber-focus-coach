import { useState, useEffect, useCallback } from 'react';
import type { RoadmapTopic } from '@cyber-focus-coach/shared';

export function useRoadmap() {
  const [topics, setTopics] = useState<RoadmapTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoadmap = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/roadmap');
      if (!res.ok) throw new Error('Failed to fetch roadmap');
      const data = await res.json();
      setTopics(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const completeTopic = async (id: number) => {
    try {
      const res = await fetch(`/api/roadmap/${id}/complete`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to complete topic');
      await fetchRoadmap();
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, [fetchRoadmap]);

  return { topics, loading, error, completeTopic, refetch: fetchRoadmap };
}
