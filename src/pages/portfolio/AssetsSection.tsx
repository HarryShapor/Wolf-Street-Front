import { useMemo, useState, useEffect } from "react";
import {
  FaPlus,
  FaArrowRight,
  FaExchangeAlt,
  FaSearch,
} from "react-icons/fa";
import btcIcon from "../../image/crypto/bitcoin.svg";
import ethIcon from "../../image/crypto/ethereum.svg";
import usdtIcon from "../../image/crypto/usdt.svg";
import tonIcon from "../../image/crypto/ton.svg";
import Button from "../../components/ui/Button";
import { Portfolio3DPie } from "./ProfileSection";
import { API_HOST } from "../../services/Api";
import { useInstruments } from "../../hooks/useInstruments";
import { useInstrumentImages } from "../../hooks/useInstrumentImages";
import CustomSelect from "../../components/ui/CustomSelect";
import Modal from "../../components/ui/Modal";
import { useOrderbookSpread } from '../../hooks/useOrderbookSpread';
import ReactDOM from 'react-dom';
import React, { createContext, useContext } from 'react';
import { useInstrumentsProfitability } from '../../hooks/useInstrumentProfitability';

// Тип для инструмента
interface Instrument {
  instrumentId: number;
  availableAmount: number;
  blockedAmount: number;
  totalAmount: number;
  // Для отображения:
  symbol?: string;
  name?: string;
  type?: string;
  price?: number;
  iconUrl?: string;
  totalPrice?: number; // добавляем поле для стоимости из API
}

// Тип для стоимости инструмента
type InstrumentValue = {
  instrumentId: number;
  lotPrice: number;
  totalPrice: number;
};

const instrumentMeta: Record<
  number,
  { symbol: string; name: string; type: string; price: number; iconUrl: string }
> = {
  // Пример: заполнить по известным instrumentId
  9007199254740991: {
    symbol: "BTC/USDT",
    name: "Биткоин/Тетер",
    type: "Спот",
    price: 2730000,
    iconUrl: btcIcon,
  },
  // ... добавить другие id и метаданные
};

// Pie chart цвета (можно заменить на фирменные)
const PIE_COLORS = [
  "from-[#fbbf24] to-[#f59e42]", // BTC — жёлтый
  "from-[#60a5fa] to-[#2563eb]", // ETH — синий
  "from-[#10b981] to-[#059669]", // USDT — зелёный
  "from-[#38bdf8] to-[#0ea5e9]", // TON — голубой
];

// Функция для перевода ошибок на русский
function getErrorMessage(err: string) {
  if (/400/.test(err) && /position|values|contains/i.test(err))
    return "У вас есть открытые позиции по этому инструменту!";
  if (/401/.test(err)) return "Вы не авторизованы!";
  if (/404/.test(err)) return "Портфель или инструмент не найден!";
  if (/успешно удален|success/i.test(err)) return "Инструмент успешно удалён!";
  return "Произошла ошибка. Попробуйте ещё раз.";
}

// Context для midPrice всех инструментов
const MidPriceContext = createContext<{ [id: number]: number }>({});
const SetMidPriceContext = createContext<(id: number, price: number) => void>(() => {});

