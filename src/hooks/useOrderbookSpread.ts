import { useEffect, useState } from 'react';

export function useOrderbookSpread(instrumentId: number | string | undefined) {
  const [data, setData] = useState<{midPrice: number, bestBid: number, bestAsk: number, spread: number} | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!instrumentId) return;
    setLoading(true);
    setError('');
    fetch(`/api/v1/orderbook/${instrumentId}/spread`)
      .then(res => res.json())
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [instrumentId]);

  return { ...data, loading, error };
} 