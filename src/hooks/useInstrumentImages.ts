import { useState, useEffect } from 'react';
import { API_HOST } from '../services/Api';

// Кэш изображений на уровне модуля
const imageCache: Record<number, string> = {};

export function useInstrumentImages(instrumentIds: number[]) {
  const [images, setImages] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const idsToFetch = instrumentIds.filter(id => !(id in imageCache));
    if (!idsToFetch.length) {
      // Всё есть в кэше
      setImages(Object.fromEntries(instrumentIds.map(id => [id, imageCache[id]])));
      return;
    }
    setLoading(true);
    setError(null);
    const params = idsToFetch.map(id => `instrumentIds=${id}`).join('&');
    fetch(`${API_HOST}/instrument-service/api/v1/storage/instruments/images?${params}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Ошибка загрузки иконок инструментов');
        return res.json();
      })
      .then(newImages => {
        Object.entries(newImages).forEach(([id, url]) => {
          imageCache[Number(id)] = url as string;
        });
        setImages(Object.fromEntries(instrumentIds.map(id => [id, imageCache[id]])));
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [instrumentIds.join(',')]);

  return { images, loading, error };
} 