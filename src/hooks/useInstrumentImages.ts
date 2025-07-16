import { useState, useEffect } from 'react';
import { API_HOST } from '../services/Api';

export function useInstrumentImages(instrumentIds: number[]) {
  const [images, setImages] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!instrumentIds.length) {
      setImages({});
      return;
    }
    setLoading(true);
    setError(null);
    const params = instrumentIds.map(id => `instrumentIds=${id}`).join('&');
    fetch(`${API_HOST}/instrument-service/api/v1/storage/instruments/images?${params}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Ошибка загрузки иконок инструментов');
        return res.json();
      })
      .then(setImages)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [instrumentIds]);

  return { images, loading, error };
} 