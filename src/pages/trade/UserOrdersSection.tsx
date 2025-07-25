import { useState, useEffect } from "react";
import { API_HOST } from "../../services/Api";
import Modal from "../../components/ui/Modal";
import { usePortfolioId } from "../../hooks/usePortfolioId";
import { useInstruments } from "../../hooks/useInstruments"; // Добавляем импорт

interface Order {
  id: string | number;
  date: string;
  pair: string;
  type: string;
  side: string;
  price: number;
  amount: number;
  filled: number;
}

const columns = [
  { key: "date", label: "Дата" },
  { key: "pair", label: "Инструмент" },
  { key: "type", label: "Тип" },
  { key: "price", label: "Цена" },
  { key: "amount", label: "Количество" },
  { key: "cancel", label: "" },
];

export default function UserOrdersSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  // Мультисортировка: массив [{ field, dir }]
  const [sorts, setSorts] = useState<{ field: string; dir: "asc" | "desc" }[]>([
    { field: "date", dir: "desc" },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const portfolioId = usePortfolioId();
  const { instruments } = useInstruments(); // Добавляем хук для получения инструментов


  // Автоматическое закрытие модалки через 2 секунды
  useEffect(() => {
    if (!modalOpen) return;
    const timer = setTimeout(() => setModalOpen(false), 2000);
    return () => clearTimeout(timer);
  }, [modalOpen]);

  useEffect(() => {
    if (!portfolioId) return;
    setLoading(true);
    setError("");
    fetch(
      `${API_HOST}/order-service/api/v1/orders?portfolioId=${portfolioId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    )
      .then(async (res) => {
        if (res.status === 401) throw new Error("Пользователь не авторизован!");
        if (res.status === 404) return [];
        if (!res.ok) throw new Error("Ошибка загрузки заявок");
        return res.json();
      })
      .then((data) => {
        // Фильтруем только открытые заявки
        const openStatuses = ["NEW", "PARTIALLY_EXECUTED"];
        setOrders(
          Array.isArray(data)
            ? data
                .filter((o: any) => openStatuses.includes(o.status))
                .map((o: any) => ({
                  id: o.orderId,
                  date: o.createdAt,
                  pair: o.instrumentId,
                  type: o.type,
                  side: o.side,
                  price: o.lotPrice,
                  amount: o.count,
                  filled: o.filled ?? 0,
                }))
            : []
        );
      })
      .catch((err) => setError(err.message || "Ошибка загрузки заявок"))
      .finally(() => setLoading(false));

    // Polling каждые 3 секунды
    const interval = setInterval(() => {
      fetch(
        `${API_HOST}/order-service/api/v1/orders?portfolioId=${portfolioId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      )
        .then(async (res) => {
          if (res.status === 401)
            throw new Error("Пользователь не авторизован!");
          if (res.status === 404) return [];
          if (!res.ok) throw new Error("Ошибка загрузки заявок");
          return res.json();
        })
        .then((data) => {
          const openStatuses = ["NEW", "PARTIALLY_EXECUTED"];
          setOrders(
            Array.isArray(data)
              ? data
                  .filter((o: any) => openStatuses.includes(o.status))
                  .map((o: any) => ({
                    id: o.orderId,
                    date: o.createdAt,
                    pair: o.instrumentId,
                    type: o.type,
                    side: o.side,
                    price: o.lotPrice,
                    amount: o.count,
                    filled: o.filled ?? 0,
                  }))
              : []
          );
        })
        .catch(() => {});
    }, 3000);
    return () => clearInterval(interval);
  }, [portfolioId]);

  async function handleCancelOrder(orderId: string | number) {
    setCancelLoading(String(orderId));
    setModalMessage("");
    try {
      const res = await fetch(
        `${API_HOST}/order-service/api/v1/orders/${orderId}/cancelled`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      if (res.status === 401 || res.status === 403)
        throw new Error("Пользователь не авторизован!");
      if (res.status === 404) throw new Error("Заявка не найдена!");
      if (!res.ok) throw new Error("Ошибка отмены заявки");
      setModalMessage("Заявка успешно отменена!");
      setModalOpen(true);
      // Удаляем отменённую заявку из списка
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err: any) {
      setModalMessage(err.message || "Ошибка отмены заявки");
      setModalOpen(true);
    } finally {
      setCancelLoading(null);
    }
  }

  function handleSort(field: string) {
    setSorts((prev) => {
      const idx = prev.findIndex((s) => s.field === field);
      if (idx === 0) {
        // Первый — меняем направление
        const newDir: "asc" | "desc" = prev[0].dir === "asc" ? "desc" : "asc";
        return [{ field, dir: newDir }, ...prev.slice(1)];
      } else if (idx > 0) {
        // Переносим наверх и меняем направление
        const newDir: "asc" | "desc" = prev[idx].dir === "asc" ? "desc" : "asc";
        const newSort: { field: string; dir: "asc" | "desc" } = {
          field,
          dir: newDir,
        };
        return [newSort, ...prev.filter((_, i) => i !== idx)];
      } else {
        // Добавляем новый
        return [{ field, dir: "asc" as "asc" }, ...prev];
      }
    });
  }

  // Мультисортировка
  const sortedOrders = [...orders].sort((a, b) => {
    for (const { field, dir } of sorts) {
      let cmp = 0;
      if (field === "date") {
        cmp = Number(new Date(a.date)) - Number(new Date(b.date));
      } else if (field === "price" || field === "amount") {
        cmp = Number(a[field as keyof Order]) - Number(b[field as keyof Order]);
      } else {
        cmp = String(a[field as keyof Order]).localeCompare(
          String(b[field as keyof Order])
        );
      }
      if (cmp !== 0) return dir === "asc" ? cmp : -cmp;
    }
    return 0;
  });

  // Функция для получения названия инструмента по ID
  const getInstrumentName = (instrumentId: string | number) => {
    const instrument = instruments.find(
      (inst) => inst.instrumentId === Number(instrumentId)
    );
    return instrument ? instrument.ticker : instrumentId;
  };

  return (
    <div className="w-full h-full bg-white/30 dark:bg-dark-card/40 backdrop-blur-md border border-light-border/40 dark:border-dark-border/40 rounded-2xl shadow-2xl animate-fadein flex flex-col p-0">
      <div className="flex items-center justify-between pl-4 pt-3 pb-2 border-b border-light-border/30 dark:border-dark-border/30 bg-light-bg dark:bg-dark-bg rounded-t-2xl">
        <span className="text-xs font-bold text-light-accent dark:text-dark-accent tracking-wide uppercase">
          Мои заявки
        </span>
      </div>
      {loading ? (
        <div className="py-12 text-center text-light-fg/70 dark:text-dark-fg/70 flex-1 flex items-center justify-center">
          Загрузка...
        </div>
      ) : error ? (
        <div className="py-12 text-center text-red-500 dark:text-dark-400 flex-1 flex items-center justify-center">
          {error}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-transparent min-h-[200px] max-h-[520px] px-4 pb-4 rounded-b-2xl custom-scrollbar">
          <table className="w-full min-w-full text-base table-fixed">
            {/* colgroup убран для авто-растяжения */}
            <thead className="sticky top-0 z-10 bg-light-card dark:bg-dark-card">
              <tr>
                {columns.map((col) => {
                  const sortIdx = sorts.findIndex((s) => s.field === col.key);
                  const isSorted = sortIdx !== -1;
                  const dir = isSorted ? sorts[sortIdx].dir : "asc";
                  return (
                    <th
                      key={col.key}
                      onClick={() =>
                        col.key !== "cancel" && handleSort(col.key)
                      }
                      className={`px-4 py-2 cursor-pointer select-none text-center font-bold uppercase tracking-wide bg-transparent relative text-base
                        ${
                          isSorted
                            ? "text-light-accent dark:text-dark-accent"
                            : "text-light-fg/80 dark:text-dark-brown/90"
                        }`}
                    >
                      <span className="inline-flex items-center gap-1 justify-center">
                        {col.label}
                        {col.key !== "cancel" && (
                          <span
                            className={`transition-transform duration-200 ml-0.5 ${
                              isSorted ? "" : "opacity-60"
                            } ${dir === "desc" ? "rotate-180" : ""}`}
                            style={{ display: "inline-block" }}
                          >
                            {/* SVG стрелка, цвет через currentColor */}
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M3 7L6 4L9 7"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        )}
                        {isSorted && sorts.length > 1 && (
                          <span className="ml-0.5 text-[10px] text-light-fg/60 dark:text-dark-brown/60">
                            {sortIdx + 1}
                          </span>
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sortedOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-8 text-center text-light-fg/70 dark:text-dark-fg/70"
                  >
                    У вас нет открытых ордеров.
                  </td>
                </tr>
              ) : (
                sortedOrders.map((order) => (
                  <tr key={order.id} className="rounded-xl">
                    <td className="px-4 py-2 text-light-fg dark:text-dark-fg font-mono whitespace-nowrap text-center text-base">
                      {(() => {
                        const d = new Date(order.date);
                        const dateStr = d.toLocaleDateString("ru-RU");
                        const timeStr = d.toLocaleTimeString("ru-RU", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        });
                        return (
                          <span className="flex flex-col items-center leading-tight">
                            <span>{dateStr}</span>
                            <span className="text-[11px] text-light-fg/60 dark:text-dark-brown/60 mt-0.5">
                              {timeStr}
                            </span>
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-2 text-light-fg/90 dark:text-dark-fg/90 font-mono text-center text-base font-semibold">
                      {getInstrumentName(order.pair)}
                    </td>
                    {/* <td className="px-6 py-3 font-bold uppercase tracking-tight text-light-fg/90 dark:text-dark-fg/90 text-center text-lg">
                      {order.type}
                    </td> */}
                    <td
                      className={`px-4 py-2 font-bold uppercase tracking-tight text-center text-base ${
                        order.type === "BUY"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-500 dark:text-red-400"
                      }`}
                    >
                      {order.type}
                    </td>
                    <td className="px-4 py-2 text-light-fg dark:text-dark-fg font-mono text-center text-base">
                      {order.price}
                    </td>
                    <td className="px-4 py-2 text-light-fg dark:text-dark-fg font-mono text-center text-base">
                      {order.amount}
                    </td>
                    <td className="px-4 py-2 text-center text-base">
                      <button
                        className="bg-transparent border-none outline-none shadow-none px-0 py-0 text-light-fg dark:text-dark-fg font-semibold text-xs cursor-pointer disabled:opacity-60"
                        title="Отменить"
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancelLoading === String(order.id)}
                      >
                        {cancelLoading === String(order.id)
                          ? "..."
                          : "Отменить"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="">
        <div className="text-center text-base text-light-accent dark:text-dark-accent px-2 py-2">
          {modalMessage}
        </div>
      </Modal>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 14px;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(120deg, #6c63ff 0%, #e0e6ed 100%);
          border-radius: 8px;
          min-height: 40px;
          transition: background 0.3s, filter 0.3s;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          filter: brightness(1.15);
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(120deg, #81c784 0%, #23243a 100%);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          filter: brightness(1.2);
        }
      `}</style>
    </div>
  );
}
