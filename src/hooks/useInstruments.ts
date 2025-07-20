import { useState, useEffect } from 'react';
import { API_HOST } from '../services/Api';

export interface Instrument {
  instrumentId: number;
  ticker: string;
  title: string;
}

export function useInstruments() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_HOST}/instrument-service/api/v1/instruments`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Ошибка загрузки инструментов');
        return res.json();
      })
      .then(setInstruments)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { instruments, loading, error };
} 