function AssetCard({ a, loadingImages, getFallbackIcon }: { a: Instrument, loadingImages: boolean, getFallbackIcon: (ticker?: string) => string }) {
  const { midPrice } = useOrderbookSpread(a.instrumentId);
  const setMidPrice = useContext(SetMidPriceContext);
  const [profitPeriod, setProfitPeriod] = React.useState<'1d' | '1w' | '1m'>('1d');
  const { data: profitability, loading: loadingProfit } = useInstrumentsProfitability([a.instrumentId], profitPeriod);
  React.useEffect(() => {
    if (midPrice && midPrice > 0) setMidPrice(a.instrumentId, midPrice);
  }, [midPrice, a.instrumentId, setMidPrice]);
  function formatNumber(n: number, max = 8) {
    return n.toLocaleString("ru-RU", { maximumFractionDigits: max });
  }
  return (
    <div
      className="p-6 bg-white/90 dark:bg-[#18191c] border border-light-border/30 dark:border-[#23243a] shadow-inner dark:shadow-[inset_0_2px_16px_0_rgba(0,0,0,0.25)] rounded-2xl flex flex-col gap-4 transition-all duration-300"
    >
      <div className="flex items-center gap-4 mb-1">
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/90 dark:bg-[#23243a]/90 border-2 border-light-accent dark:border-dark-accent shadow">
          {loadingImages ? (
            <div className="w-8 h-8 rounded-full bg-light-accent/20 dark:bg-dark-accent/20 animate-pulse flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-light-accent/40 dark:bg-dark-accent/40"></div>
            </div>
          ) : (
            <img
              src={a.iconUrl}
              alt={a.symbol}
              className="w-8 h-8 object-contain"
              onError={(e) => {
                // При ошибке загрузки иконки используем fallback
                const target = e.target as HTMLImageElement;
                target.src = getFallbackIcon(a.symbol);
              }}
            />
          )}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-light-accent dark:text-dark-accent text-[20px] tracking-tight truncate">
              {a.symbol}
            </span>
          </div>
          <span className="text-light-fg/80 dark:text-dark-brown text-[15px] truncate">
            {a.name}
          </span>
        </div>
        <span className="text-[18px] font-bold text-light-accent dark:text-dark-accent ml-4 whitespace-nowrap max-w-[120px] overflow-hidden text-ellipsis text-right font-mono">
          {midPrice && midPrice > 0
            ? `₽ ${formatNumber(a.totalAmount * midPrice, 2)}`
            : '—'}
        </span>
      </div>
      <div className="flex flex-row gap-8 mt-2">
        <div className="flex flex-col max-w-[80px]">
          <span className="text-xs text-light-fg/60 dark:text-dark-brown/70">Доступно</span>
          <span className="font-mono text-[16px] font-bold text-light-fg dark:text-dark-fg max-w-[80px] overflow-hidden text-ellipsis whitespace-nowrap text-right">{formatNumber(a.availableAmount)}</span>
        </div>
        <div className="flex flex-col max-w-[80px]">
          <span className="text-xs text-light-fg/60 dark:text-dark-brown/70">В ордерах</span>
          <span className="font-mono text-[16px] text-light-fg/70 dark:text-gray-500 max-w-[80px] overflow-hidden text-ellipsis whitespace-nowrap text-right">{a.blockedAmount ? formatNumber(a.blockedAmount) : '—'}</span>
        </div>
        <div className="flex flex-col max-w-[80px]">
          <span className="text-xs text-light-fg/60 dark:text-dark-brown/70">Всего</span>
          <span className="font-mono text-[16px] text-light-fg dark:text-dark-fg max-w-[80px] overflow-hidden text-ellipsis whitespace-nowrap text-right">{formatNumber(a.totalAmount)}</span>
        </div>
        <div className="flex flex-col max-w-[90px]">
          <span className="text-xs text-light-fg/60 dark:text-dark-brown/70">Доходность</span>
          <span className="font-mono text-[16px] text-light-fg dark:text-dark-fg max-w-[90px] overflow-hidden text-ellipsis whitespace-nowrap text-right">
            {loadingProfit ? (
              <span className="text-xs text-light-fg/60 dark:text-dark-brown/70">...</span>
            ) : profitability && profitability[a.instrumentId] !== undefined ? (
              <span className={`font-semibold ${profitability[a.instrumentId] > 0 ? 'text-green-600 dark:text-green-400' : profitability[a.instrumentId] < 0 ? 'text-red-500 dark:text-red-400' : ''}`}>
                {(Number(profitability[a.instrumentId]) * 100).toFixed(2)}%
              </span>
            ) : <span className="text-xs text-light-fg/60 dark:text-dark-brown/70">—</span>}
          </span>
        </div>
      </div>
      <div className="flex flex-row items-center gap-4 mt-2">
        <div className="flex gap-3">
          <Button
            title="Пополнить"
            variant="gradient"
            size="sm"
            iconLeft={<FaPlus />}
            className="rounded-xl px-4 py-2"
          />
          <Button
            title="Вывести"
            variant="gradient"
            size="sm"
            iconLeft={<FaArrowRight />}
            className="rounded-xl px-4 py-2"
          />
          <Button
            title="Трансфер"
            variant="gradient"
            size="sm"
            iconLeft={<FaExchangeAlt />}
            className="rounded-xl px-4 py-2"
          />
        </div>
        {/* Кнопки периода доходности */}
        <div className="flex flex-row gap-1 ml-auto">
          {['1d', '1w', '1m'].map((p) => (
            <button
              key={p}
              className={`px-1.5 py-0.5 rounded text-xs font-bold border transition-colors duration-150 ${profitPeriod === p ? 'bg-light-accent text-white dark:bg-dark-accent dark:text-dark-bg border-light-accent dark:border-dark-accent' : 'bg-transparent text-light-fg dark:text-dark-fg border-light-border dark:border-dark-border'}`}
              onClick={() => setProfitPeriod(p as '1d' | '1w' | '1m')}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Добавление и удаление инструмента (тестовые кнопки) ---
async function addInstrument(
  instrumentId: number,
  onResult: (err?: string) => void
) {
  try {
    const res = await fetch(
      `${API_HOST}/portfolio-service/api/v1/portfolio/instruments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ instrumentId }),
      }
    );
    if (!res.ok) throw new Error(await res.text());
    onResult();
  } catch (err: any) {
    onResult(err.message || "Ошибка добавления инструмента");
  }
}

async function deleteInstrument(
  instrumentId: number,
  onResult: (err?: string) => void
) {
  try {
    const res = await fetch(
      `${API_HOST}/portfolio-service/api/v1/portfolio/instruments`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ instrumentId }),
      }
    );
    if (!res.ok) throw new Error(await res.text());
    onResult();
  } catch (err: any) {
    onResult(err.message || "Ошибка удаления инструмента");
  }
}

export default function AssetsSection() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("alpha-asc");
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Опции для фильтров и сортировки
  const TYPE_FILTERS = [
    { label: "Все", value: "all" },
    { label: "Криптовалюта", value: "crypto" },
    { label: "Стейблкоин", value: "stablecoin" },
  ];

  const SORT_OPTIONS = [
    { label: "По алфавиту (A-Z)", value: "alpha-asc" },
    { label: "По алфавиту (Z-A)", value: "alpha-desc" },
    { label: "По цене (сначала дешёвые)", value: "price-asc" },
    { label: "По цене (сначала дорогие)", value: "price-desc" },
    { label: "По доходности (сначала прибыльные)", value: "profit-asc" },
    { label: "По доходности (сначала убыточные)", value: "profit-desc" },
  ];

  // Загружаем стоимости инструментов
  const [values, setValues] = useState<InstrumentValue[]>([]);
  const { instruments: allInstruments, loading: loadingAllInstruments } =
    useInstruments();

  // Загружаем иконки инструментов
  const instrumentIds = useMemo(
    () => instruments.map((inst) => inst.instrumentId),
    [instruments]
  );
  const { images: instrumentImages, loading: loadingImages } =
    useInstrumentImages(instrumentIds);

  // Объединяем инструменты портфеля с полными данными инструментов
  const instrumentsWithMetadata = useMemo(() => {
    return instruments.map((portfolioInstrument) => {
      const fullInstrument = allInstruments.find(
        (inst) => inst.instrumentId === portfolioInstrument.instrumentId
      );

      // Получаем иконку с сервера или используем fallback
      const iconUrl =
        instrumentImages[portfolioInstrument.instrumentId] ||
        getFallbackIcon(fullInstrument?.ticker);

      return {
        ...portfolioInstrument,
        symbol:
          fullInstrument?.ticker || `ID:${portfolioInstrument.instrumentId}`,
        name:
          fullInstrument?.title ||
          `Инструмент ${portfolioInstrument.instrumentId}`,
        type: "Спот", // Можно добавить в API
        price: 1, // Можно получить из API цен
        iconUrl: iconUrl,
      };
    });
  }, [instruments, allInstruments, instrumentImages]);

  // Функция для получения fallback иконки
  function getFallbackIcon(ticker?: string): string {
    if (!ticker) return btcIcon;

    const iconMap: Record<string, string> = {
      BTC: btcIcon,
      ETH: ethIcon,
      USDT: usdtIcon,
      TON: tonIcon,
    };
    return iconMap[ticker.toUpperCase()] || btcIcon;
  }

  // Инструменты, которых нет у пользователя
  const availableToAdd = useMemo(
    () =>
      allInstruments.filter(
        (inst) =>
          !instruments.some(
            (userInst) => userInst.instrumentId === inst.instrumentId
          )
      ),
    [allInstruments, instruments]
  );
  const [selectedToAdd, setSelectedToAdd] = useState<number | null>(null);
  // Для отладки:
  useEffect(() => {
    console.log("availableToAdd", availableToAdd);
  }, [availableToAdd]);

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`${API_HOST}/portfolio-service/api/v1/portfolio/instruments`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    })
      .then(async (res) => {
        if (res.status === 401) throw new Error("Пользователь не авторизован!");
        if (res.status === 404)
          throw new Error("Портфель пользователя не найден!");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setInstruments(data);
        } else {
          setInstruments([]);
        }
      })
      .catch((err) => setError(err.message || "Ошибка загрузки инструментов"))
      .finally(() => setLoading(false));
  }, []);

  // Загружаем стоимости инструментов только после загрузки инструментов и если они есть
  useEffect(() => {
    if (!instruments.length) {
      setValues([]);
      return;
    }
    fetch(`${API_HOST}/api/v1/portfolio/value`, { credentials: "include" })
      .then(async (res) => {
        if (res.status === 401) throw new Error("Пользователь не авторизован!");
        if (res.status === 404)
          throw new Error("Портфель пользователя не найден!");
        return res.json();
      })
      .then((data: InstrumentValue[]) => {
        setValues(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => {});
  }, [instruments.map((i) => i.instrumentId).join(",")]);

  // Объединяем инструменты с их стоимостью
  const instrumentsWithValue = useMemo(() => {
    if (!values.length) return instrumentsWithMetadata;
    return instrumentsWithMetadata.map((inst) => {
      const val = values.find((v) => v.instrumentId === inst.instrumentId);
      return val ? { ...inst, totalPrice: val.totalPrice } : inst;
    });
  }, [instrumentsWithMetadata, values]);

  // Получаем актуальные цены для всех инструментов
  // const midPrices = filtered.map(a => useOrderbookSpread(a.instrumentId).midPrice || 0);
  // Пересчитываем общую сумму портфеля
  // const totalSum = filtered.reduce((sum, a, i) => sum + (a.totalAmount * (midPrices[i] || 0)), 0);

  // Получаем доходность для всех инструментов (например, за 1d)
  // const [profitPeriod, setProfitPeriod] = useState<'1d' | '1w' | '1m'>('1d');
  // const { data: profitability, loading: loadingProfit, error: errorProfit } = useInstrumentsProfitability(
  //   instrumentsWithValue.map(a => a.instrumentId),
  //   profitPeriod
  // );

  // Добавление/удаление инструментов (UI)
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  // Автоматическое закрытие модалки через 2 секунды
  useEffect(() => {
    if (!modalOpen) return;
    const timer = setTimeout(() => setModalOpen(false), 2000);
    return () => clearTimeout(timer);
  }, [modalOpen]);



  // Удаляю все дублирующие объявления midPrices и setMidPrice выше по коду (оставляю только одно объявление перед рендером)
  const [midPrices, setMidPrices] = React.useState<{ [id: number]: number }>({});
  const setMidPrice = React.useCallback((id: number, price: number) => {
    setMidPrices((prev) => (prev[id] === price ? prev : { ...prev, [id]: price }));
  }, []);

  // Новый расчёт total и pie по spread (midPrices)
  const totalSpread = useMemo(() =>
    instrumentsWithValue.reduce(
      (sum, a) => sum + (a.totalAmount || 0) * (midPrices[a.instrumentId] || 0),
      0
    ),
    [instrumentsWithValue, midPrices]
  );
  const pieSpread = useMemo(
    () =>
      instrumentsWithValue.map(
        (a) => {
          const value = (a.totalAmount || 0) * (midPrices[a.instrumentId] || 0);
          return totalSpread ? value / totalSpread : 0;
        }
      ),
    [instrumentsWithValue, midPrices, totalSpread]
  );
  const filtered = useMemo(
    () => {
      let result = instrumentsWithValue.filter((a) => {
        // Фильтр по поиску
        const matchesSearch =
          (a.symbol || "").toLowerCase().includes(search.toLowerCase()) ||
          (a.name || "").toLowerCase().includes(search.toLowerCase());
        
        // Фильтр по типу (пока просто пропускаем все, можно добавить логику позже)
        const matchesFilter = filter === "all" || true; // TODO: добавить логику фильтрации по типу
        
        return matchesSearch && matchesFilter;
      });
      
      // Сортировка
      result = result.slice().sort((a, b) => {
        switch (sort) {
          case "alpha-asc":
            return (a.symbol || "").localeCompare(b.symbol || "");
          case "alpha-desc":
            return (b.symbol || "").localeCompare(a.symbol || "");
          case "price-asc":
            return (midPrices[a.instrumentId] || 0) - (midPrices[b.instrumentId] || 0);
          case "price-desc":
            return (midPrices[b.instrumentId] || 0) - (midPrices[a.instrumentId] || 0);
          case "profit-asc":
            // TODO: добавить сортировку по доходности когда будет доступна
            return 0;
          case "profit-desc":
            // TODO: добавить сортировку по доходности когда будет доступна
            return 0;
          default:
            return 0;
        }
      });
      
      return result;
    },
    [search, instrumentsWithValue, filter, sort, midPrices]
  );

  return (
    <>
      {/* Модалка ошибок — теперь в самом верху страницы через портал */}
      {modalOpen && ReactDOM.createPortal(
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={modalTitle}
        >
          <div
            className="text-red-500 dark:text-red-400 text-center text-base whitespace-pre-line"
            style={{ minWidth: 220 }}
          >
            {modalMessage}
          </div>
        </Modal>,
        document.body
      )}
      <MidPriceContext.Provider value={midPrices}>
        <SetMidPriceContext.Provider value={setMidPrice}>
          <div className="bg-gradient-to-br from-light-card/95 to-light-bg/80 dark:from-dark-card/95 dark:to-[#181926]/90 rounded-3xl shadow-2xl card-glow backdrop-blur-xl border border-light-border/40 dark:border-dark-border/40 p-8 flex flex-col gap-5 transition-all duration-300">
            {/* Верхний блок: поиск+кнопки слева, диаграмма справа */}
            <div className="flex flex-col md:flex-row md:items-start md:gap-8">
              {/* Левая колонка: поиск + кнопки */}
              <div className="flex-1 flex flex-col gap-4 mb-6 md:mb-0 md:max-w-[340px]">
                <div className="relative w-full">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-light-accent dark:text-dark-accent text-[16px] pointer-events-none">
                    <FaSearch />
                  </span>
                  <input
                    type="text"
                    placeholder="Поиск по инструментам..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-xl border border-light-border/40 dark:border-dark-border/40 bg-white/80 dark:bg-[#23243a]/90 text-[16px] focus:outline-none focus:ring-2 focus:ring-light-accent/30 dark:focus:ring-dark-accent/30 w-full shadow-inner dark:shadow-inner placeholder:text-light-fg/60 dark:placeholder:text-[#888c94]"
                  />
                </div>
                {/* Основные кнопки действий */}
                <div className="flex flex-row items-center gap-4 w-full md:max-w-[600px]">
                  <Button
                    variant="gradient"
                    size="md"
                    iconLeft={<FaPlus />}
                    className="shadow-md dark:shadow-lg"
                  >
                    Пополнить
                  </Button>
                  <Button
                    variant="gradient"
                    size="md"
                    iconLeft={<FaArrowRight />}
                    className="shadow-md dark:shadow-lg"
                  >
                    Вывести
                  </Button>
                  <Button
                    variant="gradient"
                    size="md"
                    iconLeft={<FaExchangeAlt />}
                    className="shadow-md dark:shadow-lg"
                  >
                    Трансфер
                  </Button>
                </div>
                {/* Кастомный современный выбор инструмента для удаления */}
                <div className="flex flex-col gap-3 mt-4 items-stretch max-w-xs">
                  {/* Новый выпадающий список для добавления инструмента */}
                  <div className="flex flex-col gap-2 mt-2 items-stretch max-w-xs">
                    <CustomSelect
                      value={selectedToAdd !== null ? String(selectedToAdd) : ""}
                      onChange={(val) => setSelectedToAdd(val ? Number(val) : null)}
                      options={
                        availableToAdd.length
                          ? availableToAdd.map((inst) => ({
                              value: String(inst.instrumentId),
                              label: `${inst.ticker} - ${inst.title}`,
                            }))
                          : [
                              {
                                value: "",
                                label: "Нет доступных инструментов",
                                disabled: true,
                              },
                            ]
                      }
                      placeholder="Выберите инструмент для добавления"
                      className="min-h-[32px] text-sm"
                    />
                    <button
                      onClick={() =>
                        selectedToAdd &&
                        addInstrument(selectedToAdd, (err) => {
                          if (err) {
                            setModalTitle("Ошибка");
                            let msg = err;
                            try {
                              const parsed = JSON.parse(err);
                              msg = parsed.message || parsed.error || err;
                            } catch {}
                            setModalMessage(getErrorMessage(msg));
                            setModalOpen(true);
                          }
                          setActionLoading(false);
                          setSelectedToAdd(null);
                          // обновить список инструментов ...
                          setLoading(true);
                          fetch(
                            `${API_HOST}/portfolio-service/api/v1/portfolio/instruments`,
                            {
                              headers: {
                                Authorization: `Bearer ${localStorage.getItem(
                                  "accessToken"
                                )}`,
                              },
                            }
                          )
                            .then(async (res) => res.json())
                            .then((data) => {
                              if (Array.isArray(data)) {
                                setInstruments(
                                  data.map((item: Instrument) => ({
                                    ...item,
                                    ...(instrumentMeta[item.instrumentId] || {}),
                                  }))
                                );
                              }
                            })
                            .finally(() => setLoading(false));
                        })
                      }
                      disabled={
                        actionLoading || !selectedToAdd || !availableToAdd.length
                      }
                      className={`w-full py-2 rounded-xl font-semibold transition-all duration-150
                        ${
                          !selectedToAdd || actionLoading || !availableToAdd.length
                            ? "bg-light-accent/30 text-light-fg/60 dark:bg-dark-accent/30 dark:text-dark-fg/60 cursor-not-allowed"
                            : "bg-light-accent text-white dark:bg-dark-accent dark:text-dark-bg hover:brightness-110 hover:shadow-lg"
                        }
                      `}
                      style={{ fontSize: 15, marginTop: 2 }}
                    >
                      + Добавить инструмент
                    </button>
                  </div>
                  {/* Новый выпадающий список для удаления инструмента */}
                  <div className="flex flex-col gap-2 mt-2 items-stretch max-w-xs">
                    <CustomSelect
                      value={
                        selectedToDelete !== null ? String(selectedToDelete) : ""
                      }
                      onChange={(val) =>
                        setSelectedToDelete(val ? Number(val) : null)
                      }
                      options={
                        instrumentsWithMetadata.length
                          ? instrumentsWithMetadata.map((inst) => ({
                              value: String(inst.instrumentId),
                              label: `${inst.symbol} - ${inst.name}`,
                            }))
                          : [
                              {
                                value: "",
                                label: "Нет инструментов для удаления",
                                disabled: true,
                              },
                            ]
                      }
                      placeholder="Выберите инструмент для удаления"
                      className="min-h-[32px] text-sm"
                    />
                    <button
                      onClick={() =>
                        selectedToDelete &&
                        deleteInstrument(selectedToDelete, (err) => {
                          if (err) {
                            setModalTitle("Ошибка");
                            let msg = err;
                            try {
                              const parsed = JSON.parse(err);
                              msg = parsed.message || parsed.error || err;
                            } catch {}
                            setModalMessage(getErrorMessage(msg));
                            setModalOpen(true);
                          }
                          setActionLoading(false);
                          setSelectedToDelete(null);
                          // обновить список инструментов ...
                          setLoading(true);
                          fetch(
                            `${API_HOST}/portfolio-service/api/v1/portfolio/instruments`,
                            {
                              headers: {
                                Authorization: `Bearer ${localStorage.getItem(
                                  "accessToken"
                                )}`,
                              },
                            }
                          )
                            .then(async (res) => res.json())
                            .then((data) => {
                              if (Array.isArray(data)) {
                                setInstruments(
                                  data.map((item: Instrument) => ({
                                    ...item,
                                    ...(instrumentMeta[item.instrumentId] || {}),
                                  }))
                                );
                              }
                            })
                            .finally(() => setLoading(false));
                        })
                      }
                      disabled={
                        actionLoading ||
                        !selectedToDelete ||
                        !instrumentsWithMetadata.length
                      }
                      className={`w-full py-2 rounded-xl font-semibold transition-all duration-150
                        ${
                          !selectedToDelete ||
                          actionLoading ||
                          !instrumentsWithMetadata.length
                            ? "bg-red-200/30 text-red-300 dark:bg-red-900/20 dark:text-red-400 border border-red-200/40 dark:border-red-900/40 cursor-not-allowed"
                            : "bg-red-500/20 text-red-600 dark:bg-red-600/20 dark:text-red-400 border border-red-400/40 dark:border-red-600/40 hover:bg-red-500/40 hover:text-white dark:hover:bg-red-600/40 dark:hover:text-white"
                        }
                      `}
                      style={{ fontSize: 15, marginTop: 2 }}
                    >
                      Удалить инструмент
                    </button>
                  </div>
                </div>
                {/* Фильтры и сортировка */}
                <div className="flex flex-col md:flex-row gap-3 w-full mt-4">
                  <div className="flex-shrink-0 w-full md:w-48">
                    <CustomSelect
                      id="type-filter"
                      value={filter}
                      onChange={setFilter}
                      options={TYPE_FILTERS}
                      placeholder="Тип инструмента"
                      className="text-sm"
                    />
                  </div>
                  <div className="flex-shrink-0 w-full md:w-56">
                    <CustomSelect
                      id="sort-select"
                      value={sort}
                      onChange={setSort}
                      options={SORT_OPTIONS}
                      placeholder="Сортировка"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Диаграмма справа */}
              <div className="flex-1 flex justify-center md:justify-end mb-6 md:mb-0">
                <div className="p-4 rounded-2xl flex items-center justify-center w-full max-w-[360px] transition-all">
                  <Portfolio3DPie
                    assets={instrumentsWithValue.map((a, i) => ({
                      symbol: a.symbol,
                      name: a.name,
                      percent: pieSpread[i] * 100,
                      value: Math.round((a.totalAmount || 0) * (midPrices[a.instrumentId] || 0)),
                      color: PIE_COLORS[i % PIE_COLORS.length],
                    }))}
                  />
                </div>
              </div>
            </div>
            {/* Переключатель периода доходности */}
            {/* Удален глобальный переключатель периода доходности */}

            {/* Список активов */}
            {loading || loadingAllInstruments || loadingImages ? (
              <div className="py-12 text-center text-light-fg/70 dark:text-dark-fg/70">
                Загрузка...
              </div>
            ) : error ? (
              <div className="py-12 text-center text-red-500 dark:text-red-400">
                {error}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-light-fg/70 dark:text-dark-fg/70">
                Нет инструментов
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filtered.map((a) => (
                  <AssetCard
                    key={a.instrumentId}
                    a={a}
                    loadingImages={loadingImages}
                    getFallbackIcon={getFallbackIcon}
                  />
                ))}
              </div>
            )}
          </div>
        </SetMidPriceContext.Provider>
      </MidPriceContext.Provider>


    </>
  );
}
