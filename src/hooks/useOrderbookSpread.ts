import { useEffect, useState } from 'react';
import { USE_WS_MOCK } from '../services/Api';
import { createWS } from '../services/WebSocketService';
import type { SpreadData } from '../services/WebSocketService';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export function useOrderbookSpread(instrumentId: number | string | undefined) {
  const [data, setData] = useState<SpreadData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!instrumentId) return;
    let ws: any = null;
    let stompClient: Client | null = null;
    let subscription: any = null;
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
      // WebSocket подписка через SockJS+STOMP
      const socket = new SockJS('http://wolf-street.ru/market-data-service/ws-market-data');
      stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 0,
        heartbeatIncoming: 0,
        heartbeatOutgoing: 0,
      });
      stompClient.onConnect = () => {
        console.log('[useOrderbookSpread] SUBSCRIBE to /topic/spread/' + instrumentId);
        subscription = stompClient!.subscribe(
          `/topic/spread/${instrumentId}`,
          (message) => {
            if (ignore) return;
            console.log('[useOrderbookSpread] onMessage:', message.body);
            try {
              const d: SpreadData = JSON.parse(message.body);
              setData(d);
              setLoading(false);
            } catch (e) {
              setError('Ошибка парсинга spread');
            }
          }
        );
      };
      stompClient.onStompError = (frame) => {
        setError('Ошибка WebSocket spread');
        if (stompClient) stompClient.forceDisconnect();
      };
      stompClient.activate();
    }
    return () => {
      ignore = true;
      if (ws) ws.close && ws.close();
      if (subscription) subscription.unsubscribe();
      if (stompClient) stompClient.forceDisconnect && stompClient.forceDisconnect();
    };
  }, [instrumentId]);

  return { ...data, loading, error };
} 