import { useEffect, useState } from 'react';
import { USE_WS_MOCK } from '../services/Api';
import { createWS } from '../services/WebSocketService';
import type { SpreadData } from '../services/WebSocketService';

export function useOrderbookSpread(instrumentId: number | string | undefined) {
  const [data, setData] = useState<SpreadData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!instrumentId) return;
    let ws: any = null;
    let ignore = false;
    if (USE_WS_MOCK) {
      setLoading(true);
      setError('');
      ws = createWS('spread', instrumentId);
      ws.on('message', (event: any) => {
        if (ignore) return;
        const d: SpreadData = JSON.parse(event.data);
        setData(d);
        setLoading(false);
      });
      ws.on('error', () => setError('Ошибка WebSocket'));
    } else {
      setLoading(true);
      setError('');
      fetch(`/api/v1/orderbook/${instrumentId}/spread`)
        .then(res => res.json())
        .then(setData)
        .catch(e => setError(e.message))
        .finally(() => setLoading(false));
    }
    return () => { ignore = true; if (ws) ws.close && ws.close(); };
  }, [instrumentId]);

  return { ...data, loading, error };
} 