import { USE_WS_MOCK } from "./Api";

// Типы данных для разных каналов
export type OrderBookEntry = { price: number; amount: number };
export type OrderBookData = { asks: OrderBookEntry[]; bids: OrderBookEntry[] };
export type SpreadData = {
  midPrice: number;
  bestBid: number;
  bestAsk: number;
  spread: number;
};
export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

// --- MOCK GENERATORS ---
function randomOrderBook(): OrderBookData {
  const asks = Array.from({ length: 8 }, (_, i) => ({
    price: 65010 + i * 3,
    amount: +(Math.random() * 0.7 + 0.1).toFixed(2),
  }));
  const bids = Array.from({ length: 8 }, (_, i) => ({
    price: 64995 - i * 3,
    amount: +(Math.random() * 0.7 + 0.1).toFixed(2),
  }));
  return { asks, bids };
}

function randomSpread(): SpreadData {
  const bestBid = 64995;
  const bestAsk = 65010;
  const midPrice = (bestBid + bestAsk) / 2;
  return { midPrice, bestBid, bestAsk, spread: bestAsk - bestBid };
}

function randomCandles(count = 30): Candle[] {
  let last = 100;
  return Array.from({ length: count }, (_, i) => {
    const open = last + Math.round((Math.random() - 0.5) * 10);
    const close = open + Math.round((Math.random() - 0.5) * 10);
    const high = Math.max(open, close) + Math.round(Math.random() * 5);
    const low = Math.min(open, close) - Math.round(Math.random() * 5);
    last = close;
    return {
      time: Date.now() / 1000 - (count - i) * 60,
      open,
      high,
      low,
      close,
    };
  });
}

function randomDeal(): any {
  return {
    instrumentId: 1,
    count: +(Math.random() * 0.1 + 0.01).toFixed(4),
    lotPrice: +(65000 + Math.random() * 1000).toFixed(2),
    createdAt: new Date().toISOString(),
  };
}

// --- MOCK WebSocket ---
class MockWebSocket {
  listeners: Record<string, Function[]> = {};
  interval: any;
  type: string;
  instrumentId: string | number;
  constructor(type: string, instrumentId: string | number) {
    this.type = type;
    this.instrumentId = instrumentId;
    setTimeout(() => this.emit("open"), 100);
    this.startMock();
  }
  startMock() {
    if (this.type === "orderbook") {
      this.interval = setInterval(() => {
        this.emit("message", { data: JSON.stringify(randomOrderBook()) });
      }, 1000);
    } else if (this.type === "spread") {
      this.interval = setInterval(() => {
        this.emit("message", { data: JSON.stringify(randomSpread()) });
      }, 1500);
    } else if (this.type === "ohlc") {
      this.interval = setInterval(() => {
        this.emit("message", { data: JSON.stringify(randomCandles(30)) });
      }, 2000);
    } else if (this.type === "aggregated") {
      // TODO: реализовать mock aggregated
    } else if (this.type === "deals") {
      this.interval = setInterval(() => {
        this.emit("message", { data: JSON.stringify(randomDeal()) });
      }, 3000);
    }
  }
  on(event: string, cb: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(cb);
  }
  emit(event: string, ...args: any[]) {
    (this.listeners[event] || []).forEach((cb) => cb(...args));
  }
  close() {
    clearInterval(this.interval);
    this.emit("close");
  }
}

// --- Универсальный WebSocket-клиент ---
export function createWS(channel: string, instrumentId: string | number) {
  if (USE_WS_MOCK) {
    // channel: orderbook, spread, ohlc, aggregated
    return new MockWebSocket(channel, instrumentId);
  } else {
    // Реальный WebSocket
    // const ws = new WebSocket(`wss://yourserver/${channel}/${instrumentId}`);
    // return ws;
    throw new Error("Реальный WebSocket не реализован");
  }
}
