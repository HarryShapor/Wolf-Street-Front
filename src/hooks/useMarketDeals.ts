import { useEffect, useState, useRef } from "react";
import { API_HOST } from "../services/Api";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export interface MarketDeal {
  instrumentId: number;
  count: number;
  lotPrice: number;
  createdAt: string;
}

export interface Trade {
  price: number;
  amount: number;
  side: "buy" | "sell";
  time: string;
}

export function useMarketDeals(instrumentId: number | null) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs для WebSocket соединения
  const stompClientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<any>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (!instrumentId) return;

    // Очистка предыдущего соединения
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    setLoading(true);
    setError(null);

    // Сначала загружаем исторические данные через REST
    fetch(
      `${API_HOST}/market-data-service/api/v1/trades/${instrumentId}?limit=21`
    )
      .then(async (res) => {
        if (!res.ok) throw new Error("Ошибка загрузки исторических сделок");
        return res.json();
      })
      .then((data) => {
        const historicalTrades = Array.isArray(data)
          ? data.map((t: any, index: number) => {
              // Генерируем время с небольшим смещением для каждой сделки
              const now = new Date();
              const timeOffset = (data.length - index - 1) * 1000; // 1 секунда между сделками
              const tradeTime = new Date(now.getTime() - timeOffset);

              return {
                price: t.price || t.lotPrice,
                amount: t.amount || t.count,
                side: (t.side?.toLowerCase() === "buy" ? "buy" : "sell") as
                  | "buy"
                  | "sell",
                time: tradeTime.toLocaleTimeString("ru-RU", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }),
              };
            })
          : [];
        setTrades(historicalTrades);
        setLoading(false);
      })
      .catch((e) => {
        console.warn("Ошибка загрузки исторических сделок:", e);
        setTrades([]);
        setLoading(false);
      });

    // Подписываемся на новые сделки через WebSocket
    console.log(
      `[useMarketDeals] Opening SockJS WebSocket for DEALS: instrumentId=${instrumentId}`
    );
    const socket = new SockJS(`${API_HOST}/market-data-service/ws-market-data`);
    socketRef.current = socket;

    const stompClient = new Client({
      webSocketFactory: () => socket,
      debug: () => {},
      reconnectDelay: 0,
      heartbeatIncoming: 0,
      heartbeatOutgoing: 0,
    });

    stompClientRef.current = stompClient;

    stompClient.onConnect = () => {
      if (stompClientRef.current !== stompClient) return;

      subscriptionRef.current = stompClient.subscribe(
        `/topic/deals/${instrumentId}`,
        (message) => {
          try {
            const deal: MarketDeal = JSON.parse(message.body);
            console.log("[useMarketDeals] New deal received:", deal);

            const newTrade: Trade = {
              price: deal.lotPrice,
              amount: deal.count,
              side: "buy", // По умолчанию, так как в данных нет стороны
              time: new Date().toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              }),
            };

            setTrades((prev) => {
              // Добавляем новую сделку в начало списка
              const updated = [newTrade, ...prev];
              // Ограничиваем количество сделок
              return updated.slice(0, 21);
            });
          } catch (e) {
            console.error("[useMarketDeals] Parse error:", e, message.body);
            setError("Ошибка парсинга сделки");
          }
        }
      );
    };

    stompClient.onStompError = (frame) => {
      console.error(
        "[useMarketDeals] STOMP Error:",
        frame.headers["message"],
        frame.body
      );
      setError("Ошибка WebSocket сделок");
      if (stompClientRef.current) {
        stompClientRef.current.forceDisconnect();
      }
    };

    stompClient.activate();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      if (stompClientRef.current) {
        stompClientRef.current.forceDisconnect();
        stompClientRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [instrumentId]);

  return { trades, loading, error };
}
