import { useState, useEffect } from 'react';
import { API_HOST } from '../services/Api';

export function useInstrumentMarketData(instrumentIds: number[]) {
  const [prices, setPrices] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!instrumentIds.length) {
      setPrices({});
      return;
    }
    setLoading(true);
    setError(null);

    Promise.all(
      instrumentIds.map(id =>
        fetch(`${API_HOST}/market-data-service/api/v1/orderbook/${id}?limitOrders=1`)
          .then(res => res.ok ? res.json() : null)
          .then(data => ({
            id,
            price: data && data.asks && data.asks.length > 0 ? data.asks[0].price : null
          }))
          .catch(() => ({ id, price: null }))
      )
    )
      .then(results => {
        const priceMap: Record<number, number> = {};
        results.forEach(({ id, price }) => {
          if (price !== null) priceMap[id] = price;
        });
        setPrices(priceMap);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [instrumentIds]);

  return { prices, loading, error };
} 