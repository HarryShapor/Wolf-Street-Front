import { useEffect, useState } from 'react';
import { USE_WS_MOCK } from '../services/Api';
import { createWS } from '../services/WebSocketService';
import type { SpreadData } from '../services/WebSocketService';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export function useOrderbookSpread(instrumentId: number | string | undefined) {
  const [data, setData] = useState<SpreadData | null>(null);
  const [lastMidPrice, setLastMidPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!instrumentId) return;
    let ws: any = null;
    let stompClient: Client | null = null;
    let subscription: any = null;
    let ignore = false;
    let gotValue = false;
    if (USE_WS_MOCK) {
      setLoading(true);
      setError('');
      ws = createWS('spread', instrumentId);
      ws.on('message', (event: any) => {
        if (ignore || gotValue) return;
        const d: SpreadData = JSON.parse(event.data);
        if (d && typeof d.midPrice === 'number' && d.midPrice !== 0) {
          setData(d);
          setLastMidPrice(d.midPrice);
          setLoading(false);
          gotValue = true;
        }
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
        subscription = stompClient!.subscribe(
          `/topic/spread/${instrumentId}`,
          (message) => {
            if (ignore || gotValue) return;
            try {
              const d: SpreadData = JSON.parse(message.body);
              if (d && typeof d.midPrice === 'number' && d.midPrice !== 0) {
                setData(d);
                setLastMidPrice(d.midPrice);
                setLoading(false);
                gotValue = true;
              }
            } catch (e) {
              setError('Ошибка парсинга spread');
            }
          }
        );
      };
      stompClient.onStompError = () => {
        setError('Ошибка WebSocket spread');
        if (stompClient) stompClient.forceDisconnect();
      };
      stompClient.activate();
      // Параллельно делаем REST-запрос
      fetch(`http://wolf-street.ru/market-data-service/api/v1/orderbook/${instrumentId}/spread`)
        .then(res => res.json())
        .then((d: SpreadData) => {
          if (ignore || gotValue) return;
          if (d && typeof d.midPrice === 'number' && d.midPrice !== 0) {
            setData(d);
            setLastMidPrice(d.midPrice);
            setLoading(false);
            gotValue = true;
          }
        })
        .catch(() => {});
    }
    return () => {
      ignore = true;
      if (ws) ws.close && ws.close();
      if (subscription) subscription.unsubscribe();
      if (stompClient) stompClient.forceDisconnect && stompClient.forceDisconnect();
    };
  }, [instrumentId]);

  // Возвращаем midPrice: если есть новое — его, иначе последний не нулевой
  return { ...data, midPrice: (data && data.midPrice) ? data.midPrice : lastMidPrice, loading, error };
} 